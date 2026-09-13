# Contacts API Specification

## Endpoints

### GET /contacts
List all contacts for the authenticated user. Requires authentication.

**Headers:**
- `Authorization: Bearer <token>`

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "contact-uuid-1",
      "ownerId": "abc123def456",
      "contactUserId": "xyz789ghi012",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

**Error Response (500):**
```json
{
  "success": false,
  "error": {
    "code": "LIST_CONTACTS_FAILED",
    "message": "Error description"
  }
}
```

---

### POST /contacts
Add a new contact. Requires authentication.

**Headers:**
- `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "userId": "xyz789ghi012"
}
```

**Validation Rules:**
- `userId`: string, min 1 character

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "contact-uuid-1",
    "ownerId": "abc123def456",
    "contactUserId": "xyz789ghi012",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "error": {
    "code": "ADD_CONTACT_FAILED",
    "message": "Error description"
  }
}
```

---

### DELETE /contacts/:contactId
Remove a contact. Requires authentication.

**Headers:**
- `Authorization: Bearer <token>`

**Path Parameters:**
- `contactId`: string, the contact ID to remove

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "Contact removed successfully"
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "error": {
    "code": "REMOVE_CONTACT_FAILED",
    "message": "Error description"
  }
}
```
