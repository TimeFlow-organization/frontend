// src/pages/LoginPage.tsx
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../components/LanguageSwitcher';
import AuthCard from '../components/AuthCard';

import { useNavigate, Link } from 'react-router-dom';
import { login } from '../services/authService';
import { useState } from 'react';

export default function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const email = (form.elements.namedItem('email') as HTMLInputElement).value;
    const password = (form.elements.namedItem('password') as HTMLInputElement).value;

    try {
      const result = await login(email, password);
      if (result.token) {
        navigate('/');
      } else {
        setError('login_error');
      }
    } catch {
      setError('login_error');
    }
  };

  return (
    <AuthCard>
      <LanguageSwitcher />
      <h2 className="text-center">{t('login')}</h2>
      {error && <div className="alert alert-danger">{t(error)}</div>}
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">{t('email')}</label>
          <input name="email" type="email" className="form-control" required />
        </div>
        <div className="mb-3">
          <label className="form-label">{t('password')}</label>
          <input name="password" type="password" className="form-control" required />
        </div>
        <button type="submit" className="btn btn-primary w-100">{t('login')}</button>
        <div className="mt-3 text-center">
          <span>{t('no_account')} </span>
          <Link to="/register">{t('register')}</Link>
        </div>
      </form>
    </AuthCard>
  );
}
