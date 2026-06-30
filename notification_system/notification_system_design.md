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

---

# Stage 3

## Query Analysis

The following query is functionally correct:

```sql
SELECT *
FROM notifications
WHERE student_id = 1042
AND is_read = false
ORDER BY created_at DESC;
```

However, it becomes slow as the notifications table grows because it scans a large number of rows and sorts them.

### Recommended Index

```sql
CREATE INDEX idx_notifications_student_read_created
ON notifications(student_id, is_read, created_at DESC);
```

This index supports filtering and ordering efficiently.

### Why not index every column?

Creating indexes on every column increases storage usage and slows INSERT, UPDATE, and DELETE operations because every index must also be updated. Only frequently queried columns should be indexed.

### Placement Notifications (Last 7 Days)

```sql
SELECT *
FROM notifications
WHERE notification_type = 'Placement'
AND created_at >= NOW() - INTERVAL '7 days';
```

---

# Stage 4

## Improving Performance

Fetching notifications from the database on every page load is inefficient.

### Recommended Improvements

- Cache recent notifications using Redis.
- Use pagination instead of loading all notifications.
- Push new notifications using WebSockets.
- Load only unread notifications initially.
- Archive old notifications into separate storage.

### Tradeoffs

| Strategy | Benefits | Tradeoffs |
|----------|----------|-----------|
| Redis Cache | Very fast reads | Extra infrastructure |
| Pagination | Lower DB load | Multiple API calls |
| WebSockets | Real-time updates | Persistent connections |
| Archiving | Smaller active tables | Retrieval is slower |

---

# Stage 5

## Problems with Current Implementation

The current implementation is synchronous. If sending one email fails, the remaining students are not processed.

Database writes and email delivery should be handled independently.

### Improved Architecture

- Save notifications in the database first.
- Publish notification events to a message queue (RabbitMQ/Kafka).
- Separate workers send emails and push notifications.
- Retry failed jobs automatically.
- Use dead-letter queues for repeated failures.

### Improved Pseudocode

```text
notifyAll(studentIds, message):

    notificationId = saveNotification(message)

    publishQueue({
        notificationId,
        studentIds
    })

Worker:

    while(queue not empty):

        job = getNextJob()

        sendEmail(job)

        sendPushNotification(job)

        markDelivered(job)
```

---

# Stage 6

## Priority Inbox

Priority is calculated using notification type and recency.

Weight:

- Placement = 3
- Result = 2
- Event = 1

Priority Score:

```
priority = weight × timestamp
```

Notifications are sorted by priority score in descending order and only the Top 10 unread notifications are returned.

### Efficient Maintenance

Instead of sorting the complete notification list every request:

- Maintain a Min Heap of size 10.
- Insert new notifications as they arrive.
- Remove the lowest priority item when necessary.
- Time Complexity becomes O(log n) per insertion.

This allows the Priority Inbox to remain efficient even with millions of notifications.