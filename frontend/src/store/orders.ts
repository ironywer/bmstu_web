import { defineStore } from 'pinia';
import { 
  fetchOrders, 
  createOrder, 
  updateOrderById, 
  deleteOrderById, 
  moveItemBetweenOrders 
} from '../services/orderService';
// import { fetchItems } from '../services/itemService';

export const useOrderStore = defineStore('orders', {
  state: () => ({
    orders: [] as Array<{ id: string; customerName: string; orderDate: string; items: any[] }>,
  }),
  actions: {
    async loadOrders() {
      const response = await fetchOrders();
      if (response.success) {
        this.orders = response.data || [];
      }
    },
    async addOrder(order: { customerName: string; orderDate: string }) {
      const response = await createOrder(order);
      if (response.success) {
        this.orders.push(response.data);
      }
    },
    async updateOrder(id: string, updatedOrder: { customerName: string; orderDate: string }) {
      const response = await updateOrderById(id, updatedOrder);
      if (response.success) {
        const index = this.orders.findIndex((order) => order.id === id);
        if (index !== -1) {
          this.orders[index] = { ...this.orders[index], ...response.data };
        }
      }
    },
    async removeOrder(id: string) {
      const response = await deleteOrderById(id);
      if (response.success) {
        this.orders = this.orders.filter((order) => order.id !== id);
      }
    },
    async addItemToOrder(orderId: string, itemId: string, quantity: number) {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/orders/${orderId}/items`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ itemId, quantity }),
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || 'Failed to add item to order');
        }

        const order = this.orders.find((order) => order.id === orderId);
        if (order) {
          order.items.push(data);
        }
      } catch (error) {
        throw error;
      }
    },

    async removeItemFromOrder(orderId: string, itemId: string) {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/orders/${orderId}/items/${itemId}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (response.ok) {
        const order = this.orders.find((order) => order.id === orderId);
        if (order) {
          order.items = order.items.filter((item) => item.id !== itemId);
        }
      } else {
        throw new Error(data.message || 'Failed to remove item from order');
      }
    },

    async moveItemBetweenOrders(fromOrderId: string, toOrderId: string, itemId: string, quantity: number): Promise<boolean> {
      try {
        const response = await moveItemBetweenOrders(fromOrderId, itemId, toOrderId, quantity);
        if (!response.success) {
          return false;
        }

        const sourceOrder = this.orders.find((order) => order.id === fromOrderId);
        const targetOrder = this.orders.find((order) => order.id === toOrderId);

        if (sourceOrder && targetOrder) {
          const itemIndex = sourceOrder.items.findIndex((item) => item.id === itemId);
          if (itemIndex !== -1) {
            const [item] = sourceOrder.items.splice(itemIndex, 1);
            targetOrder.items.push(item);
          }
        }

        return true;
      } catch (error) {
        console.error('Error moving item between orders:', error);
        return false;
      }
    },
  },
});
