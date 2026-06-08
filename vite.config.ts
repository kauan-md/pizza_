import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  envPrefix: ["VITE_", "NEXT_PUBLIC_", "NEXT_"],
  plugins: [
    tanstackStart({
      server: { entry: "server" },
      router: {
        autoCodeSplitting: true,
      },
      spa: {
        enabled: true,
        maskPath: "/",
      },
    }),
    react(),
    tailwindcss(),
    tsconfigPaths(),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    host: true,
  },
  preview: {
    host: true,
  },
});
