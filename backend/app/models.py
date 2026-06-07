"""
Model ORM untuk Analisis Nilai Mahasiswa.

Tabel:
  - mahasiswa   : Data identitas mahasiswa
  - mata_kuliah : Master data mata kuliah
  - nilai       : Relasi mahasiswa ↔ mata_kuliah beserta skor
"""

from sqlalchemy import Integer, Float, String, ForeignKey, Column
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Tabel 1 — mahasiswa
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
class Mahasiswa(Base):
    __tablename__ = "mahasiswa"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    nama_mahasiswa: Mapped[str] = mapped_column(String(255), nullable=False)
    nim = Column(String, unique=True, index=True, nullable=True)

    # Relasi ke tabel nilai
    nilai_list: Mapped[list["Nilai"]] = relationship(
        "Nilai", back_populates="mahasiswa", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<Mahasiswa(id={self.id}, nama='{self.nama_mahasiswa}', nim='{self.nim}')>"


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Tabel 2 — mata_kuliah
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
class MataKuliah(Base):
    __tablename__ = "mata_kuliah"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    nama_mk: Mapped[str] = mapped_column(String(255), nullable=False)

    # Relasi ke tabel nilai
    nilai_list: Mapped[list["Nilai"]] = relationship(
        "Nilai", back_populates="mata_kuliah", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<MataKuliah(id={self.id}, nama_mk='{self.nama_mk}')>"


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Tabel 3 — nilai (tabel relasi / junction)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
class Nilai(Base):
    __tablename__ = "nilai"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    mahasiswa_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("mahasiswa.id", ondelete="CASCADE"), nullable=False
    )
    mata_kuliah_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("mata_kuliah.id", ondelete="CASCADE"), nullable=False
    )
    skor: Mapped[float] = mapped_column(Float, nullable=False)

    # Relasi balik
    mahasiswa: Mapped["Mahasiswa"] = relationship("Mahasiswa", back_populates="nilai_list")
    mata_kuliah: Mapped["MataKuliah"] = relationship("MataKuliah", back_populates="nilai_list")

    def __repr__(self) -> str:
        return (
            f"<Nilai(id={self.id}, mahasiswa_id={self.mahasiswa_id}, "
            f"mk_id={self.mata_kuliah_id}, skor={self.skor})>"
        )
