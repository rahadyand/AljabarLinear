from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
# Import model untuk meregistrasikan metadata tabel
from app.models import Mahasiswa, MataKuliah, Nilai
from app.routers import mahasiswa, mata_kuliah, nilai, analisis, upload

# Buat tabel database secara otomatis
Base.metadata.create_all(bind=engine)

app = FastAPI(title="API Analisis Nilai PCA")

# Konfigurasi CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Daftarkan router
app.include_router(mahasiswa.router)
app.include_router(mata_kuliah.router)
app.include_router(nilai.router)
app.include_router(analisis.router)
app.include_router(upload.router)

# Health Check Endpoint
@app.get("/")
def read_root():
    return {"message": "API Analisis Nilai PCA Aktif"}
