import { useState, useRef } from 'react';
import { uploadCsv } from '../services/uploadApi';

export default function Upload() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [alert, setAlert] = useState(null); // { type, msg, detail? }
  const fileInputRef = useRef(null);

  // Client-side validation
  const validateFile = (f) => {
    if (!f) return 'Tidak ada file yang dipilih.';
    if (!f.name.toLowerCase().endsWith('.csv')) return 'File harus berformat .csv';
    if (f.size === 0) return 'File tidak boleh kosong.';
    if (f.size > 5 * 1024 * 1024) return 'Ukuran file tidak boleh lebih dari 5 MB.';
    return null;
  };

  const handleFileChange = (e) => {
    const selected = e.target.files[0] || null;
    setAlert(null);
    setFile(selected);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files[0] || null;
    setAlert(null);
    setFile(dropped);
    // Sync the input element too
    if (fileInputRef.current && dropped) {
      const dt = new DataTransfer();
      dt.items.add(dropped);
      fileInputRef.current.files = dt.files;
    }
  };

  const handleDragOver = (e) => e.preventDefault();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateFile(file);
    if (validationError) {
      setAlert({ type: 'danger', msg: validationError });
      return;
    }

    setUploading(true);
    setAlert(null);
    try {
      const res = await uploadCsv(file);
      const { pesan, baris_diproses } = res.data;
      setAlert({
        type: 'success',
        msg: pesan,
        detail: `${baris_diproses} baris mahasiswa berhasil diproses.`,
        count: baris_diproses,
      });
      // Reset
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      const detail = err.response?.data?.detail || 'Terjadi kesalahan saat mengunggah file.';
      setAlert({ type: 'danger', msg: detail });
    } finally {
      setUploading(false);
    }
  };

  const validationError = validateFile(file);
  const isReady = file !== null && validationError === null;

  return (
    <div>
      <div className="page-header">
        <h2>Upload CSV</h2>
        <p>Unggah data nilai mahasiswa secara massal melalui file CSV</p>
      </div>

      <div className="row g-4">
        {/* Upload Card */}
        <div className="col-12 col-lg-7">
          <div className="card border-0 shadow-sm rounded-3">
            <div className="card-body p-4">
              <h6 className="fw-semibold mb-3">Unggah File CSV</h6>

              {alert && (
                <div className={`alert alert-${alert.type} alert-dismissible`} role="alert">
                  <div className="fw-semibold">{alert.msg}</div>
                  {alert.detail && (
                    <div className="mt-1" style={{ fontSize: '0.875rem' }}>{alert.detail}</div>
                  )}
                  {alert.count !== undefined && (
                    <div className="mt-2">
                      <span className="badge bg-success bg-opacity-20 text-success fw-semibold px-3 py-2" style={{ fontSize: '0.9rem' }}>
                        ✓ {alert.count} baris diproses
                      </span>
                    </div>
                  )}
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setAlert(null)}
                    aria-label="Close"
                  />
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {/* Drop zone */}
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-3 border-2 d-flex flex-column align-items-center justify-content-center text-center"
                  style={{
                    border: `2px dashed ${file && !validationError ? '#4f46e5' : '#cbd5e1'}`,
                    background: file && !validationError ? '#f5f3ff' : '#f8fafc',
                    padding: '2.5rem 1.5rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    minHeight: 160,
                  }}
                >
                  <div style={{ fontSize: '2.5rem', lineHeight: 1 }}>
                    {file && !validationError ? '📄' : '📂'}
                  </div>
                  {file ? (
                    <>
                      <div className="fw-semibold mt-2" style={{ color: validationError ? '#dc2626' : '#4f46e5' }}>
                        {file.name}
                      </div>
                      <div className="text-secondary mt-1" style={{ fontSize: '0.8rem' }}>
                        {(file.size / 1024).toFixed(1)} KB
                        {validationError && (
                          <span className="text-danger ms-2">— {validationError}</span>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="fw-semibold mt-2 text-secondary">Klik atau seret file CSV ke sini</div>
                      <div className="text-secondary mt-1" style={{ fontSize: '0.8rem' }}>
                        Format .csv, maksimal 5 MB
                      </div>
                    </>
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="d-none"
                  id="csv_file_input"
                />

                <div className="d-flex gap-2 mt-3">
                  <button
                    type="submit"
                    className="btn btn-primary px-4"
                    disabled={uploading || !isReady}
                  >
                    {uploading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" />
                        Mengunggah...
                      </>
                    ) : (
                      'Upload CSV'
                    )}
                  </button>
                  {file && (
                    <button
                      type="button"
                      className="btn btn-outline-secondary px-3"
                      onClick={() => {
                        setFile(null);
                        setAlert(null);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                    >
                      Batal
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Format Guide */}
        <div className="col-12 col-lg-5">
          <div className="card border-0 shadow-sm rounded-3">
            <div className="card-body p-4">
              <h6 className="fw-semibold mb-3">📋 Format CSV</h6>
              <p className="text-secondary" style={{ fontSize: '0.875rem' }}>
<<<<<<< HEAD
                File CSV harus memiliki kolom pertama <code>Nama Mahasiswa</code>,
                diikuti satu kolom per mata kuliah. Separator bisa koma (<code>,</code>) atau
=======
                Kolom pertama wajib <code>Nama Mahasiswa</code>. Kolom <code>NIM</code> bersifat
                opsional dan dapat diletakkan di kolom kedua. Kolom-kolom selanjutnya
                adalah nama mata kuliah. Separator bisa koma (<code>,</code>) atau
>>>>>>> phase-b-update
                titik koma (<code>;</code>).
              </p>

              <div
<<<<<<< HEAD
                className="rounded-2 p-3 mb-3"
                style={{ background: '#1e1b4b', fontFamily: 'monospace', fontSize: '0.78rem', color: '#c7d2fe', lineHeight: 1.7 }}
              >
                <div style={{ color: '#818cf8' }}># Contoh format (koma)</div>
                <div>Nama Mahasiswa,Kalkulus,Fisika,Aljabar Linear</div>
                <div>Budi Santoso,85,78,90</div>
                <div>Siti Rahayu,92,88,75</div>
                <div>Ahmad Fauzi,70,65,80</div>
=======
                className="rounded-2 p-3 mb-2"
                style={{ background: '#1e1b4b', fontFamily: 'monospace', fontSize: '0.78rem', color: '#c7d2fe', lineHeight: 1.7 }}
              >
                <div style={{ color: '#818cf8' }}># Tanpa NIM</div>
                <div>Nama Mahasiswa,Kalkulus,Fisika,Aljabar Linear</div>
                <div>Budi Santoso,85,78,90</div>
                <div>Siti Rahayu,92,88,75</div>
              </div>

              <div
                className="rounded-2 p-3 mb-3"
                style={{ background: '#1e1b4b', fontFamily: 'monospace', fontSize: '0.78rem', color: '#c7d2fe', lineHeight: 1.7 }}
              >
                <div style={{ color: '#818cf8' }}># Dengan NIM (opsional)</div>
                <div>Nama Mahasiswa,NIM,Kalkulus,Fisika,Aljabar Linear</div>
                <div>Budi Santoso,2024001,85,78,90</div>
                <div>Siti Rahayu,2024002,92,88,75</div>
                <div>Ahmad Fauzi,,70,65,80</div>
>>>>>>> phase-b-update
              </div>

              <ul className="mb-0 ps-3" style={{ fontSize: '0.82rem', color: '#475569', lineHeight: 2 }}>
                <li>Baris pertama wajib berisi nama kolom</li>
                <li>Kolom <code>Nama Mahasiswa</code> wajib ada (case-insensitive)</li>
<<<<<<< HEAD
=======
                <li>Kolom <code>NIM</code> bersifat opsional — jika ada, nilai boleh dikosongkan per baris</li>
>>>>>>> phase-b-update
                <li>Nama mahasiswa yang sudah ada <strong>tidak</strong> akan digandakan</li>
                <li>Skor yang sudah ada akan <strong>diperbarui</strong></li>
                <li>Nilai kosong (NaN) pada suatu sel akan dilewati</li>
                <li>Encoding: UTF-8 atau UTF-8 BOM</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
