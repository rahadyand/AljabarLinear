"""
Konfigurasi koneksi database SQLAlchemy (SQLite lokal).
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase

# ──────────────────────────────────────────────
# SQLite disimpan di root proyek sebagai `analisis_nilai.db`
# ──────────────────────────────────────────────
SQLALCHEMY_DATABASE_URL = "sqlite:///./analisis_nilai.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},  # diperlukan untuk SQLite
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    """Base class untuk semua model ORM."""
    pass


def get_db():
    """
    Dependency FastAPI: menghasilkan session database per-request
    dan memastikan session ditutup setelah selesai.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
