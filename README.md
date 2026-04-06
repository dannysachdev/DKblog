# DKblog

A simple plain-English blog with two separate apps:

- **Writer** (port 3001) — admin page to write, edit, publish, and delete posts
- **Reader** (port 3000) — public page where visitors read published posts

No frameworks, no fancy design, no domain needed. Just text in, text out.

## Quick Start

```bash
# Install dependencies
npm install

# Start the reader (public blog)
node reader.js

# In another terminal, start the writer (admin)
node writer.js
```

- Writer: `http://localhost:3001/admin`
- Reader: `http://localhost:3000`

## Deploy to AWS

1. Launch an EC2 instance (t2.micro works fine)
2. SSH in and install Node.js:
   ```bash
   sudo apt update && sudo apt install -y nodejs npm
   ```
3. Clone this repo and install dependencies:
   ```bash
   git clone <your-repo-url> && cd DKblog && npm install
   ```
4. Start both apps (use `pm2` to keep them running):
   ```bash
   sudo npm install -g pm2
   pm2 start reader.js --name reader
   pm2 start writer.js --name writer
   pm2 save
   pm2 startup
   ```
5. Open ports in your Security Group:
   - Port **3000** — open to everyone (reader)
   - Port **3001** — open only to your IP (writer)
6. Access:
   - Reader: `http://<YOUR-IP>:3000`
   - Writer: `http://<YOUR-IP>:3001/admin`

### Two-IP Setup

If you want separate IPs for reading and writing:

1. Attach a second Elastic IP to your instance (via a second network interface)
2. Set environment variables to bind each app to its IP:
   ```bash
   READER_PORT=80 pm2 start reader.js --name reader
   WRITER_PORT=80 pm2 start writer.js --name writer
   ```
3. Configure routing so each app binds to its own Elastic IP

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `READER_PORT` | `3000` | Port for the public reader app |
| `WRITER_PORT` | `3001` | Port for the admin writer app |

## Tech Stack

- **Node.js + Express** — backend
- **SQLite (better-sqlite3)** — database (single file, zero config)
- **Plain HTML** — no frontend frameworks