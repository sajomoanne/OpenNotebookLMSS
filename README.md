# 📓 NotebookLM Tabs

A community directory of public [NotebookLM](https://notebooklm.google.com) notebooks — browse what others are exploring, and share your own.

Plain HTML + vanilla JS (ES modules) backed by Firebase Auth + Firestore. No build step, no frameworks.

## Pages

| Page | Description |
|---|---|
| `index.html` | Public directory — browse approved notebooks (search + category filters, paginated) |
| `submit.html` | Submit a notebook (requires sign-in; supports `?id=` for editing your own) |
| `my-notebooks.html` | Your submissions with review status, edit & delete (requires sign-in) |
| `admin.html` | Review queue for admins (requires `admin/{uid}` doc to exist) |

## Run locally

```bash
npx serve .
```

Then open http://localhost:3000 (or the port `serve` prints). ES modules require
HTTP — opening `index.html` via `file://` will not work.

## Firebase setup

The app is already wired to the `opennote-isawesome` project (config lives in
`firebase.js`). Firestore security rules are in `firestore.rules` — deploy them
with:

```bash
firebase deploy --only firestore:rules
```

Make yourself an admin by creating a document `admin/{your-uid}` (any fields,
e.g. `{ "role": "admin" }`) in the Firestore console, or via the client SDK
while rules permit.

### Required Firestore indexes

Create these composite indexes in the Firebase console (Firestore → Indexes),
or let the console generate them from the error links the queries produce:

1. `notebooks` — `isPublic` ASC, `reviewStatus` ASC, `createdAt` DESC
   *(directory listing)*
2. `notebooks` — `ownerId` ASC, `createdAt` DESC
   *(my notebooks)*
3. `notebooks` — `reviewStatus` ASC, `createdAt` DESC
   *(admin queue filters)*

## Data model

- `notebooks/{id}` — `ownerId`, `title`, `description`, `url`,
  `suggestedTags[]`, `tags[]`, `isPublic`, `reviewStatus`,
  `reviewedBy`, `reviewedAt`, `reviewNote`, `createdAt`, `updatedAt`,
  `sources` (optional), plus subcollections `ratings/` and `reports/` (Phase 2)
- `users/{uid}` — `displayName`, `email`, `bio`, `createdAt`, `lastLoginAt`
- `admin/{uid}` — marker doc; its existence grants admin access
