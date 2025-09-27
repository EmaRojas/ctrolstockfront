import { defineComponent } from "vue";
import { getProducts } from "../services/productService";
import { openCashRegister, getActiveCashRegister, registerMovement, closeCashRegister, deleteMovement } from "../services/cashRegisterService";
import Multiselect from "vue-multiselect";
import "vue-multiselect/dist/vue-multiselect.min.css";
export default defineComponent({
    name: "CajaView",
    components: {
        Multiselect
    },
    data() {
        return {
            showSaleForm: false,
            showFreeSaleForm: false,
            showEgresoForm: false,
            isOpen: false,
            openAmount: 0,
            closeAmountInput: 0,
            ventas: [],
            egresos: [],
            showOpenModal: false,
            showCloseModal: false,
            openAmountInput: 0,
            saleBarcodeOrName: "",
            saleProduct: null,
            saleQuantity: 1,
            products: [],
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
            this.ventas = activeCash.movements.filter((m) => m.type === "ingreso");
            this.egresos = activeCash.movements.filter((m) => m.type === "egreso");
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
        freeSaleTotal() {
            const amount = Number(this.freeSale.amount) || 0;
            let discount = Number(this.freeSale.discount) || 0;
            if (discount < 0)
                discount = 0;
            if (discount > 100)
                discount = 100;
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
        async loadProducts() {
            this.products = await getProducts();
        },
        selectProduct() {
            this.saleProduct = this.products.find((p) => p.barcode === this.saleBarcodeOrName ||
                p.name.toLowerCase() === this.saleBarcodeOrName.toLowerCase()) || null;
        },
        async abrirCaja() {
            try {
                const cash = await openCashRegister(this.openAmountInput, "Admin");
                this.openAmount = cash.initialAmount;
                this.isOpen = true;
                this.showOpenModal = false;
            }
            catch (err) {
                alert(err.response?.data?.message || "Error al abrir la caja");
            }
        },
        async addVenta() {
            if (!this.saleProduct)
                return;
            if (this.saleQuantity > this.saleProduct.stock) {
                return alert(`No hay suficiente stock. Disponible: ${this.saleProduct.stock}`);
            }
            try {
                const updatedCash = await registerMovement("ingreso", this.saleQuantity * this.saleProduct.price, "efectivo", `Venta de ${this.saleProduct.name}`);
                this.ventas = updatedCash.movements.filter((m) => m.type === "ingreso");
                this.egresos = updatedCash.movements.filter((m) => m.type === "egreso");
                this.saleProduct.stock -= this.saleQuantity;
                this.saleBarcodeOrName = "";
                this.saleProduct = null;
                this.saleQuantity = 1;
            }
            catch (err) {
                alert(err.response?.data?.message || "Error al registrar la venta");
            }
        },
        async addFreeSale() {
            if (this.freeSale.amount <= 0)
                return alert("Ingrese un importe válido");
            if (!this.freeSale.paymentMethod)
                return alert("Seleccione un medio de pago");
            try {
                const updatedCash = await registerMovement("ingreso", this.freeSaleTotal, this.freeSale.paymentMethod, this.freeSale.concept || "Venta libre");
                this.ventas = updatedCash.movements.filter((m) => m.type === "ingreso");
                this.egresos = updatedCash.movements.filter((m) => m.type === "egreso");
                this.freeSale.amount = 0;
                this.freeSale.discount = 0;
                this.freeSale.paymentMethod = "";
                this.freeSale.concept = "";
            }
            catch (err) {
                alert(err.response?.data?.message || "Error al registrar la venta libre");
            }
        },
        async addEgreso() {
            if (this.egreso.amount <= 0)
                return alert("Ingrese un importe válido");
            if (!this.egreso.concept)
                return alert("Debe ingresar un concepto para el egreso");
            if (!this.egreso.paymentMethod)
                return alert("Seleccione un medio de pago");
            try {
                const updatedCash = await registerMovement("egreso", this.egreso.amount, this.egreso.paymentMethod, this.egreso.concept);
                this.ventas = updatedCash.movements.filter((m) => m.type === "ingreso");
                this.egresos = updatedCash.movements.filter((m) => m.type === "egreso");
                this.egreso.amount = 0;
                this.egreso.paymentMethod = "";
                this.egreso.concept = "";
                this.egreso.date = new Date().toISOString().split("T")[0];
            }
            catch (err) {
                alert(err.response?.data?.message || "Error al registrar el egreso");
            }
        },
        subtotalVenta() {
            return this.saleProduct ? this.saleQuantity * this.saleProduct.price : 0;
        },
        async removeVenta(idx) {
            const movimiento = this.ventas[idx];
            if (!movimiento._id)
                return alert("No se puede eliminar este movimiento");
            try {
                const updatedCash = await deleteMovement(movimiento._id);
                this.ventas = updatedCash.movements.filter((m) => m.type === "ingreso");
                this.egresos = updatedCash.movements.filter((m) => m.type === "egreso");
            }
            catch (err) {
                alert(err.response?.data?.message || "Error al eliminar el movimiento");
            }
        },
        formatCurrency(value) {
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
            }
            catch (err) {
                alert(err.response?.data?.message || "Error al cerrar la caja");
            }
        },
    },
});
debugger; /* PartiallyEnd: #3632/script.vue */
const __VLS_ctx = {};
let __VLS_elements;
const __VLS_componentsOption = {
    Multiselect
};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "container mt-4" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "d-flex justify-content-between align-items-center flex-wrap mb-3" },
});
__VLS_asFunctionalElement(__VLS_elements.h2, __VLS_elements.h2)({
    ...{ class: "h4 mb-2 mb-md-0" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({});
if (!__VLS_ctx.isOpen) {
    // @ts-ignore
    [isOpen,];
    __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
        ...{ onClick: (...[$event]) => {
                if (!(!__VLS_ctx.isOpen))
                    return;
                __VLS_ctx.showOpenModal = true;
                // @ts-ignore
                [showOpenModal,];
            } },
        ...{ class: "btn btn-primary me-2" },
    });
}
if (__VLS_ctx.isOpen) {
    // @ts-ignore
    [isOpen,];
    __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.isOpen))
                    return;
                __VLS_ctx.showCloseModal = true;
                // @ts-ignore
                [showCloseModal,];
            } },
        ...{ class: "btn btn-success" },
    });
}
if (__VLS_ctx.isOpen) {
    // @ts-ignore
    [isOpen,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "mb-3 row g-2" },
    });
    for (const [card, idx] of __VLS_getVForSourceType((__VLS_ctx.resumenCaja))) {
        // @ts-ignore
        [resumenCaja,];
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "col-6 col-md-3" },
            key: (idx),
        });
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "card p-2 text-center shadow-sm" },
        });
        __VLS_asFunctionalElement(__VLS_elements.small, __VLS_elements.small)({});
        (card.label);
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "fw-bold" },
        });
        (__VLS_ctx.formatCurrency(card.value));
        // @ts-ignore
        [formatCurrency,];
    }
}
if (__VLS_ctx.isOpen) {
    // @ts-ignore
    [isOpen,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "mb-3 d-flex gap-2 flex-wrap" },
    });
    __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.isOpen))
                    return;
                __VLS_ctx.showSaleForm = !__VLS_ctx.showSaleForm;
                // @ts-ignore
                [showSaleForm, showSaleForm,];
            } },
        ...{ class: "btn btn-sm btn-primary" },
    });
    (__VLS_ctx.showSaleForm ? 'Cancelar Venta' : 'Agregar Venta');
    // @ts-ignore
    [showSaleForm,];
    __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.isOpen))
                    return;
                __VLS_ctx.showFreeSaleForm = !__VLS_ctx.showFreeSaleForm;
                // @ts-ignore
                [showFreeSaleForm, showFreeSaleForm,];
            } },
        ...{ class: "btn btn-sm btn-success" },
    });
    (__VLS_ctx.showFreeSaleForm ? 'Cancelar Venta Libre' : 'Venta Libre');
    // @ts-ignore
    [showFreeSaleForm,];
    __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.isOpen))
                    return;
                __VLS_ctx.showEgresoForm = !__VLS_ctx.showEgresoForm;
                // @ts-ignore
                [showEgresoForm, showEgresoForm,];
            } },
        ...{ class: "btn btn-sm btn-warning" },
    });
    (__VLS_ctx.showEgresoForm ? 'Cancelar Egreso' : 'Agregar Egreso');
    // @ts-ignore
    [showEgresoForm,];
}
if (__VLS_ctx.showSaleForm) {
    // @ts-ignore
    [showSaleForm,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "mb-4 card p-3 shadow-sm" },
    });
    __VLS_asFunctionalElement(__VLS_elements.h5, __VLS_elements.h5)({});
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "row g-2 align-items-center" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "col-6 col-md-6" },
    });
    __VLS_asFunctionalElement(__VLS_elements.label, __VLS_elements.label)({
        for: "barcodeInput",
        ...{ class: "form-label" },
    });
    const __VLS_0 = {}.multiselect;
    /** @type {[typeof __VLS_components.Multiselect, typeof __VLS_components.multiselect, ]} */ ;
    // @ts-ignore
    Multiselect;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
        modelValue: (__VLS_ctx.saleProduct),
        options: (__VLS_ctx.products),
        searchable: (true),
        closeOnSelect: (true),
        placeholder: "Código o nombre",
        label: "name",
        trackBy: "barcode",
    }));
    const __VLS_2 = __VLS_1({
        modelValue: (__VLS_ctx.saleProduct),
        options: (__VLS_ctx.products),
        searchable: (true),
        closeOnSelect: (true),
        placeholder: "Código o nombre",
        label: "name",
        trackBy: "barcode",
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    // @ts-ignore
    [saleProduct, products,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "col-4 col-md-2" },
    });
    __VLS_asFunctionalElement(__VLS_elements.label, __VLS_elements.label)({
        ...{ class: "form-label" },
    });
    __VLS_asFunctionalElement(__VLS_elements.input)({
        type: "number",
        min: "1",
        max: (__VLS_ctx.saleProduct ? __VLS_ctx.saleProduct.stock : 1),
        ...{ class: "form-control form-control-sm" },
    });
    (__VLS_ctx.saleQuantity);
    // @ts-ignore
    [saleProduct, saleProduct, saleQuantity,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "col-4 col-md-2" },
    });
    __VLS_asFunctionalElement(__VLS_elements.label, __VLS_elements.label)({
        ...{ class: "form-label" },
    });
    __VLS_asFunctionalElement(__VLS_elements.input)({
        type: "number",
        value: (__VLS_ctx.saleProduct ? __VLS_ctx.saleProduct.price : 0),
        readonly: true,
        ...{ class: "form-control form-control-sm" },
    });
    // @ts-ignore
    [saleProduct, saleProduct,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "col-4 col-md-2" },
    });
    __VLS_asFunctionalElement(__VLS_elements.label, __VLS_elements.label)({
        ...{ class: "form-label" },
    });
    __VLS_asFunctionalElement(__VLS_elements.input)({
        type: "text",
        value: (__VLS_ctx.subtotalVenta()),
        readonly: true,
        ...{ class: "form-control form-control-sm" },
    });
    // @ts-ignore
    [subtotalVenta,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "col-12 d-grid mt-2" },
    });
    __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
        ...{ onClick: (__VLS_ctx.addVenta) },
        ...{ class: "btn btn-success btn-sm" },
    });
    // @ts-ignore
    [addVenta,];
}
if (__VLS_ctx.showFreeSaleForm) {
    // @ts-ignore
    [showFreeSaleForm,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "mb-4 card p-3 shadow-sm" },
    });
    __VLS_asFunctionalElement(__VLS_elements.h5, __VLS_elements.h5)({});
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "row g-2" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "col-6 col-md-2" },
    });
    __VLS_asFunctionalElement(__VLS_elements.label, __VLS_elements.label)({
        ...{ class: "form-label" },
    });
    __VLS_asFunctionalElement(__VLS_elements.input)({
        type: "date",
        ...{ class: "form-control form-control-sm" },
    });
    (__VLS_ctx.freeSale.date);
    // @ts-ignore
    [freeSale,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "col-6 col-md-2" },
    });
    __VLS_asFunctionalElement(__VLS_elements.label, __VLS_elements.label)({
        ...{ class: "form-label" },
    });
    __VLS_asFunctionalElement(__VLS_elements.input)({
        type: "number",
        ...{ class: "form-control form-control-sm" },
    });
    (__VLS_ctx.freeSale.amount);
    // @ts-ignore
    [freeSale,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "col-6 col-md-2" },
    });
    __VLS_asFunctionalElement(__VLS_elements.label, __VLS_elements.label)({
        ...{ class: "form-label" },
    });
    __VLS_asFunctionalElement(__VLS_elements.input)({
        type: "number",
        ...{ class: "form-control form-control-sm" },
    });
    (__VLS_ctx.freeSale.discount);
    // @ts-ignore
    [freeSale,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "col-6 col-md-2" },
    });
    __VLS_asFunctionalElement(__VLS_elements.label, __VLS_elements.label)({
        ...{ class: "form-label" },
    });
    __VLS_asFunctionalElement(__VLS_elements.input)({
        type: "text",
        value: (__VLS_ctx.formatCurrency(__VLS_ctx.freeSaleTotal)),
        readonly: true,
        ...{ class: "form-control form-control-sm" },
    });
    // @ts-ignore
    [formatCurrency, freeSaleTotal,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "col-6 col-md-2" },
    });
    __VLS_asFunctionalElement(__VLS_elements.label, __VLS_elements.label)({
        ...{ class: "form-label" },
    });
    __VLS_asFunctionalElement(__VLS_elements.select, __VLS_elements.select)({
        value: (__VLS_ctx.freeSale.paymentMethod),
        ...{ class: "form-select form-select-sm" },
    });
    // @ts-ignore
    [freeSale,];
    __VLS_asFunctionalElement(__VLS_elements.option, __VLS_elements.option)({
        value: "",
        disabled: true,
    });
    __VLS_asFunctionalElement(__VLS_elements.option, __VLS_elements.option)({
        value: "efectivo",
    });
    __VLS_asFunctionalElement(__VLS_elements.option, __VLS_elements.option)({
        value: "tarjeta",
    });
    __VLS_asFunctionalElement(__VLS_elements.option, __VLS_elements.option)({
        value: "mercadopago",
    });
    __VLS_asFunctionalElement(__VLS_elements.option, __VLS_elements.option)({
        value: "qr",
    });
    __VLS_asFunctionalElement(__VLS_elements.option, __VLS_elements.option)({
        value: "otros",
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "col-6 col-md-2" },
    });
    __VLS_asFunctionalElement(__VLS_elements.label, __VLS_elements.label)({
        ...{ class: "form-label" },
    });
    __VLS_asFunctionalElement(__VLS_elements.input)({
        type: "text",
        value: (__VLS_ctx.freeSale.concept),
        ...{ class: "form-control form-control-sm" },
    });
    // @ts-ignore
    [freeSale,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "col-12 d-grid mt-2" },
    });
    __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
        ...{ onClick: (__VLS_ctx.addFreeSale) },
        ...{ class: "btn btn-primary btn-sm" },
    });
    // @ts-ignore
    [addFreeSale,];
}
if (__VLS_ctx.showEgresoForm) {
    // @ts-ignore
    [showEgresoForm,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "mb-4 card p-3 shadow-sm" },
    });
    __VLS_asFunctionalElement(__VLS_elements.h5, __VLS_elements.h5)({});
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "row g-2" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "col-6 col-md-2" },
    });
    __VLS_asFunctionalElement(__VLS_elements.label, __VLS_elements.label)({
        ...{ class: "form-label" },
    });
    __VLS_asFunctionalElement(__VLS_elements.input)({
        type: "date",
        ...{ class: "form-control form-control-sm" },
    });
    (__VLS_ctx.egreso.date);
    // @ts-ignore
    [egreso,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "col-6 col-md-2" },
    });
    __VLS_asFunctionalElement(__VLS_elements.label, __VLS_elements.label)({
        ...{ class: "form-label" },
    });
    __VLS_asFunctionalElement(__VLS_elements.input)({
        type: "number",
        ...{ class: "form-control form-control-sm" },
    });
    (__VLS_ctx.egreso.amount);
    // @ts-ignore
    [egreso,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "col-6 col-md-4" },
    });
    __VLS_asFunctionalElement(__VLS_elements.label, __VLS_elements.label)({
        ...{ class: "form-label" },
    });
    __VLS_asFunctionalElement(__VLS_elements.input)({
        type: "text",
        value: (__VLS_ctx.egreso.concept),
        ...{ class: "form-control form-control-sm" },
    });
    // @ts-ignore
    [egreso,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "col-6 col-md-4" },
    });
    __VLS_asFunctionalElement(__VLS_elements.label, __VLS_elements.label)({
        ...{ class: "form-label" },
    });
    __VLS_asFunctionalElement(__VLS_elements.select, __VLS_elements.select)({
        value: (__VLS_ctx.egreso.paymentMethod),
        ...{ class: "form-select form-select-sm" },
    });
    // @ts-ignore
    [egreso,];
    __VLS_asFunctionalElement(__VLS_elements.option, __VLS_elements.option)({
        value: "",
        disabled: true,
    });
    __VLS_asFunctionalElement(__VLS_elements.option, __VLS_elements.option)({
        value: "efectivo",
    });
    __VLS_asFunctionalElement(__VLS_elements.option, __VLS_elements.option)({
        value: "tarjeta",
    });
    __VLS_asFunctionalElement(__VLS_elements.option, __VLS_elements.option)({
        value: "mercadopago",
    });
    __VLS_asFunctionalElement(__VLS_elements.option, __VLS_elements.option)({
        value: "qr",
    });
    __VLS_asFunctionalElement(__VLS_elements.option, __VLS_elements.option)({
        value: "otros",
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "col-12 d-grid mt-2" },
    });
    __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
        ...{ onClick: (__VLS_ctx.addEgreso) },
        ...{ class: "btn btn-warning btn-sm" },
    });
    // @ts-ignore
    [addEgreso,];
}
if (__VLS_ctx.ventas.length || __VLS_ctx.egresos.length) {
    // @ts-ignore
    [ventas, egresos,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "table-responsive mb-3" },
    });
    __VLS_asFunctionalElement(__VLS_elements.table, __VLS_elements.table)({
        ...{ class: "table table-hover align-middle small mb-0" },
    });
    __VLS_asFunctionalElement(__VLS_elements.thead, __VLS_elements.thead)({
        ...{ class: "table-light" },
    });
    __VLS_asFunctionalElement(__VLS_elements.tr, __VLS_elements.tr)({});
    __VLS_asFunctionalElement(__VLS_elements.th, __VLS_elements.th)({});
    __VLS_asFunctionalElement(__VLS_elements.th, __VLS_elements.th)({});
    __VLS_asFunctionalElement(__VLS_elements.th, __VLS_elements.th)({});
    __VLS_asFunctionalElement(__VLS_elements.th, __VLS_elements.th)({});
    __VLS_asFunctionalElement(__VLS_elements.th, __VLS_elements.th)({});
    __VLS_asFunctionalElement(__VLS_elements.th, __VLS_elements.th)({});
    __VLS_asFunctionalElement(__VLS_elements.th, __VLS_elements.th)({
        ...{ class: "text-center" },
    });
    __VLS_asFunctionalElement(__VLS_elements.tbody, __VLS_elements.tbody)({});
    for (const [v, idx] of __VLS_getVForSourceType(([...__VLS_ctx.ventas, ...__VLS_ctx.egresos]))) {
        // @ts-ignore
        [ventas, egresos,];
        __VLS_asFunctionalElement(__VLS_elements.tr, __VLS_elements.tr)({
            key: (v._id || idx),
        });
        __VLS_asFunctionalElement(__VLS_elements.td, __VLS_elements.td)({});
        (v.name || v.concept);
        __VLS_asFunctionalElement(__VLS_elements.td, __VLS_elements.td)({});
        (v.date);
        __VLS_asFunctionalElement(__VLS_elements.td, __VLS_elements.td)({});
        (v.quantity || '-');
        __VLS_asFunctionalElement(__VLS_elements.td, __VLS_elements.td)({});
        (__VLS_ctx.formatCurrency(v.price || v.amount || v.total));
        // @ts-ignore
        [formatCurrency,];
        __VLS_asFunctionalElement(__VLS_elements.td, __VLS_elements.td)({});
        (__VLS_ctx.formatCurrency(v.quantity ? v.quantity * v.price : v.total || v.amount));
        // @ts-ignore
        [formatCurrency,];
        __VLS_asFunctionalElement(__VLS_elements.td, __VLS_elements.td)({});
        (v.paymentMethod || '-');
        __VLS_asFunctionalElement(__VLS_elements.td, __VLS_elements.td)({
            ...{ class: "text-center" },
        });
        __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.ventas.length || __VLS_ctx.egresos.length))
                        return;
                    __VLS_ctx.removeVenta(idx);
                    // @ts-ignore
                    [removeVenta,];
                } },
            ...{ class: "btn btn-link text-danger p-1" },
        });
        __VLS_asFunctionalElement(__VLS_elements.i, __VLS_elements.i)({
            ...{ class: "bi bi-trash-fill" },
        });
    }
}
if (__VLS_ctx.showOpenModal) {
    // @ts-ignore
    [showOpenModal,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "modal fade" },
        tabindex: "-1",
        ...{ class: ({ show: __VLS_ctx.showOpenModal }) },
        ...{ style: {} },
    });
    // @ts-ignore
    [showOpenModal,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "modal-dialog" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "modal-content" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "modal-header" },
    });
    __VLS_asFunctionalElement(__VLS_elements.h5, __VLS_elements.h5)({
        ...{ class: "modal-title" },
    });
    __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.showOpenModal))
                    return;
                __VLS_ctx.showOpenModal = false;
                // @ts-ignore
                [showOpenModal,];
            } },
        type: "button",
        ...{ class: "btn-close" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "modal-body" },
    });
    __VLS_asFunctionalElement(__VLS_elements.label, __VLS_elements.label)({});
    __VLS_asFunctionalElement(__VLS_elements.input)({
        type: "number",
        ...{ class: "form-control" },
    });
    (__VLS_ctx.openAmountInput);
    // @ts-ignore
    [openAmountInput,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "modal-footer" },
    });
    __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.showOpenModal))
                    return;
                __VLS_ctx.showOpenModal = false;
                // @ts-ignore
                [showOpenModal,];
            } },
        ...{ class: "btn btn-secondary" },
    });
    __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
        ...{ onClick: (__VLS_ctx.abrirCaja) },
        ...{ class: "btn btn-primary" },
    });
    // @ts-ignore
    [abrirCaja,];
}
if (__VLS_ctx.showCloseModal) {
    // @ts-ignore
    [showCloseModal,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "modal fade" },
        tabindex: "-1",
        ...{ class: ({ show: __VLS_ctx.showCloseModal }) },
        ...{ style: {} },
    });
    // @ts-ignore
    [showCloseModal,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "modal-dialog" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "modal-content" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "modal-header" },
    });
    __VLS_asFunctionalElement(__VLS_elements.h5, __VLS_elements.h5)({
        ...{ class: "modal-title" },
    });
    __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.showCloseModal))
                    return;
                __VLS_ctx.showCloseModal = false;
                // @ts-ignore
                [showCloseModal,];
            } },
        type: "button",
        ...{ class: "btn-close" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "modal-body" },
    });
    __VLS_asFunctionalElement(__VLS_elements.label, __VLS_elements.label)({});
    __VLS_asFunctionalElement(__VLS_elements.input)({
        type: "number",
        ...{ class: "form-control" },
        readonly: true,
        value: (__VLS_ctx.cashBalance),
    });
    // @ts-ignore
    [cashBalance,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "modal-footer" },
    });
    __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.showCloseModal))
                    return;
                __VLS_ctx.showCloseModal = false;
                // @ts-ignore
                [showCloseModal,];
            } },
        ...{ class: "btn btn-secondary" },
    });
    __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
        ...{ onClick: (__VLS_ctx.cerrarCaja) },
        ...{ class: "btn btn-success" },
    });
    // @ts-ignore
    [cerrarCaja,];
}
/** @type {__VLS_StyleScopedClasses['container']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
/** @type {__VLS_StyleScopedClasses['d-flex']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-content-between']} */ ;
/** @type {__VLS_StyleScopedClasses['align-items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-wrap']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-3']} */ ;
/** @type {__VLS_StyleScopedClasses['h4']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-md-0']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['me-2']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-success']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-3']} */ ;
/** @type {__VLS_StyleScopedClasses['row']} */ ;
/** @type {__VLS_StyleScopedClasses['g-2']} */ ;
/** @type {__VLS_StyleScopedClasses['col-6']} */ ;
/** @type {__VLS_StyleScopedClasses['col-md-3']} */ ;
/** @type {__VLS_StyleScopedClasses['card']} */ ;
/** @type {__VLS_StyleScopedClasses['p-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-center']} */ ;
/** @type {__VLS_StyleScopedClasses['shadow-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['fw-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-3']} */ ;
/** @type {__VLS_StyleScopedClasses['d-flex']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-wrap']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-success']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-warning']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
/** @type {__VLS_StyleScopedClasses['card']} */ ;
/** @type {__VLS_StyleScopedClasses['p-3']} */ ;
/** @type {__VLS_StyleScopedClasses['shadow-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['row']} */ ;
/** @type {__VLS_StyleScopedClasses['g-2']} */ ;
/** @type {__VLS_StyleScopedClasses['align-items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['col-6']} */ ;
/** @type {__VLS_StyleScopedClasses['col-md-6']} */ ;
/** @type {__VLS_StyleScopedClasses['form-label']} */ ;
/** @type {__VLS_StyleScopedClasses['col-4']} */ ;
/** @type {__VLS_StyleScopedClasses['col-md-2']} */ ;
/** @type {__VLS_StyleScopedClasses['form-label']} */ ;
/** @type {__VLS_StyleScopedClasses['form-control']} */ ;
/** @type {__VLS_StyleScopedClasses['form-control-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['col-4']} */ ;
/** @type {__VLS_StyleScopedClasses['col-md-2']} */ ;
/** @type {__VLS_StyleScopedClasses['form-label']} */ ;
/** @type {__VLS_StyleScopedClasses['form-control']} */ ;
/** @type {__VLS_StyleScopedClasses['form-control-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['col-4']} */ ;
/** @type {__VLS_StyleScopedClasses['col-md-2']} */ ;
/** @type {__VLS_StyleScopedClasses['form-label']} */ ;
/** @type {__VLS_StyleScopedClasses['form-control']} */ ;
/** @type {__VLS_StyleScopedClasses['form-control-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['col-12']} */ ;
/** @type {__VLS_StyleScopedClasses['d-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-success']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
/** @type {__VLS_StyleScopedClasses['card']} */ ;
/** @type {__VLS_StyleScopedClasses['p-3']} */ ;
/** @type {__VLS_StyleScopedClasses['shadow-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['row']} */ ;
/** @type {__VLS_StyleScopedClasses['g-2']} */ ;
/** @type {__VLS_StyleScopedClasses['col-6']} */ ;
/** @type {__VLS_StyleScopedClasses['col-md-2']} */ ;
/** @type {__VLS_StyleScopedClasses['form-label']} */ ;
/** @type {__VLS_StyleScopedClasses['form-control']} */ ;
/** @type {__VLS_StyleScopedClasses['form-control-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['col-6']} */ ;
/** @type {__VLS_StyleScopedClasses['col-md-2']} */ ;
/** @type {__VLS_StyleScopedClasses['form-label']} */ ;
/** @type {__VLS_StyleScopedClasses['form-control']} */ ;
/** @type {__VLS_StyleScopedClasses['form-control-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['col-6']} */ ;
/** @type {__VLS_StyleScopedClasses['col-md-2']} */ ;
/** @type {__VLS_StyleScopedClasses['form-label']} */ ;
/** @type {__VLS_StyleScopedClasses['form-control']} */ ;
/** @type {__VLS_StyleScopedClasses['form-control-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['col-6']} */ ;
/** @type {__VLS_StyleScopedClasses['col-md-2']} */ ;
/** @type {__VLS_StyleScopedClasses['form-label']} */ ;
/** @type {__VLS_StyleScopedClasses['form-control']} */ ;
/** @type {__VLS_StyleScopedClasses['form-control-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['col-6']} */ ;
/** @type {__VLS_StyleScopedClasses['col-md-2']} */ ;
/** @type {__VLS_StyleScopedClasses['form-label']} */ ;
/** @type {__VLS_StyleScopedClasses['form-select']} */ ;
/** @type {__VLS_StyleScopedClasses['form-select-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['col-6']} */ ;
/** @type {__VLS_StyleScopedClasses['col-md-2']} */ ;
/** @type {__VLS_StyleScopedClasses['form-label']} */ ;
/** @type {__VLS_StyleScopedClasses['form-control']} */ ;
/** @type {__VLS_StyleScopedClasses['form-control-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['col-12']} */ ;
/** @type {__VLS_StyleScopedClasses['d-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
/** @type {__VLS_StyleScopedClasses['card']} */ ;
/** @type {__VLS_StyleScopedClasses['p-3']} */ ;
/** @type {__VLS_StyleScopedClasses['shadow-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['row']} */ ;
/** @type {__VLS_StyleScopedClasses['g-2']} */ ;
/** @type {__VLS_StyleScopedClasses['col-6']} */ ;
/** @type {__VLS_StyleScopedClasses['col-md-2']} */ ;
/** @type {__VLS_StyleScopedClasses['form-label']} */ ;
/** @type {__VLS_StyleScopedClasses['form-control']} */ ;
/** @type {__VLS_StyleScopedClasses['form-control-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['col-6']} */ ;
/** @type {__VLS_StyleScopedClasses['col-md-2']} */ ;
/** @type {__VLS_StyleScopedClasses['form-label']} */ ;
/** @type {__VLS_StyleScopedClasses['form-control']} */ ;
/** @type {__VLS_StyleScopedClasses['form-control-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['col-6']} */ ;
/** @type {__VLS_StyleScopedClasses['col-md-4']} */ ;
/** @type {__VLS_StyleScopedClasses['form-label']} */ ;
/** @type {__VLS_StyleScopedClasses['form-control']} */ ;
/** @type {__VLS_StyleScopedClasses['form-control-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['col-6']} */ ;
/** @type {__VLS_StyleScopedClasses['col-md-4']} */ ;
/** @type {__VLS_StyleScopedClasses['form-label']} */ ;
/** @type {__VLS_StyleScopedClasses['form-select']} */ ;
/** @type {__VLS_StyleScopedClasses['form-select-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['col-12']} */ ;
/** @type {__VLS_StyleScopedClasses['d-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-warning']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['table-responsive']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-3']} */ ;
/** @type {__VLS_StyleScopedClasses['table']} */ ;
/** @type {__VLS_StyleScopedClasses['table-hover']} */ ;
/** @type {__VLS_StyleScopedClasses['align-middle']} */ ;
/** @type {__VLS_StyleScopedClasses['small']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-0']} */ ;
/** @type {__VLS_StyleScopedClasses['table-light']} */ ;
/** @type {__VLS_StyleScopedClasses['text-center']} */ ;
/** @type {__VLS_StyleScopedClasses['text-center']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-link']} */ ;
/** @type {__VLS_StyleScopedClasses['text-danger']} */ ;
/** @type {__VLS_StyleScopedClasses['p-1']} */ ;
/** @type {__VLS_StyleScopedClasses['bi']} */ ;
/** @type {__VLS_StyleScopedClasses['bi-trash-fill']} */ ;
/** @type {__VLS_StyleScopedClasses['modal']} */ ;
/** @type {__VLS_StyleScopedClasses['fade']} */ ;
/** @type {__VLS_StyleScopedClasses['show']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-dialog']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-content']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-header']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-title']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-close']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-body']} */ ;
/** @type {__VLS_StyleScopedClasses['form-control']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-footer']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-secondary']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['modal']} */ ;
/** @type {__VLS_StyleScopedClasses['fade']} */ ;
/** @type {__VLS_StyleScopedClasses['show']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-dialog']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-content']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-header']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-title']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-close']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-body']} */ ;
/** @type {__VLS_StyleScopedClasses['form-control']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-footer']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-secondary']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-success']} */ ;
var __VLS_dollars;
let __VLS_self;
