'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { TextBox } from 'devextreme-react/text-box';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!username.trim() || !password.trim()) {
      setError('Lütfen kullanıcı adı ve şifre girin');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: username.trim(), password: password.trim() }),
      });

      const data = await response.json();

      if (response.ok && data.id) {
        Cookies.set('user', JSON.stringify(data), { expires: 7 });
        router.push('/users');
        router.refresh();
      } else {
        setError(data.error || 'Kullanıcı adı veya şifre hatalı');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold text-center mb-6">Giriş Yap</h1>
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Kullanıcı Adı</label>
            <TextBox
              value={username}
              onValueChange={setUsername}
              placeholder="Kullanıcı adınızı girin"
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Şifre</label>
            <TextBox
              mode="password"
              value={password}
              onValueChange={setPassword}
              placeholder="Şifrenizi girin"
            />
          </div>
          {error && (
            <div className="mb-4 p-3 bg-red-100 border-2 border-red-400 text-red-700 rounded text-center font-medium">
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded transition-colors"
          >
            {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
          </button>
        </form>
        <div className="mt-4 text-sm text-gray-600 text-center">
          <p className="font-semibold mb-2">Test kullanıcıları:</p>
          <p>Kullanıcı Adı: <strong>ADMIN</strong> / Şifre: <strong>admin123</strong></p>
          <p>Kullanıcı Adı: <strong>mervan</strong> / Şifre: <strong>password123</strong></p>
        </div>
      </div>
    </div>
  );
}
