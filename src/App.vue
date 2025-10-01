<template>
    <div>
        <Loader :show="loader.loading" />
        <Navbar />
        <router-view />
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import Navbar from "./components/Navbar.vue";
import Loader from "./components/Loader.vue";
import { useLoaderStore } from "./stores/loaderStore.js";

export default {
    components: { Navbar, Loader },
    setup() {
        const loader = useLoaderStore();
        return { loader };
    }
};
</script>
