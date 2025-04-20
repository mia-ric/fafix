import { useDatabase, type Book } from "./use-database";

export function useBooks() {
    const { db } = useDatabase();

    /**
     * Insert Book
     * @param data 
     */
    async function insert(data: Book | Omit<Book, 'id'>) {
        return await db.books.add(data);
    }

    /**
     * Update Book
     * @param data 
     */
    async function update(id: number, data: Book | Omit<Book, 'id'>) {
        return await db.books.update(id, data as any);
    }

    /**
     * Upsert Book
     * @param data 
     */
    async function upsert(data: Book | Omit<Book, 'id'>) {
        const book = await db.books.where({ title: data.title, link: data.link }).first();
        if (book) {
            return await db.books.update(book.id, data as any);
        } else {
            return await db.books.add(data);
        }
    }

    /**
     * Receive Books
     * @returns 
     */
    async function get() {
        return await db.books.toArray();
    }

    // Export Composable
    return {
        insert,
        update,
        upsert,
        get,
    };
};

export { type Book };
