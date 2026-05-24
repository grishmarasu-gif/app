import { useState } from 'react';
import { LogOut, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

export default function LogoutButton({ isNavbar = false, iconOnly = false }) {
  const { logout } = useAuth();
  const { toast } = useApp();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    await logout();
    setLoading(false);
    if (toast) toast('Logged out successfully', 'success');
    navigate('/login');
  };

  if (isNavbar) {
    if (iconOnly) {
      return (
        <button 
          onClick={handleLogout} 
          disabled={loading}
          className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors duration-200"
          style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)', color: 'var(--text-m)' }}
          onMouseEnter={e => {
            e.currentTarget.style.background = '#fef2f2';
            e.currentTarget.style.color = '#dc2626';
            e.currentTarget.style.borderColor = '#fecaca';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'var(--bg-subtle)';
            e.currentTarget.style.color = 'var(--text-m)';
            e.currentTarget.style.borderColor = 'var(--border)';
          }}
          title="Logout"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
        </button>
      );
    }

    return (
      <button 
        onClick={handleLogout} 
        disabled={loading}
        className="flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold transition-all duration-200 hover:-translate-y-0.5"
        style={{ color: 'var(--text-m)', border: '1px solid var(--border)' }}
        onMouseEnter={e => {
          e.currentTarget.style.background = '#fef2f2';
          e.currentTarget.style.color = '#dc2626';
          e.currentTarget.style.borderColor = '#fecaca';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.color = 'var(--text-m)';
          e.currentTarget.style.borderColor = 'var(--border)';
        }}
        title="Logout"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
        <span>{loading ? 'Logging out...' : 'Log Out'}</span>
      </button>
    );
  }

  // Dashboard / Sidebar style
  return (
    <button 
      onClick={handleLogout}
      disabled={loading}
      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all hover:opacity-90"
      style={{ background: '#fef2f2', color: '#dc2626', border: '1.5px solid #fecaca' }}
      title="Logout"
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
      {loading ? 'Logging out...' : 'Log Out'}
    </button>
  );
}
