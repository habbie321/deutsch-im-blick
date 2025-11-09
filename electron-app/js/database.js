const Database = require('better-sqlite3');
const path = require('path');
const { app } = require('electron');

// Get user data path for storage
const userDataPath = app.getPath('userData');
const dbPath = path.join(userDataPath, 'app-database.db');

// Initialize database
const db = new Database(dbPath);

// Create tables if they don't exist
function initializeDatabase() {
    db.pragma('journal_mode = WAL'); // Better performance
    initializeChapters();

    db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      first_name TEXT NOT NULL,
      last_name TEXT,
      birthday TEXT,
      role TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE TABLE IF NOT EXISTS chapters (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      chapter_number INTEGER NOT NULL,
      chapter_name TEXT NOT NULL,
      UNIQUE(chapter_number, chapter_name)
    );
    
    CREATE TABLE IF NOT EXISTS user_progress (
      user_id INTEGER NOT NULL,
      chapter_id INTEGER NOT NULL,
      locked BOOLEAN,
      completed BOOLEAN,
      progress INTEGER DEFAULT 0,
      last_accessed TIMESTAMP,
      PRIMARY KEY (user_id, chapter_id),
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (chapter_id) REFERENCES chapters(id)
    );
  `);
}

function initializeChapters() {
  //   // First create the table structure
    db.exec(`
    CREATE TABLE IF NOT EXISTS chapters (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      chapter_number INTEGER NOT NULL,
      chapter_name TEXT NOT NULL,
      UNIQUE(chapter_number, chapter_name)
    );
  `);

    // Then insert your known chapters
    const chapters = [
        { number: 1, name: "Willkommen in Würzburg" },
        { number: 2, name: "An der Uni" },
        { number: 3, name: "Der Alltag und das Studentenleben" },
        { number: 4, name: "Freizeit und Ausgehen" },
        { number: 5, name: "Familie, Feste und Feiertage" },
        { number: 6, name: "Durch Deutschland und die Welt reisen" },
        { number: 7, name: "Gesundheit & Fitness" },
        { number: 8, name: "Das Traumleben Beziehungen, Wohnen und Karriere" },
        { number: 9, name: "Was ist deutsch?" },
        { number: 10, name: "Auf nach Berlin!" }
    ];

    const insert = db.prepare(`
    INSERT OR IGNORE INTO chapters (chapter_number, chapter_name)
    VALUES (?, ?)
  `);

    // Use a transaction for better performance
    const insertMany = db.transaction((chapters) => {
        for (const chapter of chapters) {
            insert.run(chapter.number, chapter.name);
        }
    });

    insertMany(chapters);
}

async function initializeUserProgress(userId) {
  return new Promise((resolve, reject) => {
    db.transaction(() => {
      try {
        const chapters = db.prepare(`SELECT id FROM chapters ORDER BY chapter_number`).all();
        
        chapters.forEach((chapter, index) => {
          db.prepare(`
            INSERT OR REPLACE INTO user_progress
            (user_id, chapter_id, locked, completed, progress)
            VALUES (?, ?, ?, ?, ?)
          `).run(
            userId,
            chapter.id,
            index === 0 ? 0 : 1, // Only unlock first chapter
            0, // completed
            0  // progress
          );
        });
        resolve();
      } catch (error) {
        reject(error);
      }
    })();
  });
}

async function getAccounts() {
    return await db.prepare('SELECT id, first_name, last_name, birthday, role, created_at FROM users ORDER BY created_at DESC').all();
}

async function getAccount(userId) {
      const stmt = db.prepare('SELECT id, first_name, last_name, birthday, role, created_at FROM users WHERE id = ?');
  try {
    const result = await stmt.get(userId);
    return result || null; // Return null if user not found
  } catch (error) {
    console.error('Failed to fetch account:', error);
    throw new Error('Could not retrieve account from database');
  }
}

async function addAccount(account) {
    const stmt = db.prepare(`
    INSERT INTO users (first_name, last_name, birthday, role) 
    VALUES (?, ?, ?, ?)
  `);

    const result = stmt.run(account.first_name, account.last_name, account.birthday, account.role);
    const newAccount = {
        id: result.lastInsertRowid,
        created_at: new Date().toISOString(),
        ...account
    };
    await initializeUserProgress(newAccount.id);
    return newAccount;
}

async function getChapters() {
    try {
        const stmt = await db.prepare(`
      SELECT id, chapter_number, chapter_name 
      FROM chapters 
      ORDER BY chapter_number ASC
    `);

        return stmt.all();
    } catch (error) {
        console.error('Failed to fetch chapters:', error);
        throw new Error('Could not retrieve chapters from database');
    }
}

async function getChapterProgress(userId) {
    return await db.prepare(`
    SELECT c.id AS chapter_id, c.chapter_number, c.chapter_name, up.locked, up.progress, up.completed, up.last_accessed
    FROM user_progress up
    JOIN chapters c ON up.chapter_id = c.id
    WHERE up.user_id = ?
  `).all(userId);
}

// Export the new functions
module.exports = {
    db,
    initializeDatabase,
    getAccount,
    getAccounts,
    addAccount,
    getChapters,
    getChapterProgress
};