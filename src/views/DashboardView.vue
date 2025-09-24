<template>
    <div class="container mt-4">
        <h1 class="mb-4">Dashboard</h1>
        <div class="row">
            <div class="col-md-3 mb-3" v-for="card in cards" :key="card.title">
                <div class="card text-white" :class="card.bgClass">
                    <div class="card-body">
                        <h5 class="card-title">{{ card.title }}</h5>
                        <p class="card-text display-6">{{ card.value }}</p>
                    </div>
                </div>
            </div>
        </div>
        <div class="mt-4">
            <h4>Accesos rápidos</h4>
            <div class="btn-group" role="group">
                <button class="btn btn-primary" @click="goTo('productos')">Productos</button>
                <button class="btn btn-secondary" @click="goTo('ventas')">Ventas</button>
                <button class="btn btn-success" @click="goTo('clientes')">Clientes</button>
                <button class="btn btn-warning" @click="goTo('caja')">Caja</button>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
    import { defineComponent } from "vue";
    import { useRouter } from "vue-router";

    export default defineComponent({
        name: "DashboardView",
        data() {
            return {
                cards: [
                    { title: "Productos en Stock", value: 120, bgClass: "bg-primary" },
                    { title: "Ventas Hoy", value: 15, bgClass: "bg-success" },
                    { title: "Caja", value: "$8500", bgClass: "bg-warning" },
                    { title: "Clientes", value: 50, bgClass: "bg-info" }
                ]
            };
        },
        setup() {
            const router = useRouter();
            const goTo = (ruta: string) => router.push({ path: `/${ruta}` });
            return { goTo };
        }
    });
</script>
