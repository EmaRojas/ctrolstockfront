import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import fs from "fs";
import path from "path";

export default defineConfig({
  plugins: [vue()],
  server: {
    host: true, // accesible desde otros dispositivos
    https: {
      key: fs.readFileSync(path.resolve(__dirname, "certs/192.168.0.105-key.pem")),
      cert: fs.readFileSync(path.resolve(__dirname, "certs/192.168.0.105.pem")),
    },
  },
});
