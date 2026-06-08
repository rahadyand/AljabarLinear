from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import pandas as pd
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
from sklearn.cluster import KMeans
from app.database import get_db
from app.models import Mahasiswa, MataKuliah, Nilai
<<<<<<< HEAD

router = APIRouter(prefix="/analisis", tags=["Analisis"])

=======
from typing import List, Dict, Any
from collections import Counter

router = APIRouter(prefix="/analisis", tags=["Analisis"])

# Mapping nama klaster
KLASTER_NAMES = {
    0: "Praktisi Teknis",
    1: "Analis/Pemikir Kritis",
    2: "Perlu Bimbingan Ekstra"
}

>>>>>>> phase-b-update
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

    # 5.1. Jalankan KMeans (n_clusters=3)
    kmeans = KMeans(n_clusters=3, random_state=42)
    klaster_labels = kmeans.fit_predict(pca_result)

    # 5.2. Hitung Profil Klaster (Rata-rata nilai per mata kuliah untuk setiap klaster)
    df_klaster = pivot_df.copy()
    df_klaster['klaster'] = klaster_labels
    profil_df = df_klaster.groupby('klaster').mean()
    
    # Ubah hasil groupby menjadi dictionary dengan format: {"0": {"MK1": 80, ...}, ...}
    profil_klaster = {str(k): v for k, v in profil_df.to_dict(orient="index").items()}

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
            "PC2": float(pca_result[i, 1]),
            "klaster": int(klaster_labels[i])
        })

<<<<<<< HEAD
=======
    # 7. Hitung Statistik Ringkasan K-Means Clustering
    total_mahasiswa = len(skor_mahasiswa)
    
    # Hitung jumlah mahasiswa per klaster
    klaster_counts = Counter(klaster_labels)
    jumlah_per_klaster = {
        KLASTER_NAMES[klaster_idx]: klaster_counts.get(klaster_idx, 0)
        for klaster_idx in range(3)
    }
    
    # Tentukan klaster dominan (paling banyak mahasiswa)
    klaster_dominan_idx = klaster_labels.argmax() if len(klaster_labels) > 0 else 0
    for klaster_idx in range(3):
        if klaster_counts.get(klaster_idx, 0) > klaster_counts.get(klaster_dominan_idx, 0):
            klaster_dominan_idx = klaster_idx
    
    klaster_dominan_nama = KLASTER_NAMES[klaster_dominan_idx]
    jumlah_dominan = klaster_counts.get(klaster_dominan_idx, 0)
    
    # Tentukan klaster dengan jumlah terkecil untuk kalimat kesimpulan
    jumlah_terkecil = min(jumlah_per_klaster.values())
    klaster_terkecil = [k for k, v in jumlah_per_klaster.items() if v == jumlah_terkecil][0]
    
    # Buat pesan otomatis berdasarkan klaster dominan
    pesan_otomatis = f"Dari total {total_mahasiswa} mahasiswa, mayoritas ({jumlah_dominan} orang) memiliki bakat sebagai {klaster_dominan_nama}, sementara {jumlah_terkecil} orang termasuk dalam kelompok {klaster_terkecil}."
    
    # Buat objek ringkasan
    ringkasan = {
        "total_mahasiswa": total_mahasiswa,
        "jumlah_per_klaster": jumlah_per_klaster,
        "klaster_dominan": klaster_dominan_nama,
        "jumlah_klaster_dominan": jumlah_dominan,
        "pesan_otomatis": pesan_otomatis
    }

>>>>>>> phase-b-update
    return {
        "explained_variance_ratio": explained_variance_ratio,
        "komponen_utama": komponen_utama,
        "skor_mahasiswa": skor_mahasiswa,
<<<<<<< HEAD
        "profil_klaster": profil_klaster
=======
        "profil_klaster": profil_klaster,
        "ringkasan": ringkasan
>>>>>>> phase-b-update
    }
