# DKblog

A plain, simple blog. No frameworks, no build tools — just static HTML files.

## Structure

```
index.html          ← Home page (lists all posts)
about.html          ← About page
style.css           ← Minimal stylesheet for readability
posts/              ← Blog posts go here
  hello-world.html  ← Example post
```

## How to add a new post

1. Create a new `.html` file in the `posts/` folder (copy `hello-world.html` as a starting point).
2. Write your content inside the `<article>` tag.
3. Add a link to the new post on `index.html`.

## How to view locally

Open `index.html` in your browser. That's it — no build step, no server required.

You can also use any simple HTTP server:

```sh
# Python
python3 -m http.server

# Node.js
npx serve
```

## Hosting

These are plain static files. They work on any static host: GitHub Pages, Netlify, Cloudflare Pages, or just any web server.