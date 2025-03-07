import { defineStore } from 'pinia';
import { fetchItems, createItem } from '../services/itemService';

export const useItemStore = defineStore('items', {
  state: () => ({
    items: [] as Array<{ id: string; name: string; quantity: number }>,
  }),
  actions: {
    async loadItems() {
      const response = await fetchItems();
      if (response.success) {
        this.items = response.data;
      }
    },
    async addItem(item: { name: string; quantity: number }) {
      const response = await createItem(item);
      if (response.success) {
        this.items.push(response.data);
      }
    },
  },
});
