<template>
  <div class="order-page">
    <h1>Orders</h1>
    <center><button @click="showCreateOrderModal">Add New Order</button></center>

    <div class="order-grid">
      <div class="column" v-for="order in groupedOrders" :key="order.customerName">
        <OrderItem v-for="item in order.items" :key="item.id" :order="item" :onDragStart="onDragStart" :onDrop="onDrop"
          :removeItem="removeItemFromOrder" :editOrder="editOrder" :deleteOrder="deleteOrder"
          @navigateToItem="navigateToItem" />
      </div>
    </div>

    <div class="modal-overlay" @click.self="closeModal" v-if="showModal">
      <div class="modal">
        <h2>{{ isEdit ? 'Edit Order' : 'Create Order' }}</h2>
        <form @submit.prevent="submitOrder">
          <label>
            Customer Name:
            <input v-model="orderForm.customerName" type="text" required />
          </label>
          <label>
            Order Date:
            <input v-model="orderForm.orderDate" type="date" required />
          </label>
          <button type="submit">{{ isEdit ? 'Update' : 'Create' }}</button>
          <button type="button" @click="closeModal">Cancel</button>
        </form>
        <label v-if="isEdit">
          Add Items:
          <select v-model="selectedItem">
            <option v-for="item in availableItems" :value="item.id" :key="item.id">
              {{ item.name }} (Available: {{ item.quantity }})
            </option>
          </select>
          <input type="number" v-model.number="itemQuantity" min="1" placeholder="Quantity" />
          <button type="button" class="add-item-button" @click="addItemToOrder">Add Item</button>
        </label>
      </div>
    </div>

  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref, computed } from 'vue';
import { useOrderStore } from '../store/orders';
import { fetchItems } from '../services/itemService';
import { useRouter } from 'vue-router';
import OrderItem from '../components/OrderItem.vue';
import { toast } from 'vue3-toastify';

export default defineComponent({
  name: 'OrderPage',
  components: { OrderItem },
  setup() {
    const orderStore = useOrderStore();
    const router = useRouter();
    const items = ref<{ id: string; name: string; quantity: number }[]>([]);

    const orderForm = reactive({ customerName: '', orderDate: '' });
    const showModal = ref(false);
    const isEdit = ref(false);
    const currentOrderId = ref<string | null>(null);

    const selectedItem = ref<string>('');
    const itemQuantity = ref<number>(1);

    const availableItems = computed(() => {
      return items.value.filter((item) => item.quantity > 0);
    });

    const groupedOrders = computed(() =>
      orderStore.orders.reduce((columns: { customerName: string; items: any[] }[], order) => {
        const column = columns.find((col) => col.customerName === order.customerName);
        if (!column) {
          columns.push({ customerName: order.customerName, items: [{ ...order }] });
        } else {
          column.items.push({ ...order });
        }
        return columns;
      }, [])
    );

    const navigateToItem = (itemId: string) => {
      router.push(`/items/${itemId}`);
    };

    const draggedItem = ref<{ itemId: string; fromOrderId: string } | null>(null);

    const showCreateOrderModal = () => {
      isEdit.value = false;
      orderForm.customerName = '';
      orderForm.orderDate = '';
      showModal.value = true;
    };

    const editOrder = (order: { id: string; customerName: string; orderDate: string }) => {
      isEdit.value = true;
      currentOrderId.value = order.id;
      orderForm.customerName = order.customerName;
      orderForm.orderDate = order.orderDate;
      showModal.value = true;
    };

    const submitOrder = async () => {
      try {
        if (isEdit.value && currentOrderId.value) {
          await orderStore.updateOrder(currentOrderId.value, orderForm);
          toast.success('Order updated successfully');
        } else {
          await orderStore.addOrder(orderForm);
          toast.success('Order created successfully');
        }
      } catch {
        toast.error('Failed to save order');
      }
    };

    const deleteOrder = async (id: string) => {
      try {
        await orderStore.removeOrder(id);
        toast.success('Order deleted successfully');
      } catch {
        toast.error('Failed to delete order');
      }
    };

    const addItemToOrder = async () => {
      if (!currentOrderId.value) return;
      try {
        await orderStore.addItemToOrder(currentOrderId.value, selectedItem.value, itemQuantity.value);
        toast.success('Item added successfully');
      } catch (error) {
        toast.error(error);
      }
    };

    const removeItemFromOrder = async (orderId: string, itemId: string) => {
      try {
        await orderStore.removeItemFromOrder(orderId, itemId);
        toast.success('Item removed successfully');
      } catch {
        toast.error('Failed to remove item');
      }
    };

    const onDragStart = (item: { id: string }, fromOrderId: string) => {
      draggedItem.value = { itemId: item.id, fromOrderId };
    };

    const onDrop = async (toOrderId: string) => {
      if (!draggedItem.value) return;

      const { itemId, fromOrderId } = draggedItem.value;

      try {
        const success = await orderStore.moveItemBetweenOrders(fromOrderId, toOrderId, itemId, itemQuantity.value);

        if (success) {
          toast.success('Item moved successfully');
        } else {
          toast.error('Failed to move item');
        }
      } catch (error) {
        console.error('Error moving item:', error);
        toast.error('An error occurred while moving the item');
      } finally {
        draggedItem.value = null;
      }
    };

    const closeModal = () => {
      showModal.value = false;
      isEdit.value = false;
      currentOrderId.value = null;
    };

    orderStore.loadOrders();
    fetchItems().then((res) => {
      if (res.success) items.value = res.data;
    });

    return {
      orderStore,
      orderForm,
      items,
      groupedOrders,
      showModal,
      isEdit,
      currentOrderId,
      availableItems,
      selectedItem,
      itemQuantity,
      showCreateOrderModal,
      editOrder,
      submitOrder,
      deleteOrder,
      addItemToOrder,
      removeItemFromOrder,
      closeModal,
      onDragStart,
      onDrop,
      navigateToItem,
    };
  },
});
</script>
