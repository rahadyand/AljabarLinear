"""
Pydantic v2 schemas untuk Analisis Nilai Mahasiswa (PCA).

Pemisahan:
  - Base     : field-field dasar yang dipakai bersama
  - Create   : schema input dari user (inherit Base)
  - Response : schema output ke frontend (inherit Base + id)
"""

from pydantic import BaseModel, ConfigDict


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Mahasiswa
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
class MahasiswaBase(BaseModel):
    nama_mahasiswa: str


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
