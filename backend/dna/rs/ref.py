import os
os.environ["DISABLE_FLASH_ATTN"] = "1"
import json, numpy as np, torch, faiss
from Bio import SeqIO
from transformers import AutoTokenizer, AutoModelForMaskedLM
from tqdm import tqdm

MODEL = "InstaDeepAI/nucleotide-transformer-v2-100m-multi-species" 
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
MAXLEN = 512
BATCH = 4 if DEVICE == "cuda" else 2

def read_labels(tsv):
    m = {}
    with open(tsv, "r", encoding="utf-8") as f:
        next(f)
        for line in f:
            acc, taxid, sci, phy, cls = line.rstrip("\n").split("\t")
            m[acc] = {"taxid": taxid, "scientific_name": sci, "phylum": phy, "class": cls}
    return m

@torch.inference_mode()
def embed_fasta(fa_path, tok, mdl):
    ids, buf, embs = [], [], []

    def flush():
        if not buf: return
        x = tok(buf, return_tensors="pt", padding=True, truncation=True, max_length=MAXLEN)
        x = {k: v.to(DEVICE) for k, v in x.items()}
        out = mdl(**x)
        h = out.hidden_states[-1]
        mask = x["attention_mask"].unsqueeze(-1).to(h.dtype)
        pooled = (h * mask).sum(1) / mask.sum(1).clamp_min(1)
        embs.append(pooled.cpu().numpy().astype("float32"))
        buf.clear()

    total = sum(1 for _ in SeqIO.parse(fa_path, "fasta"))
    for rec in tqdm(SeqIO.parse(fa_path, "fasta"), total=total, desc="Embedding"):
        ids.append(rec.id.split()[0])
        seq = str(rec.seq).upper().replace("U","T")
        buf.append(seq)
        if len(buf) >= BATCH:
            flush()
    flush()
    return ids, np.vstack(embs)

def build_index(x, nlist=2048, m=16, codebits=8, add_batch=5000):
    d = x.shape[1]
    base = faiss.IndexFlatL2(d)
    idx = faiss.IndexIVFPQ(base, d, nlist, m, codebits)

    print("Training index ")
    idx.train(x)

    print("Adding vectors ")
    for i in tqdm(range(0, len(x), add_batch), desc="FAISS add"):
        idx.add(x[i:i+add_batch])

    idx.nprobe = 16
    return idx

if __name__ == "__main__":
    print(f"Model: {MODEL}  Device: {DEVICE}")
    tok = AutoTokenizer.from_pretrained(MODEL, trust_remote_code=True)
    mdl = AutoModelForMaskedLM.from_pretrained(
        MODEL,
        torch_dtype=torch.float32,
        trust_remote_code=True,
        output_hidden_states=True
    ).to(DEVICE).eval()

    labels = read_labels("refs_all.phylum_class.tsv")

    print("Embedding refs_all.fasta ")
    ref_ids, ref_embs = embed_fasta("refs_all.fasta", tok, mdl)
    print(f"Refs: {len(ref_ids)}  dim={ref_embs.shape[1]}")

    print("Building FAISS ")
    index = build_index(ref_embs)
    faiss.write_index(index, "ref_index.faiss")
    with open("ref_meta.json", "w") as f:
        json.dump({"ids": ref_ids, "labels": {rid: labels.get(rid, {}) for rid in ref_ids}}, f)

    print("ref_index.faiss and ref_meta.json saved")
