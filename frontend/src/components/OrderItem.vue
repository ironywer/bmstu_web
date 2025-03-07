<template>
  <div class="order-item" :class="{ 'highlighted': isHighlighted }">
    <h3>{{ order.customerName }} - {{ order.orderDate }}</h3>
    <ul class="item-list" @dragover.prevent="onDragOver" @dragleave="onDragLeave" @drop="onDrop(order.id)">
      <li
        v-for="orderItem in order.items"
        :key="orderItem.item.id"
        draggable="true"
        @dragstart="onDragStart(orderItem, order.id)"
        @click="navigateToItem(orderItem.item.id)"
        class="clickable-item"
      >
        {{ orderItem.item.name }} (x{{ orderItem.quantity }})
        <button class="remove-btn" @click.stop="removeItem(order.id, orderItem.item.id)">×</button>
      </li>
      <li v-if="order.items.length === 0" class="empty">
        Drop items here
      </li>
    </ul>
    <button @click="editOrder(order)">Edit</button>
    <button @click="deleteOrder(order.id)">Delete</button>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useRouter } from 'vue-router';

export default defineComponent({
  name: 'OrderItem',
  props: {
    order: {
      type: Object,
      required: true,
    },
    onDragStart: {
      type: Function,
      required: true,
    },
    onDrop: {
      type: Function,
      required: true,
    },
    removeItem: {
      type: Function,
      required: true,
    },
    editOrder: {
      type: Function,
      required: true,
    },
    deleteOrder: {
      type: Function,
      required: true,
    },
  },
  setup(props) {
    const router = useRouter();
    const isHighlighted = ref(false);

    const onDragOver = () => {
      isHighlighted.value = true;
    };

    const onDragLeave = () => {
      isHighlighted.value = false;
    };

    const onDrop = (orderId: string) => {
      isHighlighted.value = false;
      props.onDrop(orderId);
    };

    const navigateToItem = (itemId: string) => {
      router.push(`/items/${itemId}`);
    };

    return {
      isHighlighted,
      onDragOver,
      onDragLeave,
      onDrop,
      navigateToItem,
    };
  },
});
</script>

<style scoped>
.order-item {
  border: 1px solid #ccc;
  box-sizing: border-box;
  padding: 10px;
  margin-bottom: 10px;
  border-radius: 4px;
  width: 100%;
  transition: background-color 0.3s, border-color 0.3s;
}

.order-item.highlighted {
  background-color: #f0f9f0;
  border-color: #4caf50;
}

.item-list {
  min-height: 50px;
  padding: 10px;
  border: 1px dashed #ccc;
  transition: border-color 0.3s;
}

.item-list .empty {
  color: gray;
  text-align: center;
  font-style: italic;
}

.remove-btn {
  background: transparent;
  border: none;
  color: red;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  margin-left: 10px;
  padding: 0;
}

.remove-btn:hover {
  color: darkred;
}

.clickable-item {
  cursor: pointer;
  transition: background-color 0.2s;
}

.clickable-item:hover {
  background-color: #f9f9f9;
}
</style>
