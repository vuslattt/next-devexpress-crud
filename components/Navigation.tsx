'use client';

import { useRouter, usePathname } from 'next/navigation';
import { Button } from 'devextreme-react/button';
import Cookies from 'js-cookie';

export default function Navigation() {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    Cookies.remove('user');
    router.push('/login');
  };

  if (pathname === '/login') {
    return null;
  }

  return (
    <nav className="bg-blue-600 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex gap-4">
          <Button
            text="Kullanıcılar"
            stylingMode="text"
            onClick={() => router.push('/users')}
            className={pathname?.startsWith('/users') ? 'text-yellow-300' : ''}
          />
          <Button
            text="Siparişler"
            stylingMode="text"
            onClick={() => router.push('/orders')}
            className={pathname?.startsWith('/orders') ? 'text-yellow-300' : ''}
          />
        </div>
        <Button
          text="Çıkış"
          stylingMode="text"
          icon="close"
          onClick={handleLogout}
        />
      </div>
    </nav>
  );
}





