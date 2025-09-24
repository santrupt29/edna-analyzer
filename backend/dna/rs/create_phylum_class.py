import csv

NODES = "taxanomy/nodes.dmp"
NAMES = "taxanomy/names.dmp"

def load_nodes():
    nodes = {}
    with open(NODES, "r", encoding="utf-8") as f:
        for line in f:
            parts = [p.strip() for p in line.split("|")]
            taxid = int(parts[0]); parent = int(parts[1]); rank = parts[2]
            nodes[taxid] = (parent, rank)
    return nodes

def load_names():
    sci = {}
    with open(NAMES, "r", encoding="utf-8") as f:
        for line in f:
            parts = [p.strip() for p in line.split("|")]
            taxid = int(parts[0]); name = parts[1]; nclass = parts[3]
            if nclass == "scientific name":
                sci[taxid] = name
    return sci

def climb(nodes, start, target_rank):
    seen=set(); t=start
    while t and t not in seen:
        seen.add(t)
        parent, rank = nodes.get(t, (None,None))
        if rank == target_rank:
            return t
        t = parent
    return None

def annotate(id_tax_tsv, out_tsv, nodes, names):
    with open(id_tax_tsv,"r",encoding="utf-8") as f, open(out_tsv,"w",newline="",encoding="utf-8") as out:
        r=csv.reader(f,delimiter="\t"); w=csv.writer(out,delimiter="\t")
        w.writerow(["accession","taxid","scientific_name","phylum","class"])
        header_skipped=False
        for row in r:
            if not row: continue
            if not header_skipped and row[0].lower().startswith("accession"):
                header_skipped=True; continue
            acc,taxid=row[0],row[1]; sci=row[2] if len(row)>2 else ""
            try: t=int(taxid)
            except: w.writerow([acc,taxid,sci,"NA","NA"]); continue
            phy_id=climb(nodes,t,"phylum"); cls_id=climb(nodes,t,"class")
            phy=names.get(phy_id,"NA") if phy_id else "NA"
            cls=names.get(cls_id,"NA") if cls_id else "NA"
            w.writerow([acc,taxid,sci,phy,cls])

if __name__=="__main__":
    nodes=load_nodes(); names=load_names()
    annotate("dataset_sample/SSU/SSU_eukaryote_rRNA.id_tax.tsv","dataset_sample/SSU/SSU_eukaryote_rRNA.phylum_class.tsv",nodes,names)
    annotate("dataset_sample/ITS/ITS_eukaryote_sequences.id_tax.tsv","dataset_sample/ITS/ITS_eukaryote_sequences.phylum_class.tsv",nodes,names)
    print("Phylum/class TSVs written.")
