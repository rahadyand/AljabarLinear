from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import pandas as pd
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
from app.database import get_db
from app.models import Mahasiswa, MataKuliah, Nilai

router = APIRouter(prefix="/analisis", tags=["Analisis"])

@router.post("/pca")
def hitung_pca(db: Session = Depends(get_db)):
    # 1. Tarik semua data dari database
    mahasiswa_list = db.query(Mahasiswa).all()
    
    # Validasi minimal 3 mahasiswa
    if len(mahasiswa_list) < 3:
        raise HTTPException(status_code=400, detail="Data tidak cukup untuk PCA")
        
    nilai_list = db.query(Nilai).all()
    mata_kuliah_list = db.query(MataKuliah).all()
    
    if not nilai_list or not mata_kuliah_list:
        raise HTTPException(status_code=400, detail="Data tidak cukup untuk PCA")

    # Mapping meta data
    mhs_map = {m.id: {"nama_mahasiswa": m.nama_mahasiswa, "nim": m.nim} for m in mahasiswa_list}
    mk_map = {mk.id: mk.nama_mk for mk in mata_kuliah_list}

    # 2. Konversi data ke Pandas DataFrame
    records = []
    for n in nilai_list:
        records.append({
            "mahasiswa_id": n.mahasiswa_id,
            "nama_mk": mk_map.get(n.mata_kuliah_id, f"MK_{n.mata_kuliah_id}"),
            "skor": n.skor
        })
        
    df = pd.DataFrame(records)
    
    if df.empty:
        raise HTTPException(status_code=400, detail="Data tidak cukup untuk PCA")

    # Pivot: Baris = mahasiswa_id, Kolom = nama_mk, Values = skor
    pivot_df = df.pivot_table(index="mahasiswa_id", columns="nama_mk", values="skor", aggfunc="mean")
    
    # Jika hasil pivot memiliki kurang dari 3 baris (mahasiswa ber-nilai) atau kurang dari 2 kolom (mata kuliah)
    if pivot_df.shape[0] < 3 or pivot_df.shape[1] < 2:
        raise HTTPException(status_code=400, detail="Data tidak cukup untuk PCA")

    # 3. Imputasi nilai yang kosong (NaN) dengan 0
    pivot_df = pivot_df.fillna(0)

    # 4. Standardisasi nilai
    scaler = StandardScaler()
    scaled_data = scaler.fit_transform(pivot_df)

    # 5. Jalankan PCA (n_components=2)
    pca = PCA(n_components=2)
    pca_result = pca.fit_transform(scaled_data)

    # 6. Susun Response JSON
    # explained_variance_ratio
    explained_variance_ratio = pca.explained_variance_ratio_.tolist()

    # komponen_utama (loadings)
    komponen_utama = {
        "PC1": {col: float(val) for col, val in zip(pivot_df.columns, pca.components_[0])},
        "PC2": {col: float(val) for col, val in zip(pivot_df.columns, pca.components_[1])}
    }

    # skor_mahasiswa
    skor_mahasiswa = []
    for i, mhs_id in enumerate(pivot_df.index):
        meta = mhs_map.get(mhs_id, {"nama_mahasiswa": "Tidak Dikenal", "nim": None})
        skor_mahasiswa.append({
            "mahasiswa_id": int(mhs_id),
            "nama_mahasiswa": meta["nama_mahasiswa"],
            "nim": meta["nim"],
            "PC1": float(pca_result[i, 0]),
            "PC2": float(pca_result[i, 1])
        })

    return {
        "explained_variance_ratio": explained_variance_ratio,
        "komponen_utama": komponen_utama,
        "skor_mahasiswa": skor_mahasiswa
    }
