# CampusSwap

CampusSwap is a full-stack campus marketplace where college students can buy and sell items inside their university community. The app includes student auth, listings, filters, favorites, buyer/seller chat, reviews, notifications, safe pickup zones, seeded demo data, and Swagger API documentation.

The project runs as one Node server:

- Express serves the REST API under `/api`.
- Vite serves the React frontend during development.
- In production, the built React app is served from `dist`.
- Sequelize talks to SQLite by default, or PostgreSQL when `DATABASE_URL` is provided.

## 1. Setup Instructions

### Prerequisites

- Node.js 20 or newer recommended
- npm
- Optional: PostgreSQL, only if you do not want to use the default local SQLite database

### Install dependencies

```bash
npm install
```

### Create environment file

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

On macOS/Linux:

```bash
cp .env.example .env
```

Then review `.env`.

Important values:

```env
JWT_SECRET="replace-this-with-a-long-random-secret"
DATABASE_URL=""
GEMINI_API_KEY="MY_GEMINI_API_KEY"
APP_URL="MY_APP_URL"
```

Notes:

- Leave `DATABASE_URL` empty for zero-config local development. The app will create `.data/campusswap.sqlite`.
- Set `DATABASE_URL` to a PostgreSQL connection string if you want Postgres, for example `postgresql://user:password@localhost:5432/campusswap`.
- `JWT_SECRET` signs login tokens. Use a stronger value before deploying.

### Run locally

```bash
npm run dev
```

Open:

- App: `http://localhost:3000`
- Swagger docs: `http://localhost:3000/api/docs`
- Swagger JSON: `http://localhost:3000/api/docs.json`
- Health check: `http://localhost:3000/api/health`

The first run automatically creates the database tables and inserts demo data.

### Demo users

Seeded demo users are created with this password:

```text
demo1234
```

You can also use the app's demo-login flow, which calls:

```text
GET  /api/auth/demo-users
POST /api/auth/demo-login/:userId
```

### Build and run production bundle

```bash
npm run build
npm start
```

`npm run build` builds the React frontend with Vite and bundles the server to `dist/server.cjs`.

### Type-check

```bash
npm run lint
```

This script runs TypeScript with `tsc --noEmit`.

## 2. Architecture

### High-level runtime

```text
Browser
  |
  | React UI calls fetch("/api/...")
  v
Express server in server.ts
  |
  | API routes mounted in src/backend/app.ts
  v
Routes -> Controllers -> Services -> Sequelize Models -> SQLite/PostgreSQL
```

### Main folders

```text
.
|-- server.ts                         # Starts Express and attaches Vite middleware in dev
|-- vite.config.ts                    # Vite + React + Tailwind setup
|-- src/
|   |-- main.tsx                      # React entry point
|   |-- App.tsx                       # Main marketplace screen and modal orchestration
|   |-- index.css                     # Tailwind import
|   |-- types.ts                      # Shared frontend TypeScript types
|   |-- lib/
|   |   |-- api.ts                    # Frontend API client around fetch()
|   |-- context/
|   |   |-- AuthContext.tsx           # User session, campus state, notifications
|   |-- components/                   # Navbar, listing cards, modals, filters, safety UI
|   |-- backend/
|       |-- app.ts                    # Express app setup, middleware, route mounting
|       |-- config/database.ts        # Sequelize database connection
|       |-- models/                   # Sequelize models and associations
|       |-- routes/                   # Express route definitions and Zod schemas
|       |-- controllers/              # HTTP request/response handlers
|       |-- services/                 # Business logic
|       |-- middleware/               # Auth, validation, logging, error handling
|       |-- seed/seedData.ts          # Demo users, listings, chats, reviews, notifications
|       |-- docs/swagger.ts           # OpenAPI/Swagger setup
```

### Frontend architecture

The frontend is a React 19 single-page app.

- `src/main.tsx` mounts `<App />`.
- `src/App.tsx` renders the marketplace page and controls modal state.
- `src/context/AuthContext.tsx` stores the logged-in user, selected campus, available campuses, notifications, and auth actions.
- `src/lib/api.ts` is the only frontend file that knows the API paths. Components call `api.listings.getAll()`, `api.auth.login()`, `api.conversations.sendMessage()`, etc.
- `src/components/*` contains UI pieces such as listing cards, filters, auth modal, chat modal, favorites modal, profile modal, transactions modal, safety modal, and Swagger modal.

Frontend data flow example:

```text
User types a search
  -> App.tsx updates search/filter state
  -> fetchListings() calls api.listings.getAll()
  -> src/lib/api.ts sends GET /api/listings?search=...
  -> response updates listings state
  -> ListingCard components re-render
```

Auth flow:

```text
Login/Register modal
  -> api.auth.login() or api.auth.register()
  -> backend returns JWT + user
  -> AuthContext saves token in localStorage as campusswap_token
  -> api.ts adds Authorization: Bearer <token> to future requests
```

### Backend architecture

The backend follows a simple layered pattern:

```text
Route
  -> validates path/body/query when needed
  -> calls Controller
  -> Controller reads req and formats res
  -> Service contains business rules
  -> Model talks to the database through Sequelize
```

Example: creating a listing

```text
POST /api/listings
  -> listingRoutes.ts checks JWT and validates body with Zod
  -> ListingController.create()
  -> ListingService.create()
  -> Listing model inserts row into database
  -> service loads full listing with seller data
  -> controller returns JSON response
```

### Backend entry points

- `server.ts` starts the server on port `3000`.
- In development, it creates a Vite middleware server so React and Express run together.
- In production, it serves static files from `dist`.
- `src/backend/app.ts` creates the Express app, seeds the database, installs middleware, sets up Swagger, adds `/api/health`, mounts all API routes, and registers the centralized error handler.

### Database layer

`src/backend/config/database.ts` decides which database to use:

- If `DATABASE_URL` starts with `postgres://` or `postgresql://`, Sequelize uses PostgreSQL.
- Otherwise, Sequelize uses SQLite at `.data/campusswap.sqlite`.
- If `.data` cannot be created, it falls back to in-memory SQLite.

`src/backend/seed/seedData.ts` runs during app startup through `seedDatabase()`.

- It calls `sequelize.sync({ force: false })`.
- If users already exist, it does not seed again.
- If the database is empty, it creates demo users, listings, favorites, a conversation, messages, reviews, and notifications.

### Data model

Core tables:

- `User`: student account, university, campus, dorm, avatar, rating, review count
- `Listing`: marketplace item, price, category, condition, status, images, seller, optional buyer
- `Favorite`: join table between user and listing
- `Conversation`: one buyer/seller chat about one listing
- `Message`: chat messages, offers, meetup proposals, and system messages
- `Review`: ratings left by one user for another, optionally tied to a listing
- `Notification`: unread/read notification items for a user

Important associations:

- One user has many listings as `seller`.
- One listing belongs to one seller and optionally one buyer.
- Users favorite listings through `Favorite`.
- Listings have conversations.
- Conversations have messages.
- Users give and receive reviews.
- Users have notifications.

### API surface

Main route groups:

```text
/api/auth
  POST /register
  POST /login
  GET  /me
  GET  /demo-users
  POST /demo-login/:userId

/api/listings
  GET    /
  GET    /favorites
  GET    /:id
  POST   /
  PUT    /:id
  DELETE /:id
  POST   /:id/favorite
  PUT    /:id/status

/api/users
  GET  /:id
  PUT  /profile
  GET  /:id/listings
  POST /verify-edu

/api/conversations
  GET  /
  POST /start
  GET  /:conversationId
  POST /:conversationId/messages

/api/reviews
  GET  /user/:userId
  POST /

/api/campuses
  GET /
  GET /:id

/api/notifications
  GET /
  PUT /read-all
```

Authentication rules:

- Public or optional-auth routes: browsing listings, listing details, campus data, public profiles, public reviews.
- Protected routes: creating/updating/deleting listings, favorites, conversations, messages, profile update, notifications, reviews, and current-user data.

### Middleware

- `auth.ts`: verifies JWTs and attaches `req.user`; also supports optional auth for public listing reads.
- `validation.ts`: uses Zod to validate request body, query, or params.
- `logger.ts`: logs HTTP method, URL, status code, duration, and client IP.
- `errorHandler.ts`: sends consistent JSON errors and includes stack traces outside production.
- `helmet`, `cors`, and `express-rate-limit` are configured in `app.ts`.

### Response style

Most successful API responses look like this:

```json
{
  "success": true,
  "data": {}
}
```

Many mutation endpoints also include a `message`.

Errors look like this:

```json
{
  "success": false,
  "message": "Something went wrong"
}
```

Validation errors include an `errors` array with field-level messages.

## 3. Fresher SDE Explanation

Think of CampusSwap as two apps living in one project:

1. The React frontend is what the student sees and clicks.
2. The Express backend is the API that stores and returns data.

When a student opens the site, React loads the marketplace screen. React does not directly read the database. Instead, it calls API functions from `src/lib/api.ts`. That file wraps `fetch()` and talks to backend URLs like `/api/listings` and `/api/auth/login`.

When the request reaches the backend, it normally passes through these layers:

```text
routes -> controllers -> services -> models -> database
```

Each layer has a job:

- Routes decide which controller function should handle a URL.
- Controllers translate HTTP details into normal TypeScript function calls.
- Services hold the actual business rules.
- Models describe database tables and relationships.
- Sequelize converts model operations into SQL.

For example, if you click the favorite button:

1. `ListingCard` calls the favorite handler in `App.tsx`.
2. `App.tsx` updates the UI optimistically so it feels fast.
3. `api.listings.toggleFavorite(id)` sends `POST /api/listings/:id/favorite`.
4. `listingRoutes.ts` requires a valid JWT.
5. `ListingController.toggleFavorite()` reads the listing id and user id.
6. `ListingService.toggleFavorite()` checks if the favorite already exists.
7. It creates or deletes a `Favorite` row and updates `favoritesCount`.
8. The API returns the new favorite state.

That same mental model works for most features.

For auth, the important idea is JWT:

- Login/register returns a token.
- The frontend stores it in `localStorage`.
- Every protected request sends `Authorization: Bearer <token>`.
- The backend verifies the token and knows which student is making the request.

For the database, you do not need to manually create tables locally. The app calls `seedDatabase()` during startup. Sequelize syncs the models, then seed data is inserted only when there are no users yet. That is why a fresh clone already has sample students, items, messages, and reviews.

For adding a new backend feature, follow this order:

1. Add or update a Sequelize model if the database needs new data.
2. Add service logic in `src/backend/services`.
3. Add a controller method in `src/backend/controllers`.
4. Add a route in `src/backend/routes`.
5. Add a function in `src/lib/api.ts`.
6. Call that API function from a React component or context.

For adding a new frontend feature, start from the screen/component:

1. Find the component responsible for the UI.
2. Check if the needed data already exists in `AuthContext`, `App.tsx`, or props.
3. If data must come from the server, add or reuse an API method in `src/lib/api.ts`.
4. Keep server-specific URL details out of components when possible.

The key idea: keep UI logic in React, business logic in services, and database structure in models. If you follow that separation, the codebase stays easy to reason about as features grow.
