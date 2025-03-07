// Замените в коде все использования `orderDate` на `orderDate`

const API_URL = `${import.meta.env.VITE_API_URL}/orders`;

export const fetchOrders = async () => {
  const response = await fetch(API_URL);
  return response.json();
};

export const fetchOrderById = async (id: string) => {
  const response = await fetch(`${API_URL}/${id}`);
  return response.json();
};

// Исправленный код
export const createOrder = async (order: { customerName: string; orderDate: string }) => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(order), // теперь используется orderDate
  });
  return response.json();
};

// Исправленный код
export const updateOrderById = async (id: string, order: { customerName: string; orderDate: string }) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(order), // теперь используется orderDate
  });
  return response.json();
};

export const deleteOrderById = async (id: string) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
  });
  return response.json();
};

export const moveItemBetweenOrders = async (fromOrderId: string, itemId: string, toOrderId: string, quantity: number) => {
  const response = await fetch(`${API_URL}/${fromOrderId}/items/${itemId}/move/${toOrderId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ quantity }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error?.message || 'Failed to move item between orders');
  }

  return response.json();
};
