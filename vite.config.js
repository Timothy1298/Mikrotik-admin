import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
export default defineConfig({
    plugins: [react()],
    build: {
        rollupOptions: {
            output: {
                manualChunks: function (id) {
                    if (!id.includes("node_modules"))
                        return undefined;
                    if (/node_modules\/(react|react-dom|scheduler)\//.test(id))
                        return "react-vendor";
                    if (id.includes("@tanstack"))
                        return "tanstack-vendor";
                    if (id.includes("recharts") || id.includes("d3-"))
                        return "charts-vendor";
                    if (id.includes("@xterm") || id.includes("/xterm"))
                        return "terminal-vendor";
                    if (id.includes("dayjs") || id.includes("lucide-react"))
                        return "ui-vendor";
                    return "vendor";
                },
            },
        },
    },
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
    server: {
        port: 5173,
        host: "0.0.0.0",
    },
});
