import { useDatabase, type Statistic } from "./use-database";

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

export function useStatistics() {
    const db = useDatabase();

    /**
     * Store Statistic Values
     * @param title 
     * @param link 
     * @param stats 
     * @param statsDate 
     */
    async function store(title: string, link: string, stats: StatisticValues, statsDate?: Date) {
        const now = statsDate || new Date();
        const pad = (num: number) => String(num).padStart(2, '0');
        const date = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
        const time = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
        
        const db = useDatabase();
        const entry = await db.statistics.where({ title, date }).first();
        if (entry) {
            return await db.statistics.update(entry.id, {
                time,
                ...stats,
            });
        } else {
            return await db.statistics.add({
                title,
                link,
                date,
                time,
                ...stats,
            });
        }
    }
    
    /**
     * Get Statistics by Book
     * @param link
     * @returns 
     */
    async function stats(link: string) {
        return await db.statistics.where({ link }).sortBy('date');
    }

    // Export Composable
    return { 
        store,
        stats,
    };
};

export { type Statistic };
