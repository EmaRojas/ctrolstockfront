import { createRouter, createWebHistory } from "vue-router";
import Dashboard from "./views/DashboardView.vue";
import ProductosView from "./views/ProductosView.vue";
//import ClientesView from "./views/ClientesView.vue";
//import VentasView from "./views/VentasView.vue";
//import CajaView from "./views/CajaView.vue";

const routes = [
    { path: "/", component: Dashboard },
    { path: "/productos", component: ProductosView },
    //{ path: "/clientes", component: ClientesView },
    //{ path: "/ventas", component: VentasView },
    //{ path: "/caja", component: CajaView },
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

export default router;
