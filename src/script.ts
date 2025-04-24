import './styles/theme.css';
import { createApp } from 'vue';
import Charts from './components/Charts/Charts.vue';
import Overlay from './components/Overlay/Overlay.vue';
import Editor from './components/TipTap/Editor.vue';
import prepareDemo from './core/prepare-demo';
import manageBooks from './core/manage-books';
import manageFavicon from './core/manage-favicon';
import manageStatistics from './core/manage-statistics';
import ready from './utils/ready';
import select from './utils/select';

/**
 * Main Runtime Handler
 */
async function main() {
    if (import.meta.env.PROD && !select('[title="Mein Profil"]')) {
        console.error('FAFIX: Du bist nicht angemeldet.');
        return;
    }

    // Load Assets
    if (import.meta.env.PROD) {
        let style = document.createElement('link');
        style.rel = 'stylesheet';
        style.type = 'text/css';
        style.href = DEPLOYMENT_SERVE ? 'http://localhost:7878/fafix.css' : 'https://mia-ric.github.io/fafix.css';
        document.head.append(style);
    } else {
        await prepareDemo();
        let charts = select('.charts');
        if (charts) {
            createApp(Charts).mount(charts);
        }
    }

    // Store Books Data
    if (window.location.search.includes('a=b')) {
        await ready();
        await manageBooks();
    }

    // Store Statistics Data
    if (window.location.pathname.startsWith('/stats')) {
        await ready();
        await manageStatistics();
    }

    // Append Stats Component
    if (window.location.pathname.startsWith('/stats') && !window.location.hash.includes('fafix:updater')) {
        let statsTitle = select('h2');
        if (statsTitle && statsTitle.parentElement) {
            const statsChart = document.createElement('div');
            statsTitle.parentElement.insertBefore(statsChart, statsTitle.nextElementSibling?.nextElementSibling || null);
            createApp(Charts).mount(statsChart);
        }
    }

    // Append FAFIX Overlay
    if (!window.location.hash.includes('fafix:updater')) {
        let overlay = document.createElement('div');
        overlay.style = `width:0;height:0;display:contents;`;
        document.body.append(overlay);
        createApp(Overlay).mount(overlay) as any;
    }

    // Append TipTap Editor
    let textarea = select('#textarea-chapter');
    if (textarea && textarea.parentElement && !window.location.hash.includes('fafix:updater')) {
        const vueContainer = document.createElement('div');
        textarea.parentElement.append(vueContainer);

        const app = createApp(Editor);
        const instance = app.mount(vueContainer) as any;
        instance.setTextarea(textarea);
    }

    // Handle Favicon
    if (!window.location.hash.includes('fafix:updater')) {
        manageFavicon();
    }

    // Close Window when used for updating purposes only
    if (window.location.hash === '#fafix:updater') {
        window.close();
    }
}
main();
