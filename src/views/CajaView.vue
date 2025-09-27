<template>
  <div class="container mt-4">

    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center flex-wrap mb-3">
      <h2 class="h4 mb-2 mb-md-0">Caja</h2>
    </div>

    <!-- Multiselect Producto -->
    <div class="mb-3">
      <label class="form-label small">Producto</label>
      <Multiselect
        v-model="selectedProduct"
        :options="productosOptions"
        placeholder="Seleccione producto o escanee"
        label="name"
        track-by="barcode"
        @click.native="onBarcodeClick"
        :searchable="true"
        :close-on-select="true"
      />
    </div>

    <!-- Cantidad -->
    <div class="mb-3">
      <label class="form-label small">Cantidad</label>
      <input type="number" v-model.number="cantidad" class="form-control form-control-sm" />
    </div>

    <!-- Botón Agregar -->
    <div class="mb-3 d-grid">
      <button class="btn btn-success" @click="agregarProducto">
        <i class="bi bi-plus-circle"></i> Agregar al carrito
      </button>
    </div>

    <!-- Lista de productos agregados -->
    <table class="table table-hover align-middle small" v-if="carrito.length">
      <thead class="table-light">
        <tr>
          <th>Producto</th>
          <th>Código</th>
          <th>Cantidad</th>
          <th class="text-center">Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, index) in carrito" :key="index">
          <td>{{ item.name }}</td>
          <td>{{ item.barcode }}</td>
          <td>{{ item.cantidad }}</td>
          <td class="text-center">
            <button class="btn btn-link p-1 text-danger" @click="removeItem(index)">
              <i class="bi bi-trash-fill"></i>
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- ----------------- SCANNER ----------------- -->
    <div v-if="scannerVisible" class="scanner-modal">
      <video ref="videoPreview" autoplay muted playsinline></video>

      <div class="scanner-overlay">
        <div class="scan-line"></div>
      </div>

      <button class="btn btn-danger mt-2" @click="stopScanner">
        <i class="bi bi-x-circle"></i> Cancelar
      </button>
    </div>

  </div>
</template>

<script lang="ts">
import { defineComponent, nextTick } from "vue";
import { BrowserBarcodeReader } from "@zxing/library";
import Multiselect from "vue-multiselect";
import { getProducts } from "../services/productService"; // tu servicio existente

export default defineComponent({
  name: "CajaView",
  components: { Multiselect },
  data() {
    return {
      productosOptions: [] as any[],
      selectedProduct: null as any,
      cantidad: 1,
      carrito: [] as any[],
      scannerVisible: false,
      scanner: null as any,
    };
  },
  mounted() {
    this.loadProductos();
  },
  methods: {
    async loadProductos() {
      this.productosOptions = await getProducts();
    },

    isMobile() {
      return /Mobi|Android/i.test(navigator.userAgent);
    },

    onBarcodeClick() {
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
          // Buscar producto por código de barras
          const producto = this.productosOptions.find(p => p.barcode === result.getText());
          if (producto) {
            this.selectedProduct = producto;
          } else {
            // Si no existe, crear temporal
            this.selectedProduct = { name: "Desconocido", barcode: result.getText() };
          }
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

    agregarProducto() {
      if (!this.selectedProduct) return;
      this.carrito.push({ ...this.selectedProduct, cantidad: this.cantidad });
      this.selectedProduct = null;
      this.cantidad = 1;
    },

    removeItem(index: number) {
      this.carrito.splice(index, 1);
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
  background: rgba(0,0,0,0.85);
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
</style>
