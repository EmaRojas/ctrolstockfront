<template>
  <div class="container mt-4">

    <!-- Header + Botón Agregar -->
    <div class="d-flex justify-content-between align-items-center flex-wrap mb-3">
      <h2 class="h4 mb-2 mb-md-0">Productos</h2>
      <button class="btn btn-primary d-flex align-items-center" @click="toggleForm">
        <i class="bi" :class="showForm ? 'bi-x-lg' : 'bi-plus-lg'"></i>
        <span class="ms-2 d-none d-md-inline">{{ showForm ? 'Cancelar' : 'Agregar' }}</span>
      </button>
    </div>

    <!-- Formulario ABM -->
    <div v-if="showForm" class="card p-3 mb-3 shadow-sm">
      <form @submit.prevent="saveProduct" class="row g-2">
        <div class="col-12 col-md-6">
          <label class="form-label small">Código de Barra</label>
          <input ref="barcodeInput" v-model="form.barcode" type="text" class="form-control form-control-sm"
            placeholder="Ej: 123456789012" :readonly="isMobile()" @focus.prevent="onBarcodeFocus" />
        </div>
        <div class="col-12 col-md-6">
          <label class="form-label small">Nombre</label>
          <input v-model="form.name" type="text" class="form-control form-control-sm" placeholder="Ej: Lápiz" />
        </div>
        <div class="col-6 col-md-3">
          <label class="form-label small">Precio</label>
          <input v-model.number="form.price" type="number" class="form-control form-control-sm" />
        </div>
        <div class="col-6 col-md-3">
          <label class="form-label small">Stock</label>
          <input v-model.number="form.stock" type="number" class="form-control form-control-sm" />
        </div>
        <div class="col-6 col-md-3">
          <label class="form-label small">Costo</label>
          <input v-model.number="form.cost" type="number" class="form-control form-control-sm" />
        </div>
        <div class="col-6 col-md-3 d-grid">
          <button type="submit" class="btn btn-success btn-sm mt-4">
            <i class="bi bi-check2-circle"></i> Guardar
          </button>
        </div>
      </form>
    </div>

    <!-- Escáner de código de barra móvil -->
    <div v-if="scannerVisible" class="scanner-modal">
      <video ref="videoPreview" autoplay muted playsinline></video>

      <!-- Recuadro animado -->
      <div class="scanner-overlay">
        <div class="scan-line"></div>
      </div>

      <button class="btn btn-danger mt-2" @click="stopScanner">
        <i class="bi bi-x-circle"></i> Cancelar
      </button>
    </div>

    <!-- Tabla de productos -->
    <table class="table table-hover align-middle small">
      <thead class="table-light">
        <tr>
          <th>Código</th>
          <th>Nombre</th>
          <th>Precio</th>
          <th>Stock</th>
          <th>Costo</th>
          <th class="text-center">Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="p in products" :key="p._id">
          <td>{{ p.barcode }}</td>
          <td>{{ p.name }}</td>
          <td>{{ formatCurrency(p.price) }}</td>
          <td>{{ p.stock }}</td>
          <td>{{ formatCurrency(p.cost) }}</td>
          <td class="text-center">
            <button class="btn btn-link p-1 text-warning" @click="editProduct(p)">
              <i class="bi bi-pencil-fill"></i>
            </button>
            <button class="btn btn-link p-1 text-danger" @click="removeProduct(p._id)">
              <i class="bi bi-trash-fill"></i>
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Botón flotante en móviles -->
    <button v-if="!showForm && isMobile()"
      class="btn btn-primary btn-float d-flex align-items-center justify-content-center" @click="toggleForm">
      <i class="bi bi-plus-lg"></i>
    </button>
  </div>
</template>

<script lang="ts">
import { defineComponent, nextTick } from "vue";
import { BrowserBarcodeReader } from "@zxing/library";
import { getProducts, createProduct, updateProduct, deleteProduct } from "../services/productService";
import { useLoaderStore } from '../stores/loaderStore.js';

export default defineComponent({
  name: "ProductosView",
  data() {
    return {
      products: [] as any[],
      showForm: false,
      scannerVisible: false,
      scanner: null as any,
      form: { barcode: "", name: "", price: 0, stock: 0, cost: 0, _id: null } as any,
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
            (this.$refs.barcodeInput as HTMLInputElement).focus();
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
    async removeProduct(id: string) {
      if (confirm("¿Seguro que quieres eliminar este producto?")) {
        await deleteProduct(id);
        await this.loadProducts();
      }
    },

    // ----------------- SCANNER -----------------
    isMobile() {
      return /Mobi|Android/i.test(navigator.userAgent);
    },
    onBarcodeFocus() {
      if (this.isMobile()) {
        this.startScanner();
      }
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
  0% {
    top: 0;
  }

  100% {
    top: 100%;
  }
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
