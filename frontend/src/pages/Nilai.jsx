import { useState, useEffect } from 'react';
import { getNilai, createNilai } from '../services/nilaiApi';
import { getMahasiswa } from '../services/mahasiswaApi';
import { getMataKuliah } from '../services/mataKuliahApi';

export default function Nilai() {
  // List data
  const [nilaiList, setNilaiList] = useState([]);
  const [mahasiswaList, setMahasiswaList] = useState([]);
  const [mataKuliahList, setMataKuliahList] = useState([]);

  // Lookup maps: id -> name (built from lists)
  const [mhsMap, setMhsMap] = useState({});
  const [mkMap, setMkMap] = useState({});

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState(null);

  // Form state
  const [form, setForm] = useState({ mahasiswa_id: '', mata_kuliah_id: '', skor: '' });

  const fetchAll = async () => {
    try {
      const [nilaiRes, mhsRes, mkRes] = await Promise.all([
        getNilai(),
        getMahasiswa(),
        getMataKuliah(),
      ]);

      const mhs = mhsRes.data;
      const mk = mkRes.data;

      setNilaiList(nilaiRes.data);
      setMahasiswaList(mhs);
      setMataKuliahList(mk);

      // Build lookup maps
      setMhsMap(Object.fromEntries(mhs.map((m) => [m.id, m.nama_mahasiswa])));
      setMkMap(Object.fromEntries(mk.map((m) => [m.id, m.nama_mk])));
    } catch {
      setAlert({ type: 'danger', msg: 'Gagal memuat data. Pastikan backend berjalan.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const isFormValid =
    form.mahasiswa_id !== '' &&
    form.mata_kuliah_id !== '' &&
    form.skor !== '' &&
    !isNaN(parseFloat(form.skor));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;

    setSubmitting(true);
    setAlert(null);
    try {
      await createNilai({
        mahasiswa_id: parseInt(form.mahasiswa_id),
        mata_kuliah_id: parseInt(form.mata_kuliah_id),
        skor: parseFloat(form.skor),
      });

      const mhsName = mhsMap[form.mahasiswa_id] ?? `ID ${form.mahasiswa_id}`;
      const mkName = mkMap[form.mata_kuliah_id] ?? `ID ${form.mata_kuliah_id}`;
      setAlert({
        type: 'success',
        msg: `Nilai ${form.skor} untuk ${mhsName} (${mkName}) berhasil ditambahkan.`,
      });

      setForm({ mahasiswa_id: '', mata_kuliah_id: '', skor: '' });
      await fetchAll();
    } catch (err) {
      const detail = err.response?.data?.detail || 'Gagal menambahkan nilai.';
      setAlert({ type: 'danger', msg: detail });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h2>Nilai</h2>
        <p>Tambah dan lihat data nilai mahasiswa</p>
      </div>

      {/* Add Form */}
      <div className="card border-0 shadow-sm rounded-3 mb-4">
        <div className="card-body p-4">
          <h6 className="fw-semibold mb-3">Tambah Nilai</h6>

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

          <form onSubmit={handleSubmit}>
            <div className="row g-3 align-items-end">
              {/* Mahasiswa dropdown */}
              <div className="col-12 col-md-4">
                <label htmlFor="mahasiswa_id" className="form-label form-label-sm text-secondary mb-1">
                  Mahasiswa
                </label>
                <select
                  id="mahasiswa_id"
                  name="mahasiswa_id"
                  className="form-select"
                  value={form.mahasiswa_id}
                  onChange={handleChange}
                  disabled={submitting || mahasiswaList.length === 0}
                  required
                >
                  <option value="">-- Pilih Mahasiswa --</option>
                  {mahasiswaList.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.nama_mahasiswa}
                    </option>
                  ))}
                </select>
              </div>

              {/* Mata Kuliah dropdown */}
              <div className="col-12 col-md-4">
                <label htmlFor="mata_kuliah_id" className="form-label form-label-sm text-secondary mb-1">
                  Mata Kuliah
                </label>
                <select
                  id="mata_kuliah_id"
                  name="mata_kuliah_id"
                  className="form-select"
                  value={form.mata_kuliah_id}
                  onChange={handleChange}
                  disabled={submitting || mataKuliahList.length === 0}
                  required
                >
                  <option value="">-- Pilih Mata Kuliah --</option>
                  {mataKuliahList.map((mk) => (
                    <option key={mk.id} value={mk.id}>
                      {mk.nama_mk}
                    </option>
                  ))}
                </select>
              </div>

              {/* Skor input */}
              <div className="col-12 col-md-2">
                <label htmlFor="skor" className="form-label form-label-sm text-secondary mb-1">
                  Skor
                </label>
                <input
                  id="skor"
                  name="skor"
                  type="number"
                  className="form-control"
                  placeholder="0 – 100"
                  min="0"
                  max="100"
                  step="0.1"
                  value={form.skor}
                  onChange={handleChange}
                  disabled={submitting}
                  required
                />
              </div>

              {/* Submit */}
              <div className="col-12 col-md-2">
                <button
                  type="submit"
                  className="btn btn-primary w-100"
                  disabled={submitting || !isFormValid}
                >
                  {submitting ? (
                    <span className="spinner-border spinner-border-sm" role="status" />
                  ) : (
                    'Tambah'
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Data Table */}
      <div className="card border-0 shadow-sm rounded-3">
        <div className="card-body p-0">
          <div className="d-flex align-items-center justify-content-between px-4 py-3 border-bottom">
            <h6 className="fw-semibold mb-0">Daftar Nilai</h6>
            <span className="badge bg-warning bg-opacity-10 text-warning fw-semibold">
              {nilaiList.length} entri
            </span>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status" />
            </div>
          ) : nilaiList.length === 0 ? (
            <div className="text-center py-5 text-secondary">
              <div style={{ fontSize: '2rem' }}>📝</div>
              <p className="mt-2 mb-0" style={{ fontSize: '0.875rem' }}>Belum ada data nilai.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="px-4 py-3 text-secondary fw-semibold" style={{ fontSize: '0.78rem', width: 50 }}>#</th>
                    <th className="px-4 py-3 text-secondary fw-semibold" style={{ fontSize: '0.78rem' }}>MAHASISWA</th>
                    <th className="px-4 py-3 text-secondary fw-semibold" style={{ fontSize: '0.78rem' }}>MATA KULIAH</th>
                    <th className="px-4 py-3 text-secondary fw-semibold" style={{ fontSize: '0.78rem', width: 100 }}>SKOR</th>
                  </tr>
                </thead>
                <tbody>
                  {nilaiList.map((n, idx) => (
                    <tr key={n.id}>
                      <td className="px-4 text-secondary" style={{ fontSize: '0.875rem' }}>{idx + 1}</td>
                      <td className="px-4 fw-medium" style={{ fontSize: '0.875rem' }}>
                        {mhsMap[n.mahasiswa_id] ?? (
                          <span className="text-secondary fst-italic">ID {n.mahasiswa_id}</span>
                        )}
                      </td>
                      <td className="px-4" style={{ fontSize: '0.875rem' }}>
                        {mkMap[n.mata_kuliah_id] ?? (
                          <span className="text-secondary fst-italic">ID {n.mata_kuliah_id}</span>
                        )}
                      </td>
                      <td className="px-4">
                        <span
                          className={`badge fw-semibold ${
                            n.skor >= 80
                              ? 'bg-success bg-opacity-10 text-success'
                              : n.skor >= 60
                              ? 'bg-warning bg-opacity-10 text-warning'
                              : 'bg-danger bg-opacity-10 text-danger'
                          }`}
                          style={{ fontSize: '0.82rem' }}
                        >
                          {n.skor}
                        </span>
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
