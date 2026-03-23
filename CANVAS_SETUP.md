# Canvas LMS Integration Setup

This document explains how to set up Canvas LMS API integration with Estimately.

## Features

- **Connect Canvas Account**: OAuth-based authentication to link your Canvas account
- **Fetch Upcoming Assignments**: Automatically retrieve assignments due in the next 7 days
- **Sync to Tasks**: Convert Canvas assignments into Estimately tasks with AI time predictions
- **Track Source**: Assignments are tagged with Canvas metadata for easy reference

## Prerequisites

1. A Canvas LMS account with courses and assignments
2. Canvas LMS OAuth application credentials (client ID and secret)

## Setup Instructions

### 1. Register Canvas OAuth Application

1. Log in to your Canvas instance as an administrator
2. Navigate to **Admin → Settings → Developer Keys**
3. Create a new Developer Key with the following:
   - **Key Name**: Estimately
   - **Redirect URLs**: `https://your-domain.com/api/canvas/callback`
   - **Scopes**: 
     - `url:GET|/api/v1/courses`
     - `url:GET|/api/v1/courses/:id/assignments`
     - `url:GET|/api/v1/users/self`

4. Note the **Client ID** and **Client Secret**

### 2. Configure Environment Variables

Add the following to your `.env.local` file:

```env
# Canvas LMS Integration
NEXT_PUBLIC_CANVAS_API_URL=https://canvas.instructure.com/api/v1
NEXT_PUBLIC_CANVAS_OAUTH_CLIENT_ID=your_client_id_here
CANVAS_OAUTH_CLIENT_SECRET=your_client_secret_here
NEXT_PUBLIC_APP_URL=http://localhost:3000  # or your production URL
```

### 3. Update Database Schema (Optional)

If you want to track Canvas assignments in your Appwrite database, add these fields to your Tasks collection:

```javascript
{
  "canvas_assignment_id": "string",           // Canvas assignment ID
  "canvas_course_id": "integer",              // Canvas course ID
  "canvas_course_name": "string",             // Course name
  "canvas_due_date": "datetime",              // Assignment due date
  "canvas_html_url": "string",                // Link to assignment on Canvas
  "source": "enum[canvas, manual]"            // Track if from Canvas or manually added
}
```

## Usage

### From Dashboard

1. Navigate to the **Dashboard** page
2. Scroll down to the **Canvas LMS Integration** card
3. Click **"Connect Canvas Account"**
4. You'll be redirected to Canvas to authorize the connection
5. After authorization, you'll be redirected back to the dashboard
6. Click **"Sync Next 7 Days"** to fetch upcoming assignments
7. Assignments will appear in your Task List

### API Endpoints

#### GET `/api/canvas/sync`
Preview upcoming Canvas assignments without syncing to database

**Response:**
```json
{
  "upcoming": [
    {
      "id": 12345,
      "name": "Essay on Climate Change",
      "course_name": "ENV 101",
      "due_at": "2026-03-30T23:59:59Z",
      "description": "Write a 5-page essay...",
      "html_url": "https://canvas.instructure.com/courses/123/assignments/12345"
    }
  ],
  "count": 1
}
```

#### POST `/api/canvas/sync`
Fetch and sync Canvas assignments to your task list

**Request:**
```json
{
  "userId": "user_id_from_appwrite"
}
```

**Response:**
```json
{
  "message": "Canvas assignments synced successfully",
  "total": 5,
  "tasks": [
    {
      "$id": "task_id",
      "title": "Essay on Climate Change",
      "canvas_assignment_id": 12345,
      "canvas_course_name": "ENV 101",
      "source": "canvas"
    }
  ]
}
```

#### GET `/api/canvas/callback`
Canvas OAuth callback handler (handled automatically)

## Troubleshooting

### "Canvas not connected" Error
- Make sure you've clicked "Connect Canvas Account" and completed the OAuth flow
- Check that `NEXT_PUBLIC_CANVAS_OAUTH_CLIENT_ID` is set correctly in `.env.local`
- Clear browser cookies and try connecting again

### No Assignments Appearing
- Check that you have active courses in Canvas
- Verify that assignments have due dates set within the next 7 days
- Check the browser console for any error messages

### OAuth Redirect URI Mismatch
- Ensure the redirect URL in your Canvas Developer Key matches exactly:
  - Dev: `http://localhost:3000/api/canvas/callback`
  - Production: `https://yourdomain.com/api/canvas/callback`

### Rate Limiting
Canvas API has rate limits. If you're syncing frequently:
- Wait at least 1 minute between sync requests
- Consider implementing queue-based syncing for large course loads

## Security Notes

- Canvas OAuth tokens are stored in **secure HttpOnly cookies**
- Tokens are never exposed to client-side JavaScript
- Redirect URL must exactly match the Canvas Developer Key configuration
- Store `CANVAS_OAUTH_CLIENT_SECRET` only on the server (.env.local)

## Data Privacy

- Only assignment metadata (title, description, due date) is synced to Estimately
- Full assignment content is not stored; assignments link back to Canvas URLs
- Students can disconnect their Canvas account at any time to stop syncing
- Synced assignments are stored in your Appwrite database with your userId

## Future Enhancements

- [ ] Sync assignment submissions back to Canvas
- [ ] Support for grading and feedback integration
- [ ] Automatic recurring syncs
- [ ] Course-specific task type mapping
- [ ] Canvas course code to Estimately subject mapping
