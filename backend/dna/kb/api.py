from fastapi import FastAPI, UploadFile, File
import uvicorn
import os

app = FastAPI(title="EDNA Clustering API", version="1.0.0")

@app.get("/")
async def root():
    return {"message": "DNA Clustering API is running"}

@app.get("/health")
async def health():
    return {"status": "healthy"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
