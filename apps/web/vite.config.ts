import vinext from "vinext";
import { defineConfig } from "vite";

export default defineConfig({
  server: {
    host: "127.0.0.1",
  },
  optimizeDeps: {
    exclude: ["@base-ui/react", "lucide-react"],
  },
  plugins: [vinext({ react: { compiler: true } })],
});
