import { createRouter, createWebHistory } from 'vue-router';
import HomePage from '../pages/HomePage.vue';
import OrderPage from '../pages/OrderPage.vue';
import ItemPage from '../pages/ItemPage.vue';

const routes = [
  { path: '/', name: 'Home', component: HomePage },
  { path: '/orders', name: 'Orders', component: OrderPage },
  { path: '/items', name: 'Items', component: ItemPage },
  { path: '/items/:id', name: 'ItemEdit', component: ItemPage },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
