import { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  Tooltip,
  Legend,
  Title,
} from 'chart.js';
import { Bar, Scatter } from 'react-chartjs-2';
import { runPca } from '../services/pcaApi';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, Tooltip, Legend, Title);

// ── Helpers ────────────────────────────────────────────────
function round4(n) {
  return Math.round(n * 10000) / 10000;
}

// Insight Box component
function InsightBox({ skor }) {
  if (!skor || skor.length === 0) return null;
  
  // Count by cluster
  const clusterCounts = [0, 0, 0];
  skor.forEach((s) => {
    const k = s.klaster ?? 0;
    clusterCounts[k]++;
  });
  
  const total = skor.length;
  const percentages = clusterCounts.map((c) => Math.round((c / total) * 100));
  
  // Generate insight text
  let insightText = `Dari ${total} mahasiswa yang dianalisis, `;
  const clusterTexts = [];
  
  if (clusterCounts[1] > 0) {
    clusterTexts.push(`${clusterCounts[1]} orang (${percentages[1]}%) memiliki bakat sebagai **Praktisi Teknis**`);
  }
  if (clusterCounts[2] > 0) {
    clusterTexts.push(`${clusterCounts[2]} orang (${percentages[2]}%) sebagai **Analis/Pemikir Kritis**`);
  }
  if (clusterCounts[0] > 0) {
    clusterTexts.push(`${clusterCounts[0]} orang (${percentages[0]}%) memerlukan **bimbingan akademik ekstra**`);
  }
  
  insightText += clusterTexts.join(', ') + '.';
  
  return (
    <div className="card border-0 shadow-sm rounded-3 mb-4" style={{ background: 'linear-gradient(135deg, rgba(79,70,229,0.08), rgba(37,99,235,0.08))' }}>
      <div className="card-body p-4">
        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
          <div style={{ fontSize: '2rem' }}>💡</div>
          <div style={{ flex: 1 }}>
            <h6 className="fw-semibold mb-2" style={{ color: '#1e293b' }}>Kesimpulan Analisis</h6>
            <p style={{ fontSize: '0.95rem', color: '#475569', marginBottom: 0, lineHeight: '1.6' }}>
              {insightText}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
function VarianceChart({ ratios }) {
  const pct = ratios.map((r) => parseFloat((r * 100).toFixed(2)));
  const data = {
    labels: ['PC1', 'PC2'],
    datasets: [
      {
        label: 'Explained Variance (%)',
        data: pct,
        backgroundColor: ['rgba(79,70,229,0.8)', 'rgba(99,102,241,0.5)'],
        borderColor: ['#4f46e5', '#6366f1'],
        borderWidth: 1,
        borderRadius: 6,
      },
    ],
  };
  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => ` ${ctx.parsed.y}%`,
        },
      },
      title: {
        display: true,
        text: `Total explained: ${(pct[0] + pct[1]).toFixed(2)}%`,
        color: '#64748b',
        font: { size: 12, weight: 'normal' },
        padding: { bottom: 12 },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: (v) => `${v}%`,
          color: '#94a3b8',
        },
        grid: { color: '#f1f5f9' },
      },
      x: { ticks: { color: '#94a3b8' }, grid: { display: false } },
    },
  };
  return <Bar data={data} options={options} />;
}

// Cluster color palette & persona mapping
const CLUSTER_COLORS = [
  { bg: 'rgba(220,38,38,0.70)',  border: '#dc2626', label: 'Perlu Bimbingan Ekstra' },
  { bg: 'rgba(22,163,74,0.70)',  border: '#16a34a', label: 'Praktisi Teknis' },
  { bg: 'rgba(37,99,235,0.70)',  border: '#2563eb', label: 'Analis/Pemikir Kritis' },
];

// Get persona from cluster
function getPersona(klaster) {
  const personas = [
    'Perlu Bimbingan Ekstra',
    'Praktisi Teknis',
    'Analis/Pemikir Kritis'
  ];
  return personas[klaster] || 'Klaster ' + klaster;
}

// Get recommendation from cluster
function getRecommendation(klaster) {
  const recommendations = {
    0: 'Memerlukan bimbingan akademik ekstra dan dukungan intensif dari dosen.',
    1: 'Cocok diarahkan untuk proyek praktik, lab programming, atau asisten dosen di mata kuliah teknis.',
    2: 'Cocok diarahkan untuk riset, asisten dosen, atau peran akademik yang memerlukan analisis mendalam.'
  };
  return recommendations[klaster] || 'Tidak ada rekomendasi.';
}

function ScatterChart({ skor }) {
  // Split points by cluster
  const byCluster = [[], [], []];
  skor.forEach((s) => {
    const k = s.klaster ?? 0;
    byCluster[k]?.push({ x: s.PC1, y: s.PC2, label: s.nama_mahasiswa, nim: s.nim, klaster: k });
  });

  const data = {
    datasets: CLUSTER_COLORS.map((c, i) => ({
      label: c.label,
      data: byCluster[i] ?? [],
      backgroundColor: c.bg,
      borderColor: c.border,
      pointRadius: 6,
      pointHoverRadius: 9,
    })),
  };
  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: { color: '#475569', font: { size: 12 }, padding: 16, usePointStyle: true },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        padding: 12,
        titleFont: { size: 13, weight: 'bold' },
        bodyFont: { size: 12 },
        callbacks: {
          title: () => `KTP Mahasiswa`,
          label: (ctx) => {
            const pt = ctx.raw;
            return [
              `Nama: ${pt.label}`,
              `Profil: ${getPersona(pt.klaster)}`,
              `Rekomendasi: ${getRecommendation(pt.klaster)}`
            ];
          },
          afterLabel: () => '',
        },
      },
    },
    scales: {
      x: {
        title: { display: true, text: 'Dominasi Praktik & Coding ➡️', color: '#64748b', font: { size: 12, weight: 'bold' } },
        ticks: { color: '#94a3b8' },
        grid: { color: '#f1f5f9' },
      },
      y: {
        title: { display: true, text: 'Dominasi Teori & Analisis ⬆️', color: '#64748b', font: { size: 12, weight: 'bold' } },
        ticks: { color: '#94a3b8' },
        grid: { color: '#f1f5f9' },
      },
    },
  };
  return <Scatter data={data} options={options} />;
}

// Cluster badge helper
function KlasterBadge({ klaster }) {
  const styles = [
    { bg: '#fee2e2', color: '#b91c1c' },
    { bg: '#dcfce7', color: '#15803d' },
    { bg: '#dbeafe', color: '#1d4ed8' },
  ];
  const s = styles[klaster] ?? styles[0];
  const persona = getPersona(klaster);
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '2px 10px',
        borderRadius: 999,
        fontSize: '0.78rem',
        fontWeight: 600,
        background: s.bg,
        color: s.color,
      }}
    >
      {persona}
    </span>
  );
}

// Profil Klaster table
function ProfilKlaster({ profil }) {
  if (!profil || Object.keys(profil).length === 0) return null;
  const klasterKeys = Object.keys(profil).sort();
  const mkCols = Object.keys(profil[klasterKeys[0]] ?? {});
  const clusterStyle = [
    { bg: '#fee2e2', color: '#b91c1c', label: 'Perlu Bimbingan Ekstra' },
    { bg: '#dcfce7', color: '#15803d', label: 'Praktisi Teknis' },
    { bg: '#dbeafe', color: '#1d4ed8', label: 'Analis/Pemikir Kritis' },
  ];
  return (
    <div className="card border-0 shadow-sm rounded-3 mt-4">
      <div className="card-body p-0">
        <div className="px-4 py-3 border-bottom">
          <h6 className="fw-semibold mb-0">Profil Klaster (Rata-rata Nilai per Mata Kuliah)</h6>
        </div>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th className="px-4 py-3 text-secondary fw-semibold" style={{ fontSize: '0.78rem' }}>KLASTER</th>
                {mkCols.map((mk) => (
                  <th key={mk} className="px-4 py-3 text-secondary fw-semibold" style={{ fontSize: '0.78rem' }}>
                    {mk.toUpperCase()}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {klasterKeys.map((k) => {
                const idx = parseInt(k, 10);
                const cs = clusterStyle[idx] ?? clusterStyle[0];
                return (
                  <tr key={k}>
                    <td className="px-4">
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '2px 12px',
                          borderRadius: 999,
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          background: cs.bg,
                          color: cs.color,
                        }}
                      >
                        {cs.label}
                      </span>
                    </td>
                    {mkCols.map((mk) => (
                      <td key={mk} className="px-4 font-monospace" style={{ fontSize: '0.82rem' }}>
                        {(profil[k][mk] ?? 0).toFixed(2)}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ───────────────────────────────────────────────
export default function PCA() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleRun = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await runPca();
      setResult(res.data);
    } catch (err) {
      const detail = err.response?.data?.detail || 'Gagal menjalankan PCA.';
      setError(detail);
    } finally {
      setLoading(false);
    }
  };

  // Build loadings table rows from komponen_utama
  const loadingRows = result
    ? Object.keys(result.komponen_utama.PC1).map((mk) => ({
        mk,
        pc1: round4(result.komponen_utama.PC1[mk]),
        pc2: round4(result.komponen_utama.PC2[mk]),
      }))
    : [];

  return (
    <div>
      <div className="page-header">
        <h2>Analisis PCA</h2>
        <p>Principal Component Analysis pada data nilai mahasiswa</p>
      </div>

      {/* Run button */}
      <div className="card border-0 shadow-sm rounded-3 mb-4">
        <div className="card-body p-4 d-flex align-items-center justify-content-between flex-wrap gap-3">
          <div>
            <div className="fw-semibold">Hitung PCA</div>
            <div className="text-secondary" style={{ fontSize: '0.82rem' }}>
              Minimal 3 mahasiswa dan 2 mata kuliah dengan nilai. Gunakan semua data terkini di database.
            </div>
          </div>
          <button
            className="btn btn-primary px-4"
            onClick={handleRun}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" />
                Menghitung...
              </>
            ) : (
              '🔬 Hitung PCA'
            )}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="alert alert-danger alert-dismissible" role="alert">
          {error}
          <button type="button" className="btn-close" onClick={() => setError(null)} aria-label="Close" />
        </div>
      )}

      {/* Results */}
      {result && (
        <>
          {/* Insight Box */}
          <InsightBox skor={result.skor_mahasiswa} />
          
          {/* Variance summary badges */}
          <div className="d-flex gap-3 mb-4 flex-wrap">
            {result.explained_variance_ratio.map((r, i) => (
              <div key={i} className="card border-0 shadow-sm rounded-3 px-4 py-3 d-flex flex-row align-items-center gap-3">
                <div
                  className="d-flex align-items-center justify-content-center rounded-circle"
                  style={{ width: 40, height: 40, background: i === 0 ? 'rgba(79,70,229,0.12)' : 'rgba(99,102,241,0.10)' }}
                >
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#4f46e5' }}>PC{i + 1}</span>
                </div>
                <div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#1e293b', lineHeight: 1 }}>
                    {(r * 100).toFixed(2)}%
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Explained Variance</div>
                </div>
              </div>
            ))}
            <div className="card border-0 shadow-sm rounded-3 px-4 py-3 d-flex flex-row align-items-center gap-3">
              <div
                className="d-flex align-items-center justify-content-center rounded-circle"
                style={{ width: 40, height: 40, background: 'rgba(16,185,129,0.12)' }}
              >
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#059669' }}>Σ</span>
              </div>
              <div>
                <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#1e293b', lineHeight: 1 }}>
                  {(result.explained_variance_ratio.reduce((a, b) => a + b, 0) * 100).toFixed(2)}%
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Total (PC1 + PC2)</div>
              </div>
            </div>
          </div>

          {/* Charts row */}
          <div className="row g-4 mb-4">
            <div className="col-12 col-lg-4">
              <div className="card border-0 shadow-sm rounded-3">
                <div className="card-body p-4">
                  <h6 className="fw-semibold mb-3">Explained Variance</h6>
                  <VarianceChart ratios={result.explained_variance_ratio} />
                </div>
              </div>
            </div>
            <div className="col-12 col-lg-8">
              <div className="card border-0 shadow-sm rounded-3">
                <div className="card-body p-4">
                  <h6 className="fw-semibold mb-3">Scatter Plot PC1 vs PC2</h6>
                  <ScatterChart skor={result.skor_mahasiswa} />
                </div>
              </div>
            </div>
          </div>

          {/* Tables row */}
          <div className="row g-4">
            {/* Skor mahasiswa table */}
            <div className="col-12 col-lg-7">
              <div className="card border-0 shadow-sm rounded-3">
                <div className="card-body p-0">
                  <div className="d-flex align-items-center justify-content-between px-4 py-3 border-bottom">
                    <h6 className="fw-semibold mb-0">Skor PCA Mahasiswa</h6>
                    <span className="badge bg-primary bg-opacity-10 text-primary fw-semibold">
                      {result.skor_mahasiswa.length} mahasiswa
                    </span>
                  </div>
                  <div className="table-responsive" style={{ maxHeight: 360, overflowY: 'auto' }}>
                    <table className="table table-hover align-middle mb-0">
                      <thead className="table-light" style={{ position: 'sticky', top: 0 }}>
                        <tr>
                          <th className="px-4 py-3 text-secondary fw-semibold" style={{ fontSize: '0.78rem' }}>#</th>
                          <th className="px-4 py-3 text-secondary fw-semibold" style={{ fontSize: '0.78rem' }}>NAMA MAHASISWA</th>
                          <th className="px-4 py-3 text-secondary fw-semibold" style={{ fontSize: '0.78rem' }}>NIM</th>
                          <th className="px-4 py-3 text-secondary fw-semibold" style={{ fontSize: '0.78rem' }}>KLASTER</th>
                          <th className="px-4 py-3 text-secondary fw-semibold" style={{ fontSize: '0.78rem' }}>PC1</th>
                          <th className="px-4 py-3 text-secondary fw-semibold" style={{ fontSize: '0.78rem' }}>PC2</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.skor_mahasiswa.map((s, idx) => (
                          <tr key={s.mahasiswa_id}>
                            <td className="px-4 text-secondary" style={{ fontSize: '0.875rem' }}>{idx + 1}</td>
                            <td className="px-4 fw-medium" style={{ fontSize: '0.875rem' }}>{s.nama_mahasiswa}</td>
                            <td className="px-4 text-secondary" style={{ fontSize: '0.82rem' }}>
                              {s.nim ?? <span className="fst-italic">—</span>}
                            </td>
                            <td className="px-4"><KlasterBadge klaster={s.klaster} /></td>
                            <td className="px-4 font-monospace" style={{ fontSize: '0.82rem' }}>{round4(s.PC1)}</td>
                            <td className="px-4 font-monospace" style={{ fontSize: '0.82rem' }}>{round4(s.PC2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            {/* Loadings table */}
            <div className="col-12 col-lg-5">
              <div className="card border-0 shadow-sm rounded-3">
                <div className="card-body p-0">
                  <div className="px-4 py-3 border-bottom">
                    <h6 className="fw-semibold mb-0">Komponen Utama (Loadings)</h6>
                  </div>
                  <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                      <thead className="table-light">
                        <tr>
                          <th className="px-4 py-3 text-secondary fw-semibold" style={{ fontSize: '0.78rem' }}>MATA KULIAH</th>
                          <th className="px-4 py-3 text-secondary fw-semibold" style={{ fontSize: '0.78rem' }}>PC1</th>
                          <th className="px-4 py-3 text-secondary fw-semibold" style={{ fontSize: '0.78rem' }}>PC2</th>
                        </tr>
                      </thead>
                      <tbody>
                        {loadingRows.map((row) => (
                          <tr key={row.mk}>
                            <td className="px-4 fw-medium" style={{ fontSize: '0.875rem' }}>{row.mk}</td>
                            <td className="px-4 font-monospace" style={{ fontSize: '0.82rem', color: row.pc1 >= 0 ? '#059669' : '#dc2626' }}>
                              {row.pc1 >= 0 ? '+' : ''}{row.pc1}
                            </td>
                            <td className="px-4 font-monospace" style={{ fontSize: '0.82rem', color: row.pc2 >= 0 ? '#059669' : '#dc2626' }}>
                              {row.pc2 >= 0 ? '+' : ''}{row.pc2}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Profil Klaster */}
          <ProfilKlaster profil={result.profil_klaster} />
        </>
      )}

      {/* Empty state */}
      {!result && !loading && !error && (
        <div className="card border-0 shadow-sm rounded-3">
          <div className="text-center py-5 text-secondary">
            <div style={{ fontSize: '3rem' }}>🔬</div>
            <p className="mt-2 mb-0 fw-semibold">Klik tombol "Hitung PCA" untuk memulai analisis.</p>
            <p style={{ fontSize: '0.82rem' }} className="mt-1">Hasil akan ditampilkan di sini setelah analisis selesai.</p>
          </div>
        </div>
      )}
    </div>
  );
}
