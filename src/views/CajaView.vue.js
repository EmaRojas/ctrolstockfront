import { defineComponent, nextTick } from "vue";
import { BrowserBarcodeReader } from "@zxing/library";
import Multiselect from "vue-multiselect";
import { getProducts } from "../services/productService"; // tu servicio existente
export default defineComponent({
    name: "CajaView",
    components: { Multiselect },
    data() {
        return {
            productosOptions: [],
            selectedProduct: null,
            cantidad: 1,
            carrito: [],
            scannerVisible: false,
            scanner: null,
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
                .decodeOnceFromVideoDevice(undefined, this.$refs.videoPreview)
                .then(result => {
                // Buscar producto por código de barras
                const producto = this.productosOptions.find(p => p.barcode === result.getText());
                if (producto) {
                    this.selectedProduct = producto;
                }
                else {
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
            if (!this.selectedProduct)
                return;
            this.carrito.push({ ...this.selectedProduct, cantidad: this.cantidad });
            this.selectedProduct = null;
            this.cantidad = 1;
        },
        removeItem(index) {
            this.carrito.splice(index, 1);
        },
    },
});
debugger; /* PartiallyEnd: #3632/script.vue */
const __VLS_ctx = {};
let __VLS_elements;
const __VLS_componentsOption = { Multiselect };
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
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "mb-3" },
});
__VLS_asFunctionalElement(__VLS_elements.label, __VLS_elements.label)({
    ...{ class: "form-label small" },
});
const __VLS_0 = {}.Multiselect;
/** @type {[typeof __VLS_components.Multiselect, ]} */ ;
// @ts-ignore
Multiselect;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ 'onClick': {} },
    modelValue: (__VLS_ctx.selectedProduct),
    options: (__VLS_ctx.productosOptions),
    placeholder: "Seleccione producto o escanee",
    label: "name",
    trackBy: "barcode",
    searchable: (true),
    closeOnSelect: (true),
}));
const __VLS_2 = __VLS_1({
    ...{ 'onClick': {} },
    modelValue: (__VLS_ctx.selectedProduct),
    options: (__VLS_ctx.productosOptions),
    placeholder: "Seleccione producto o escanee",
    label: "name",
    trackBy: "barcode",
    searchable: (true),
    closeOnSelect: (true),
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_4;
let __VLS_5;
const __VLS_6 = ({ click: {} },
    { onClick: (__VLS_ctx.onBarcodeClick) });
// @ts-ignore
[selectedProduct, productosOptions, onBarcodeClick,];
var __VLS_3;
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "mb-3" },
});
__VLS_asFunctionalElement(__VLS_elements.label, __VLS_elements.label)({
    ...{ class: "form-label small" },
});
__VLS_asFunctionalElement(__VLS_elements.input)({
    type: "number",
    ...{ class: "form-control form-control-sm" },
});
(__VLS_ctx.cantidad);
// @ts-ignore
[cantidad,];
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "mb-3 d-grid" },
});
__VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
    ...{ onClick: (__VLS_ctx.agregarProducto) },
    ...{ class: "btn btn-success" },
});
// @ts-ignore
[agregarProducto,];
__VLS_asFunctionalElement(__VLS_elements.i, __VLS_elements.i)({
    ...{ class: "bi bi-plus-circle" },
});
if (__VLS_ctx.carrito.length) {
    // @ts-ignore
    [carrito,];
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
    __VLS_asFunctionalElement(__VLS_elements.th, __VLS_elements.th)({
        ...{ class: "text-center" },
    });
    __VLS_asFunctionalElement(__VLS_elements.tbody, __VLS_elements.tbody)({});
    for (const [item, index] of __VLS_getVForSourceType((__VLS_ctx.carrito))) {
        // @ts-ignore
        [carrito,];
        __VLS_asFunctionalElement(__VLS_elements.tr, __VLS_elements.tr)({
            key: (index),
        });
        __VLS_asFunctionalElement(__VLS_elements.td, __VLS_elements.td)({});
        (item.name);
        __VLS_asFunctionalElement(__VLS_elements.td, __VLS_elements.td)({});
        (item.barcode);
        __VLS_asFunctionalElement(__VLS_elements.td, __VLS_elements.td)({});
        (item.cantidad);
        __VLS_asFunctionalElement(__VLS_elements.td, __VLS_elements.td)({
            ...{ class: "text-center" },
        });
        __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.carrito.length))
                        return;
                    __VLS_ctx.removeItem(index);
                    // @ts-ignore
                    [removeItem,];
                } },
            ...{ class: "btn btn-link p-1 text-danger" },
        });
        __VLS_asFunctionalElement(__VLS_elements.i, __VLS_elements.i)({
            ...{ class: "bi bi-trash-fill" },
        });
    }
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
/** @type {__VLS_StyleScopedClasses['mb-3']} */ ;
/** @type {__VLS_StyleScopedClasses['form-label']} */ ;
/** @type {__VLS_StyleScopedClasses['small']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-3']} */ ;
/** @type {__VLS_StyleScopedClasses['form-label']} */ ;
/** @type {__VLS_StyleScopedClasses['small']} */ ;
/** @type {__VLS_StyleScopedClasses['form-control']} */ ;
/** @type {__VLS_StyleScopedClasses['form-control-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-3']} */ ;
/** @type {__VLS_StyleScopedClasses['d-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-success']} */ ;
/** @type {__VLS_StyleScopedClasses['bi']} */ ;
/** @type {__VLS_StyleScopedClasses['bi-plus-circle']} */ ;
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
/** @type {__VLS_StyleScopedClasses['text-danger']} */ ;
/** @type {__VLS_StyleScopedClasses['bi']} */ ;
/** @type {__VLS_StyleScopedClasses['bi-trash-fill']} */ ;
/** @type {__VLS_StyleScopedClasses['scanner-modal']} */ ;
/** @type {__VLS_StyleScopedClasses['scanner-overlay']} */ ;
/** @type {__VLS_StyleScopedClasses['scan-line']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-danger']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
/** @type {__VLS_StyleScopedClasses['bi']} */ ;
/** @type {__VLS_StyleScopedClasses['bi-x-circle']} */ ;
var __VLS_dollars;
let __VLS_self;
