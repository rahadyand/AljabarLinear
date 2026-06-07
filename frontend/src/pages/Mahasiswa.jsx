import { useState, useEffect } from 'react';
import { getMahasiswa, createMahasiswa, deleteMahasiswa } from '../services/mahasiswaApi';

export default function Mahasiswa() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [nama, setNama] = useState('');
  const [nim, setNim] = useState('');
  const [alert, setAlert] = useState(null); // { type: 'success'|'danger', msg }

  const fetchData = async () => {
    try {
      const res = await getMahasiswa();
      setList(res.data);
    } catch {
      setAlert({ type: 'danger', msg: 'Gagal memuat data mahasiswa.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = nama.trim();
    if (!trimmed) return;

    setSubmitting(true);
    setAlert(null);
    try {
      const payload = { nama_mahasiswa: trimmed };
      if (nim.trim()) payload.nim = nim.trim();
      await createMahasiswa(payload);
      setNama('');
      setNim('');
      setAlert({ type: 'success', msg: `Mahasiswa "${trimmed}" berhasil ditambahkan.` });
      await fetchData();
    } catch (err) {
      const detail = err.response?.data?.detail || 'Gagal menambahkan mahasiswa.';
      setAlert({ type: 'danger', msg: detail });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, nama) => {
    if (!window.confirm(`Hapus mahasiswa "${nama}" beserta semua nilainya?`)) return;
    setAlert(null);
    try {
      const res = await deleteMahasiswa(id);
      setAlert({ type: 'success', msg: res.data.message });
      await fetchData();
    } catch (err) {
      const detail = err.response?.data?.detail || 'Gagal menghapus mahasiswa.';
      setAlert({ type: 'danger', msg: detail });
    }
  };

  return (
    <div>
      <div className="page-header">
        <h2>Mahasiswa</h2>
        <p>Tambah dan lihat data mahasiswa</p>
      </div>

      {/* Add Form */}
      <div className="card border-0 shadow-sm rounded-3 mb-4">
        <div className="card-body p-4">
          <h6 className="fw-semibold mb-3">Tambah Mahasiswa</h6>
          {alert && (
            <div className={`alert alert-${alert.type} alert-dismissible`} role="alert">
              {alert.msg}
              <button
                type="button"
                className="btn-close"
                onClick={() => setAlert(null)}
                aria-label="Close"
              />
            </div>
          )}
          <form onSubmit={handleSubmit} className="d-flex gap-2 align-items-end flex-wrap">
            <div className="flex-grow-1" style={{ minWidth: 180 }}>
              <label htmlFor="nama_mahasiswa" className="form-label form-label-sm text-secondary mb-1">
                Nama Mahasiswa
              </label>
              <input
                id="nama_mahasiswa"
                type="text"
                className="form-control"
                placeholder="Masukkan nama mahasiswa..."
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                required
                disabled={submitting}
              />
            </div>
            <div style={{ minWidth: 140 }}>
              <label htmlFor="nim_input" className="form-label form-label-sm text-secondary mb-1">
                NIM <span className="text-muted" style={{ fontSize: '0.75rem' }}>(opsional)</span>
              </label>
              <input
                id="nim_input"
                type="text"
                className="form-control"
                placeholder="Contoh: 2024001"
                value={nim}
                onChange={(e) => setNim(e.target.value)}
                disabled={submitting}
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary px-4"
              disabled={submitting || !nama.trim()}
              style={{ height: 38 }}
            >
              {submitting ? (
                <span className="spinner-border spinner-border-sm" role="status" />
              ) : (
                'Tambah'
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Data Table */}
      <div className="card border-0 shadow-sm rounded-3">
        <div className="card-body p-0">
          <div className="d-flex align-items-center justify-content-between px-4 py-3 border-bottom">
            <h6 className="fw-semibold mb-0">Daftar Mahasiswa</h6>
            <span className="badge bg-primary bg-opacity-10 text-primary fw-semibold">
              {list.length} mahasiswa
            </span>
          </div>
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status" />
            </div>
          ) : list.length === 0 ? (
            <div className="text-center py-5 text-secondary">
              <div style={{ fontSize: '2rem' }}>👤</div>
              <p className="mt-2 mb-0" style={{ fontSize: '0.875rem' }}>Belum ada data mahasiswa.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th style={{ width: 60 }} className="px-4 py-3 text-secondary fw-semibold" style={{ fontSize: '0.78rem' }}>#</th>
                    <th className="px-4 py-3 text-secondary fw-semibold" style={{ fontSize: '0.78rem' }}>ID</th>
                    <th className="px-4 py-3 text-secondary fw-semibold" style={{ fontSize: '0.78rem' }}>NIM</th>
                    <th className="px-4 py-3 text-secondary fw-semibold" style={{ fontSize: '0.78rem' }}>NAMA MAHASISWA</th>
                    <th className="px-4 py-3 text-secondary fw-semibold" style={{ fontSize: '0.78rem', width: 80 }}>AKSI</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((m, idx) => (
                    <tr key={m.id}>
                      <td className="px-4 text-secondary" style={{ fontSize: '0.875rem' }}>{idx + 1}</td>
                      <td className="px-4">
                        <span className="badge bg-secondary bg-opacity-10 text-secondary fw-normal">
                          {m.id}
                        </span>
                      </td>
                      <td className="px-4 text-secondary" style={{ fontSize: '0.82rem' }}>
                        {m.nim ?? <span className="fst-italic text-muted">—</span>}
                      </td>
                      <td className="px-4 fw-medium" style={{ fontSize: '0.875rem' }}>
                        {m.nama_mahasiswa}
                      </td>
                      <td className="px-4">
                        <button
                          className="btn btn-outline-danger btn-sm"
                          style={{ fontSize: '0.75rem', padding: '2px 10px' }}
                          onClick={() => handleDelete(m.id, m.nama_mahasiswa)}
                        >
                          Hapus
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
