import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

export async function connectDatabase() {
    const db = await open({
        filename: './tasks.sqlite',
        driver: sqlite3.Database
    });
    return db;
}

export async function createTable(db) {
    await db.exec(`
        CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            task TEXT NOT NULL,
            reminder_time TEXT NOT NULL,
            reminder_date TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `);
    console.log('Таблица tasks создана');
}

export async function addTaskDB(db, user_id, task, reminder_time, reminder_date = null) {
    await db.run(
        `INSERT INTO tasks (user_id, task, reminder_time, reminder_date) 
         VALUES (?, ?, ?, ?)`,
        [user_id, task, reminder_time, reminder_date || new Date().toISOString().slice(0, 10)]
    );
}


export async function getUserTasks(db, userId, page = 1, limit = 8) {
    const offset = (page - 1) * limit;
    return await db.all(
        `SELECT * FROM tasks 
         WHERE user_id = ? 
         ORDER BY reminder_date, reminder_time
         LIMIT ? OFFSET ?`,
        [userId, limit, offset]
    );
}


export async function getTasksCount(db, userId) {
    const result = await db.get(
        `SELECT COUNT(*) as count FROM tasks WHERE user_id = ?`,
        [userId]
    );
    return result.count;
}