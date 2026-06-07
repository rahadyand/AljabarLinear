from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Mahasiswa
from app.schemas import MahasiswaCreate, MahasiswaResponse

router = APIRouter(prefix="/mahasiswa", tags=["Mahasiswa"])

@router.post("/", response_model=MahasiswaResponse)
def create_mahasiswa(mahasiswa: MahasiswaCreate, db: Session = Depends(get_db)):
    db_mahasiswa = Mahasiswa(**mahasiswa.model_dump())
    db.add(db_mahasiswa)
    db.commit()
    db.refresh(db_mahasiswa)
    return db_mahasiswa

@router.get("/", response_model=list[MahasiswaResponse])
def get_semua_mahasiswa(db: Session = Depends(get_db)):
    return db.query(Mahasiswa).all()

@router.delete("/{mahasiswa_id}")
def delete_mahasiswa(mahasiswa_id: int, db: Session = Depends(get_db)):
    db_mahasiswa = db.query(Mahasiswa).filter(Mahasiswa.id == mahasiswa_id).first()
    if not db_mahasiswa:
        raise HTTPException(status_code=404, detail="Mahasiswa tidak ditemukan")
    
    from app.models import Nilai
    db.query(Nilai).filter(Nilai.mahasiswa_id == mahasiswa_id).delete()
    
    db.delete(db_mahasiswa)
    db.commit()
    return {"message": "Data mahasiswa dan nilai terkait berhasil dihapus"}
