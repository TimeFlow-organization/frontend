// src/components/RequireAuth.tsx
import { useEffect, useState, type JSX } from 'react';
import { useNavigate } from 'react-router-dom';
import { checkTokenValid, getToken } from '../services/authService';

export default function RequireAuth({ children }: { children: JSX.Element }) {
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setAuthorized(false);
      navigate('/login');
      return;
    }

    (async () => {
      const isValid = await checkTokenValid();
      if (!isValid) {
        setAuthorized(false);
        navigate('/login');
      } else {
        setAuthorized(true);
      }
    })();
  }, [navigate]);

  if (authorized === null) return <div className="text-center mt-5">Checking authentication...</div>;
  return children;
}
