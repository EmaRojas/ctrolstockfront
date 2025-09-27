import { defineComponent } from "vue";
import { BrowserMultiFormatReader } from "@zxing/browser";
export default defineComponent({
    name: "BarcodeScanner",
    emits: ["on-detected"],
    data() {
        return {
            codeReader: null,
            codeDetected: null,
            error: null,
        };
    },
    mounted() {
        this.iniciarScanner();
    },
    beforeUnmount() {
        if (this.codeReader)
            this.codeReader.reset();
    },
    methods: {
        async iniciarScanner() {
            this.codeReader = new BrowserMultiFormatReader();
            try {
                const devices = await BrowserMultiFormatReader.listVideoInputDevices();
                const deviceId = devices[devices.length - 1]?.deviceId; // cámara trasera
                await this.codeReader.decodeFromVideoDevice(deviceId, this.$refs.video, (result) => {
                    if (result) {
                        this.codeDetected = result.getText();
                        this.$emit("on-detected", this.codeDetected);
                        this.codeReader.reset(); // detener escaneo cuando detecta
                    }
                });
            }
            catch (e) {
                this.error =
                    "No se pudo acceder a la cámara. Revisá permisos o usá HTTPS.";
                console.error(e);
            }
        },
    },
});
debugger; /* PartiallyEnd: #3632/script.vue */
const __VLS_ctx = {};
let __VLS_elements;
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "scanner-container" },
});
__VLS_asFunctionalElement(__VLS_elements.video, __VLS_elements.video)({
    ref: "video",
    ...{ class: "scanner-video" },
});
/** @type {typeof __VLS_ctx.video} */ ;
// @ts-ignore
[video,];
if (__VLS_ctx.error) {
    // @ts-ignore
    [error,];
    __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
        ...{ class: "text-danger" },
    });
    (__VLS_ctx.error);
    // @ts-ignore
    [error,];
}
if (__VLS_ctx.codeDetected) {
    // @ts-ignore
    [codeDetected,];
    __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
        ...{ class: "text-success" },
    });
    (__VLS_ctx.codeDetected);
    // @ts-ignore
    [codeDetected,];
}
/** @type {__VLS_StyleScopedClasses['scanner-container']} */ ;
/** @type {__VLS_StyleScopedClasses['scanner-video']} */ ;
/** @type {__VLS_StyleScopedClasses['text-danger']} */ ;
/** @type {__VLS_StyleScopedClasses['text-success']} */ ;
var __VLS_dollars;
let __VLS_self;
