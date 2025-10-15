import postgres from 'postgres';

import {
  Users,
  Notes,
  Folders,
} from './definitions';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

export async function fetchAllFolders() {
  try {
    const data = await sql<Folders[]>`
      SELECT folders.id, folders.name
      FROM folders
      ORDER BY folders.name ASC`;

    const folders = data.map((folder) => ({
      ...folder,
      // Здесь можно добавить дополнительную обработку данных, если нужно
      // Например: formattedName: formatFolderName(folder.name)
    }));
    return folders;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch folders.');
  }
}

export async function fetchAllNotes() {
  try {
    const data = await sql<Notes[]>`
      SELECT notes.id, notes.title
      FROM notes
      ORDER BY notes.title ASC`;

    const notes = data.map((note) => ({
      ...note,
      // Здесь можно добавить дополнительную обработку данных, если нужно
      // Например: formattedTitle: formatNoteTitle(note.title)
    }));
    return notes;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch notes.');
  }
}

// export async function fetchFilteredInvoices(
//   query: string,
//   currentPage: number,
// ) {

//   try {
//     const invoices = await sql<Notes[]>`
//       SELECT
//         invoices.id,
//         invoices.folder_id,
//         invoices.title,
//         invoices.content,

//       FROM Notes
//       JOIN folders ON invoices.folder_id = folder.id
//       WHERE
//         customers.name ILIKE ${`%${query}%`} OR
//         customers.email ILIKE ${`%${query}%`} OR
//         invoices.amount::text ILIKE ${`%${query}%`} OR
//         invoices.date::text ILIKE ${`%${query}%`} OR
//         invoices.status ILIKE ${`%${query}%`}
//     `;

//     return invoices;
//   } catch (error) {
//     console.error('Database Error:', error);
//     throw new Error('Failed to fetch invoices.');
//   }
// }

export async function fetchFilteredNotes(query: string) {
  try {
    const notes = await sql<Notes[]>`
      SELECT
        notes.id,
        notes.folder_id,
        notes.title,
        notes.content,
        folders.name as folder_name
      FROM notes
      JOIN folders ON notes.folder_id = folders.id
      WHERE
        notes.title ILIKE ${`%${query}%`} OR
        notes.content ILIKE ${`%${query}%`} OR
        folders.name ILIKE ${`%${query}%`}
      ORDER BY notes.title ASC
    `;

    return notes;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch notes.');
  }
}

