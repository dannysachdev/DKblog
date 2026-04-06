const Database = require("better-sqlite3");
const path = require("path");

const dbPath = path.join(__dirname, "blog.db");
const db = new Database(dbPath);

// Enable WAL mode so both apps can access the DB at the same time
db.pragma("journal_mode = WAL");

// Create the posts table if it doesn't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    published INTEGER NOT NULL DEFAULT 0
  )
`);

// ── Helper functions ──

function getAllPosts() {
  return db.prepare("SELECT * FROM posts ORDER BY created_at DESC").all();
}

function getPublishedPosts() {
  return db
    .prepare("SELECT * FROM posts WHERE published = 1 ORDER BY created_at DESC")
    .all();
}

function getPostById(id) {
  return db.prepare("SELECT * FROM posts WHERE id = ?").get(id);
}

function createPost(title, body) {
  const info = db
    .prepare("INSERT INTO posts (title, body) VALUES (?, ?)")
    .run(title, body);
  return info.lastInsertRowid;
}

function updatePost(id, title, body) {
  db.prepare("UPDATE posts SET title = ?, body = ? WHERE id = ?").run(
    title,
    body,
    id
  );
}

function publishPost(id) {
  db.prepare("UPDATE posts SET published = 1 WHERE id = ?").run(id);
}

function unpublishPost(id) {
  db.prepare("UPDATE posts SET published = 0 WHERE id = ?").run(id);
}

function deletePost(id) {
  db.prepare("DELETE FROM posts WHERE id = ?").run(id);
}

module.exports = {
  db,
  getAllPosts,
  getPublishedPosts,
  getPostById,
  createPost,
  updatePost,
  publishPost,
  unpublishPost,
  deletePost,
};
