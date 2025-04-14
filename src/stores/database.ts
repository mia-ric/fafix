import Dexie, { type EntityTable } from 'dexie';

interface Statistic {
    id: number;
    title: string;
    link: string;
    chapters: number;
    words: number;
    reviews: number;
    recommendations: number;
    views: number;
    favorites: number;
    bookmarks: number;
    offlineLibraries: number;
    bookshelves: number;
    date: string;
    time: string;
}

const db = new Dexie('FAFIX') as Dexie & {
    statistics: EntityTable<Statistic, 'id'>;
};

db.version(1).stores({
    statistics: '++id, title, link, chapters, words, reviews, recommendations, views, favorites, bookmarks, offlineLibraries, bookshelves, date, time'
});

export type { Statistic };
export { db };
