import { defineConfig } from "tsup"

export default defineConfig({
    entry: ["lib.ts"],
    format: ["cjs", "esm"],
    dts: true,
    clean: true,
    outDir: "dist",
    target: "es2020",
    outExtension({ format }) {
        if (format === "cjs") {
            return { js: ".cjs" }
        }
        if (format === "esm") {
            return { js: ".mjs" }
        }
        return { js: ".js" }
    },
})

