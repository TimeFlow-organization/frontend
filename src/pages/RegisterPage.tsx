import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../components/LanguageSwitcher';
import AuthCard from '../components/AuthCard';
import { register, saveToken } from '../services/authService';
import { useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';

export default function RegisterPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const email = (form.elements.namedItem('email') as HTMLInputElement).value;
    const username = (form.elements.namedItem('username') as HTMLInputElement).value;
    const password = (form.elements.namedItem('password') as HTMLInputElement).value;
    const confirm = (form.elements.namedItem('confirm') as HTMLInputElement).value;

    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }

    try {
      const response = await register(email, username, password);
      if (response && response.token) {
        saveToken(response.token);
        navigate('/');
      } else {
        setError('Registration failed. Please try again.');
      }
    } catch (err) {
      setError('Registration error. Check input or try again.');
    }
  };

  return (
    <AuthCard>
      <LanguageSwitcher />
      <h2 className="text-center">{t('register')}</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">{t('email')}</label>
          <input name="email" type="email" className="form-control" required />
        </div>
        <div className="mb-3">
          <label className="form-label">{t('username')}</label>
          <input name="username" type="text" className="form-control" required />
        </div>
        <div className="mb-3">
          <label className="form-label">{t('password')}</label>
          <div className="input-group">
            <input name="password" type={passwordVisible ? 'text' : 'password'} className="form-control" required />
            <button type="button" className="btn btn-outline-secondary" onClick={() => setPasswordVisible(!passwordVisible)}>
              {passwordVisible ? '👁️‍🗨️' : '👁️'}
            </button>
          </div>
        </div>
        <div className="mb-3">
          <label className="form-label">{t('confirm_password')}</label>
          <div className="input-group">
            <input name="confirm" type={confirmVisible ? 'text' : 'password'} className="form-control" required />
            <button type="button" className="btn btn-outline-secondary" onClick={() => setConfirmVisible(!confirmVisible)}>
              {confirmVisible ? '👁️‍🗨️' : '👁️'}
            </button>
          </div>
        </div>
        <button type="submit" className="btn btn-success w-100">{t('register')}</button>
        <div className="mt-3 text-center">
          <span>{t('have_account')} </span>
          <Link to="/login">{t('login')}</Link>
        </div>
      </form>
    </AuthCard>
  );
}