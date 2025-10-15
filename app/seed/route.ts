import bcrypt from 'bcrypt';
import postgres from 'postgres';
import { notes, folders, users } from '@/lib/placeholder-data';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

async function seedUsers() {
  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL
    );
  `;

  const insertedUsers = await Promise.all(
    users.map(async (user) => {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      return sql`
        INSERT INTO users (id, name, email, password)
        VALUES (${user.id}, ${user.name}, ${user.email}, ${hashedPassword})
        ON CONFLICT (id) DO NOTHING;
      `;
    }),
  );

  return insertedUsers;
}

async function seedFolders() {
  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

  await sql`
    CREATE TABLE IF NOT EXISTS folders (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      title VARCHAR(255) NOT NULL
      created_at TIMESTAMP DEFAULT NOW()
    );
  `;

  const insertedFolders = await Promise.all(
    folders.map(
      (folder) => sql`
        INSERT INTO folders (id, title)
        VALUES (${folder.id}, ${folder.title})
        ON CONFLICT (id) DO NOTHING;
      `,
    ),
  );

  return insertedFolders;
}

async function seedNotes() {
  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

  await sql`
    CREATE TABLE IF NOT EXISTS notes (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      folder UUID REFERENCES folders(id),
      title VARCHAR(255) NOT NULL,
      content TEXT NOT NULL,
      due_date DATE NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
      completed VARCHAR(255) NOT NULL,
    );
  `;

  const insertedNotes = await Promise.all(
    notes.map(
      (note) => sql`
        INSERT INTO notes (id, folder_id, title, content, due_date, completed)
        VALUES (${note.id}, ${note.folder}, ${note.title}, ${note.content}, ${note.due_date} ${note.completed})
        ON CONFLICT (id) DO NOTHING;
      `,
    ),
  );

  return insertedNotes;
}

export async function GET() {
  try {
    const result = await sql.begin((sql) => [
      seedUsers(),
      seedFolders(),
      seedNotes(),
    ]);

    return Response.json({ message: 'Database seeded successfully' });
  } catch (error) {
    return Response.json({ error }, { status: 500 });
  }
}