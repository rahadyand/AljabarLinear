import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Mahasiswa from './pages/Mahasiswa';
import MataKuliah from './pages/MataKuliah';
import Nilai from './pages/Nilai';
import Upload from './pages/Upload';
import PCA from './pages/PCA';

// Placeholder stubs — to be implemented in later phases
const Stub = ({ name }) => (
  <div>
    <div className="page-header">
      <h2>{name}</h2>
      <p>Halaman ini akan diimplementasikan berikutnya.</p>
    </div>
  </div>
);

export default function App() {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <Routes>
          <Route path="/"            element={<Dashboard />} />
          <Route path="/mahasiswa"   element={<Mahasiswa />} />
          <Route path="/mata-kuliah" element={<MataKuliah />} />
          <Route path="/nilai"       element={<Nilai />} />
          <Route path="/upload"      element={<Upload />} />
          <Route path="/pca"         element={<PCA />} />
        </Routes>
      </main>
    </div>
  );
}
