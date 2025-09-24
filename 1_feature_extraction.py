import pandas as pd
from Bio import SeqIO
from collections import defaultdict
import itertools

# --- Configuration ---
INPUT_FASTA = "data/sample_10000.fasta"
OUTPUT_CSV = "data/kmer_counts_10k.csv"
K = 6 # The length of the k-mer

def count_kmers(sequence, k):
    """Counts all k-mers in a given DNA sequence."""
    kmer_counts = defaultdict(int)
    for i in range(len(sequence) - k + 1):
        kmer = sequence[i:i+k]
        if "N" not in kmer: # Ignore k-mers with unknown bases
            kmer_counts[kmer] += 1
    return dict(kmer_counts)

def main():
    """Main function to process the FASTA file and save k-mer counts."""
    print(f"Processing {INPUT_FASTA} for k-mers of length {K}...")

    # A list to hold the k-mer data for each sequence
    all_sequence_data = []

    # Read the FASTA file
    for record in SeqIO.parse(INPUT_FASTA, "fasta"):
        seq_id = record.id
        sequence = str(record.seq).upper()
        
        # Count k-mers for the current sequence
        kmer_counts = count_kmers(sequence, K)
        
        # Add the sequence ID to the dictionary
        kmer_counts['sequence_id'] = seq_id
        
        all_sequence_data.append(kmer_counts)

    # Convert the list of dictionaries to a pandas DataFrame
    # The fillna(0) ensures that if a k-mer is absent in a sequence, its count is 0
    df = pd.DataFrame(all_sequence_data).fillna(0)

    # Reorder columns to have 'sequence_id' first
    if 'sequence_id' in df.columns:
        cols = ['sequence_id'] + [col for col in df.columns if col != 'sequence_id']
        df = df[cols]

    # Save the DataFrame to a CSV file
    df.to_csv(OUTPUT_CSV, index=False)
    print(f"Success! K-mer counts saved to {OUTPUT_CSV}")
    print(f"DataFrame shape: {df.shape[0]} sequences, {df.shape[1]} features (k-mers).")

if __name__ == "__main__":
    main()