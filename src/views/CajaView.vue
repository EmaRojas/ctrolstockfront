<template>
    <div class="container mt-4">

        <!-- Header y botones abrir/cerrar caja -->
        <div class="d-flex justify-content-between align-items-center flex-wrap mb-3">
            <h2 class="h4 mb-2 mb-md-0">Caja</h2>
            <div>
                <button v-if="!isOpen" class="btn btn-primary me-2" @click="showOpenModal = true">
                    Abrir Caja
                </button>
                <button v-if="isOpen" class="btn btn-success" @click="showCloseModal = true">
                    Cerrar Caja
                </button>
            </div>
        </div>

        <!-- Resumen de caja -->
        <div v-if="isOpen" class="mb-3 row g-2">
            <div class="col-6 col-md-3" v-for="(card, idx) in resumenCaja" :key="idx">
                <div class="card p-2 text-center shadow-sm">
                    <small>{{ card.label }}</small>
                    <div class="fw-bold">{{ formatCurrency(card.value) }}</div>
                </div>
            </div>
        </div>

        <div v-if="isOpen" class="mb-3 d-flex gap-2 flex-wrap">
            <button class="btn btn-sm btn-primary" @click="showSaleForm = !showSaleForm">
                {{ showSaleForm ? 'Cancelar Venta' : 'Agregar Venta' }}
            </button>
            <button class="btn btn-sm btn-success" @click="showFreeSaleForm = !showFreeSaleForm">
                {{ showFreeSaleForm ? 'Cancelar Venta Libre' : 'Venta Libre' }}
            </button>
            <button class="btn btn-sm btn-warning" @click="showEgresoForm = !showEgresoForm">
                {{ showEgresoForm ? 'Cancelar Egreso' : 'Agregar Egreso' }}
            </button>
        </div>

        <div v-if="showSaleForm" class="mb-4 card p-3 shadow-sm">
            <h5>Registrar Venta por Producto</h5>
            <div class="row g-2 align-items-center">
                <div class="col-6 col-md-6">
                    <label for="barcodeInput" class="form-label">Código o Nombre</label>
                    <!-- <input id="barcodeInput" ref="barcodeInput" v-model="saleBarcodeOrName" @input="selectProduct"
                        type="text" class="form-control form-control-sm" placeholder="Ingrese código o nombre" /> -->
                    <multiselect :readonly="isMobile()"
            @focus.prevent="onBarcodeFocus" v-model="saleProduct" :options="products" :searchable="true" :close-on-select="true"
                        placeholder="Código o nombre" label="name" track-by="barcode" />
                </div>
                <div class="col-4 col-md-2">
                    <label class="form-label">Cantidad</label>
                    <input v-model.number="saleQuantity" type="number" min="1"
                        :max="saleProduct ? saleProduct.stock : 1" class="form-control form-control-sm" />
                </div>
                <div class="col-4 col-md-2">
                    <label class="form-label">Precio</label>
                    <input type="number" :value="saleProduct ? saleProduct.price : 0" readonly
                        class="form-control form-control-sm" />
                </div>
                <div class="col-4 col-md-2">
                    <label class="form-label">Subtotal</label>
                    <input type="text" :value="subtotalVenta()" readonly class="form-control form-control-sm" />
                </div>
                <div class="col-12 d-grid mt-2">
                    <button class="btn btn-success btn-sm" @click="addVenta">Agregar</button>
                </div>
            </div>
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

        <div v-if="showFreeSaleForm" class="mb-4 card p-3 shadow-sm">
            <h5>Registrar Venta Libre</h5>
            <div class="row g-2">
                <div class="col-6 col-md-2">
                    <label class="form-label">Fecha</label>
                    <input type="date" v-model="freeSale.date" class="form-control form-control-sm" />
                </div>
                <div class="col-6 col-md-2">
                    <label class="form-label">Importe</label>
                    <input type="number" v-model.number="freeSale.amount" class="form-control form-control-sm" />
                </div>
                <div class="col-6 col-md-2">
                    <label class="form-label">Descuento %</label>
                    <input type="number" v-model.number="freeSale.discount" class="form-control form-control-sm" />
                </div>
                <div class="col-6 col-md-2">
                    <label class="form-label">Total Final</label>
                    <input type="text" :value="formatCurrency(freeSaleTotal)" readonly
                        class="form-control form-control-sm" />
                </div>
                <div class="col-6 col-md-2">
                    <label class="form-label">Medio de Pago</label>
                    <select v-model="freeSale.paymentMethod" class="form-select form-select-sm">
                        <option value="" disabled>Seleccione</option>
                        <option value="efectivo">Efectivo</option>
                        <option value="tarjeta">Tarjeta</option>
                        <option value="mercadopago">Mercado Pago</option>
                        <option value="qr">QR</option>
                        <option value="otros">Otros</option>
                    </select>
                </div>
                <div class="col-6 col-md-2">
                    <label class="form-label">Concepto</label>
                    <input type="text" v-model="freeSale.concept" class="form-control form-control-sm" />
                </div>
                <div class="col-12 d-grid mt-2">
                    <button class="btn btn-primary btn-sm" @click="addFreeSale">Registrar</button>
                </div>
            </div>
        </div>

        <!-- 💸 Registrar Egreso -->
        <div v-if="showEgresoForm" class="mb-4 card p-3 shadow-sm">
            <h5>Registrar Egreso</h5>
            <div class="row g-2">
                <div class="col-6 col-md-2">
                    <label class="form-label">Fecha</label>
                    <input type="date" v-model="egreso.date" class="form-control form-control-sm" />
                </div>
                <div class="col-6 col-md-2">
                    <label class="form-label">Importe</label>
                    <input type="number" v-model.number="egreso.amount" class="form-control form-control-sm" />
                </div>
                <div class="col-6 col-md-4">
                    <label class="form-label">Concepto</label>
                    <input type="text" v-model="egreso.concept" class="form-control form-control-sm" />
                </div>
                <div class="col-6 col-md-4">
                    <label class="form-label">Medio de Pago</label>
                    <select v-model="egreso.paymentMethod" class="form-select form-select-sm">
                        <option value="" disabled>Seleccione</option>
                        <option value="efectivo">Efectivo</option>
                        <option value="tarjeta">Tarjeta</option>
                        <option value="mercadopago">Mercado Pago</option>
                        <option value="qr">QR</option>
                        <option value="otros">Otros</option>
                    </select>
                </div>
                <div class="col-12 d-grid mt-2">
                    <button class="btn btn-warning btn-sm" @click="addEgreso">Registrar Egreso</button>
                </div>
            </div>
        </div>

        <!-- 📊 Tabla de ventas y egresos -->
        <div v-if="ventas.length || egresos.length" class="table-responsive mb-3">
            <table class="table table-hover align-middle small mb-0">
                <thead class="table-light">
                    <tr>
                        <th>Producto / Concepto</th>
                        <th>Fecha</th>
                        <th>Cantidad</th>
                        <th>Precio</th>
                        <th>Subtotal</th>
                        <th>Medio</th>
                        <th class="text-center">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(v, idx) in [...ventas, ...egresos]" :key="v._id || idx">
                        <td>{{ v.name || v.concept }}</td>
                        <td>{{ v.date }}</td>
                        <td>{{ v.quantity || '-' }}</td>
                        <td>{{ formatCurrency(v.price || v.amount || v.total) }}</td>
                        <td>{{ formatCurrency(v.quantity ? v.quantity * v.price : v.total || v.amount) }}</td>
                        <td>{{ v.paymentMethod || '-' }}</td>
                        <td class="text-center">
                            <button class="btn btn-link text-danger p-1" @click="removeVenta(idx)">
                                <i class="bi bi-trash-fill"></i>
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Modal Abrir Caja -->
        <div class="modal fade" tabindex="-1" :class="{ show: showOpenModal }" style="display: block"
            v-if="showOpenModal">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Abrir Caja</h5>
                        <button type="button" class="btn-close" @click="showOpenModal = false"></button>
                    </div>
                    <div class="modal-body">
                        <label>Monto Inicial:</label>
                        <input type="number" v-model.number="openAmountInput" class="form-control" />
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" @click="showOpenModal = false">Cancelar</button>
                        <button class="btn btn-primary" @click="abrirCaja">Abrir</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Modal Cerrar Caja -->
        <div class="modal fade" tabindex="-1" :class="{ show: showCloseModal }" style="display: block"
            v-if="showCloseModal">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Cerrar Caja</h5>
                        <button type="button" class="btn-close" @click="showCloseModal = false"></button>
                    </div>
                    <div class="modal-body">
                        <label>Monto Final:</label>
                        <input type="number" class="form-control" readonly :value="cashBalance" />
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" @click="showCloseModal = false">Cancelar</button>
                        <button class="btn btn-success" @click="cerrarCaja">Cerrar</button>
                    </div>
                </div>
            </div>
        </div>

    </div>
</template>

<script lang="ts">
import { defineComponent, nextTick } from "vue";
import { getProducts } from "../services/productService";
import {
    openCashRegister,
    getActiveCashRegister,
    registerMovement,
    closeCashRegister,
    deleteMovement
} from "../services/cashRegisterService";
import Multiselect from "vue-multiselect";
import "vue-multiselect/dist/vue-multiselect.min.css";
import { BrowserBarcodeReader } from "@zxing/library";

export default defineComponent({
    name: "CajaView",
      components: {
    Multiselect
  },
    data() {
        return {
          scannerVisible: false,
          scanner: null as any,
            showSaleForm: false,
            showFreeSaleForm: false,
            showEgresoForm: false,
            isOpen: false,
            openAmount: 0,
            closeAmountInput: 0,
            ventas: [] as any[],
            egresos: [] as any[],
            showOpenModal: false,
            showCloseModal: false,
            openAmountInput: 0,
            saleBarcodeOrName: "",
            saleProduct: null as any,
            saleQuantity: 1,
            products: [] as any[],
            freeSale: {
                date: new Date().toISOString().split("T")[0],
                amount: 0,
                discount: 0,
                paymentMethod: "",
                concept: "",
            },
            egreso: {
                date: new Date().toISOString().split("T")[0],
                amount: 0,
                paymentMethod: "",
                concept: "",
            },
        };
    },
    async mounted() {
        this.loadProducts();
        const activeCash = await getActiveCashRegister();
        if (activeCash) {
            this.isOpen = true;
            this.openAmount = activeCash.initialAmount;
            this.ventas = activeCash.movements.filter((m: any) => m.type === "ingreso");
            this.egresos = activeCash.movements.filter((m: any) => m.type === "egreso");
        }
    },
    computed: {
        resumenCaja() {
            return [
                { label: "Monto Inicial", value: this.openAmount },
                { label: "Total Ventas", value: this.totalVentas },
                { label: "Total Egresos", value: this.totalEgresos },
                { label: "Efectivo Actual", value: this.cashBalance },
            ];
        },
        freeSaleTotal(): number {
            const amount = Number(this.freeSale.amount) || 0;
            let discount = Number(this.freeSale.discount) || 0;
            if (discount < 0) discount = 0;
            if (discount > 100) discount = 100;
            return Number((amount - (amount * discount) / 100).toFixed(2));
        },
        totalVentas() {
            return this.ventas.reduce((sum, v) => {
                // si viene quantity*price, usalo; si no, tomá amount
                const valor = v.quantity && v.price ? v.quantity * v.price : v.amount ?? 0;
                return sum + valor;
            }, 0);
        },
        totalEgresos() {
            return this.egresos.reduce((sum, e) => sum + (e.amount ?? 0), 0);
        },
        cashBalance() {
            return this.openAmount + this.totalVentas - this.totalEgresos;
        },
    },
    methods: {
      async startScanner() {
      this.scannerVisible = true;
      await nextTick();

      const codeReader = new BrowserBarcodeReader();
      this.scanner = codeReader;

      codeReader
        .decodeOnceFromVideoDevice(undefined, this.$refs.videoPreview as HTMLVideoElement)
        .then(result => {
          this.saleProduct = result.getText();
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
        isMobile() {
      return /Mobi|Android/i.test(navigator.userAgent);
    },
    onBarcodeFocus() {
      if (this.isMobile()) {
        this.startScanner();
      }
    },
        async loadProducts() {
            this.products = await getProducts();
        },
        selectProduct() {
            this.saleProduct = this.products.find(
                (p) =>
                    p.barcode === this.saleBarcodeOrName ||
                    p.name.toLowerCase() === this.saleBarcodeOrName.toLowerCase()
            ) || null;
        },
        async abrirCaja() {
            try {
                const cash = await openCashRegister(this.openAmountInput, "Admin");
                this.openAmount = cash.initialAmount;
                this.isOpen = true;
                this.showOpenModal = false;
            } catch (err: any) {
                alert(err.response?.data?.message || "Error al abrir la caja");
            }
        },
        async addVenta() {
            if (!this.saleProduct) return;
            if (this.saleQuantity > this.saleProduct.stock) {
                return alert(`No hay suficiente stock. Disponible: ${this.saleProduct.stock}`);
            }

            try {
                const updatedCash = await registerMovement(
                    "ingreso",
                    this.saleQuantity * this.saleProduct.price,
                    "efectivo",
                    `Venta de ${this.saleProduct.name}`
                );

                this.ventas = updatedCash.movements.filter((m: any) => m.type === "ingreso");
                this.egresos = updatedCash.movements.filter((m: any) => m.type === "egreso");

                this.saleProduct.stock -= this.saleQuantity;
                this.saleBarcodeOrName = "";
                this.saleProduct = null;
                this.saleQuantity = 1;
            } catch (err: any) {
                alert(err.response?.data?.message || "Error al registrar la venta");
            }
        },
        async addFreeSale() {
            if (this.freeSale.amount <= 0) return alert("Ingrese un importe válido");
            if (!this.freeSale.paymentMethod) return alert("Seleccione un medio de pago");

            try {
                const updatedCash = await registerMovement(
                    "ingreso",
                    this.freeSaleTotal,
                    this.freeSale.paymentMethod,
                    this.freeSale.concept || "Venta libre"
                );

                this.ventas = updatedCash.movements.filter((m: any) => m.type === "ingreso");
                this.egresos = updatedCash.movements.filter((m: any) => m.type === "egreso");

                this.freeSale.amount = 0;
                this.freeSale.discount = 0;
                this.freeSale.paymentMethod = "";
                this.freeSale.concept = "";
            } catch (err: any) {
                alert(err.response?.data?.message || "Error al registrar la venta libre");
            }
        },
        async addEgreso() {
            if (this.egreso.amount <= 0) return alert("Ingrese un importe válido");
            if (!this.egreso.concept) return alert("Debe ingresar un concepto para el egreso");
            if (!this.egreso.paymentMethod) return alert("Seleccione un medio de pago");

            try {
                const updatedCash = await registerMovement(
                    "egreso",
                    this.egreso.amount,
                    this.egreso.paymentMethod,
                    this.egreso.concept
                );

                this.ventas = updatedCash.movements.filter((m: any) => m.type === "ingreso");
                this.egresos = updatedCash.movements.filter((m: any) => m.type === "egreso");

                this.egreso.amount = 0;
                this.egreso.paymentMethod = "";
                this.egreso.concept = "";
                this.egreso.date = new Date().toISOString().split("T")[0];
            } catch (err: any) {
                alert(err.response?.data?.message || "Error al registrar el egreso");
            }
        },
        subtotalVenta() {
            return this.saleProduct ? this.saleQuantity * this.saleProduct.price : 0;
        },
        async removeVenta(idx: number) {
            const movimiento = this.ventas[idx];
            if (!movimiento._id) return alert("No se puede eliminar este movimiento");

            try {
                const updatedCash = await deleteMovement(movimiento._id);
                this.ventas = updatedCash.movements.filter((m: any) => m.type === "ingreso");
                this.egresos = updatedCash.movements.filter((m: any) => m.type === "egreso");
            } catch (err: any) {
                alert(err.response?.data?.message || "Error al eliminar el movimiento");
            }
        },
        formatCurrency(value: number) {
            return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(value);
        },
        async cerrarCaja() {
            try {
                const closedCash = await closeCashRegister();
                alert(`Caja cerrada. Monto final: ${this.formatCurrency(closedCash.finalAmount)}`);
                this.isOpen = false;
                this.ventas = [];
                this.egresos = [];
                this.openAmount = 0;
                this.openAmountInput = 0;
                this.closeAmountInput = 0;
                this.showCloseModal = false;
            } catch (err: any) {
                alert(err.response?.data?.message || "Error al cerrar la caja");
            }
        },
    },
});
</script>

<style scoped>
.modal {
    background-color: rgba(0, 0, 0, 0.4);
}

.modal-dialog {
    margin-top: 10vh;
}
</style>
