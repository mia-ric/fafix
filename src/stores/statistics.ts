import { db, type Statistic } from "./database";

export interface StatisticValues {
    chapters: number;
    words: number;
    reviews: number;
    recommendations: number;
    views: number;
    favorites: number;
    bookmarks: number;
    offlineLibraries: number;
    bookshelves: number;
}

/**
 * Store Statistic Values
 * @param title 
 * @param link 
 * @param stats 
 * @param statsDate 
 */
export async function storeStatistic(title: string, link: string, stats: StatisticValues, statsDate?: Date) {
    const now = statsDate || new Date();
    const pad = (num: number) => String(num).padStart(2, '0');
    const date = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
    const time = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    
    const entry = await db.statistics.where({ title, date }).first();
    if (entry) {
        await db.statistics.update(entry.id, {
            time,
            ...stats,
        });
    } else {
        await db.statistics.add({
            title,
            link,
            date,
            time,
            ...stats,
        });
    }
}

/**
 * Get Statistics per Book
 * @returns 
 */
export async function getStatistics() {
    const books = await db.statistics.toArray().then((allStats) => {
        const map = new Map<string, { title: string; link: string, data: Statistic[] }>();
        for (const stat of allStats) {
            const key = `${stat.title}||${stat.link}`;
            if (!map.has(key)) {
                map.set(key, { title: stat.title, link: stat.link, data: [] });
            }
        }
        return Array.from(map.values());
    });

    for (const book of books) {
        book.data = await db.statistics.where({ link: book.link }).sortBy('date');
    }

    return books;
}