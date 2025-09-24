<template>
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
        <div class="container-fluid">
            <a class="navbar-brand" href="#">Control Stock</a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav">
                    <li class="nav-item"><router-link class="nav-link" to="/">Dashboard</router-link></li>
                    <li class="nav-item"><router-link class="nav-link" to="/productos">Productos</router-link></li>
                    <li class="nav-item"><router-link class="nav-link" to="/ventas">Ventas</router-link></li>
                    <li class="nav-item"><router-link class="nav-link" to="/clientes">Clientes</router-link></li>
                    <li class="nav-item"><router-link class="nav-link" to="/caja">Caja</router-link></li>
                </ul>
            </div>
        </div>
    </nav>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "Navbar"
});
</script>
