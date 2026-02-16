# Notebook Backend Requirements (KOKOTOA POS)

This document defines backend API requirements for the new **Notebook/Daftari** feature in frontend (`/notebook`).

## Base URL
`http://localhost:8000/api/notebook/`

## Authentication
All endpoints require JWT:

`Authorization: Bearer <your_jwt_token>`

---

## 1) Data Model Requirements

### 1.1 Note
Minimum fields:

- `id` (integer)
- `store` (FK -> Store)
- `created_by` (FK -> User)
- `title` (string, max 255, default "New Note")
- `content` (text, default "")
- `category` (enum: `expense`, `debt`, `useful`, `general`)
- `folder` (string, max 100, default "My Notes")
- `tags` (array of strings)  
  Recommended: `JSONField(default=list)`
- `is_pinned` (boolean, default false)
- `created_at` (datetime)
- `updated_at` (datetime)
- `is_archived` (boolean, default false)
- `is_deleted` (boolean, default false) (soft delete)

### 1.2 Optional (if you want notebook sharing later)
- `visibility` (`private`, `store`)
- `shared_with` (M2M users)

---

## 2) API Endpoints

## 2.1 List Notes
**GET** `/api/notebook/notes/`

Query params:
- `search` (title/content/tags)
- `category` (`expense|debt|useful|general`)
- `folder` (string)
- `is_pinned` (`true|false`)
- `is_archived` (`true|false`, default false)
- `ordering` (`-updated_at` default)
- `page`, `page_size`

Response:
```json
{
  "success": true,
  "message": "Found 12 notes.",
  "data": {
    "notes": [
      {
        "id": 1,
        "title": "Supplier debt - January",
        "content": "Paid 200,000 today...",
        "category": "debt",
        "folder": "My Notes",
        "tags": ["supplier", "jan"],
        "is_pinned": true,
        "created_at": "2026-02-16T10:00:00Z",
        "updated_at": "2026-02-16T12:00:00Z"
      }
    ],
    "summary": {
      "count": 12,
      "pinned_count": 2
    }
  },
  "errors": null
}
```

---

## 2.2 Create Note
**POST** `/api/notebook/notes/`

Request:
```json
{
  "title": "Rent + electricity",
  "content": "Rent 500,000; LUKU 120,000",
  "category": "expense",
  "folder": "My Notes",
  "tags": ["rent", "utilities"],
  "is_pinned": false
}
```

Validation:
- `category` must be one of allowed enums.
- `tags` must be string array (trim each, remove empty).

---

## 2.3 Get Note Detail
**GET** `/api/notebook/notes/{id}/`

---

## 2.4 Update Note (full)
**PUT** `/api/notebook/notes/{id}/`

---

## 2.5 Update Note (partial)
**PATCH** `/api/notebook/notes/{id}/`

Supported partial updates:
- `title`
- `content`
- `category`
- `folder`
- `tags`
- `is_pinned`
- `is_archived`

---

## 2.6 Delete Note (soft delete)
**DELETE** `/api/notebook/notes/{id}/`

Behavior:
- set `is_deleted=true`
- do not permanently remove by default

Response:
```json
{
  "success": true,
  "message": "Note deleted successfully."
}
```

---

## 2.7 Bulk Export Notes
**GET** `/api/notebook/notes/export/`

Query params (optional):
- same filters as list endpoint
- `format=json|txt` (default `json`)

Response options:
- JSON payload with notes array
- or file download attachment

---

## 2.8 Folders List (for organize UI)
**GET** `/api/notebook/folders/`

Response:
```json
{
  "success": true,
  "message": "Folders retrieved.",
  "data": {
    "folders": ["My Notes", "Expenses", "Debts", "Useful"]
  },
  "errors": null
}
```

---

## 3) Permissions / Access Rules

- User can only access notes from own store.
- Owner/authorized staff only (follow your current permission policy).
- Never expose notes from other stores.

---

## 4) Recommended Indexes

- `(store, is_deleted, updated_at DESC)`
- `(store, category, is_deleted)`
- `(store, folder, is_deleted)`
- Full-text index on `title`, `content` if available.

---

## 5) Error Handling Standard

Use existing API format:
```json
{
  "success": false,
  "message": "Validation failed.",
  "data": null,
  "errors": {
    "category": ["Invalid category."]
  }
}
```

Common status codes:
- `200 OK`
- `201 Created`
- `400 Bad Request`
- `401 Unauthorized`
- `403 Forbidden`
- `404 Not Found`

---

## 6) Frontend Contract (current)

Frontend currently expects note shape equivalent to:

```ts
{
  id: string | number;
  title: string;
  content: string;
  category: 'expense' | 'debt' | 'useful' | 'general';
  folder: string;
  tags: string[];
  pinned: boolean; // backend can return is_pinned; frontend mapping needed
  createdAt: string; // backend can return created_at
  updatedAt: string; // backend can return updated_at
}
```

Recommended:
- Keep backend snake_case.
- Frontend can map:
  - `is_pinned -> pinned`
  - `created_at -> createdAt`
  - `updated_at -> updatedAt`

---

## 7) Suggested Implementation Order

1. Create `Note` model + migration.
2. Create serializer + viewset.
3. Add filters/search + pagination.
4. Add folder list endpoint.
5. Add export endpoint.
6. Add tests:
   - auth required
   - store isolation
   - filter correctness
   - soft delete behavior
   - tag/category validation

