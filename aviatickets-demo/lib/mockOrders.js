import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'MOCK_ORDERS';

export async function getOrders() {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}


export async function saveOrder(order) {
  const orders = await getOrders();
  orders.unshift(order);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
}

export async function getOrderById(orderId) {
  const orders = await getOrders();
  return orders.find(o => o.orderId === orderId);
}