import os; os.environ["DISABLE_FLASH_ATTN"]="1"
from pathlib import Path
import argparse, json, numpy as np, torch, faiss
from Bio import SeqIO
from tqdm import tqdm
from transformers import AutoTokenizer, AutoModelForMaskedLM

MODEL = "InstaDeepAI/nucleotide-transformer-v2-100m-multi-species"
MAXLEN = 512

def load_ref_meta(p: Path):
    with p.open("r") as f:
        m = json.load(f)
    return m["ids"], m.get("labels", {})

@torch.inference_mode()
def embed_fasta(fa: Path, tok, mdl, device: str, batch: int, use_fp16: bool):
    ids, buf, embs = [], [], []

    def flush():
        if not buf:
            return
        x = tok(buf, return_tensors="pt", padding=True, truncation=True, max_length=MAXLEN)
        x = {k: v.to(device) for k, v in x.items()}  
        out = mdl(**x)
        h = out.hidden_states[-1]                    
        mask = x["attention_mask"].unsqueeze(-1).to(h.dtype)  
        pooled = (h * mask).sum(1) / mask.sum(1).clamp_min(1)
        embs.append(pooled.detach().cpu().numpy().astype("float32"))
        buf.clear()

    total = sum(1 for _ in SeqIO.parse(str(fa), "fasta"))
    for rec in tqdm(SeqIO.parse(str(fa), "fasta"), total=total, desc="Embed ASVs"):
        ids.append(rec.id.split()[0])
        buf.append(str(rec.seq).upper().replace("U", "T"))
        if len(buf) >= batch:
            flush()
    flush()
    X = np.vstack(embs) if embs else np.zeros((0, 768), dtype="float32")
    return ids, X

def as_similarity(D: np.ndarray, metric: str) -> np.ndarray:
    if metric == "ip":
        mx = np.max(D, axis=1, keepdims=True)
        mn = np.min(D, axis=1, keepdims=True)
        denom = np.clip(mx - mn, 1e-6, None)
        return (D - mn) / denom
    return 1.0 / (1.0 + D)

if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--asv-fasta", required=True)
    ap.add_argument("--ref-index", required=True)
    ap.add_argument("--ref-meta", required=True)
    ap.add_argument("--outdir", required=True)
    ap.add_argument("--metric", choices=["l2", "ip"], default="l2")
    ap.add_argument("--tau", type=float, default=0.75)
    ap.add_argument("--batch", type=int, default=4)
    ap.add_argument("--fp16", action="store_true")
    ap.add_argument("--topk", type=int, default=5)
    ap.add_argument("--nprobe", type=int, default=16)
    args = ap.parse_args()

    outdir = Path(args.outdir); outdir.mkdir(parents=True, exist_ok=True)
    device = "cuda" if torch.cuda.is_available() else "cpu"
    use_fp16 = bool(args.fp16 and device == "cuda")
    model_dtype = torch.float16 if use_fp16 else torch.float32

    tok = AutoTokenizer.from_pretrained(MODEL, trust_remote_code=True)
    mdl = AutoModelForMaskedLM.from_pretrained(
        MODEL,
        trust_remote_code=True,
        output_hidden_states=True,
        torch_dtype=model_dtype,
        low_cpu_mem_usage=True
    ).to(device)
    if use_fp16:
        mdl = mdl.half()
    mdl = mdl.eval()

    ids, Xq = embed_fasta(Path(args.asv_fasta), tok, mdl, device, args.batch, use_fp16)
    np.save(outdir / "asv_embeddings.npy", Xq)
    (outdir / "asv_meta.json").write_text(json.dumps({"ids": ids}))

    index = faiss.read_index(str(Path(args.ref_index)))
    try:
        index.nprobe = args.nprobe
    except Exception:
        pass

    if args.metric == "ip":
        faiss.normalize_L2(Xq)

    D, I = index.search(Xq, args.topk)
    ref_ids, labels = load_ref_meta(Path(args.ref_meta))

    rows, inspect = [], {}
    S = as_similarity(D, args.metric)
    for qi, asv in enumerate(ids):
        kbest = []
        for j in range(args.topk):
            ridx = int(I[qi, j])
            if ridx < 0 or ridx >= len(ref_ids):
                continue
            rid = ref_ids[ridx]
            lab = labels.get(rid, {})
            kbest.append({
                "ref_id": rid,
                "sim": float(S[qi, j]),
                "phylum": lab.get("phylum", "NA"),
                "class":  lab.get("class",  "NA")
            })
        inspect[asv] = kbest
        if kbest:
            top = kbest[0]
            is_reject = 0 if (top["sim"] >= args.tau and (top["phylum"] != "NA" or top["class"] != "NA")) else 1
            rows.append((asv, top["ref_id"], f"{top['sim']:.4f}", top["phylum"], top["class"], is_reject))
        else:
            rows.append((asv, "NA", "0.0000", "NA", "NA", 1))

    (outdir / "taxonomy_table.tsv").write_text(
        "ASV_id\tref_id\tsimilarity\tphylum\tclass\tis_reject\n" +
        "\n".join("\t".join(map(str, r)) for r in rows) + "\n"
    )
    (outdir / "topk.json").write_text(json.dumps(inspect))

    n_total = len(rows)
    n_known = sum(1 for r in rows if r[5] == 0)
    n_rej = n_total - n_known
    (outdir / "summary.json").write_text(json.dumps({
        "total_asvs": n_total,
        "assigned": n_known,
        "rejected": n_rej,
        "tau": args.tau,
        "metric": args.metric,
        "topk": args.topk,
        "device": device,
        "dtype": "fp16" if use_fp16 else "fp32"
    }, indent=2))

    print(str(outdir / "asv_embeddings.npy"))
    print(str(outdir / "taxonomy_table.tsv"))
    print(str(outdir / "summary.json"))
    print(str(outdir / "topk.json"))
