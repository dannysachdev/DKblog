const path = require("path");
const fs = require("fs");

const PREVIEW_LENGTH = 200;

// Cache templates in memory after first read
const templateCache = {};

function escapeHtml(str) {
  if (str == null) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function loadTemplate(filename) {
  if (!templateCache[filename]) {
    const filePath = path.join(__dirname, "views", filename);
    templateCache[filename] = fs.readFileSync(filePath, "utf8");
  }
  return templateCache[filename];
}

function renderTemplate(filename, data) {
  let html = loadTemplate(filename);

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

module.exports = { renderTemplate, escapeHtml, PREVIEW_LENGTH };
