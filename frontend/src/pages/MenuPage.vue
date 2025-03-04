<template>
  <div class="menu-page">
    <h1>Menus</h1>
    <center><button @click="showCreateMenuModal">Add New Menu</button></center>

    <div class="menu-grid">
      <div class="column" v-for="menu in groupedMenus" :key="menu.day">
        <MenuItem v-for="item in menu.items" :key="item.id" :menu="item" :onDragStart="onDragStart" :onDrop="onDrop"
          :removeDish="removeDishFromMenu" :editMenu="editMenu" :deleteMenu="deleteMenu"
          @navigateToDish="navigateToDish" />


      </div>
    </div>

    <div class="modal-overlay" @click.self="closeModal" v-if="showModal">
      <div class="modal">
        <h2>{{ isEdit ? 'Edit Menu' : 'Create Menu' }}</h2>
        <form @submit.prevent="submitMenu">
          <label>
            Day:
            <input v-model="menuForm.day" type="text" required />
          </label>
          <label>
            Variant:
            <input v-model="menuForm.variant" type="text" required />
          </label>
          <button type="submit">{{ isEdit ? 'Update' : 'Create' }}</button>
          <button type="button" @click="closeModal">Cancel</button>
        </form>
        <label v-if="isEdit">
          Add Dishes:
          <select v-model="selectedDish">
            <option v-for="dish in availableDishes" :value="dish.id" :key="dish.id">
              {{ dish.name }}
            </option>
          </select>
          <button type="button" class="add-dish-button" @click="addDishToMenu">Add Item</button>
        </label>
      </div>
    </div>

  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref, computed } from 'vue';
import { useMenuStore } from '../store/menus';
import { fetchDishes } from '../services/dishService';
import { useRouter } from 'vue-router';
import MenuItem from '../components/MenuItem.vue';
import { toast } from 'vue3-toastify';

export default defineComponent({
  name: 'MenuPage',
  components: { MenuItem },
  setup() {
    const menuStore = useMenuStore();
    const router = useRouter();
    const dishes = ref<{ id: string; name: string; type: string }[]>([]);

    const menuForm = reactive({ day: '', variant: '' });
    const showModal = ref(false);
    const isEdit = ref(false);
    const currentMenuId = ref<string | null>(null);

    const selectedDish = ref<string>('');
    const availableDishes = computed(() => {
      if (!currentMenuId.value) return dishes.value;
      const currentMenu = menuStore.menus.find((menu) => menu.id === currentMenuId.value);
      return dishes.value.filter((dish) => !currentMenu?.dishes.some((d) => d.id === dish.id));
    });

    const DishTypeOrder = ['salad', 'starter', 'main course', 'drink', 'dessert'];

    const getDishTypeOrderIndex = (type: string): number => {
      const index = DishTypeOrder.indexOf(type);
      return index !== -1 ? index : DishTypeOrder.length;
    };

    const groupedMenus = computed(() =>
      menuStore.menus.reduce((columns: { day: string; items: any[] }[], menu) => {
        if (!menu.day) return columns;

        const sortedDishes = [...menu.dishes].sort(
          (a, b) => getDishTypeOrderIndex(a.type) - getDishTypeOrderIndex(b.type)
        );

        const column = columns.find((col) => col.day === menu.day);
        if (!column) {
          columns.push({ day: menu.day, items: [{ ...menu, dishes: sortedDishes }] });
        } else {
          column.items.push({ ...menu, dishes: sortedDishes });
        }
        return columns;
      }, [])
    );

    const updateDishOrder = (menuId: string) => {
      const menu = menuStore.menus.find((m) => m.id === menuId);
      if (menu) {
        menu.dishes.sort((a, b) => getDishTypeOrderIndex(a.type) - getDishTypeOrderIndex(b.type));
      }
    };

    const navigateToDish = (dishId: string) => {
      router.push(`/dishes/${dishId}`);
    };


    const draggedDish = ref<{ dishId: string; fromMenuId: string } | null>(null);

    const showCreateMenuModal = () => {
      isEdit.value = false;
      menuForm.day = '';
      menuForm.variant = '';
      showModal.value = true;
    };

    const editMenu = (menu: { id: string; day: string; variant: string }) => {
      isEdit.value = true;
      currentMenuId.value = menu.id;
      menuForm.day = menu.day;
      menuForm.variant = menu.variant;
      showModal.value = true;
    };

    const submitMenu = async () => {
      try {
        if (isEdit.value && currentMenuId.value) {
          await menuStore.updateMenu(currentMenuId.value, menuForm);
          toast.success('Menu updated successfully');
        } else {
          await menuStore.addMenu(menuForm);
          toast.success('Menu created successfully');
        }
      } catch {
        toast.error('Failed to save menu');
      }
    };

    const deleteMenu = async (id: string) => {
      try {
        await menuStore.removeMenu(id);
        toast.success('Menu deleted successfully');
      } catch {
        toast.error('Failed to delete menu');
      }
    };

    const addDishToMenu = async () => {
      if (!currentMenuId.value) return;
      try {
        await menuStore.addDishToMenu(currentMenuId.value, selectedDish.value);
        updateDishOrder(currentMenuId.value);
        toast.success('Item added successfully');
      } catch (error) {
        toast.error(error);
      }
    };

    const removeDishFromMenu = async (menuId: string, dishId: string) => {
      try {
        await menuStore.removeDishFromMenu(menuId, dishId);
        toast.success('Item removed successfully');
      } catch {
        toast.error('Failed to remove dish');
      }
    };

    const onDragStart = (dish: { id: string }, fromMenuId: string) => {
      draggedDish.value = { dishId: dish.id, fromMenuId };
    };

    const onDrop = async (toMenuId: string) => {
      if (!draggedDish.value) return;

      const { dishId, fromMenuId } = draggedDish.value;

      try {
        const success = await menuStore.moveDish(fromMenuId, toMenuId, dishId);

        if (success) {
          toast.success('Item moved successfully');
        } else {
          toast.error('Failed to move dish');
        }
      } catch (error) {
        console.error('Error moving dish:', error);
        toast.error('An error occurred while moving the dish');
      } finally {
        draggedDish.value = null;
      }
    };

    const closeModal = () => {
      showModal.value = false;
      isEdit.value = false;
      currentMenuId.value = null;
    };

    menuStore.loadMenus();
    fetchDishes().then((res) => {
      if (res.success) dishes.value = res.data;
    });

    return {
      menuStore,
      menuForm,
      dishes,
      groupedMenus,
      showModal,
      isEdit,
      currentMenuId,
      availableDishes,
      selectedDish,
      showCreateMenuModal,
      editMenu,
      submitMenu,
      deleteMenu,
      addDishToMenu,
      removeDishFromMenu,
      closeModal,
      onDragStart,
      onDrop,
      navigateToDish,
    };
  },
});
</script>