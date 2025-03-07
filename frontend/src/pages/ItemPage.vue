<template>
  <div class="item-page page-container">
    <h1>Items</h1>
    <center><button @click="showItemModal = true">Add New Item</button></center>
    <div v-if="items.length" class="item-list">
      <ItemCard
        v-for="item in items"
        :key="item.id"
        :item="item"
        @click="openEditItemModal(item)"
        @delete-item="deleteItem"
      />
    </div>
    <p v-else>No items available</p>

    <!-- Add/Edit Item Modal -->
    <div v-if="showItemModal" class="modal-overlay" @click.self="closeItemModal">
      <div class="modal">
        <h2>{{ isEditing ? 'Edit Item' : 'Add Item' }}</h2>
        <form @submit.prevent="submitItem">
          <div>
            <label for="name">Name:</label>
            <input id="name" v-model="currentItem.name" type="text" required />
          </div>
          <div>
            <label for="quantity">Quantity:</label>
            <input id="quantity" v-model.number="currentItem.quantity" type="number" min="0" required />
          </div>
          <div class="modal-buttons">
            <button type="submit">{{ isEditing ? 'Update' : 'Add' }}</button>
            <button type="button" @click="closeItemModal">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, reactive, ref } from 'vue';
import { useRoute } from 'vue-router';
import {
  fetchItems,
  createItem,
  updateItemService,
  deleteItemService,
} from '../services/itemService';
import ItemCard from '../components/ItemCard.vue';
import { toast } from 'vue3-toastify';

export default defineComponent({
  name: 'ItemPage',
  components: { ItemCard },
  setup() {
    const items = reactive<Array<{ id: string; name: string; quantity: number }>>([]);
    const currentItem = reactive<{ id?: string; name: string; quantity: number }>({
      name: '',
      quantity: 0,
    });
    const showItemModal = ref(false);
    const isEditing = ref(false);

    const loadItems = async () => {
      const response = await fetchItems();
      if (response.success) {
        items.push(...(response.data as Array<{ id: string; name: string; quantity: number }>));
      }
    };

    const addItem = async () => {
      try {
        const response = await createItem(currentItem);
        if (response.success) {
          items.push(response.data);
          closeItemModal();
          toast.success('Item added successfully');
        } else {
          throw new Error('Failed to add item');
        }
      } catch (error) {
        toast.error(error || 'Error adding item');
      }
    };

    const updateItem = async () => {
      if (!currentItem.id) return;
      try {
        const response = await updateItemService(currentItem.id, currentItem);
        if (response.success) {
          const index = items.findIndex((item) => item.id === currentItem.id);
          if (index !== -1) {
            items[index] = response.data;
          }
          closeItemModal();
          toast.success('Item updated successfully');
        } else {
          throw new Error('Failed to update item');
        }
      } catch (error) {
        toast.error(error || 'Error updating item');
      }
    };

    const deleteItem = async (id?: string) => {
      if (!id) return;
      try {
        const response = await deleteItemService(id);
        if (response.success) {
          const index = items.findIndex((item) => item.id === id);
          if (index !== -1) {
            items.splice(index, 1);
          }
          toast.success('Item deleted successfully');
        } else {
          throw new Error('Failed to delete item');
        }
      } catch (error) {
        toast.error(error || 'Error deleting item');
      }
    };

    const openEditItemModal = (item: { id: string; name: string; quantity: number }) => {
      Object.assign(currentItem, item);
      isEditing.value = true;
      showItemModal.value = true;
    };

    const closeItemModal = () => {
      Object.assign(currentItem, { name: '', quantity: 0 });
      isEditing.value = false;
      showItemModal.value = false;
    };

    const submitItem = async () => {
      if (isEditing.value) {
        await updateItem();
      } else {
        await addItem();
      }
    };

    const route = useRoute();
    const loadItemFromRoute = () => {
      const itemId = route.params.id as string;
      if (itemId) {
        const item = items.find((i) => i.id == itemId);
        if (item) {
          openEditItemModal(item);
        }
      }
    };

    onMounted(async () => {
      await loadItems();
      loadItemFromRoute();
    });

    return {
      items,
      currentItem,
      showItemModal,
      isEditing,
      addItem,
      updateItem,
      deleteItem,
      openEditItemModal,
      closeItemModal,
      submitItem,
    };
  },
});
</script>
