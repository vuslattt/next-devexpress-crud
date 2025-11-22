import { NextRequest, NextResponse } from 'next/server';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const getOrdersFilePath = () => join(process.cwd(), 'data', 'orders.json');

export async function GET(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const orderId = parseInt(params.orderId);
    const filePath = getOrdersFilePath();
    const fileContents = readFileSync(filePath, 'utf8');
    const orders = JSON.parse(fileContents);

    const order = orders.find((o: any) => o.id === orderId);
    
    if (!order) {
      return NextResponse.json(
        { error: 'Sipariş bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json(order.products || []);
  } catch (error) {
    console.error('Get products error:', error);
    return NextResponse.json(
      { error: 'Ürünler yüklenirken hata oluştu' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const orderId = parseInt(params.orderId);
    const productData = await request.json();
    const filePath = getOrdersFilePath();
    const fileContents = readFileSync(filePath, 'utf8');
    const orders = JSON.parse(fileContents);

    const order = orders.find((o: any) => o.id === orderId);
    if (!order) {
      return NextResponse.json(
        { error: 'Sipariş bulunamadı' },
        { status: 404 }
      );
    }

    if (!order.products) {
      order.products = [];
    }

    const newProductId = Math.max(...order.products.map((p: any) => p.id || 0), 0) + 1;
    const newProduct = { ...productData, id: newProductId };
    order.products.push(newProduct);

    writeFileSync(filePath, JSON.stringify(orders, null, 2), 'utf8');
    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    console.error('Create product error:', error);
    return NextResponse.json(
      { error: 'Ürün oluşturulurken hata oluştu' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const orderId = parseInt(params.orderId);
    const productData = await request.json();
    const filePath = getOrdersFilePath();
    const fileContents = readFileSync(filePath, 'utf8');
    const orders = JSON.parse(fileContents);

    const order = orders.find((o: any) => o.id === orderId);
    if (!order || !order.products) {
      return NextResponse.json(
        { error: 'Sipariş veya ürün bulunamadı' },
        { status: 404 }
      );
    }

    const productIndex = order.products.findIndex((p: any) => p.id === productData.id);
    if (productIndex === -1) {
      return NextResponse.json(
        { error: 'Ürün bulunamadı' },
        { status: 404 }
      );
    }

    // productData içindeki tüm field'ları merge et (images dahil)
    const updatedProduct = { ...order.products[productIndex], ...productData };
    console.log('API PUT - productData:', productData);
    console.log('API PUT - productData.images:', productData.images);
    console.log('API PUT - updatedProduct:', updatedProduct);
    console.log('API PUT - updatedProduct.images:', updatedProduct.images);
    order.products[productIndex] = updatedProduct;
    writeFileSync(filePath, JSON.stringify(orders, null, 2), 'utf8');

    return NextResponse.json(order.products[productIndex]);
  } catch (error) {
    console.error('Update product error:', error);
    return NextResponse.json(
      { error: 'Ürün güncellenirken hata oluştu' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const orderId = parseInt(params.orderId);
    const { searchParams } = new URL(request.url);
    const productId = parseInt(searchParams.get('productId') || '0');

    const filePath = getOrdersFilePath();
    const fileContents = readFileSync(filePath, 'utf8');
    const orders = JSON.parse(fileContents);

    const order = orders.find((o: any) => o.id === orderId);
    if (!order || !order.products) {
      return NextResponse.json(
        { error: 'Sipariş veya ürün bulunamadı' },
        { status: 404 }
      );
    }

    order.products = order.products.filter((p: any) => p.id !== productId);
    writeFileSync(filePath, JSON.stringify(orders, null, 2), 'utf8');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete product error:', error);
    return NextResponse.json(
      { error: 'Ürün silinirken hata oluştu' },
      { status: 500 }
    );
  }
}

