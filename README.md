
# edna-analyzer

> **Reference-light, AI-first analysis of deep-sea eDNA**  
> Classify 18S/COI reads, surface putative **novel taxa**, and compute biodiversity metrics — even when reference databases are sparse.

---

## Problem Statement (SIH-25042)

Deep-sea biodiversity is under-catalogued. Database-dependent pipelines (QIIME2/DADA2, BLAST-based) often misclassify or leave many eDNA reads **unassigned** because PR2/SILVA/NCBI have limited coverage for deep-sea eukaryotes.

**edna-analyzer** minimizes reliance on those databases by learning from **DNA foundation-model embeddings**. It assigns labels **only when confident** and clusters the rest to highlight candidate **new/rare taxa** for CMLRE/MoES monitoring and discovery.

---

## Key Features

- **Foundation-model embeddings** (Nucleotide-Transformer v2-100M; Hugging Face/PyTorch).  
- **ANN search** with **FAISS (IVF-PQ)** + calibrated **τ** threshold for conservative labeling.  
- **Novelty discovery**: HDBSCAN on rejected reads; **Novelty Index** per cluster; exemplar sequence + nearest known relative.  
- **Ecology outputs**: per-sample abundance, **Shannon/Simpson**, **Bray–Curtis**, optional **Krona** + UMAP visualizations.  
- **API + UI**: FastAPI backend; simple web UI (Next.js/React or Streamlit) for upload → results.  
- **Reproducible & offline-friendly**: versioned artifacts (`refs_all.fasta`, `ref_index.faiss`, `ref_meta.json`), `summary.json` with checksums.

---

## Pipeline (High Level)

1. **Preprocess**: trim/quality-filter; discard **< 30 bp**; de-novo chimera removal.  
2. **Embed**: convert reads → fixed-dim vectors (mean-pool; future: `[CLS]`).  
3. **Search/Assign**: FAISS ANN against small **anchor** set (PR2/SILVA/BOLD slice).  
   - if similarity ≥ **τ** → assign at highest reliable rank (order → family → genus)  
   - else **reject** → mark **unassigned**  
4. **Cluster negatives**: HDBSCAN on unassigned → **candidate novel groups**  
5. **Summarize**: abundance tables, diversity metrics, **Novelty Index**, HTML/CSV/JSON reports

---

## Repository Structure

```

edna-analyzer/
├─ pipeline/           # ingest → embed → search → cluster → report
├─ models/             # cached model weights/tokenizer
├─ anchors/            # refs\_all.fasta, refs\_all.phylum\_class.tsv, ref\_index.faiss, ref\_meta.json
├─ api/                # FastAPI app (REST endpoints)
├─ ui/                 # Next.js/React or Streamlit UI
├─ scripts/            # embed.py, build\_index.py, run\_pipeline.py, etc.
├─ requirements.txt
├─ docker-compose.yml
└─ README.md

````

*(Folder names may differ slightly; adjust to your tree.)*

---

## Quickstart

### 1) Local (Python)

```bash
# Clone
git clone https://github.com/santrupt29/edna-analyzer.git
cd edna-analyzer

# Create env
python3 -m venv .venv
source .venv/bin/activate

# Install deps
pip install -r requirements.txt

# First run: fetch model + build FAISS index
python scripts/download_model.py
python scripts/build_index.py --refs anchors/refs_all.fasta --out anchors/ref_index.faiss

# Run on example data
python scripts/run_pipeline.py \
  --input data/sample.fastq \
  --out results/ \
  --tau 0.20 \
  --topk 5 \
  --min-cluster-size 10 \
  --min-samples 5
````

### 2) Docker (optional)

```bash
docker compose up --build
# API → http://localhost:8000 (OpenAPI docs at /docs)
# UI  → http://localhost:3000
```

---

## Inputs & Outputs

**Inputs**

* FASTQ/FASTA (gz accepted). Amplicons: **18S rRNA / COI**.

**Outputs (in `results/`)**

* `results.csv` — per-read label (taxon, rank, similarity, cluster\_id)
* `clusters.csv` — novel clusters (size, Novelty Index, exemplar, nearest relative)
* `abundance.csv` — counts & relative abundance per sample × taxon/cluster
* `diversity.json` — Shannon, Simpson, Bray–Curtis (+ ordination coords if computed)
* `report.html` — interactive plots (UMAP/Krona, bars/stacks)
* `summary.json` — parameters, counts, model/index versions, SHA-256 checksums

---

## FastAPI (Core Endpoints)

* `POST /api/v1/jobs` — submit analysis (file upload or S3/MinIO URL)
* `GET  /api/v1/jobs/{id}` — job status + summary
* `GET  /api/v1/jobs/{id}/results` — per-read/class/cluster outputs
* `GET  /api/v1/refs/health` — versions & checksums of model/anchors/index

*(See live docs at `/docs` after the server starts.)*

---

## Configuration (Common Flags)

* `--tau` : similarity threshold for assignment (default: **0.20**, conservative)
* `--topk`: FAISS neighbors to retrieve (typ. 5–10)
* `--min-cluster-size`, `--min-samples` : HDBSCAN granularity
* `--metric`: similarity metric (`l2` now; **cosine/FlatIP** planned)
* `--max-reads`: cap for very large inputs (quick subsample previews)

---

## Tech Stack

* **Algorithm/ML** — PyTorch, Hugging Face (NT v2-100M), FAISS (IVF-PQ), HDBSCAN
* **Backend** — FastAPI (+ Celery/Redis optional), Nextflow/Snakemake
* **Frontend** — Next.js/React or Streamlit; Plotly + Krona
* **Data/Storage** — PostgreSQL; MinIO/S3 or local FS; Dockerized deploy
* **Security** — TLS, JWT/API keys; versioned artifacts (SHA-256)

---

## Roadmap (Post-Prototype)

* **Model**: larger transformer; **`[CLS]` pooling**; **sliding-window** for long reads
* **Search**: normalize embeddings; **cosine / FlatIP**; **OPQ+PQ** for huge refs; hybrid HNSW+IVF
* **Calibration**: **auto-τ** from similarity distributions / energy-based OOD; rank-aware stop (order→family→genus)
* **Interpretability**: for each novel cluster, show **nearest relative** + exemplars
* **Workflow**: full Nextflow/Snakemake; cloud batch; richer reports & maps

---

## Data & References

* PR2 (18S): [https://pr2-database.org](https://pr2-database.org)
* SILVA SSU: [https://www.arb-silva.de](https://www.arb-silva.de)
* BOLD (COI): [https://www.boldsystems.org](https://www.boldsystems.org)
* NCBI BLAST DB FTP (anchors/baselines): [https://ftp.ncbi.nlm.nih.gov/blast/db/](https://ftp.ncbi.nlm.nih.gov/blast/db/)
* FAISS: [https://github.com/facebookresearch/faiss](https://github.com/facebookresearch/faiss)
* HDBSCAN: [https://hdbscan.readthedocs.io](https://hdbscan.readthedocs.io)
* Krona: [https://github.com/marbl/Krona](https://github.com/marbl/Krona)

---

## Contributing

Issues and PRs are welcome! Please open an issue describing bugs/feature requests before large changes.

---

## Contributors

* **Santrupt Potphode**
* **Aniket Desai**
* **Gaurav Sharma**
* **Rakshitha Kowlikar**
* **Kartik Bulusu**

---

## Acknowledgements

Ministry of Earth Sciences (MoES), **CMLRE**, and the **Smart India Hackathon (SIH 2025)**. Thanks to the maintainers of PR2, SILVA, FAISS, and HDBSCAN.

---

## License

Specify your license (e.g., MIT) in `LICENSE`. If unsure, start with MIT and update later.

---

## Citation

```bibtex
@software{edna_analyzer_2025,
  title  = {edna-analyzer: Reference-light AI for Deep-Sea eDNA},
  year   = {2025},
  author = {Potphode, Santrupt and Desai, Aniket and Sharma, Gaurav and Kowlikar, Rakshitha and Bulusu, Kartik},
  url    = {https://github.com/santrupt29/edna-analyzer}
}
```

```
::contentReference[oaicite:0]{index=0}
```
