<template>
  <button :class="['btn', variantClass]">
    <span v-if="icon" class="material-symbols-rounded">{{ icon }}</span>
    <slot></slot>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue' 

const props = defineProps({
  variant: { type: String, default: 'primary' },
  icon: { type: String, default: null }
})

const variantClass = computed(() => {
  return props.variant === 'outline' ? 'btn-outline-primary' : 'btn-primary'
})
</script>
