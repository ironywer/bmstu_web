const API_URL = `${import.meta.env.VITE_API_URL}/items`;

export const fetchItems = async () => {
  const response = await fetch(API_URL);
  return response.json();
};

export const createItem = async (item: { name: string; quantity: number }) => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item),
  });
  return response.json();
};

export const deleteItemService = async (itemId: string) => {
  const response = await fetch(`${API_URL}/${itemId}`, {
    method: 'DELETE',
  });
  return response.json();
};

export const updateItemService = async (itemId: string, item: { name: string; quantity: number }) => {
  const response = await fetch(`${API_URL}/${itemId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item),
  });
  return response.json();
};
