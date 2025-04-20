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
    const { db } = useDatabase();

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

    /**
     * Get the daily delta summary value.
     * @returns 
     */
    async function deltaSummary() {
        const today = new Date();
        const formatDate = (d: Date) =>
            `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    
        const todayDate = formatDate(today);
        const todayStats = await db.statistics.where('date').equals(todayDate).toArray();

        const previousStats = await db.statistics
            .where('date')
            .below(todayDate)
            .reverse()
            .sortBy('date');
        const latestPreviousDate = previousStats.length > 0 ? previousStats[0].date : null;
    
        const yesterdayStats = latestPreviousDate
            ? await db.statistics.where('date').equals(latestPreviousDate).toArray()
            : [];
    
        const sumStats = (list: Statistic[]) => {
            return list.reduce((sum, stat) => {
                sum.views += parseInt(stat.views || 0 as any);
                sum.reviews += parseInt(stat.reviews || 0 as any);
                sum.recommendations += parseInt(stat.recommendations || 0 as any);
                sum.favorites += parseInt(stat.favorites || 0 as any);
                sum.bookmarks += parseInt(stat.bookmarks || 0 as any);
                sum.offlineLibraries += parseInt(stat.offlineLibraries || 0 as any);
                sum.bookshelves += parseInt(stat.bookshelves || 0 as any);
                return sum;
            }, {
                views: 0,
                reviews: 0,
                recommendations: 0,
                favorites: 0,
                bookmarks: 0,
                offlineLibraries: 0,
                bookshelves: 0
            } as StatisticValues);
        };
    
        const todaySum = sumStats(todayStats);
        const yesterdaySum = sumStats(yesterdayStats);
        return {
            newViews: todaySum.views - yesterdaySum.views,
            newReviews: todaySum.reviews - yesterdaySum.reviews,
            newRecommendations: todaySum.recommendations - yesterdaySum.recommendations,
            newFavorites: todaySum.favorites - yesterdaySum.favorites,
            newBookmarks: todaySum.bookmarks - yesterdaySum.bookmarks,
            newOfflineLibraries: todaySum.offlineLibraries - yesterdaySum.offlineLibraries,
            newBookshelves: todaySum.bookshelves - yesterdaySum.bookshelves,
        };
    }

    // Export Composable
    return { 
        store,
        stats,
        deltaSummary,
    };
};

export { type Statistic };
