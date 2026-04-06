const express = require("express");
const {
  getAllPosts,
  getPostById,
  createPost,
  updatePost,
  publishPost,
  unpublishPost,
  deletePost,
} = require("./db");
const { renderTemplate } = require("./template");

const app = express();
const PORT = process.env.WRITER_PORT || 3001;

// Parse form bodies
app.use(express.urlencoded({ extended: false }));

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
