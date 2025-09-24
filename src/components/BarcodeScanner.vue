<template>
  <div class="scanner-container">
    <video ref="video" class="scanner-video"></video>
    <p v-if="error" class="text-danger">{{ error }}</p>
    <p v-if="codeDetected" class="text-success">
      ✅ Código detectado: {{ codeDetected }}
    </p>
  </div>
</template>

<script>
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
    if (this.codeReader) this.codeReader.reset();
  },

  methods: {
    async iniciarScanner() {
      this.codeReader = new BrowserMultiFormatReader();
      try {
        const devices = await BrowserMultiFormatReader.listVideoInputDevices();
        const deviceId = devices[devices.length - 1]?.deviceId; // cámara trasera

        await this.codeReader.decodeFromVideoDevice(
          deviceId,
          this.$refs.video,
          (result) => {
            if (result) {
              this.codeDetected = result.getText();
              this.$emit("on-detected", this.codeDetected);
              this.codeReader.reset(); // detener escaneo cuando detecta
            }
          }
        );
      } catch (e) {
        this.error =
          "No se pudo acceder a la cámara. Revisá permisos o usá HTTPS.";
        console.error(e);
      }
    },
  },
});
</script>

<style scoped>
.scanner-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 10px;
}
.scanner-video {
  width: 100%;
  max-width: 400px;
  border: 2px solid #ccc;
  border-radius: 8px;
}
</style>
