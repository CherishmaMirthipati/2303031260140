# Notification System Design

## Stage 1

### Core Actions
- Create notification
- Fetch user notifications
- Mark notification as read
- Fetch unread count
- Send real-time notification

### REST APIs

#### Create Notification
POST /api/notifications

Headers:
Authorization: Bearer token
Content-Type: application/json

Request:
{
  "studentId": 1042,
  "type": "Placement",
  "message": "CSX Corporation hiring",
  "priority": "high"
}

Response:
{
  "success": true,
  "notificationId": "uuid",
  "message": "Notification created successfully"
}

#### Get Notifications
GET /api/students/{studentId}/notifications?limit=20&offset=0

Response:
{
  "studentId": 1042,
  "notifications": [
    {
      "id": "uuid",
      "type": "Placement",
      "message": "CSX Corporation hiring",
      "isRead": false,
      "createdAt": "2026-04-22T17:51:18Z"
    }
  ]
}

#### Mark as Read
PATCH /api/notifications/{notificationId}/read

Response:
{
  "success": true,
  "message": "Notification marked as read"
}

#### Unread Count
GET /api/students/{studentId}/notifications/unread-count

Response:
{
  "studentId": 1042,
  "unreadCount": 12
}

### Real-Time Mechanism
Use WebSockets or Server-Sent Events. WebSocket is preferred because it supports persistent two-way communication. When a notification is created, the backend publishes it to the connected student session.

---

## Stage 2

### Recommended DB
PostgreSQL is recommended because notifications need reliable persistence, indexing, filtering, ordering, and transactional consistency.

### Schema

```sql
CREATE TABLE students (
  id BIGINT PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(150) UNIQUE NOT NULL
);

CREATE TYPE notification_type AS ENUM ('Event', 'Result', 'Placement');

CREATE TABLE notifications (
  id UUID PRIMARY KEY,
  student_id BIGINT NOT NULL REFERENCES students(id),
  notification_type notification_type NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
### Queries

#### Create notification

```sql
INSERT INTO notifications(id, student_id, notification_type, message, is_read)
VALUES ($1, $2, $3, $4, false);
```

#### Fetch notifications

```sql
SELECT id, notification_type, message, is_read, created_at
FROM notifications
WHERE student_id = $1
ORDER BY created_at DESC
LIMIT $2 OFFSET $3;
```

#### Mark as read

```sql
UPDATE notifications
SET is_read = true
WHERE id = $1 AND student_id = $2;
```

#### Unread count

```sql
SELECT COUNT(*)
FROM notifications
WHERE student_id = $1
AND is_read = false;
```