import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { getToken, logout } from '../services/authService';
import { useNavigate } from 'react-router-dom';

export default function HomePage() {
  const { t } = useTranslation();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setError('No token found');
      return;
    }

    fetch('http://localhost:8080/api/test/hello', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => {
        if (!res.ok) throw new Error('Unauthorized');
        return res.text();
      })
      .then(setMessage)
      .catch(() => setError('Authorization failed'));
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <LanguageSwitcher />
        <button onClick={handleLogout} className="btn btn-outline-danger">
          🔓 {t('logout') || 'Logout'}
        </button>
      </div>

      <h1>{t('welcome')}</h1>

      {message && <div className="alert alert-success mt-4">{message}</div>}
      {error && <div className="alert alert-danger mt-4">{error}</div>}
    </div>
  );
}
