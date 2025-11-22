import fs from 'fs';
import path from 'path';

const dataDirectory = path.join(process.cwd(), 'data');

// Users API
export function getUsers() {
  const filePath = path.join(dataDirectory, 'users.json');
  const fileContents = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(fileContents);
}

export function saveUsers(users: any[]) {
  const filePath = path.join(dataDirectory, 'users.json');
  fs.writeFileSync(filePath, JSON.stringify(users, null, 2), 'utf8');
}

export function getUserById(id: number) {
  const users = getUsers();
  return users.find((u: any) => u.id === id);
}

export function createUser(user: any) {
  const users = getUsers();
  const newId = Math.max(...users.map((u: any) => u.id), 0) + 1;
  const newUser = { ...user, id: newId };
  users.push(newUser);
  saveUsers(users);
  return newUser;
}

export function updateUser(id: number, userData: any) {
  const users = getUsers();
  const index = users.findIndex((u: any) => u.id === id);
  if (index !== -1) {
    users[index] = { ...users[index], ...userData, id };
    saveUsers(users);
    return users[index];
  }
  return null;
}

export function deleteUsers(ids: number[]) {
  const users = getUsers();
  const filteredUsers = users.filter((u: any) => !ids.includes(u.id));
  saveUsers(filteredUsers);
  return filteredUsers;
}

// Orders API
export function getOrders() {
  const filePath = path.join(dataDirectory, 'orders.json');
  const fileContents = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(fileContents);
}

export function saveOrders(orders: any[]) {
  const filePath = path.join(dataDirectory, 'orders.json');
  fs.writeFileSync(filePath, JSON.stringify(orders, null, 2), 'utf8');
}

export function getOrderById(id: number) {
  const orders = getOrders();
  return orders.find((o: any) => o.id === id);
}

export function createOrder(order: any) {
  const orders = getOrders();
  const newId = Math.max(...orders.map((o: any) => o.id), 0) + 1;
  const newOrder = { ...order, id: newId };
  orders.push(newOrder);
  saveOrders(orders);
  return newOrder;
}

export function updateOrder(id: number, orderData: any) {
  const orders = getOrders();
  const index = orders.findIndex((o: any) => o.id === id);
  if (index !== -1) {
    orders[index] = { ...orders[index], ...orderData, id };
    saveOrders(orders);
    return orders[index];
  }
  return null;
}

export function deleteOrder(id: number) {
  const orders = getOrders();
  const filteredOrders = orders.filter((o: any) => o.id !== id);
  saveOrders(filteredOrders);
  return filteredOrders;
}

export function updateOrderProduct(orderId: number, productId: number, productData: any) {
  const orders = getOrders();
  const orderIndex = orders.findIndex((o: any) => o.id === orderId);
  if (orderIndex !== -1) {
    const productIndex = orders[orderIndex].products.findIndex((p: any) => p.id === productId);
    if (productIndex !== -1) {
      orders[orderIndex].products[productIndex] = { ...orders[orderIndex].products[productIndex], ...productData, id: productId };
      saveOrders(orders);
      return orders[orderIndex].products[productIndex];
    }
  }
  return null;
}

export function deleteOrderProduct(orderId: number, productId: number) {
  const orders = getOrders();
  const orderIndex = orders.findIndex((o: any) => o.id === orderId);
  if (orderIndex !== -1) {
    orders[orderIndex].products = orders[orderIndex].products.filter((p: any) => p.id !== productId);
    saveOrders(orders);
    return orders[orderIndex];
  }
  return null;
}

export function addOrderProduct(orderId: number, productData: any) {
  const orders = getOrders();
  const orderIndex = orders.findIndex((o: any) => o.id === orderId);
  if (orderIndex !== -1) {
    const newProductId = Math.max(...(orders[orderIndex].products.map((p: any) => p.id) || [0]), 0) + 1;
    const newProduct = { ...productData, id: newProductId };
    orders[orderIndex].products.push(newProduct);
    saveOrders(orders);
    return newProduct;
  }
  return null;
}





