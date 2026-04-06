const express = require("express");
const path = require("path");
const fs = require("fs");
const {
  getAllPosts,
  getPostById,
  createPost,
  updatePost,
  publishPost,
  unpublishPost,
  deletePost,
} = require("./db");

const app = express();
const PORT = process.env.WRITER_PORT || 3001;

// Parse form bodies
app.use(express.urlencoded({ extended: false }));

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

          // Handle {{#if this.published}} ... {{else}} ... {{/if}}
          row = row.replace(
            /\{\{#if this\.published\}\}([\s\S]*?)\{\{else\}\}([\s\S]*?)\{\{\/if\}\}/g,
            (_, ifBlock, elseBlock) => (post.published ? ifBlock : elseBlock)
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

  // Handle {{#if post}} ... {{else}} ... {{/if}}
  html = html.replace(
    /\{\{#if post\}\}([\s\S]*?)\{\{else\}\}([\s\S]*?)\{\{\/if\}\}/g,
    (_, ifBlock, elseBlock) => (data.post ? ifBlock : elseBlock)
  );

  // Replace simple variables
  html = html.replace(/\{\{title\}\}/g, escapeHtml(data.title || ""));
  html = html.replace(/\{\{body\}\}/g, escapeHtml(data.body || ""));
  html = html.replace(
    /\{\{created_at\}\}/g,
    escapeHtml(data.created_at || "")
  );
  html = html.replace(/\{\{formAction\}\}/g, escapeHtml(data.formAction || ""));

  return html;
}

// ── Routes ──────────────────────────────────────────────────────────────

// List all posts
app.get("/admin", (req, res) => {
  const posts = getAllPosts();
  res.send(renderTemplate("admin-list.html", { posts }));
});

// New post form
app.get("/admin/new", (req, res) => {
  res.send(
    renderTemplate("admin-form.html", {
      post: null,
      title: "",
      body: "",
      formAction: "/admin/posts",
    })
  );
});

// Create post
app.post("/admin/posts", (req, res) => {
  const { title, body } = req.body;
  if (!title || !body) {
    return res.status(400).send("Title and body are required.");
  }
  createPost(title.trim(), body.trim());
  res.redirect("/admin");
});

// Edit post form
app.get("/admin/edit/:id", (req, res) => {
  const post = getPostById(req.params.id);
  if (!post) return res.status(404).send("Post not found.");
  res.send(
    renderTemplate("admin-form.html", {
      post,
      title: post.title,
      body: post.body,
      formAction: "/admin/posts/" + post.id,
    })
  );
});

// Update post
app.post("/admin/posts/:id", (req, res) => {
  const post = getPostById(req.params.id);
  if (!post) return res.status(404).send("Post not found.");
  const { title, body } = req.body;
  if (!title || !body) {
    return res.status(400).send("Title and body are required.");
  }
  updatePost(post.id, title.trim(), body.trim());
  res.redirect("/admin");
});

// Publish post
app.post("/admin/posts/:id/publish", (req, res) => {
  const post = getPostById(req.params.id);
  if (!post) return res.status(404).send("Post not found.");
  publishPost(post.id);
  res.redirect("/admin");
});

// Unpublish post
app.post("/admin/posts/:id/unpublish", (req, res) => {
  const post = getPostById(req.params.id);
  if (!post) return res.status(404).send("Post not found.");
  unpublishPost(post.id);
  res.redirect("/admin");
});

// Delete post
app.post("/admin/posts/:id/delete", (req, res) => {
  const post = getPostById(req.params.id);
  if (!post) return res.status(404).send("Post not found.");
  deletePost(post.id);
  res.redirect("/admin");
});

// Redirect root to admin
app.get("/", (req, res) => {
  res.redirect("/admin");
});

// ── Start ───────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`Writer app running at http://localhost:${PORT}/admin`);
});
