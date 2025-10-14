<template>
  <div class="container mt-4">
    <!-- Header + Botón Agregar -->
    <div class="d-flex justify-content-between align-items-center flex-wrap mb-3">
      <h2 class="h4 mb-2 mb-md-0">Productos</h2>

      <BaseButton
        variant="primary"
        icon="add"
        @click="toggleForm"
      >
        {{ showForm ? 'Cancelar' : 'Agregar' }}
      </BaseButton>
    </div>

    <!-- Formulario ABM -->
    <BaseCard v-if="showForm" class="p-3 mb-3">
      <form @submit.prevent="saveProduct" class="row g-2">
        <div class="col-12 col-md-3">
          <BaseInput
            v-model="form.barcode"
            label="Código de Barra"
            placeholder="Ej: 123456789012"
            icon="qr_code_scanner"
            type="text"
            :readonly="isMobile()"
            @focus.prevent="onBarcodeFocus"
          />
        </div>

        <div class="col-12 col-md-3">
          <BaseInput
            v-model="form.name"
            label="Nombre"
            placeholder="Ej: Lápiz"
            icon="edit"
          />
        </div>

        <div class="col-6 col-md-2">
          <BaseInput
            v-model.number="form.price"
            label="Precio"
            type="number"
            icon="attach_money"
          />
        </div>

        <div class="col-6 col-md-1">
          <BaseInput
            v-model.number="form.stock"
            label="Stock"
            type="number"
            icon="inventory_2"
          />
        </div>

        <div class="col-6 col-md-1">
          <BaseInput
            v-model.number="form.cost"
            label="Costo"
            type="number"
            icon="payments"
          />
        </div>

        <div class="col-6 col-md-2 d-grid">
          <BaseButton variant="primary" icon="check_circle" type="submit" class="mt-4 mb-3">
            Guardar
          </BaseButton>
        </div>
      </form>
    </BaseCard>

    <!-- Escáner de código de barra móvil -->
    <div v-if="scannerVisible" class="scanner-modal">
      <video ref="videoPreview" autoplay muted playsinline></video>

      <div class="scanner-overlay">
        <div class="scan-line"></div>
      </div>

      <BaseButton variant="outline" icon="cancel" class="mt-3" @click="stopScanner">
        Cancelar
      </BaseButton>
    </div>

    <!-- Tabla de productos -->
    <BaseTable
      :columns="tableColumns"
      :rows="products"
      @edit="editProduct"
      @delete="removeProduct"
    />

    <!-- Botón flotante en móviles -->
    <BaseButton
      v-if="!showForm && isMobile()"
      variant="primary"
      icon="add"
      class="btn-float"
      @click="toggleForm"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, nextTick } from "vue";
import { BrowserBarcodeReader } from "@zxing/library";
import { getProducts, createProduct, updateProduct, deleteProduct } from "../services/productService";
import { useLoaderStore } from '../stores/loaderStore.js';

// Componentes base
import BaseInput from "../components/BaseInput.vue";
import BaseButton from "../components/BaseButton.vue";
import BaseCard from "../components/BaseCard.vue";
import BaseTable from "../components/BaseTable.vue";

export default defineComponent({
  name: "ProductosView",
  components: { BaseInput, BaseButton, BaseCard, BaseTable },
  data() {
    return {
      products: [] as any[],
      showForm: false,
      scannerVisible: false,
      scanner: null as any,
      form: { barcode: "", name: "", price: 0, stock: 0, cost: 0, _id: null } as any,
      tableColumns: [
        { label: "Código", field: "barcode" },
        { label: "Nombre", field: "name" },
        { label: "Precio", field: "price" },
        { label: "Stock", field: "stock" },
        { label: "Costo", field: "cost" }
      ]
    };
  },
  async mounted() {
    const loader = useLoaderStore();
    loader.show();
    await this.loadProducts();
    loader.hide();
  },
  methods: {
    async loadProducts() {
      this.products = await getProducts();
    },
    toggleForm() {
      this.showForm = !this.showForm;
      if (this.showForm) {
        nextTick(() => {
          if (!this.isMobile()) {
            const input = document.querySelector("input[placeholder='Ej: 123456789012']") as HTMLInputElement;
            input?.focus();
          }
        });
      } else {
        this.resetForm();
      }
    },
    resetForm() {
      this.form = { barcode: "", name: "", price: 0, stock: 0, cost: 0, _id: null };
    },
    editProduct(product: any) {
      this.showForm = true;
      this.form = { ...product };
    },
    async saveProduct() {
      if (this.form._id) {
        await updateProduct(this.form._id, this.form);
      } else {
        await createProduct(this.form);
      }
      await this.loadProducts();
      this.toggleForm();
    },
    async removeProduct(product: any) {
      if (confirm("¿Seguro que quieres eliminar este producto?")) {
        await deleteProduct(product._id);
        await this.loadProducts();
      }
    },
    // ----------------- SCANNER -----------------
    isMobile() {
      return /Mobi|Android/i.test(navigator.userAgent);
    },
    onBarcodeFocus() {
      if (this.isMobile()) this.startScanner();
    },
    async startScanner() {
      this.scannerVisible = true;
      await nextTick();
      const codeReader = new BrowserBarcodeReader();
      this.scanner = codeReader;
      codeReader
        .decodeOnceFromVideoDevice(undefined, this.$refs.videoPreview as HTMLVideoElement)
        .then(result => {
          this.form.barcode = result.getText();
          this.stopScanner();
        })
        .catch(err => console.error("Error al escanear:", err));
    },
    stopScanner() {
      if (this.scanner) {
        this.scanner.reset();
        this.scanner = null;
      }
      this.scannerVisible = false;
    },
    // ----------------- UTILIDADES -----------------
    formatCurrency(value: number) {
      return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(value);
    },
  },
});
</script>

<style scoped>
/* Modal Escáner */
.scanner-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.scanner-modal video {
  width: 90%;
  max-width: 400px;
  border-radius: 8px;
  border: 2px solid #fff;
}

/* Recuadro animado */
.scanner-overlay {
  position: absolute;
  width: 90%;
  max-width: 400px;
  height: 150px;
  border: 2px solid #00ff00;
  border-radius: 8px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  box-sizing: border-box;
}

.scan-line {
  position: absolute;
  width: 100%;
  height: 2px;
  background: #00ff00;
  animation: scanAnim 2s linear infinite;
  top: 0;
}

@keyframes scanAnim {
  0% { top: 0; }
  100% { top: 100%; }
}

/* Botón flotante móvil */
.btn-float {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 999;
  border-radius: 50%;
  width: 56px;
  height: 56px;
  padding: 0;
  font-size: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
