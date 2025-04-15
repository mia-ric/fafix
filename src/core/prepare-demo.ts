import { useBooks } from "../composables/use-books";
import { useStatistics } from "../composables/use-statistics";

export default async function prepareDemo() {
    const books = useBooks();
    books.insert({
        status: 0,
        title: 'A very long title',
        link: 'demo://1',
        category: [],
        genres: [],
        chapters: 21,
        words: 27842,
        created_at: '2025-03-01',
        updated_at: '2025-04-14',
    });

    const stats = useStatistics();
    const oneWeekAgo = new Date((new Date).getTime() - 7 * 24 * 60 * 60 * 1000);
    {
        let views = 3500;
        for (let i = 0; i < 7; i++) {
            const statsDate = new Date(oneWeekAgo.getTime() + (i * 24 * 60 * 60 * 1000));
    
            views += (Math.floor(Math.random() * (200 - 50 + 1)) + 50);
            await stats.store(
                'Demo 1',
                'demo://1',
                {
                    chapters: i > 3 ? 21 : 20,
                    words: i > 3 ? 27842 : 25768,
                    reviews: i > 1 ? 1 : 0,
                    recommendations: i > 3 ? 1 : 0,
                    views,
                    favorites: i > 5 ? 1 : 0,
                    bookmarks: i > 2 ? 1 : 0,
                    offlineLibraries: i > 4 ? 1 : 0,
                    bookshelves: i > 2 ? 1 : 0,
                },
                statsDate
            );
        }
    }

    {
        let views = 1500;
        for (let i = 0; i < 7; i++) {
            const statsDate = new Date(oneWeekAgo.getTime() + (i * 24 * 60 * 60 * 1000));
    
            views += (Math.floor(Math.random() * (500 - 50 + 1)) + 50);
            await stats.store(
                'Demo 2',
                'demo://2',
                {
                    chapters: i > 3 ? 11 : 8,
                    words: i > 3 ? 16774 : 14547,
                    reviews: i > 1 ? 1 : 0,
                    recommendations: i > 3 ? 1 : 0,
                    views,
                    favorites: i > 5 ? 1 : 0,
                    bookmarks: i > 2 ? 1 : 0,
                    offlineLibraries: i > 4 ? 1 : 0,
                    bookshelves: i > 2 ? 1 : 0,
                },
                statsDate
            );
        }
    }
};
