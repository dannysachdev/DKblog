const express = require("express");
const { getPublishedPosts, getPostById } = require("./db");
const { renderTemplate, PREVIEW_LENGTH } = require("./template");

const app = express();
const PORT = process.env.READER_PORT || 3000;

// ── Routes ──────────────────────────────────────────────────────────────

// List published posts
app.get("/", (req, res) => {
  const posts = getPublishedPosts().map((p) => ({
    ...p,
    preview: p.body.length > PREVIEW_LENGTH ? p.body.slice(0, PREVIEW_LENGTH) + "..." : p.body,
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
