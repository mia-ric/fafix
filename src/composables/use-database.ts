import Dexie, { type EntityTable } from 'dexie';

export interface Statistic {
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

export interface Book {
    id: number;
    status: number;
    title: string;
    link: string;
    category: string[];
    genres: string[];
    chapters: number;
    words: number;
    created_at: string;
    updated_at: string;
}

export function useDatabase() {
    const db = new Dexie('FAFIX') as Dexie & {
        statistics: EntityTable<Statistic, 'id'>;
        books: EntityTable<Book, 'id'>;
    };

    db.version(1).stores({
        statistics: '++id, title, link, chapters, words, reviews, recommendations, views, favorites, bookmarks, offlineLibraries, bookshelves, date, time',
    });

    db.version(2).stores({
        statistics: '++id, title, link, chapters, words, reviews, recommendations, views, favorites, bookmarks, offlineLibraries, bookshelves, date, time',
        books: '++id, status, title, link, *category, *genres, chapters, words, created_at, updated_at',
    });

    return db;
};
