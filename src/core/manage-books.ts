import { useBooks, type Book } from "../composables/use-books";
import { useStorage } from "../composables/use-storage";
import { getStateByLabel } from "../enums/states";
import select from "../utils/select";

export default function () {
    const storyList = document.querySelector('.container-storylist');
    if (!storyList) {
        return;
    }

    const books = useBooks();
    Array.from(storyList.querySelectorAll('tbody tr') as NodeListOf<HTMLTableRowElement>).map(async row => {
        let statusColumn = select('[data-ff-sort-colname="status"]', row);
        if (!statusColumn || !(statusColumn = select('span[title]', statusColumn))) {
            return;
        }

        let titleColumn = select('[data-ff-sort-colname="title_catname_statusinfo"]', row);
        if (!titleColumn) {
            return;
        }

        let chaptersColumn = select('[data-ff-sort-colname="chaptercount"]', row);
        let genresColumn = chaptersColumn ? (chaptersColumn.nextElementSibling as HTMLElement) : null;
        let wordsColumn = select('[data-ff-sort-colname="storylen"]', row);
        let createdAtColumn = select('[data-ff-sort-colname="createdate"]', row);
        let updatedAtColumn = select('[data-ff-sort-colname="updatedate"]', row);

        const handleDateStamp = (timestamp: number) => {
            const date = new Date(timestamp * 1000);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };

        let book: Omit<Book, 'id'> = {
            status: getStateByLabel(statusColumn.title) || 0,
            title: titleColumn.dataset.ffSortVal || '',
            link: select<HTMLAnchorElement>('a', titleColumn)?.href || '',
            category: select('span', titleColumn)?.getAttribute('aria-label')?.split('/') || [],
            genres: genresColumn ? genresColumn.innerText.split('\n').map(el => el.trim()) : [],
            chapters: chaptersColumn ? parseInt(chaptersColumn.dataset.ffSortVal as any) : 1,
            words: wordsColumn ? parseInt(wordsColumn.dataset.ffSortVal as any) : 1,
            created_at: createdAtColumn ? handleDateStamp(parseInt(createdAtColumn.dataset.ffSortVal as any)) : '',
            updated_at: updatedAtColumn ? handleDateStamp(parseInt(updatedAtColumn.dataset.ffSortVal as any)) : '',
        };
        await books.upsert(book);
    });

    // Store last-updated-at timestamp
    const storage = useStorage();
    storage.local.set('books_updated_at', Date.now());
};
