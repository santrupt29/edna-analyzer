import os
os.environ["DISABLE_FLASH_ATTN"] = "1"

import json
import numpy as np
import torch
import faiss
from transformers import AutoTokenizer, AutoModelForMaskedLM

MODEL = "InstaDeepAI/nucleotide-transformer-v2-100m-multi-species"
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
MAXLEN = 512
BATCH = 4

REF_INDEX = faiss.read_index("ref_index.faiss")
REF_META = json.load(open("ref_meta.json"))
REF_IDS = REF_META["ids"]
REF_LABELS = REF_META["labels"]

tok = AutoTokenizer.from_pretrained(MODEL, trust_remote_code=True)
mdl = AutoModelForMaskedLM.from_pretrained(
    MODEL,
    trust_remote_code=True,
    output_hidden_states=True,
    torch_dtype=torch.float32,   
    low_cpu_mem_usage=True
).to(DEVICE).eval()

@torch.inference_mode()
def embed_sequences(seqs):
    buf, embs = [], []

    def flush():
        if not buf: 
            return
        x = tok(buf, return_tensors="pt", padding=True, truncation=True, max_length=MAXLEN)
        x = {k: v.to(DEVICE) for k,v in x.items()}
        out = mdl(**x)
        h = out.hidden_states[-1]
        mask = x["attention_mask"].unsqueeze(-1).to(h.dtype)
        pooled = (h * mask).sum(1) / mask.sum(1).clamp_min(1)
        embs.append(pooled.cpu().numpy().astype("float32"))
        buf.clear()

    for seq in seqs:
        buf.append(seq.upper().replace("U", "T"))
        if len(buf) >= BATCH: 
            flush()
    flush()
    return np.vstack(embs)

def classify_asvs(seqs, topk=3, tau=0.2):
    X = embed_sequences(seqs)
    D, I = REF_INDEX.search(X, topk)

    results = []
    for qi, seq in enumerate(seqs):
        seq_res = []
        for j in range(topk):
            idx = int(I[qi, j])
            if idx < 0 or idx >= len(REF_IDS): 
                continue
            rid = REF_IDS[idx]
            lab = REF_LABELS.get(rid, {})
            seq_res.append({
                "ref_id": rid,
                "similarity": float(1 / (1 + D[qi, j])), 
                "phylum": lab.get("phylum", "NA"),
                "class": lab.get("class", "NA")
            })
        if seq_res:
            top = seq_res[0]
            is_reject = 0 if top["similarity"] >= tau else 1
        else:
            top = {"ref_id": "NA", "similarity": 0.0, "phylum": "NA", "class": "NA"}
            is_reject = 1
        results.append({
            "input_seq": seq,
            "top_hit": top,
            "is_reject": is_reject,
            "topk": seq_res
        })
    return results
