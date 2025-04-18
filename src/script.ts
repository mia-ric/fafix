import './styles/theme.css';
import { createApp } from 'vue';
import Charts from './components/Charts.vue';
import Editor from './components/Editor.vue';
import prepareDemo from './core/prepare-demo';
import manageBooks from './core/manage-books';
import manageStatistics from './core/manage-statistics';
import manageUpdater from './core/manage-updater';
import ready from './utils/ready';
import select from './utils/select';

/**
 * Main Runtime Handler
 */
async function main() {
    if (!select('[title="Mein Profil"]')) {
        console.error('FAFIX: Du bist nicht angemeldet.');
        return;
    }

    // Load Assets
    if (import.meta.env.PROD) {
        GM_addStyle(GM_getResourceText("customCSS"));
    } else {
        await prepareDemo();
        let charts = select('.charts');
        if (charts) {
            createApp(Charts).mount(charts);
        }
    }

    // Append TipTap Editor
    let textarea = select('#textarea-chapter');
    if (textarea && textarea.parentElement) {
        const vueContainer = document.createElement('div');
        textarea.parentElement.append(vueContainer);

        const app = createApp(Editor);
        const instance = app.mount(vueContainer) as any;
        instance.setTextarea(textarea);
    }

    // Store Force Update
    if (!window.location.pathname.startsWith('/?a=b') && !window.location.pathname.startsWith('/stats')) {
        await manageUpdater();
    }

    // Store Books
    if (!window.location.pathname.startsWith('/?a=b')) {
        await ready();
        await manageBooks();
    }

    // Store Statistics
    if (window.location.pathname.startsWith('/stats')) {
        await ready();
        await manageStatistics();

        // Append Stats Component
        let statsTitle = select('h2');
        if (statsTitle && statsTitle.parentElement) {
            const statsChart = document.createElement('div');
            statsTitle.parentElement.insertBefore(statsChart, statsTitle.nextElementSibling?.nextElementSibling || null);
            createApp(Charts).mount(statsChart);
        }
    }

    // Close Window when used for updating purposes only
    if (window.location.hash === '#fafix:updater') {
        window.close();
    }
}
main();
