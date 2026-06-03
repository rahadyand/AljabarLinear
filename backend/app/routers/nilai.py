from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Nilai
from app.schemas import NilaiCreate, NilaiResponse

router = APIRouter(prefix="/nilai", tags=["Nilai"])

@router.post("/", response_model=NilaiResponse)
def create_nilai(nilai: NilaiCreate, db: Session = Depends(get_db)):
    db_nilai = Nilai(**nilai.model_dump())
    db.add(db_nilai)
    db.commit()
    db.refresh(db_nilai)
    return db_nilai

@router.get("/", response_model=list[NilaiResponse])
def get_semua_nilai(db: Session = Depends(get_db)):
    return db.query(Nilai).all()

@router.get("/{mahasiswa_id}", response_model=list[NilaiResponse])
def get_nilai_mahasiswa(mahasiswa_id: int, db: Session = Depends(get_db)):
    return db.query(Nilai).filter(Nilai.mahasiswa_id == mahasiswa_id).all()
