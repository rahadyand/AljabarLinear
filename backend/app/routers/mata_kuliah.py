from fastapi import APIRouter, Depends, HTTPException
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

@router.delete("/{mk_id}")
def delete_mata_kuliah(mk_id: int, db: Session = Depends(get_db)):
    db_mk = db.query(MataKuliah).filter(MataKuliah.id == mk_id).first()
    if not db_mk:
        raise HTTPException(status_code=404, detail="Mata Kuliah tidak ditemukan")
    
    from app.models import Nilai
    db.query(Nilai).filter(Nilai.mata_kuliah_id == mk_id).delete()
    
    db.delete(db_mk)
    db.commit()
    return {"message": "Data mata kuliah dan nilai terkait berhasil dihapus"}
