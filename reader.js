const express = require("express");
const path = require("path");
const fs = require("fs");
const { getPublishedPosts, getPostById } = require("./db");

const app = express();
const PORT = process.env.READER_PORT || 3000;

// ── Simple template helper ──────────────────────────────────────────────

function escapeHtml(str) {
  if (str == null) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderTemplate(filename, data) {
  const filePath = path.join(__dirname, "views", filename);
  let html = fs.readFileSync(filePath, "utf8");

  // Handle {{#each posts}} ... {{/each}}
  html = html.replace(
    /\{\{#each posts\}\}([\s\S]*?)\{\{\/each\}\}/g,
    (_, block) => {
      if (!data.posts || data.posts.length === 0) return "";
      return data.posts
        .map((post) => {
          let row = block;
          row = row.replace(/\{\{this\.id\}\}/g, escapeHtml(post.id));
          row = row.replace(/\{\{this\.title\}\}/g, escapeHtml(post.title));
          row = row.replace(
            /\{\{this\.created_at\}\}/g,
            escapeHtml(post.created_at)
          );
          row = row.replace(
            /\{\{this\.preview\}\}/g,
            escapeHtml(post.preview || "")
          );
          return row;
        })
        .join("");
    }
  );

  // Handle {{#if posts.length}} ... {{else}} ... {{/if}}
  html = html.replace(
    /\{\{#if posts\.length\}\}([\s\S]*?)\{\{else\}\}([\s\S]*?)\{\{\/if\}\}/g,
    (_, ifBlock, elseBlock) =>
      data.posts && data.posts.length > 0 ? ifBlock : elseBlock
  );

  // Replace simple variables
  html = html.replace(/\{\{title\}\}/g, escapeHtml(data.title || ""));
  html = html.replace(/\{\{body\}\}/g, escapeHtml(data.body || ""));
  html = html.replace(
    /\{\{created_at\}\}/g,
    escapeHtml(data.created_at || "")
  );

  return html;
}

// ── Routes ──────────────────────────────────────────────────────────────

// List published posts
app.get("/", (req, res) => {
  const posts = getPublishedPosts().map((p) => ({
    ...p,
    preview: p.body.length > 200 ? p.body.slice(0, 200) + "..." : p.body,
  }));
  res.send(renderTemplate("post-list.html", { posts }));
});

// View a single published post
app.get("/posts/:id", (req, res) => {
  const post = getPostById(req.params.id);
  if (!post || !post.published) {
    return res.status(404).send("Post not found.");
  }
  res.send(
    renderTemplate("post-detail.html", {
      title: post.title,
      body: post.body,
      created_at: post.created_at,
    })
  );
});

// ── Start ───────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`Reader app running at http://localhost:${PORT}`);
});
