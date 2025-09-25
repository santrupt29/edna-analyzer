from fastapi import FastAPI
from pydantic import BaseModel
from api.classify import classify_asvs

app = FastAPI(title="EDNA Analyzer API")

class ClassifyRequest(BaseModel):
    sequence: str       
    topk: int = 3
    tau: float = 0.75

@app.post("/classify")
def classify(req: ClassifyRequest):
    result = classify_asvs([req.sequence], topk=req.topk, tau=req.tau)[0]
    return result 
