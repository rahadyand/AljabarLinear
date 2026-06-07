import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/',            icon: '📊', label: 'Dashboard'    },
  { to: '/mahasiswa',   icon: '👤', label: 'Mahasiswa'    },
  { to: '/mata-kuliah', icon: '📚', label: 'Mata Kuliah'  },
  { to: '/nilai',       icon: '📝', label: 'Nilai'        },
  { to: '/upload',      icon: '📂', label: 'Upload CSV'   },
  { to: '/pca',         icon: '🔬', label: 'Analisis PCA' },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <h5>Analisis Nilai</h5>
        <p>Sistem PCA Mahasiswa</p>
      </div>
      <nav className="sidebar-nav">
        {navItems.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
          >
            <span className="nav-icon">{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
