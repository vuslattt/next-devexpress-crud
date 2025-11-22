import { NextRequest, NextResponse } from 'next/server';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const getUsersFilePath = () => join(process.cwd(), 'data', 'users.json');

export async function GET() {
  try {
    const filePath = getUsersFilePath();
    const fileContents = readFileSync(filePath, 'utf8');
    const users = JSON.parse(fileContents);
    
    // Şifreleri kaldır
    const usersWithoutPasswords = users.map((user: any) => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
    
    return NextResponse.json(usersWithoutPasswords);
  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json(
      { error: 'Kullanıcılar yüklenirken hata oluştu' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userData = await request.json();
    const filePath = getUsersFilePath();
    const fileContents = readFileSync(filePath, 'utf8');
    const users = JSON.parse(fileContents);

    // Yeni ID oluştur
    const newId = Math.max(...users.map((u: any) => u.id), 0) + 1;
    const newUser = { ...userData, id: newId };

    users.push(newUser);
    writeFileSync(filePath, JSON.stringify(users, null, 2), 'utf8');

    const { password, ...userWithoutPassword } = newUser;
    return NextResponse.json(userWithoutPassword, { status: 201 });
  } catch (error) {
    console.error('Create user error:', error);
    return NextResponse.json(
      { error: 'Kullanıcı oluşturulurken hata oluştu' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const userData = await request.json();
    const filePath = getUsersFilePath();
    const fileContents = readFileSync(filePath, 'utf8');
    const users = JSON.parse(fileContents);

    const index = users.findIndex((u: any) => u.id === userData.id);
    if (index === -1) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }

    users[index] = { ...users[index], ...userData };
    writeFileSync(filePath, JSON.stringify(users, null, 2), 'utf8');

    const { password, ...userWithoutPassword } = users[index];
    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json(
      { error: 'Kullanıcı güncellenirken hata oluştu' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const idsParam = searchParams.get('ids');
    
    if (!idsParam) {
      return NextResponse.json(
        { error: 'Silinecek kullanıcı ID\'leri gereklidir' },
        { status: 400 }
      );
    }

    const ids = JSON.parse(idsParam);
    const filePath = getUsersFilePath();
    const fileContents = readFileSync(filePath, 'utf8');
    const users = JSON.parse(fileContents);

    const filteredUsers = users.filter((u: any) => !ids.includes(u.id));
    writeFileSync(filePath, JSON.stringify(filteredUsers, null, 2), 'utf8');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json(
      { error: 'Kullanıcı silinirken hata oluştu' },
      { status: 500 }
    );
  }
}

