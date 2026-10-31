# Portfolio Website

A personal portfolio built with the MERN stack: a React (Vite) frontend and an Express + MongoDB backend. Projects, certifications, volunteering experience, blog posts, the languages/tools list and the page text (hero, about, footer) are stored in MongoDB, served through a small REST API and managed from a built-in admin panel at `/admin`.

## Features

- Home page with Hero and About sections (education, languages and tools, volunteering with photo albums, contact form)
- Projects page: categories, search, per-category project lists, demo video modal
- Certifications & Skills page: categories, search, certificate cards
- Blogs: Markdown posts stored in the database, with a list page (search and tag filter) and a page per post where visitors can rate and comment
- Admin panel (`/admin`): sign-in, analytics dashboard, editing of all site content, blog editor with Published/Private status, image uploads, and an inbox for contact messages and comments
- Light and dark theme with a navbar toggle (remembers your choice, follows the system setting on first visit)
- Skeleton loaders, cached API data (TanStack Query) and lazy-loaded routes
- Optimized images (WebP variants with responsive sizes) and self-hosted fonts
- Keyboard-accessible album modal, visible focus styles, reduced-motion support

## Tech Stack

| Area | Technology |
| --- | --- |
| Frontend | React 19, Vite, React Router 7, TanStack Query, react-markdown, react-icons |
| Backend | Node.js, Express 4, Mongoose 7, Nodemailer, Multer, JWT (jsonwebtoken), bcryptjs |
| Database | MongoDB |

## Project Structure

```
portfolio2/
├── client/                      React frontend (Vite)
│   ├── index.html               HTML entry, theme bootstrap, SEO meta
│   ├── vite.config.mjs
│   ├── scripts/
│   │   └── optimize-images.mjs  Generates WebP variants of public/images and public/blog-images
│   ├── public/images/           Images served as-is (projects, certifications, volunteering)
│   ├── public/blog-images/      Images shared by all blog posts
│   └── src/
│       ├── main.jsx             App entry, providers, font imports
│       ├── App.jsx              Routes (Projects and Certifications are lazy-loaded)
│       ├── api/                 fetch helper, TanStack Query hooks and client
│       ├── admin/               Admin panel (lazy-loaded at /admin): pages, shared form UI, auth
│       ├── content/             siteDefaults.js (built-in page text) and the blog Markdown seed files
│       ├── components/          Navbar, Hero, About, Projects, Certifications, Blogs, BlogPost,
│       │                        BlogFeedback, AlbumModal, OptimizedImage, Skeleton, Footer, ...
│       ├── hooks/               useScrollAnimation, useTheme, useDocumentMeta
│       ├── styles/              Component CSS (uses the design tokens in index.css)
│       └── utils/               Image helpers, page-view tracking, visitor id
└── server/                      Express backend
    ├── server.js                App setup, DB connection, routes
    ├── middleware/auth.js       Admin sign-in check (JWT) and write guard
    ├── models/                  Mongoose models
    ├── routes/                  API route handlers
    └── scripts/                 hash-password.js, seed-blogs.js
```

## Getting Started

### Prerequisites

- Node.js 20.19+ (or 22.12+)
- A MongoDB database (a free MongoDB Atlas cluster works)
- A Gmail account with an app password (only needed for the contact form)

### 1. Backend

```bash
cd server
npm install
cp .env.example .env     # Windows Command Prompt: copy .env.example .env
```

Fill in `server/.env`:

| Variable | Purpose |
| --- | --- |
| `MONGODB_URI` | MongoDB connection string |
| `PORT` | Server port (defaults to `5000`) |
| `GMAIL_USER` | Gmail address used to send contact form emails |
| `GMAIL_APP_PASSWORD` | Gmail app password for that account |
| `CONTACT_RECEIVER_EMAIL` | Address that receives contact form messages |
| `BLOG_ADMIN_TOKEN` | Optional secret that lets a script delete blog comments (the admin panel does not need it) |
| `ADMIN_USERNAME` | Username for the admin panel |
| `ADMIN_PASSWORD_HASH` | bcrypt hash of the admin password (see Admin panel below). `ADMIN_PASSWORD` (plain text) also works but is not recommended |
| `JWT_SECRET` | Long random string used to sign admin sign-in tokens |

Then start it:

```bash
npm run dev     # with nodemon
npm start       # plain node
```

The API runs on `http://localhost:5000`.

First-time setup for blogs: run `npm run seed:blogs` once to copy the Markdown posts in `client/src/content/blogs/` into the database (existing posts are skipped; add `-- --overwrite` to replace them). After that, manage posts in the admin panel.

### 2. Frontend

```bash
cd client
npm install
cp .env.example .env     # Windows Command Prompt: copy .env.example .env
npm run dev
```

The app runs on `http://localhost:3000`.

| Variable | Purpose |
| --- | --- |
| `VITE_API_BASE_URL` | Base URL of the backend (defaults to `http://localhost:5000`) |

Vite reads env variables at build time, so redeploy after changing it.

## Scripts (server)

| Command | What it does |
| --- | --- |
| `npm run dev` | Start with nodemon |
| `npm start` | Start with plain node |
| `npm run hash-password -- "your password"` | Print the bcrypt hash for `ADMIN_PASSWORD_HASH` (password of 10+ characters) |
| `npm run seed:blogs` | Import the Markdown posts into the database |

## Scripts (client)

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the Vite dev server (`npm start` is an alias) |
| `npm run build` | Production build into `client/build` |
| `npm run preview` | Serve the production build locally |
| `npm run optimize-images` | Generate WebP variants for everything in `public/images` |

## API

All routes are under `/api` unless noted.

| Route | Description |
| --- | --- |
| `GET /health` | Health check for uptime monitors (not under `/api`) |
| `GET /api` | API status message |
| `/api/project-categories` | Project categories and their projects |
| `/api/certification-categories` | Certification categories and certificates |
| `/api/volunteering-experiences` | Volunteering experiences and photos |
| `/api/language-tool-sections` | Languages and tools list |
| `POST /api/contact/send` | Send a contact form message by email |
| `/api/blog-feedback` | Blog ratings and comments (see Blogs below) |
| `/api/blogs` | Blog posts (list without bodies, one post with body). Private posts are hidden from visitors |
| `/api/site-content` | Editable text for hero, about, footer, top bar and social links |
| `GET /api/media/:id` | Serve an uploaded image |
| `POST /api/analytics/view` | Record an anonymous page view (rate limited, bots ignored) |
| `/api/admin/*` | Sign-in, stats, contact messages and comment moderation (admin only, except `login`) |

Reads are public. Every write (`POST`, `PUT`, `PATCH`, `DELETE`) on the content routes, plus uploads, stats and the inbox, needs an admin token sent as `Authorization: Bearer <token>`, which `POST /api/admin/login` returns. Tokens last 12 hours.

Write endpoints (admin only):

- Projects and certifications: `POST /upsert` and `POST /bulk-upsert`, `DELETE /:slug`, plus public `GET /:slug` for a single category.
- Languages and tools: `POST /upsert`.
- Volunteering: `POST /`, `GET|PUT|DELETE /:id`, `POST /bulk/create`, plus the older photo upload and removal under `/:id/images`.
- Blogs: `POST /`, `PUT /:slug`, `PATCH /:slug/status` (publish or make private), `DELETE /:slug` (also removes the post's comments and ratings).
- Site content: `PUT /api/site-content`.
- Media: `GET /api/media` (list), `POST /api/media` (one image, up to 4 MB), `DELETE /api/media/:id`.

GET responses are sent with `Cache-Control` headers (browser cache 60 seconds, plus `s-maxage` for any CDN in front). Requests carrying an admin token are never cached, so the admin panel always sees fresh data; visitors can take up to a few minutes to see an edit.

## Admin panel

Open `/admin` (for example `http://localhost:3000/admin`) and sign in.

### Setup

1. Generate a password hash: `cd server && npm run hash-password -- "your long password"`.
2. Put these in `server/.env` (and in your host's environment settings when deployed). Wrap the hash in single quotes, because it contains `$`:

   ```
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD_HASH='$2a$12$...'
   JWT_SECRET=a-long-random-string
   ```

3. Restart the server. Until these are set, sign-in returns "not configured" and every write endpoint stays locked.

Failed sign-ins are limited to 10 per 15 minutes per IP.

### What you can do

| Section | Purpose |
| --- | --- |
| Dashboard | Page views and unique visitors (7, 30 or 90 days, compared with the previous period), views per day, top pages, referrers, per-blog views, ratings and comments, content totals, unread messages |
| Site content | Hero, About (text, numbers, education), social links, footer and top bar. Each section can be reset to the built-in text |
| Projects, Certifications, Languages & tools, Volunteering | Add, edit, reorder and delete |
| Blog posts | Markdown editor with preview and image insert. Each post is **Published** or **Private**, and you can switch this straight from the list |
| Messages & comments | Contact form messages (reply, mark read, delete) and blog comment moderation |
| Image library | Upload, copy the address of, and delete images |

How it works:

- Only the page text you change is stored; everything else falls back to the defaults in `client/src/content/siteDefaults.js`.
- Uploaded images are stored in MongoDB (JPEG, PNG, WebP or GIF, up to 4 MB). Large JPEG and PNG photos are shrunk to WebP in the browser first. Images already in `client/public/images/` keep working.
- Page views are anonymous (a random id saved in the visitor's browser). Visits from localhost, known bots and a browser signed in to the admin are not counted, so the dashboard stays empty until the site is live. Views are kept for about 400 days.
- Contact form messages are saved to the database as well as emailed.

## Blogs

Posts live in the database and are written in the admin panel (Blog posts > New post).

### Writing a post

1. Enter a title, an address (the part after `/blogs/`; lowercase letters, numbers and hyphens, fixed after creation), a date, tags, a summary and an optional cover image.
2. Write the article in Markdown: headings, lists, tables, quotes, links and fenced code blocks (name the language, for example ```python, to get highlighting). Raw HTML is not rendered. Use **Insert image** to upload a picture and add it to the text, and **Preview** to check the result.
3. The YouTube link field is optional and shows a video at the top of the post. A YouTube link on its own line in the body is also turned into a player.
4. Choose **Private** to keep a post hidden from visitors, or save it as **Published**. The cover image appears on the list card and as a soft backdrop behind the post title.

The Markdown files in `client/src/content/blogs/` are only seed data for `npm run seed:blogs`; editing them does not change the live site.

### Ratings and comments

Each post page has a 1–5 star rating and a comment box, stored in MongoDB (`BlogRating` and `BlogComment`).

- A visitor gets an anonymous id saved in their browser, so they can change their rating but not stack several. It is a light guard, not full protection against someone clearing their storage.
- Comments appear immediately. The API limits each IP to 5 comments and 30 rating changes per 10 minutes, validates every field, and includes a hidden spam-trap field. Comment text is always rendered as plain text.
- To remove a comment, use Messages & comments in the admin panel. A script can also send a DELETE request with the comment's id and your `BLOG_ADMIN_TOKEN` (or an admin token):

  ```bash
  curl -X DELETE https://YOUR-API/api/blog-feedback/comments/COMMENT_ID -H "x-admin-token: YOUR_TOKEN"
  ```

  Comment ids come from the `_id` field of `GET /api/blog-feedback/POST_SLUG`. The token route is disabled until `BLOG_ADMIN_TOKEN` is set.
- If the server runs behind a proxy (most hosts do), `trust proxy` is already enabled so limits apply per visitor, not per proxy.

## Working with Images

Images you upload in the admin panel are stored in MongoDB and need no extra steps. Images that ship with the site live in `client/public/images/`, and the database stores paths like `/images/projects/cinema.png`.

After adding or replacing a file in `public/images` or `public/blog-images`, run:

```bash
cd client
npm run optimize-images
```

This writes `name.webp`, `name-480.webp` and `name-960.webp` next to the original. The frontend picks the WebP variants automatically and falls back to the original file, so the paths stored in the database don't need to change. Commit the generated files along with the original.

## Theming

Colors are CSS variables defined in `client/src/index.css` (`--bg`, `--surface`, `--ink`, `--fill`, and so on). Dark mode overrides the same variables under `:root[data-theme='dark']`. Use the variables rather than hard-coded colors in new CSS so both themes keep working.

## Deployment

- **Frontend:** build with `npm run build` in `client/` and publish the `build` folder. Set `VITE_API_BASE_URL` to your backend URL in the host's environment settings.
- **Backend:** run `npm start` in `server/` with the environment variables above set (including the admin ones). Run `npm run seed:blogs` once against the production database. Use `/health` for uptime monitoring. On hosts that put idle services to sleep (most free tiers), a monitor that pings it every 10 minutes avoids a slow first request.

## Notes

- Use a strong admin password and keep `JWT_SECRET` private; changing `JWT_SECRET` signs everyone out.
- Never commit `server/.env`. It is ignored by git; only the `.env.example` files are tracked.
- If the database is unreachable, the server keeps running and API calls return errors, which the frontend shows as a message instead of crashing.
