<template>
  <div class="base-table-wrapper">
    <table class="base-table">
      <thead>
        <tr>
          <th v-for="(col, index) in columns" :key="index">{{ col.label }}</th>
          <th v-if="hasActions" class="text-center">Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, rIndex) in rows" :key="rIndex">
          <td v-for="(col, cIndex) in columns" :key="cIndex">
            {{ row[col.field] }}
          </td>
          <td v-if="hasActions" class="text-center">
            <BaseButton
              v-if="onEdit"
              size="sm"
              variant="link"
              icon="edit"
              @click="$emit('edit', row)"
            />
            <BaseButton
              v-if="onDelete"
              size="sm"
              variant="link"
              icon="delete"
              @click="$emit('delete', row)"
            />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { computed } from 'vue' 
import BaseButton from './BaseButton.vue'

const props = defineProps({
  columns: { type: Array, required: true }, // [{label:'Nombre', field:'name'}, ...]
  rows: { type: Array, required: true },
  onEdit: { type: Boolean, default: true },
  onDelete: { type: Boolean, default: true },
})

const hasActions = computed(() => props.onEdit || props.onDelete)
</script>

<style scoped>
.base-table-wrapper {
  overflow-x: auto;
  border-radius: 6px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.05);
}

.base-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  min-width: 600px;
}

.base-table thead {
  background: #fff;
}

.base-table th,
.base-table td {
  padding: 10px 12px;
  text-align: left;
  border-bottom: 1px solid #e6e6e6;
  font-size: 0.9rem;
}

.base-table tr:hover {
  background: #f9f9f9;
  box-shadow: inset 0 0 4px rgba(0,0,0,0.03);
}

.text-center {
  text-align: center;
}
</style>
