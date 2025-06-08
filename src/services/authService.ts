const API_URL = `${import.meta.env.VITE_API_URL}/auth`;

export async function register(email: string, username: string, password: string) {
  const response = await fetch(`${API_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, username, password }),
  });
  console.log("Register response", response);
  return response.json();
}

export async function login(email: string, password: string) {
  const response = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();
  if (response.ok && data.token) {
    localStorage.setItem('token', data.token);
  }
  return data;
}

export async function logout() {
  const token = localStorage.getItem('token');
  await fetch(`${API_URL}/logout`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  localStorage.removeItem('token');
}

export async function checkTokenValid(): Promise<boolean> {
    const token = localStorage.getItem('token');
    if (!token) return false;
  
    try {
      const res = await fetch(`${API_URL}/check`, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      const isValid = await res.json(); 
      return isValid === true;
    } catch (error) {
      console.error('Token check failed:', error);
      return false;
    }
  }
  
export function saveToken(token: string) {
    localStorage.setItem('token', token);
}
  

export function getToken(): string | null {
  return localStorage.getItem('token');
}
