<template>
  <div class="mb-3">
    <!-- Label -->
    <label v-if="label" class="form-label">
      <span v-if="icon" class="material-symbols-rounded" style="font-size: 18px; margin-right: 4px;">
        {{ icon }}
      </span>
      {{ label }}
    </label>

    <!-- Input -->
    <input
      :type="type"
      class="form-control"
      :placeholder="placeholder"
      v-model="modelValueLocal"
      @input="emitUpdate"
    />
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  modelValue: { type: [String, Number], default: '' },
  label: { type: String, default: null },
  placeholder: { type: String, default: '' },
  type: { type: String, default: 'text' },
  icon: { type: String, default: null } // Ej: "search", "email", etc.
})

const emit = defineEmits(['update:modelValue'])
const modelValueLocal = ref(props.modelValue)

watch(() => props.modelValue, (newVal) => {
  modelValueLocal.value = newVal;
})

const emitUpdate = () => {
  emit('update:modelValue', modelValueLocal.value)
}
</script>
