from http.client import HTTPException
from fastapi import FastAPI, UploadFile, File
from pydantic import BaseModel
import torch
import joblib
import numpy as np
from transformers import AutoTokenizer
from transformers import AutoModelForMaskedLM
from hdbscan import approximate_predict
from Bio import SeqIO
import io
from sklearn.metrics import silhouette_score, silhouette_samples
import traceback
import os

BASE_DIR = os.path.dirname(__file__)
HDBSCAN_MODEL_PATH = os.path.join(BASE_DIR, "hdbscan_model.pkl")

MODEL_NAME = "InstaDeepAI/nucleotide-transformer-v2-50m-multi-species"
# HDBSCAN_MODEL_PATH = "hdbscan_model.pkl"
MAX_LENGTH = 20
print("Loading Nucleotide Transformer...")
tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME, trust_remote_code=True)
model = AutoModelForMaskedLM.from_pretrained(MODEL_NAME, trust_remote_code=True)
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model.to(device).eval()
print("Transformer model loaded.")
print("Loading HDBSCAN model")
clusterer = joblib.load(HDBSCAN_MODEL_PATH)
print("model loaded loaded.")
app = FastAPI()

def seq_to_kmers(seq, k=6):
    seq = seq.upper()
    return " ".join([seq[i:i+k] for i in range(len(seq)-k+1)])
@app.post("/predict_fasta")
async def predict_fasta(file: UploadFile = File(...)):
    try:
        content = await file.read()
        fasta_io = io.StringIO(content.decode("utf-8", errors="ignore"))
        sequences = []
        ids = []
        for record in SeqIO.parse(fasta_io, "fasta"):
            ids.append(record.id)
            sequences.append(str(record.seq))
        if not sequences:
            raise HTTPException(400, "No sequences found in FASTA file.")
        print(f"Parsed {len(sequences)} sequences from {file.filename}")
        batch_kmers = [seq_to_kmers(s) for s in sequences]
        inputs = tokenizer(
            batch_kmers,
            return_tensors="pt",
            padding=True,
            truncation=True,
            max_length=MAX_LENGTH
        )
        inputs = {k: v.to(device) for k, v in inputs.items()}
        print("Tokenization done. Shape:", inputs["input_ids"].shape)
        with torch.no_grad():
            outputs = model(**inputs, output_hidden_states=True)
            last_hidden = outputs.hidden_states[-1]
            mean_embeddings = last_hidden.mean(dim=1).cpu().numpy()
        print("Embeddings generated. Shape:", mean_embeddings.shape)
        labels = clusterer.fit_predict(mean_embeddings)
        strengths = [1.0 if l != -1 else 0.0 for l in labels] 
        print("Clustering done. Found clusters:", set(labels))
        valid_mask = np.array(labels) != -1
        silhouette_avg, per_sample_sil = None, None
        if np.unique(np.array(labels)[valid_mask]).shape[0] > 1:
            silhouette_avg = silhouette_score(mean_embeddings[valid_mask], np.array(labels)[valid_mask])
            per_sample_sil = silhouette_samples(mean_embeddings[valid_mask], np.array(labels)[valid_mask])
        results = []
        for i in range(len(ids)):
            result = {
                "id": ids[i],
                "cluster": int(labels[i]),
                "confidence": round(float(strengths[i]), 3)
            }
            if labels[i] == -1:
                result["note"] = "Potential novel/unknown sequence"
            if per_sample_sil is not None and valid_mask[i]:
                result["silhouette"] = round(float(per_sample_sil[list(np.where(valid_mask)[0]).index(i)]), 3)
            results.append(result)
        return {
            "overall_silhouette": round(float(silhouette_avg), 3) if silhouette_avg else None,
            "results": results
        }
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(500, f"Server error: {str(e)}")
@app.get("/")
def root():
    return {"message": "DNA Clustering API is running"}
