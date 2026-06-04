from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import MataKuliah
from app.schemas import MataKuliahCreate, MataKuliahResponse

router = APIRouter(prefix="/mata-kuliah", tags=["Mata Kuliah"])

@router.post("/", response_model=MataKuliahResponse)
def create_mata_kuliah(mata_kuliah: MataKuliahCreate, db: Session = Depends(get_db)):
    db_mk = MataKuliah(**mata_kuliah.model_dump())
    db.add(db_mk)
    db.commit()
    db.refresh(db_mk)
    return db_mk

@router.get("/", response_model=list[MataKuliahResponse])
def get_semua_mata_kuliah(db: Session = Depends(get_db)):
    return db.query(MataKuliah).all()
