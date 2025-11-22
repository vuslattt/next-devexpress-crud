import Cookies from 'js-cookie';

export function hasManagementPermission(): boolean {
  const userCookie = Cookies.get('user');
  if (!userCookie) return false;
  
  try {
    const user = JSON.parse(userCookie);
    return user.department === 'Yönetim';
  } catch {
    return false;
  }
}

export function getCurrentUser() {
  const userCookie = Cookies.get('user');
  if (!userCookie) return null;
  
  try {
    return JSON.parse(userCookie);
  } catch {
    return null;
  }
}





