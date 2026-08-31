import { Menu } from 'lucide-react';

export default function Topbar({ onMenu, title, subtitle, breadcrumb }) {
  return (
    <header className="topbar">
      <div className="topbar-title">
        <div className="breadcrumb">{breadcrumb}</div>
        <h2>{title}</h2>
        {subtitle && <small style={{ color: 'var(--text-dim)', fontSize: '12px' }}>{subtitle}</small>}
      </div>
      <div className="topbar-actions">
        <div className="user-menu">
          <div className="avatar">M</div>
          <span style={{ fontSize: '13px', fontWeight: 600 }}>MAC</span>
        </div>
        <button className="menu-button icon-button" onClick={onMenu}><Menu size={20} /></button>
      </div>
    </header>
  );
}
