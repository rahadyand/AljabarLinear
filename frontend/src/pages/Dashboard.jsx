import { useEffect, useState } from 'react';
import StatCard from '../components/StatCard';
import { getMahasiswa } from '../services/mahasiswaApi';
import { getMataKuliah } from '../services/mataKuliahApi';
import { getNilai } from '../services/nilaiApi';

export default function Dashboard() {
  const [counts, setCounts] = useState({ mahasiswa: null, mataKuliah: null, nilai: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [mhsRes, mkRes, nilaiRes] = await Promise.all([
          getMahasiswa(),
          getMataKuliah(),
          getNilai(),
        ]);
        setCounts({
          mahasiswa: mhsRes.data.length,
          mataKuliah: mkRes.data.length,
          nilai: nilaiRes.data.length,
        });
      } catch (err) {
        setError('Gagal memuat data. Pastikan backend berjalan di http://localhost:8000');
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  const cards = [
    {
      icon: '👤',
      label: 'Total Mahasiswa',
      value: counts.mahasiswa,
      colorClass: 'bg-primary bg-opacity-10 text-primary',
    },
    {
      icon: '📚',
      label: 'Mata Kuliah',
      value: counts.mataKuliah,
      colorClass: 'bg-success bg-opacity-10 text-success',
    },
    {
      icon: '📝',
      label: 'Entri Nilai',
      value: counts.nilai,
      colorClass: 'bg-warning bg-opacity-10 text-warning',
    },
  ];

  return (
    <div>
      <div className="page-header">
        <h2>Dashboard</h2>
        <p>Ringkasan data sistem analisis nilai mahasiswa</p>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <div className="row g-4">
        {cards.map((card) => (
          <div className="col-12 col-sm-6 col-lg-4" key={card.label}>
            <StatCard
              icon={card.icon}
              label={card.label}
              value={card.value}
              loading={loading}
              colorClass={card.colorClass}
            />
          </div>
        ))}
      </div>

      <div className="mt-5">
        <div className="card border-0 shadow-sm rounded-3">
          <div className="card-body p-4">
            <h6 className="fw-semibold mb-3 text-secondary text-uppercase" style={{ fontSize: '0.75rem', letterSpacing: '0.08em' }}>
              Panduan Penggunaan
            </h6>
            <div className="row g-3">
              {[
                { step: '1', title: 'Tambah Data', desc: 'Tambahkan mahasiswa, mata kuliah, dan nilai secara manual atau via Upload CSV.' },
                { step: '2', title: 'Upload CSV', desc: 'Format: kolom pertama "Nama Mahasiswa", kolom selanjutnya adalah nama mata kuliah.' },
                { step: '3', title: 'Jalankan PCA', desc: 'Buka halaman Analisis PCA, klik tombol Hitung PCA untuk melihat hasil visualisasi.' },
              ].map(({ step, title, desc }) => (
                <div className="col-12 col-md-4" key={step}>
                  <div className="d-flex gap-3">
                    <div
                      className="flex-shrink-0 d-flex align-items-center justify-content-center rounded-circle bg-primary text-white fw-bold"
                      style={{ width: 32, height: 32, fontSize: '0.85rem' }}
                    >
                      {step}
                    </div>
                    <div>
                      <div className="fw-semibold" style={{ fontSize: '0.875rem' }}>{title}</div>
                      <div className="text-secondary" style={{ fontSize: '0.8rem' }}>{desc}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
