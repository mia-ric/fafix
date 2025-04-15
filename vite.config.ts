import pkg from './package.json' with { type: 'json' };

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

const dev = process.argv.includes('--watch');

const banner = `// ==UserScript==
// @name         FaFiX - FanFiktion Extension
// @namespace    https://mia-ric.github.io
// @version      ${pkg.version}
// @description  A FanFiktion-related TamperMonkey script.
// @author       MIA${dev ? `\n// @require      http://localhost:7878/fafix.js` : ''}
// @resource     customCSS ${dev ? `http://localhost:7878/fafix.css` : 'https://mia-ric.github.io/fafix.css'}
// @downloadURL  https://mia-ric.github.io/fafix.js
// @updateURL    https://mia-ric.github.io/fafix.js
// @match        https://www.fanfiktion.de/*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        GM_getResourceText
// @grant        GM_addStyle
// ==/UserScript==`;

// https://vite.dev/config/
export default defineConfig({
    plugins: [vue()],
    build: {
        outDir: 'dist',
        minify: !dev, 
        lib: {
            entry: 'src/script.ts',
            name: 'FaFiX',
            formats: ['iife']
        },
        rollupOptions: {
            output: {
                entryFileNames: 'fafix.js',
                //banner: banner.trim(), // rollup strips non-/*! */ comments
            },
            external: ['GM'],
            plugins: [
                {
                    name: 'custom-banner',
                    generateBundle(options, bundle) {
                        for (const file of Object.values(bundle)) {
                            if (file.type === 'chunk') {
                                file.code = banner.trim() + "\n" + file.code;
                            }
                        }
                    }
                }
            ]
        },
    },
    define: {
        'process.env.NODE_ENV': JSON.stringify('dev'),
    },
});
