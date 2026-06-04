import { useState, useEffect } from 'react';
import { getMataKuliah, createMataKuliah } from '../services/mataKuliahApi';

export default function MataKuliah() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [namaMk, setNamaMk] = useState('');
  const [alert, setAlert] = useState(null); // { type: 'success'|'danger', msg }

  const fetchData = async () => {
    try {
      const res = await getMataKuliah();
      setList(res.data);
    } catch {
      setAlert({ type: 'danger', msg: 'Gagal memuat data mata kuliah.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = namaMk.trim();
    if (!trimmed) return;

    setSubmitting(true);
    setAlert(null);
    try {
      await createMataKuliah({ nama_mk: trimmed });
      setNamaMk('');
      setAlert({ type: 'success', msg: `Mata kuliah "${trimmed}" berhasil ditambahkan.` });
      await fetchData();
    } catch (err) {
      const detail = err.response?.data?.detail || 'Gagal menambahkan mata kuliah.';
      setAlert({ type: 'danger', msg: detail });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h2>Mata Kuliah</h2>
        <p>Tambah dan lihat data mata kuliah</p>
      </div>

      {/* Add Form */}
      <div className="card border-0 shadow-sm rounded-3 mb-4">
        <div className="card-body p-4">
          <h6 className="fw-semibold mb-3">Tambah Mata Kuliah</h6>
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
          <form onSubmit={handleSubmit} className="d-flex gap-2 align-items-end">
            <div className="flex-grow-1">
              <label htmlFor="nama_mk" className="form-label form-label-sm text-secondary mb-1">
                Nama Mata Kuliah
              </label>
              <input
                id="nama_mk"
                type="text"
                className="form-control"
                placeholder="Masukkan nama mata kuliah..."
                value={namaMk}
                onChange={(e) => setNamaMk(e.target.value)}
                required
                disabled={submitting}
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary px-4"
              disabled={submitting || !namaMk.trim()}
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
            <h6 className="fw-semibold mb-0">Daftar Mata Kuliah</h6>
            <span className="badge bg-success bg-opacity-10 text-success fw-semibold">
              {list.length} mata kuliah
            </span>
          </div>
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status" />
            </div>
          ) : list.length === 0 ? (
            <div className="text-center py-5 text-secondary">
              <div style={{ fontSize: '2rem' }}>📚</div>
              <p className="mt-2 mb-0" style={{ fontSize: '0.875rem' }}>Belum ada data mata kuliah.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="px-4 py-3 text-secondary fw-semibold" style={{ fontSize: '0.78rem', width: 60 }}>#</th>
                    <th className="px-4 py-3 text-secondary fw-semibold" style={{ fontSize: '0.78rem', width: 80 }}>ID</th>
                    <th className="px-4 py-3 text-secondary fw-semibold" style={{ fontSize: '0.78rem' }}>NAMA MATA KULIAH</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((mk, idx) => (
                    <tr key={mk.id}>
                      <td className="px-4 text-secondary" style={{ fontSize: '0.875rem' }}>{idx + 1}</td>
                      <td className="px-4">
                        <span className="badge bg-secondary bg-opacity-10 text-secondary fw-normal">
                          {mk.id}
                        </span>
                      </td>
                      <td className="px-4 fw-medium" style={{ fontSize: '0.875rem' }}>
                        {mk.nama_mk}
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
