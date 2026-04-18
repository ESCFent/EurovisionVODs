// @ts-check
import { defineConfig, fontProviders } from "astro/config";
import { viteStaticCopy } from "vite-plugin-static-copy";

// https://astro.build/config
export default defineConfig({
    experimental: {
        fonts: [{
            provider: fontProviders.bunny(),
            name: "Inter",
            cssVariable: "--font-inter",
            weights: [400, 700],
            subsets: ["latin", "latin-ext"]
        }]
    },
    vite: {
        plugins: [
            viteStaticCopy({
                targets: [
                    {
                        src: "src/shows/_thumbnails",
                        dest: "."
                    }
                ]
            })
        ]
    }
});