import './styles/theme.css';
import { createApp } from 'vue';
import Editor from './components/Editor.vue';
import ready from './utils/ready';
import { storeStatistic, type StatisticValues } from './stores/statistics';
import { installDemonstrationData } from './utils/demo';
import Charts from './components/Charts.vue';

async function main() {
    if (import.meta.env.PROD) {
        ///@ts-ignore
        const css = GM_getResourceText("customCSS");
        ///@ts-ignore
        GM_addStyle(css);
    }

    // Append TipTap Editor
    let textarea = document.querySelector('#textarea-chapter');
    if (textarea && textarea.parentElement) {
        const vueContainer = document.createElement('div');
        textarea.parentElement.append(vueContainer);

        const app = createApp(Editor);
        const instance = app.mount(vueContainer) as any;
        instance.setTextarea(textarea);
    }

    // Append Charts
    if (import.meta.env.DEV) {
        await installDemonstrationData();

        let charts = document.querySelector('.charts');
        if (charts) {
            const app = createApp(Charts);
            const instance = app.mount(charts) as any;
        }
    }

    // Store Statistics
    if (window.location.pathname.startsWith('/stats')) {
        await ready();
        const storyList = document.querySelector('.container-storylist');
        if (storyList) {
            Array.from(storyList.querySelectorAll('tbody tr')).map(async row => {
                let titleColumn = row.querySelector(`[data-ff-sort-colname="title_catname_statusinfo"]`) as HTMLElement|null;
                if (!titleColumn) {
                    return;
                }

                let title = (titleColumn.dataset.ffSortVal || '').trim();
                if (!title) {
                    return;
                }

                let link = titleColumn.querySelector('a')?.href || null;
                if (!link) {
                    return;
                }

                let chapterColumn = row.querySelector(`[data-ff-sort-colname="chaptercount"]`) as HTMLElement|null;
                let storyLenColumn = row.querySelector(`[data-ff-sort-colname="storylen"]`) as HTMLElement|null;
                let reviewsColumn = row.querySelector(`[data-ff-sort-colname="reviewcount"]`) as HTMLElement|null;
                let recommendationsColumn = row.querySelector(`[data-ff-sort-colname="recommendationcount"]`) as HTMLElement|null;
                let viewsColumn = row.querySelector(`[data-ff-sort-colname="hits"]`) as HTMLElement|null;
                let favoritesColumn = row.querySelector(`[data-ff-sort-colname="favcount"]`) as HTMLElement|null;
                let bookmarkColumn = row.querySelector(`[data-ff-sort-colname="storybookmarkcount"]`) as HTMLElement|null;
                let offlineLibraryColumn = row.querySelector(`[data-ff-sort-colname="offlinelibrarycount"]`) as HTMLElement|null;
                let bookshelfColumn = row.querySelector(`[data-ff-sort-colname="bookshelfcount"]`) as HTMLElement|null;

                let stats: StatisticValues = {
                    chapters: chapterColumn ? parseInt(chapterColumn.dataset.ffSortVal as any) : 1,
                    words: storyLenColumn ? parseInt(storyLenColumn.dataset.ffSortVal as any) : 1,
                    reviews: reviewsColumn ? parseInt(reviewsColumn.dataset.ffSortVal as any) : 0,
                    recommendations: recommendationsColumn ? parseInt(recommendationsColumn.dataset.ffSortVal as any) : 0,
                    views: viewsColumn ? parseInt(viewsColumn.dataset.ffSortVal as any) : 0,
                    favorites: favoritesColumn ? parseInt(favoritesColumn.dataset.ffSortVal as any) : 0,
                    bookmarks: bookmarkColumn ? parseInt(bookmarkColumn.dataset.ffSortVal as any) : 0,
                    offlineLibraries: offlineLibraryColumn ? parseInt(offlineLibraryColumn.dataset.ffSortVal as any) : 0,
                    bookshelves: bookshelfColumn ? parseInt(bookshelfColumn.dataset.ffSortVal as any) : 0,
                };
                await storeStatistic(title, link, stats);
            });
        }

        // Append Stats Component
        let statsTitle = document.querySelector('h2');
        if (statsTitle) {
            const statsChart = document.createElement('div');
            statsTitle.parentElement?.insertBefore(statsChart, statsTitle?.nextElementSibling?.nextElementSibling as any);

            const app = createApp(Charts);
            const instance = app.mount(statsChart) as any;
        }
    }
}
main();
