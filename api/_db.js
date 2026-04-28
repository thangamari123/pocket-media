import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.resolve(__dirname, '../local.db');

const db = new Database(dbPath);

// Initialize tables if they don't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS social_accounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    platform TEXT NOT NULL,
    account_name TEXT NOT NULL,
    account_handle TEXT NOT NULL,
    page_id TEXT,
    profile_url TEXT,
    follower_count INTEGER DEFAULT 0,
    status TEXT DEFAULT 'connected',
    connected_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    business_id INTEGER,
    content TEXT,
    caption TEXT,
    hashtags TEXT,
    platform TEXT,
    status TEXT DEFAULT 'draft',
    scheduled_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS analytics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id INTEGER,
    platform TEXT,
    likes INTEGER DEFAULT 0,
    comments INTEGER DEFAULT 0,
    shares INTEGER DEFAULT 0,
    reach INTEGER DEFAULT 0,
    posted_at DATETIME
  );
`);

export default db;
