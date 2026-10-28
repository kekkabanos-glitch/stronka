import { defineConfig } from 'astro/config';
import vue from '@astrojs/vue';
import tailwind from '@astrojs/tailwind';
import compress from 'astro-compress';

export default defineConfig({
    scopedStyleStrategy: 'where',
    integrations: [
        vue(),
        tailwind(),
        compress({
            HTML: {
                removeComments: true,
                collapseWhitespace: true,
                removeAttributeQuotes: false,
                customAttrSurround: [],
            },
            CSS: true,
            JavaScript: true,
            SVG: true,
        }),
    ],
    site: 'https://logarytmika.pl',
    compressHTML: true,

    build: {
        inlineStylesheets: 'auto',
        assets: 'files',
    },

    vite: {
        build: {
            minify: 'esbuild',
            cssMinify: true,
        },
    },
});