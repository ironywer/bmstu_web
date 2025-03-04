<template>
  <div class="dish-page page-container">
    <h1>Dishes</h1>
    <center><button @click="showDishModal = true">Add New Item</button></center>
    <div v-if="dishes.length" class="dish-list">
      <DishItem 
        v-for="dish in dishes" 
        :key="dish.id" 
        :dish="dish" 
        @click="openEditDishModal(dish)" 
        @delete-dish="deleteDish" 
      />
    </div>
    <p v-else>No dishes available</p>

    <!-- Add/Edit Item Modal -->
    <div v-if="showDishModal" class="modal-overlay" @click.self="closeDishModal">
      <div class="modal">
        <h2>{{ isEditing ? 'Edit Item' : 'Add Item' }}</h2>
        <form @submit.prevent="submitDish">
          <div>
            <label for="name">Name:</label>
            <input id="name" v-model="currentDish.name" type="text" required />
          </div>
          <div>
            <label for="type">Type:</label>
            <select id="type" v-model="currentDish.type" required>
              <option value="salad">salad</option>
              <option value="starter">starter</option>
              <option value="main course">main course</option>
              <option value="drink">drink</option>
              <option value="dessert">dessert</option>
            </select>
          </div>
          <div class="modal-buttons">
            <button type="submit">{{ isEditing ? 'Update' : 'Add' }}</button>
            <button type="button" @click="closeDishModal">Cancel</button>
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
  fetchDishes,
  createDish,
  updateDishService,
  deleteDishService,
} from '../services/dishService';
import DishItem from '../components/DishItem.vue';
import { toast } from 'vue3-toastify';

export default defineComponent({
  name: 'DishPage',
  components: { DishItem },
  setup() {
    const dishes = reactive<Array<{ id: string; name: string; type: string }>>([]);
    const currentDish = reactive<{ id?: string; name: string; type: string }>({
      name: '',
      type: '',
    });
    const showDishModal = ref(false);
    const isEditing = ref(false);

    const loadDishes = async () => {
      const response = await fetchDishes();
      if (response.success) {
        dishes.push(...(response.data as Array<{ id: string; name: string; type: string }>));
      }
    };

    const addDish = async () => {
      try {
        const response = await createDish(currentDish);
        if (response.success) {
          dishes.push(response.data);
          closeDishModal();
          toast.success('Item added successfully');
        } else {
          throw new Error('Failed to add dish');
        }
      } catch (error) {
        toast.error(error || 'Error adding dish');
      }
    };

    const updateDish = async () => {
      if (!currentDish.id) return;
      try {
        const response = await updateDishService(currentDish.id, currentDish);
        if (response.success) {
          const index = dishes.findIndex((dish) => dish.id === currentDish.id);
          if (index !== -1) {
            dishes[index] = response.data;
          }
          closeDishModal();
          toast.success('Item updated successfully');
        } else {
          throw new Error('Failed to update dish');
        }
      } catch (error) {
        toast.error(error || 'Error updating dish');
      }
    };

    const deleteDish = async (id?: string) => {
      if (!id) return;
      try {
        const response = await deleteDishService(id);
        if (response.success) {
          const index = dishes.findIndex((dish) => dish.id === id);
          if (index !== -1) {
            dishes.splice(index, 1);
          }
          toast.success('Item deleted successfully');
        } else {
          throw new Error('Failed to delete dish');
        }
      } catch (error) {
        toast.error(error || 'Error deleting dish');
      }
    };

    const openEditDishModal = (dish: { id: string; name: string; type: string }) => {
      Object.assign(currentDish, dish);
      isEditing.value = true;
      showDishModal.value = true;
    };

    const closeDishModal = () => {
      Object.assign(currentDish, { name: '', type: '' });
      isEditing.value = false;
      showDishModal.value = false;
    };

    const submitDish = async () => {
      if (isEditing.value) {
        await updateDish();
      } else {
        await addDish();
      }
    };

    const route = useRoute();
    const loadDishFromRoute = () => {
      const dishId = route.params.id as string;
      if (dishId) {
        const dish = dishes.find((d) => d.id == dishId);
        if (dish) {
          openEditDishModal(dish);
        }
      }
    };

    onMounted(async () => {
      await loadDishes();
      loadDishFromRoute();
    });

    return {
      dishes,
      currentDish,
      showDishModal,
      isEditing,
      addDish,
      updateDish,
      deleteDish,
      openEditDishModal,
      closeDishModal,
      submitDish,
    };
  },
});
</script>
