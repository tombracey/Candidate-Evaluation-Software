from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from src.evaluate_tables import evaluate_table
from src.evaluate_cvs import evaluate_all_CVs
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional

app = FastAPI()

# Request models
class EvaluateTableRequest(BaseModel):
    path: str
    find_travel_time: bool = False
    travel_weight: Optional[float] = 0.35
    employer_address: Optional[str]
    candidate_address_column: Optional[str] = None
    metrics: Optional[dict] = None

class EvaluateAllCVsRequest(BaseModel):
    pool: List[str]
    role: str
    location: Optional[str] = None
    description: Optional[str] = None

# Endpoints
@app.post("/evaluate_table/")
async def evaluate_table_endpoint(request: EvaluateTableRequest):
    try:
        result = evaluate_table(
            path=request.path,
            find_travel_time=request.find_travel_time,
            travel_weight=request.travel_weight,
            employer_address=request.employer_address,
            candidate_address_column=request.candidate_address_column,
            **(request.metrics or {})
        )
        return {"ok": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/evaluate_all_CVs/")
async def evaluate_all_CVs_endpoint(request: EvaluateAllCVsRequest):
    try:
        result = evaluate_all_CVs(
            pool=request.pool,
            role=request.role,
            location=request.location,
            description=request.description
        )
        return {"ok": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)