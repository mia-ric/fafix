import { useStatistics, type StatisticValues } from "../composables/use-statistics";
import { useStorage } from "../composables/use-storage";

export default function () {
    const storyList = document.querySelector('.container-storylist');
    if (!storyList) {
        return;
    }

    const stats = useStatistics();
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

        let values: StatisticValues = {
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
        await stats.store(title, link, values);
    });

    // Store last-updated-at timestamp
    const storage = useStorage();
    storage.local.set('statistics_updated_at', Date.now());
};

