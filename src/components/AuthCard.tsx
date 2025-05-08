import React from 'react';

export default function AuthCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="card p-4 shadow-sm" style={{ minWidth: '350px', maxWidth: '400px', width: '100%' }}>
        {children}
      </div>
    </div>
  );
}
