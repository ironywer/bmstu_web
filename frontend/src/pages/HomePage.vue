<template>
  <div class="home-page">
    <h1>Welcome to Warehouse Dashboard</h1>
    <p>
      <router-link to="/orders">Go to Orders</router-link>
    </p>
    <p>
      <router-link to="/items">Go to Items</router-link>
    </p>
  </div>
</template>

<script lang="ts">
export default {
  name: 'HomePage',
};
</script>

<style scoped>
.home-page {
  text-align: center;
  margin-top: 50px;
}
</style>
