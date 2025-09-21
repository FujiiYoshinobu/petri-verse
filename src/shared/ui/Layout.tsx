import { NavLink, Outlet } from 'react-router-dom';
import './layout.css';

const links = [
  { to: '/', label: '観察' },
  { to: '/encyclopedia', label: '図鑑' },
  { to: '/ranking', label: 'ランキング' }
];

export const Layout = () => (
  <div className="layout">
    <header className="layout__header">
      <div className="layout__logo">
        <img src="/logo.svg" alt="PetriVerse" />
        <div>
          <h1>PetriVerse</h1>
          <p>ペトリ皿に広がる小さな宇宙</p>
        </div>
      </div>
      <nav>
        {links.map((link) => (
          <NavLink key={link.to} to={link.to} className={({ isActive }) => (isActive ? 'is-active' : '')}>
            {link.label}
          </NavLink>
        ))}
      </nav>
    </header>
    <main className="layout__content">
      <Outlet />
    </main>
  </div>
);
