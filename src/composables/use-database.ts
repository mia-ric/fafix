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
        books: '++id, status, title, link, *category, *genres, chapters, words, created_at, updated_at',
        statistics: '++id, title, link, chapters, words, reviews, recommendations, views, favorites, bookmarks, offlineLibraries, bookshelves, date, time',
    });

    //db.version(3).stores({
    //    stories: '++id, title, link, chapter'
    //});

    /**
     * Import Data
     * @param file 
     * @returns 
     */
    async function importData(file: File) {
        const text = await file.text();
        let data: any[] = [];
    
        const fileName = file.name.toLowerCase();
        const isJson = fileName.endsWith('.json') || file.type === 'application/json';
        const isCsv = fileName.endsWith('.csv') || file.type === 'text/csv';
    
        if (isJson) {
            try {
                data = JSON.parse(text);
            } catch (error) {
                throw new Error('Ungültiges JSON-Format: ' + error);
            }
        } else if (isCsv) {
            const [headerLine, ...lines] = text.split('\n').filter(line => line.trim() !== '');
            const headers = headerLine.split(';');
    
            data = lines.map(line => {
                const values = line.split(';').map(val =>
                    val.trim().replace(/^"|"$/g, '').replace(/""/g, '"')
                );
                const entry: any = {};
                headers.forEach((header, index) => {
                    entry[header] = values[index];
                });
                return entry;
            });
        } else {
            throw new Error('Unbekanntes Dateiformat. Bitte eine .json oder .csv Datei hochladen.');
        }
    
        await db.statistics.clear();
        await db.statistics.bulkAdd(data);
    }

    /**
     * Export Data
     * @param type 
     * @returns 
     */
    async function exportData(type: 'json' | 'csv' = 'json') {
        const statistics = await db.statistics.toArray();

        if (type === 'json') {
            const jsonData = JSON.stringify(statistics, null, 2);
            return new Blob([jsonData], { type: 'application/json' });
        } else if (type === 'csv') {
            const convertToCSV = (data: any[]) => {
                if (!data.length) {
                    return '';
                }
                const headers = Object.keys(data[0]);
                const rows = data.map(row =>
                    headers.map(field => {
                        const value = row[field];
                        if (typeof value === 'string') {
                            return `"${value.replace(/"/g, '""')}"`;
                        }
                        return value;
                    }).join(';')
                );
                return [headers.join(';'), ...rows].join('\n');
            };
    
            const statsCSV = convertToCSV(statistics);
            return new Blob([statsCSV], { type: 'text/csv' });
        }
    }

    // Export Composable
    return {
        db,
        importData,
        exportData,
    };
};
