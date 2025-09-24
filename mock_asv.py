from pathlib import Path
import argparse, random, numpy as np
from Bio import SeqIO

DNA = ("A","C","G","T")

def mutate(seq: str, rate: float, seed: int, ensure_at_least_one=True) -> str:
    rng = random.Random(seed)
    s = seq.upper().replace("U","T")
    out = []
    flips = 0
    for ch in s:
        if ch not in DNA:
            out.append(ch); continue
        if rng.random() < rate:
            flips += 1
            out.append(rng.choice([b for b in DNA if b != ch]))
        else:
            out.append(ch)
    if ensure_at_least_one and flips == 0:
        idxs = [i for i,c in enumerate(out) if out[i] in DNA]
        if idxs:
            i = rng.choice(idxs)
            cur = out[i]
            out[i] = rng.choice([b for b in DNA if b != cur])
    return "".join(out)

def fragment(seq: str, target_len: int, seed: int) -> str:
    if target_len <= 0 or len(seq) <= target_len:
        return seq
    rng = random.Random(seed)
    start = rng.randint(0, max(0, len(seq)-target_len))
    return seq[start:start+target_len]

if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--refs-fasta", required=True)
    ap.add_argument("--outdir", required=True)
    ap.add_argument("--n-asvs", type=int, default=400)
    ap.add_argument("--fragment-len", type=int, default=250, help="0 to disable")
    ap.add_argument("--mutation-rate", type=float, default=0.01)
    ap.add_argument("--n-samples", type=int, default=4)
    ap.add_argument("--seed", type=int, default=42)
    args = ap.parse_args()

    outdir = Path(args.outdir); outdir.mkdir(parents=True, exist_ok=True)
    refs = list(SeqIO.parse(args.refs_fasta, "fasta"))
    if not refs: raise SystemExit("no sequences in refs_all.fasta")

    n = min(args.n_asvs, len(refs))
    rng = random.Random(args.seed)
    picks = rng.sample(refs, n)

    asv_records = []
    for i, rec in enumerate(picks, 1):
        base = str(rec.seq).upper().replace("U","T")
        frag = fragment(base, args.fragment_len, args.seed + i)
        mut  = mutate(frag, args.mutation_rate, args.seed + i, ensure_at_least_one=True)
        rec.id = f"ASV_{i:05d}"; rec.description = ""; rec.seq = type(rec.seq)(mut)
        asv_records.append(rec)

    asv_fa = outdir / "mock_asvs.fasta"
    SeqIO.write(asv_records, asv_fa, "fasta")

    np_rng = np.random.default_rng(args.seed)
    lam = np_rng.uniform(5, 30, size=args.n_samples)
    counts = np_rng.poisson(lam, size=(len(asv_records), args.n_samples))
    counts[np_rng.random(counts.shape) < 0.15] = 0

    asv_tsv = outdir / "mock_asv_table.tsv"
    with asv_tsv.open("w") as f:
        f.write("ASV_id\t" + "\t".join([f"sample_{i+1}" for i in range(args.n_samples)]) + "\n")
        for i, r in enumerate(asv_records):
            f.write(r.id + "\t" + "\t".join(map(str, counts[i].tolist())) + "\n")

    print(str(asv_fa))
    print(str(asv_tsv))
