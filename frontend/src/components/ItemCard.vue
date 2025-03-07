<template>
  <div class="item-card card" @mouseover="hover = true" @mouseleave="hover = false">
    <button class="remove-btn" @click.stop="deleteItem">×</button>
    <h4>{{ item.name }}</h4>
    <p>Quantity: {{ item.quantity }}</p>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import type { PropType } from 'vue';

export default defineComponent({
  name: 'ItemCard',
  props: {
    item: {
      type: Object as PropType<{
        id: string;
        name: string;
        quantity: number;
      }>,
      required: true,
    },
  },
  emits: ['delete-item'],
  setup(props, { emit }) {
    const hover = ref(false);

    const deleteItem = () => {
      emit('delete-item', props.item.id);
    };

    return { hover, deleteItem };
  },
});
</script>

<style scoped>
.item-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  position: relative;
  padding: 15px;
  transition: box-shadow 0.3s, transform 0.3s;
}

.item-card:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  transform: translateY(-3px);
}

.item-card h4 {
  margin-bottom: 8px;
  font-size: 18px;
  color: #333;
}

.item-card p {
  margin: 0;
  color: #555;
  font-size: 14px;
}
</style
