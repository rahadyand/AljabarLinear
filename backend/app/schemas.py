"""
Pydantic v2 schemas untuk Analisis Nilai Mahasiswa (PCA).

Pemisahan:
  - Base     : field-field dasar yang dipakai bersama
  - Create   : schema input dari user (inherit Base)
  - Response : schema output ke frontend (inherit Base + id)
"""

from pydantic import BaseModel, ConfigDict
from typing import Optional, Dict, List, Any


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Mahasiswa
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
class MahasiswaBase(BaseModel):
    nama_mahasiswa: str
    nim: Optional[str] = None


class MahasiswaCreate(MahasiswaBase):
    pass


class MahasiswaResponse(MahasiswaBase):
    id: int

    model_config = ConfigDict(from_attributes=True)


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Mata Kuliah
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
class MataKuliahBase(BaseModel):
    nama_mk: str


class MataKuliahCreate(MataKuliahBase):
    pass


class MataKuliahResponse(MataKuliahBase):
    id: int

    model_config = ConfigDict(from_attributes=True)


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Nilai
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
class NilaiBase(BaseModel):
    mahasiswa_id: int
    mata_kuliah_id: int
    skor: float


class NilaiCreate(NilaiBase):
    pass


class NilaiResponse(NilaiBase):
    id: int

    model_config = ConfigDict(from_attributes=True)


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PCA Analysis Response Schemas
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
class SkorMahasiswaResponse(BaseModel):
    """Schema untuk skor PCA setiap mahasiswa"""
    mahasiswa_id: int
    nama_mahasiswa: str
    nim: Optional[str] = None
    PC1: float
    PC2: float
    klaster: int


class RingkasanKlaster(BaseModel):
    """Schema untuk ringkasan statistik K-Means clustering"""
    total_mahasiswa: int
    jumlah_per_klaster: Dict[str, int]
    klaster_dominan: str
    jumlah_klaster_dominan: int
    pesan_otomatis: str


class PCAResponse(BaseModel):
    """Schema untuk response lengkap endpoint PCA"""
    explained_variance_ratio: List[float]
    komponen_utama: Dict[str, Dict[str, float]]
    skor_mahasiswa: List[SkorMahasiswaResponse]
    profil_klaster: Dict[str, Dict[str, float]]
    ringkasan: RingkasanKlaster
