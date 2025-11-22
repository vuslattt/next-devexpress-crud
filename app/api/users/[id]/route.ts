import { NextRequest, NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const filePath = join(process.cwd(), 'data', 'users.json');
    const fileContents = readFileSync(filePath, 'utf8');
    const users = JSON.parse(fileContents);

    const user = users.find((u: any) => u.id === id);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }

    const { password, ...userWithoutPassword } = user;
    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { error: 'Kullanıcı yüklenirken hata oluştu' },
      { status: 500 }
    );
  }
}

