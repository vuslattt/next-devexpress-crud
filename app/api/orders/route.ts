import { NextRequest, NextResponse } from 'next/server';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const getOrdersFilePath = () => join(process.cwd(), 'data', 'orders.json');

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const userId = searchParams.get('userId');

    const filePath = getOrdersFilePath();
    const fileContents = readFileSync(filePath, 'utf8');
    let orders = JSON.parse(fileContents);

    // Tarih filtresi
    if (startDate && endDate) {
      orders = orders.filter((order: any) => {
        const orderDate = new Date(order.orderDate);
        const start = new Date(startDate);
        const end = new Date(endDate);
        return orderDate >= start && orderDate <= end;
      });
    }

    // Temsilci filtresi (representative field'ına göre)
    if (userId && userId !== 'null' && userId !== 'undefined') {
      // userId aslında temsilci adı (name surname formatında) olarak gönderiliyor
      const representativeName = userId;
      orders = orders.filter((order: any) => {
        // Hem userId hem de representative field'larını kontrol et
        if (order.representative === representativeName) {
          return true;
        }
        // Eğer userId sayısal ise, eski format için de kontrol et
        const userIdNum = parseInt(userId);
        if (!isNaN(userIdNum) && order.userId === userIdNum) {
          return true;
        }
        return false;
      });
    }

    return NextResponse.json(orders);
  } catch (error) {
    console.error('Get orders error:', error);
    return NextResponse.json(
      { error: 'Siparişler yüklenirken hata oluştu' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const orderData = await request.json();
    const filePath = getOrdersFilePath();
    const fileContents = readFileSync(filePath, 'utf8');
    const orders = JSON.parse(fileContents);

    const newId = Math.max(...orders.map((o: any) => o.id), 0) + 1;
    const newOrder = { ...orderData, id: newId, products: orderData.products || [] };

    orders.push(newOrder);
    writeFileSync(filePath, JSON.stringify(orders, null, 2), 'utf8');

    return NextResponse.json(newOrder, { status: 201 });
  } catch (error) {
    console.error('Create order error:', error);
    return NextResponse.json(
      { error: 'Sipariş oluşturulurken hata oluştu' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const orderData = await request.json();
    const filePath = getOrdersFilePath();
    const fileContents = readFileSync(filePath, 'utf8');
    const orders = JSON.parse(fileContents);

    const index = orders.findIndex((o: any) => o.id === orderData.id);
    if (index === -1) {
      return NextResponse.json(
        { error: 'Sipariş bulunamadı' },
        { status: 404 }
      );
    }

    orders[index] = { ...orders[index], ...orderData };
    writeFileSync(filePath, JSON.stringify(orders, null, 2), 'utf8');

    return NextResponse.json(orders[index]);
  } catch (error) {
    console.error('Update order error:', error);
    return NextResponse.json(
      { error: 'Sipariş güncellenirken hata oluştu' },
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
        { error: 'Silinecek sipariş ID\'leri gereklidir' },
        { status: 400 }
      );
    }

    const ids = JSON.parse(idsParam);
    const filePath = getOrdersFilePath();
    const fileContents = readFileSync(filePath, 'utf8');
    const orders = JSON.parse(fileContents);

    const filteredOrders = orders.filter((o: any) => !ids.includes(o.id));
    writeFileSync(filePath, JSON.stringify(filteredOrders, null, 2), 'utf8');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete order error:', error);
    return NextResponse.json(
      { error: 'Sipariş silinirken hata oluştu' },
      { status: 500 }
    );
  }
}

