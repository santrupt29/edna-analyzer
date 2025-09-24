
# 🧬 edna-analyzer

<div align="center">

**AI-powered discovery engine for environmental DNA.** <sub>Classify known species with confidence and surface novel taxa from the "unassigned."</sub>

</div>

<div align="center">

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python Version](https://img.shields.io/badge/python-3.9+-blue.svg)](https://www.python.org/downloads/)
[![Code style: black](https://img.shields.io/badge/code%20style-black-000000.svg)](https://github.com/psf/black)
[![Status](https://img.shields.io/badge/status-active-brightgreen.svg)]()

</div>

---

### The Problem: Databases Can't Keep Up

Traditional eDNA analysis pipelines rely on matching sequences to reference databases. For frontier environments like the deep sea, these databases are vastly incomplete, leaving a majority of reads **unassigned**. This isn't just noise—it's a missed opportunity for discovery.

### Our Solution: Understand DNA's Language

`edna-analyzer` takes a different approach. It uses a **DNA foundation model**—an AI that has learned the fundamental patterns of DNA sequences. Instead of just "matching words" (exact sequences), it understands the "grammar" and context.

This allows us to:
1.  **Confidently Classify** reads that have a strong semantic similarity to a curated set of known organisms.
2.  **Systematically Discover** what's new by clustering the remaining reads, turning the "unassigned" majority into a prioritized list of candidate novel species.

## Visual Workflow

```mermaid
graph LR
    A[FASTQ/FASTA Reads] --> B{1. Preprocess};
    B --> C[Clean Reads];
    C --> D{2. Embed};
    D -- Nucleotide Transformer --> E[Sequence Vectors];
    E --> F{3. Search};
    F -- FAISS ANN Search --> G{Similarity ≥ τ ?};
    G -- Yes --> H[✅ Assigned Taxon];
    G -- No --> I[❓ Unassigned];
    I --> J{4. Cluster};
    J -- HDBSCAN --> K[🔬 Candidate Novel Taxa];
    H & K --> L{5. Report};
    L --> M[📊 Abundance, Diversity & Visuals];
````

## Core Features

  * **AI-Powered Classification**: Uses `Nucleotide-Transformer` embeddings to capture deep sequence context, providing more robust classification than alignment-based methods.
  * **High-Speed Vector Search**: Employs **FAISS** (`IVF-PQ`) for approximate nearest neighbor search, enabling rapid comparison of millions of reads against our reference index.
  * **Automated Novelty Discovery**: Applies **HDBSCAN**, a powerful density-based clustering algorithm, to group unassigned vectors into high-confidence candidates for new taxa.
  * **Actionable Outputs**: Generates publication-ready tables (`.csv`), biodiversity metrics (`.json`), and interactive visualizations (`.html` with Krona/UMAP).
  * **Reproducible & Accessible**: Fully containerized with **Docker** and accessible via a **FastAPI** backend and a simple web interface.

-----

## 🚀 Quickstart

### 1\. Docker (Recommended)

Get the full application stack running with a single command.

```bash
# Build and start the services (API, UI, etc.)
docker compose up --build

# ➡️ API is now live at http://localhost:8000
# ➡️ Interactive Docs at http://localhost:8000/docs
# ➡️ Web UI at http://localhost:3000
```

### 2\. Local Python Environment

For command-line use and development.

```bash
# 1. Clone & setup environment
git clone [https://github.com/santrupt29/edna-analyzer.git](https://github.com/santrupt29/edna-analyzer.git)
cd edna-analyzer
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

# 2. Download model & build index (one-time setup)
python scripts/download_model.py
python scripts/build_index.py --refs anchors/refs_all.fasta --out anchors/ref_index.faiss

# 3. Run a sample analysis
python scripts/run_pipeline.py \
  --input data/sample.fastq \
  --out results/ \
  --tau 0.20
```

-----

## 📁 Inputs & Outputs

| File Type          | Description                                                                                             |
| ------------------ | ------------------------------------------------------------------------------------------------------- |
| **Input** | `FASTQ` / `FASTA` files (gzipped `.gz` accepted) for 18S or COI amplicons.                                |
| **Output Files** |                                                                                                         |
| `results.csv`      | Per-read results: assigned taxon, similarity score, or novel cluster ID.                                |
| `clusters.csv`     | Novel cluster summary: size, exemplar sequence, nearest known relative.                                 |
| `abundance.csv`    | Counts and relative abundance matrix (samples vs. taxa/clusters).                                       |
| `diversity.json`   | Key metrics: Shannon, Simpson (Alpha), Bray-Curtis (Beta).                                              |
| `report.html`      | Interactive summary report with plots and charts.                                                       |
| `summary.json`     | Run parameters, file checksums, and versions for full reproducibility.                                  |

-----

## 🔧 Key Configuration

| Flag                 | Description                                       | Default    |
| -------------------- | ------------------------------------------------- | ---------- |
| `--input`            | Path to input FASTQ/FASTA file.                   | `None`     |
| `--out`              | Output directory for results.                     | `results/` |
| `--tau`              | Similarity threshold for classification.          | `0.20`     |
| `--topk`             | Number of neighbors to retrieve from FAISS.       | `5`        |
| `--min-cluster-size` | HDBSCAN parameter for minimum cluster size.       | `10`       |
| `--max-reads`        | Subsample input to N reads for a quick preview.   | `None`     |

-----

## 🛣️ Roadmap

  - [ ] **Model Enhancements**: Fine-tune the foundation model on a curated set of marine taxa.
  - [ ] **Auto-τ Calibration**: Develop a method to automatically recommend an optimal `τ` threshold based on the input data's similarity distribution.
  - [ ] **Hybrid Search Index**: Explore HNSW+PQ indexes in FAISS for potentially faster and more accurate search.
  - [ ] **Scalable Workflow**: Port the core logic to Nextflow/Snakemake for seamless execution on HPC and cloud platforms.
  - [ ] **Phylogenetic Placement**: For novel clusters, place the exemplar sequence onto a reference tree to better visualize its evolutionary context.

## 🤝 Contributing

Contributions are welcome\! Please open an issue to discuss bugs or feature ideas before submitting a pull request.

**Contributors:** Santrupt Potphode, Aniket Desai, Gaurav Sharma, Rakshitha Kowlikar, Kartik Bulusu

## 🙏 Acknowledgements

This work is for the **Smart India Hackathon 2025**, in service of the **Ministry of Earth Sciences (MoES)** and **CMLRE**. We stand on the shoulders of giants—thank you to the maintainers of PyTorch, Hugging Face, FAISS, HDBSCAN, and many other open-source projects.

## ⚖️ License

Licensed under the **MIT License**.

## 🖋️ Citation

```bibtex
@software{edna_analyzer_2025,
  title  = {edna-analyzer: Reference-light AI for Deep-Sea eDNA},
  year   = {2025},
  author = {Potphode, Santrupt and Desai, Aniket and Sharma, Gaurav and Kowlikar, Rakshitha and Bulusu, Kartik},
  url    = {[https://github.com/santrupt29/edna-analyzer](https://github.com/santrupt29/edna-analyzer)}
}
```

```
```
