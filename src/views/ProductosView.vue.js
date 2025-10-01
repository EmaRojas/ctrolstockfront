import { defineComponent, nextTick } from "vue";
import { BrowserBarcodeReader } from "@zxing/library";
import { getProducts, createProduct, updateProduct, deleteProduct } from "../services/productService";
import { useLoaderStore } from '../stores/loaderStore.js';
export default defineComponent({
    name: "ProductosView",
    data() {
        return {
            products: [],
            showForm: false,
            scannerVisible: false,
            scanner: null,
            form: { barcode: "", name: "", price: 0, stock: 0, cost: 0, _id: null },
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
                        this.$refs.barcodeInput.focus();
                    }
                });
            }
            else {
                this.resetForm();
            }
        },
        resetForm() {
            this.form = { barcode: "", name: "", price: 0, stock: 0, cost: 0, _id: null };
        },
        editProduct(product) {
            this.showForm = true;
            this.form = { ...product };
        },
        async saveProduct() {
            if (this.form._id) {
                await updateProduct(this.form._id, this.form);
            }
            else {
                await createProduct(this.form);
            }
            await this.loadProducts();
            this.toggleForm();
        },
        async removeProduct(id) {
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
                .decodeOnceFromVideoDevice(undefined, this.$refs.videoPreview)
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
        formatCurrency(value) {
            return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(value);
        },
    },
});
debugger; /* PartiallyEnd: #3632/script.vue */
const __VLS_ctx = {};
let __VLS_elements;
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['scanner-modal']} */ ;
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
__VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
    ...{ onClick: (__VLS_ctx.toggleForm) },
    ...{ class: "btn btn-primary d-flex align-items-center" },
});
// @ts-ignore
[toggleForm,];
__VLS_asFunctionalElement(__VLS_elements.i, __VLS_elements.i)({
    ...{ class: "bi" },
    ...{ class: (__VLS_ctx.showForm ? 'bi-x-lg' : 'bi-plus-lg') },
});
// @ts-ignore
[showForm,];
__VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
    ...{ class: "ms-2 d-none d-md-inline" },
});
(__VLS_ctx.showForm ? 'Cancelar' : 'Agregar');
// @ts-ignore
[showForm,];
if (__VLS_ctx.showForm) {
    // @ts-ignore
    [showForm,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "card p-3 mb-3 shadow-sm" },
    });
    __VLS_asFunctionalElement(__VLS_elements.form, __VLS_elements.form)({
        ...{ onSubmit: (__VLS_ctx.saveProduct) },
        ...{ class: "row g-2" },
    });
    // @ts-ignore
    [saveProduct,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "col-12 col-md-6" },
    });
    __VLS_asFunctionalElement(__VLS_elements.label, __VLS_elements.label)({
        ...{ class: "form-label small" },
    });
    __VLS_asFunctionalElement(__VLS_elements.input)({
        ...{ onFocus: (__VLS_ctx.onBarcodeFocus) },
        ref: "barcodeInput",
        value: (__VLS_ctx.form.barcode),
        type: "text",
        ...{ class: "form-control form-control-sm" },
        placeholder: "Ej: 123456789012",
        readonly: (__VLS_ctx.isMobile()),
    });
    /** @type {typeof __VLS_ctx.barcodeInput} */ ;
    // @ts-ignore
    [onBarcodeFocus, form, isMobile, barcodeInput,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "col-12 col-md-6" },
    });
    __VLS_asFunctionalElement(__VLS_elements.label, __VLS_elements.label)({
        ...{ class: "form-label small" },
    });
    __VLS_asFunctionalElement(__VLS_elements.input)({
        value: (__VLS_ctx.form.name),
        type: "text",
        ...{ class: "form-control form-control-sm" },
        placeholder: "Ej: Lápiz",
    });
    // @ts-ignore
    [form,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "col-6 col-md-3" },
    });
    __VLS_asFunctionalElement(__VLS_elements.label, __VLS_elements.label)({
        ...{ class: "form-label small" },
    });
    __VLS_asFunctionalElement(__VLS_elements.input)({
        type: "number",
        ...{ class: "form-control form-control-sm" },
    });
    (__VLS_ctx.form.price);
    // @ts-ignore
    [form,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "col-6 col-md-3" },
    });
    __VLS_asFunctionalElement(__VLS_elements.label, __VLS_elements.label)({
        ...{ class: "form-label small" },
    });
    __VLS_asFunctionalElement(__VLS_elements.input)({
        type: "number",
        ...{ class: "form-control form-control-sm" },
    });
    (__VLS_ctx.form.stock);
    // @ts-ignore
    [form,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "col-6 col-md-3" },
    });
    __VLS_asFunctionalElement(__VLS_elements.label, __VLS_elements.label)({
        ...{ class: "form-label small" },
    });
    __VLS_asFunctionalElement(__VLS_elements.input)({
        type: "number",
        ...{ class: "form-control form-control-sm" },
    });
    (__VLS_ctx.form.cost);
    // @ts-ignore
    [form,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "col-6 col-md-3 d-grid" },
    });
    __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
        type: "submit",
        ...{ class: "btn btn-success btn-sm mt-4" },
    });
    __VLS_asFunctionalElement(__VLS_elements.i, __VLS_elements.i)({
        ...{ class: "bi bi-check2-circle" },
    });
}
if (__VLS_ctx.scannerVisible) {
    // @ts-ignore
    [scannerVisible,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "scanner-modal" },
    });
    __VLS_asFunctionalElement(__VLS_elements.video, __VLS_elements.video)({
        ref: "videoPreview",
        autoplay: true,
        muted: true,
        playsinline: true,
    });
    /** @type {typeof __VLS_ctx.videoPreview} */ ;
    // @ts-ignore
    [videoPreview,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "scanner-overlay" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "scan-line" },
    });
    __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
        ...{ onClick: (__VLS_ctx.stopScanner) },
        ...{ class: "btn btn-danger mt-2" },
    });
    // @ts-ignore
    [stopScanner,];
    __VLS_asFunctionalElement(__VLS_elements.i, __VLS_elements.i)({
        ...{ class: "bi bi-x-circle" },
    });
}
__VLS_asFunctionalElement(__VLS_elements.table, __VLS_elements.table)({
    ...{ class: "table table-hover align-middle small" },
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
__VLS_asFunctionalElement(__VLS_elements.th, __VLS_elements.th)({
    ...{ class: "text-center" },
});
__VLS_asFunctionalElement(__VLS_elements.tbody, __VLS_elements.tbody)({});
for (const [p] of __VLS_getVForSourceType((__VLS_ctx.products))) {
    // @ts-ignore
    [products,];
    __VLS_asFunctionalElement(__VLS_elements.tr, __VLS_elements.tr)({
        key: (p._id),
    });
    __VLS_asFunctionalElement(__VLS_elements.td, __VLS_elements.td)({});
    (p.barcode);
    __VLS_asFunctionalElement(__VLS_elements.td, __VLS_elements.td)({});
    (p.name);
    __VLS_asFunctionalElement(__VLS_elements.td, __VLS_elements.td)({});
    (__VLS_ctx.formatCurrency(p.price));
    // @ts-ignore
    [formatCurrency,];
    __VLS_asFunctionalElement(__VLS_elements.td, __VLS_elements.td)({});
    (p.stock);
    __VLS_asFunctionalElement(__VLS_elements.td, __VLS_elements.td)({});
    (__VLS_ctx.formatCurrency(p.cost));
    // @ts-ignore
    [formatCurrency,];
    __VLS_asFunctionalElement(__VLS_elements.td, __VLS_elements.td)({
        ...{ class: "text-center" },
    });
    __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.editProduct(p);
                // @ts-ignore
                [editProduct,];
            } },
        ...{ class: "btn btn-link p-1 text-warning" },
    });
    __VLS_asFunctionalElement(__VLS_elements.i, __VLS_elements.i)({
        ...{ class: "bi bi-pencil-fill" },
    });
    __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.removeProduct(p._id);
                // @ts-ignore
                [removeProduct,];
            } },
        ...{ class: "btn btn-link p-1 text-danger" },
    });
    __VLS_asFunctionalElement(__VLS_elements.i, __VLS_elements.i)({
        ...{ class: "bi bi-trash-fill" },
    });
}
if (!__VLS_ctx.showForm && __VLS_ctx.isMobile()) {
    // @ts-ignore
    [showForm, isMobile,];
    __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
        ...{ onClick: (__VLS_ctx.toggleForm) },
        ...{ class: "btn btn-primary btn-float d-flex align-items-center justify-content-center" },
    });
    // @ts-ignore
    [toggleForm,];
    __VLS_asFunctionalElement(__VLS_elements.i, __VLS_elements.i)({
        ...{ class: "bi bi-plus-lg" },
    });
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
/** @type {__VLS_StyleScopedClasses['d-flex']} */ ;
/** @type {__VLS_StyleScopedClasses['align-items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['bi']} */ ;
/** @type {__VLS_StyleScopedClasses['ms-2']} */ ;
/** @type {__VLS_StyleScopedClasses['d-none']} */ ;
/** @type {__VLS_StyleScopedClasses['d-md-inline']} */ ;
/** @type {__VLS_StyleScopedClasses['card']} */ ;
/** @type {__VLS_StyleScopedClasses['p-3']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-3']} */ ;
/** @type {__VLS_StyleScopedClasses['shadow-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['row']} */ ;
/** @type {__VLS_StyleScopedClasses['g-2']} */ ;
/** @type {__VLS_StyleScopedClasses['col-12']} */ ;
/** @type {__VLS_StyleScopedClasses['col-md-6']} */ ;
/** @type {__VLS_StyleScopedClasses['form-label']} */ ;
/** @type {__VLS_StyleScopedClasses['small']} */ ;
/** @type {__VLS_StyleScopedClasses['form-control']} */ ;
/** @type {__VLS_StyleScopedClasses['form-control-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['col-12']} */ ;
/** @type {__VLS_StyleScopedClasses['col-md-6']} */ ;
/** @type {__VLS_StyleScopedClasses['form-label']} */ ;
/** @type {__VLS_StyleScopedClasses['small']} */ ;
/** @type {__VLS_StyleScopedClasses['form-control']} */ ;
/** @type {__VLS_StyleScopedClasses['form-control-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['col-6']} */ ;
/** @type {__VLS_StyleScopedClasses['col-md-3']} */ ;
/** @type {__VLS_StyleScopedClasses['form-label']} */ ;
/** @type {__VLS_StyleScopedClasses['small']} */ ;
/** @type {__VLS_StyleScopedClasses['form-control']} */ ;
/** @type {__VLS_StyleScopedClasses['form-control-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['col-6']} */ ;
/** @type {__VLS_StyleScopedClasses['col-md-3']} */ ;
/** @type {__VLS_StyleScopedClasses['form-label']} */ ;
/** @type {__VLS_StyleScopedClasses['small']} */ ;
/** @type {__VLS_StyleScopedClasses['form-control']} */ ;
/** @type {__VLS_StyleScopedClasses['form-control-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['col-6']} */ ;
/** @type {__VLS_StyleScopedClasses['col-md-3']} */ ;
/** @type {__VLS_StyleScopedClasses['form-label']} */ ;
/** @type {__VLS_StyleScopedClasses['small']} */ ;
/** @type {__VLS_StyleScopedClasses['form-control']} */ ;
/** @type {__VLS_StyleScopedClasses['form-control-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['col-6']} */ ;
/** @type {__VLS_StyleScopedClasses['col-md-3']} */ ;
/** @type {__VLS_StyleScopedClasses['d-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-success']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
/** @type {__VLS_StyleScopedClasses['bi']} */ ;
/** @type {__VLS_StyleScopedClasses['bi-check2-circle']} */ ;
/** @type {__VLS_StyleScopedClasses['scanner-modal']} */ ;
/** @type {__VLS_StyleScopedClasses['scanner-overlay']} */ ;
/** @type {__VLS_StyleScopedClasses['scan-line']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-danger']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
/** @type {__VLS_StyleScopedClasses['bi']} */ ;
/** @type {__VLS_StyleScopedClasses['bi-x-circle']} */ ;
/** @type {__VLS_StyleScopedClasses['table']} */ ;
/** @type {__VLS_StyleScopedClasses['table-hover']} */ ;
/** @type {__VLS_StyleScopedClasses['align-middle']} */ ;
/** @type {__VLS_StyleScopedClasses['small']} */ ;
/** @type {__VLS_StyleScopedClasses['table-light']} */ ;
/** @type {__VLS_StyleScopedClasses['text-center']} */ ;
/** @type {__VLS_StyleScopedClasses['text-center']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-link']} */ ;
/** @type {__VLS_StyleScopedClasses['p-1']} */ ;
/** @type {__VLS_StyleScopedClasses['text-warning']} */ ;
/** @type {__VLS_StyleScopedClasses['bi']} */ ;
/** @type {__VLS_StyleScopedClasses['bi-pencil-fill']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-link']} */ ;
/** @type {__VLS_StyleScopedClasses['p-1']} */ ;
/** @type {__VLS_StyleScopedClasses['text-danger']} */ ;
/** @type {__VLS_StyleScopedClasses['bi']} */ ;
/** @type {__VLS_StyleScopedClasses['bi-trash-fill']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-float']} */ ;
/** @type {__VLS_StyleScopedClasses['d-flex']} */ ;
/** @type {__VLS_StyleScopedClasses['align-items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-content-center']} */ ;
/** @type {__VLS_StyleScopedClasses['bi']} */ ;
/** @type {__VLS_StyleScopedClasses['bi-plus-lg']} */ ;
var __VLS_dollars;
let __VLS_self;
