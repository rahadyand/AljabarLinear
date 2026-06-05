from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
import pandas as pd
from app.database import get_db
from app.models import Mahasiswa, MataKuliah, Nilai

router = APIRouter(prefix="/upload", tags=["Upload"])

@router.post("/csv")
async def upload_csv(file: UploadFile = File(...), db: Session = Depends(get_db)):
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="File harus berupa CSV")
    
    try:
        # Gunakan utf-8-sig untuk otomatis membuang BOM jika ada
        # Gunakan sep=None dan engine='python' agar Pandas otomatis mendeteksi koma (,) atau titik koma (;)
        df = pd.read_csv(file.file, encoding='utf-8-sig', sep=None, engine='python')
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Gagal membaca file CSV: {str(e)}")

    # 1. Normalisasi nama kolom: hilangkan spasi depan/belakang dan ubah ke huruf kecil semua
    df.columns = df.columns.str.strip().str.lower()

    # 2. Validasi Case Insensitive
    if "nama mahasiswa" not in df.columns:
        raise HTTPException(status_code=400, detail="Kolom 'Nama Mahasiswa' tidak ditemukan dalam CSV")
    
    course_cols = [col for col in df.columns if col not in ["nama mahasiswa", "nim"]]
    
    # Cache dengan menggunakan string lowercase agar pencarian lebih kebal typo huruf besar/kecil
    mahasiswa_cache = {m.nama_mahasiswa.lower(): m for m in db.query(Mahasiswa).all()}
    mk_cache = {mk.nama_mk.lower(): mk for mk in db.query(MataKuliah).all()}
    
    baris_diproses = 0

    # Pastikan mata kuliah sudah ada di database
    for mk_name_lower in course_cols:
        if mk_name_lower not in mk_cache:
            # Gunakan title() agar format di database tetap rapi (misal 'kalkulus' jadi 'Kalkulus')
            baru_mk = MataKuliah(nama_mk=mk_name_lower.title())
            db.add(baru_mk)
            db.flush() # Flush agar mendapatkan ID
            mk_cache[mk_name_lower] = baru_mk

    for index, row in df.iterrows():
        nama_mhs = row["nama mahasiswa"]
        if pd.isna(nama_mhs):
            continue # Lewati baris jika nama mahasiswa kosong

        nama_mhs = str(nama_mhs).strip()
        nama_mhs_lower = nama_mhs.lower()
        
        # Tangani kolom NIM jika ada
        nim_val = None
        if "nim" in df.columns:
            nim_raw = row["nim"]
            if pd.notna(nim_raw):
                nim_str = str(nim_raw)
                # Tangani masalah float misal 12345.0
                if nim_str.endswith(".0"):
                    nim_str = nim_str[:-2]
                nim_val = nim_str.strip()
        
        # Cek dan simpan nama mahasiswa
        if nama_mhs_lower not in mahasiswa_cache:
            baru_mhs = Mahasiswa(nama_mahasiswa=nama_mhs, nim=nim_val) # Simpan dengan format aslinya beserta nim
            db.add(baru_mhs)
            db.flush()
            mahasiswa_cache[nama_mhs_lower] = baru_mhs
        else:
            mhs_db = mahasiswa_cache[nama_mhs_lower]
            # Update nim jika sebelumnya None tapi sekarang ada di CSV
            if nim_val and not mhs_db.nim:
                mhs_db.nim = nim_val
        
        mhs_db = mahasiswa_cache[nama_mhs_lower]

        # Simpan nilai untuk setiap mata kuliah
        for mk_name_lower in course_cols:
            skor = row[mk_name_lower]
            
            # Abaikan jika nilai kosong (NaN) di CSV
            if pd.isna(skor):
                continue
                
            mk_db = mk_cache[mk_name_lower]

            # Cek apakah nilai sudah ada (update jika ada, insert jika baru)
            existing_nilai = db.query(Nilai).filter(
                Nilai.mahasiswa_id == mhs_db.id,
                Nilai.mata_kuliah_id == mk_db.id
            ).first()

            if existing_nilai:
                try:
                    existing_nilai.skor = float(skor)
                except ValueError:
                    pass # Abaikan skor jika tidak bisa diubah ke angka float
            else:
                try:
                    baru_nilai = Nilai(
                        mahasiswa_id=mhs_db.id,
                        mata_kuliah_id=mk_db.id,
                        skor=float(skor)
                    )
                    db.add(baru_nilai)
                except ValueError:
                    pass # Abaikan skor jika tidak bisa diubah ke angka float
        
        baris_diproses += 1

    # Commit semua perubahan di akhir agar efisien
    db.commit()

    return {
        "pesan": "File CSV berhasil diproses",
        "baris_diproses": baris_diproses
    }
