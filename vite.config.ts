import { defineConfig } from "vite";

export default defineConfig({
  base: "/", // user site on a custom domain, served at the root
  build: {
    rollupOptions: {
      input: { main: "index.html", desk: "desk/index.html" },
    },
  },
});
