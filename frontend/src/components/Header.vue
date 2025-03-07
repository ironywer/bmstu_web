<template>
  <header class="app-header">
    <nav>
      <ul>
        <li><a href="/">Home</a></li>
        <li><a href="/orders">Orders</a></li>
        <li><a href="/items">Items</a></li>
      </ul>
    </nav>
  </header>
</template>

<script lang="ts">
export default {
  name: "Header",
};
</script>

<style scoped>
.app-header {
  background-color: #333;
  color: white;
  padding: 10px 20px;
}

.app-header ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  gap: 20px;
}

.app-header a {
  color: white;
  text-decoration: none;
}

.app-header a:hover {
  text-decoration: underline;
}
</style>
