import vinext from "vinext";
import { defineConfig } from "vite";

export default defineConfig({
  optimizeDeps: {
    exclude: ["@base-ui/react", "lucide-react"],
  },
  plugins: [vinext()],
});
