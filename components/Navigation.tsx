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
    <nav className="bg-black text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex gap-4">
          <Button
            text="Kullanıcılar"
            stylingMode="text"
            onClick={() => router.push('/users')}
            className={pathname?.startsWith('/users') ? 'text-yellow-300' : 'text-white'}
            elementAttr={{
              style: { color: pathname?.startsWith('/users') ? '#fde047' : '#ffffff' }
            }}
          />
          <Button
            text="Siparişler"
            stylingMode="text"
            onClick={() => router.push('/orders')}
            className={pathname?.startsWith('/orders') ? 'text-yellow-300' : 'text-white'}
            elementAttr={{
              style: { color: pathname?.startsWith('/orders') ? '#fde047' : '#ffffff' }
            }}
          />
        </div>
        <Button
          text="Çıkış"
          stylingMode="text"
          icon="close"
          onClick={handleLogout}
          className="text-white"
          elementAttr={{
            style: { color: '#ffffff' }
          }}
        />
      </div>
    </nav>
  );
}





