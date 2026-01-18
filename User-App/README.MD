# Artistic Integrity

Artistic Integrity is a hackathon project focused on protecting and respecting human made art in an era of widespread generative AI.

The project combines a mobile application, a lightweight backend, and an AI assisted verification pipeline to flag potentially AI generated artwork while keeping humans in control of final decisions.

The system is intentionally designed so that AI never makes the final call.

## Problem Statement

As AI generated images become more common, artists face increasing difficulty proving that their work is human made. Automated detection systems are unreliable on their own, while purely manual moderation does not scale.

Artistic Integrity addresses this by using AI as an advisory signal combined with human verification.

## Core Idea

Users upload artwork to the platform.

Each submission is scanned by an AI model that estimates how likely the content is to be AI generated.

The AI result is stored as a score and clearly labeled as informational.

Human moderators review flagged content and make the final verification decision.

## System Architecture

The project is split into five main components.

User App
A React Native Expo application where users upload posts and track verification status.

PocketBase
Acts as the main backend and source of truth. It stores posts, media files, AI scores, and verification state.

Middleman Backend
A FastAPI service responsible for fetching uploaded media from PocketBase, running AI inference, and writing results back.

AI Model
A PyTorch based image classifier trained to distinguish between human made and AI generated images.

Admin App
A moderation interface that displays unverified posts along with AI scores and allows human approval or rejection.

## Data Flow Overview

1. User uploads content through the mobile app
2. PocketBase stores the post and media
3. The middleman backend is triggered asynchronously
4. The AI model analyzes the media
5. AI results are written back to PocketBase
6. Admins review and verify submissions
7. Users see updated verification status

## AI Model

The AI model is a binary image classifier built with PyTorch and timm.

Architecture
EfficientNet B2

Training Configuration
Image size 224 by 224
Batch size 32
Binary classification using BCEWithLogitsLoss

Output
The model produces a probability score that is converted into a percentage likelihood.

Important note
The AI output is advisory only and is never treated as ground truth.

## Verification Philosophy

Artistic Integrity does not attempt to fully automate moderation.

AI is used to surface potentially suspicious content.

Humans make the final decision.

False positives are preferred over false negatives to avoid incorrectly approving AI generated content.

## Verify Page

The Verify page allows users to track the verification status of their submissions.

Displayed states
Scanning
Pending review
Verified

The page observes PocketBase records and updates automatically.

It does not block the UI or wait for AI results.

## Admin Moderation

Admins see a dashboard of unverified posts.

Each entry includes
User information
Post content
Media preview
AI likelihood score
Verification status

Admins can approve or reject submissions, updating PocketBase directly.

## Technology Stack

Frontend
React Native
Expo
TypeScript

Backend
PocketBase
FastAPI

Machine Learning
PyTorch
timm

## Security Model

The frontend never writes AI related fields.

The middleman backend uses privileged credentials and only updates AI related fields.

PocketBase remains the single source of truth.

## Limitations

AI detection of generated art is an unsolved problem.

Results depend heavily on dataset diversity and image style.

This project prioritizes transparency and human judgment over raw accuracy.

## Hackathon Scope

This project was built under hackathon time constraints.

The focus was on system design, integration, and responsible AI usage rather than model perfection.

## License

MIT License

## Summary

Artistic Integrity demonstrates a responsible approach to AI assisted content verification.

It treats AI as a tool, not an authority.

Humans remain in control of final decisions.

The system is designed to be transparent, ethical, and practical.


# Artistic Integrity - PocketBase Schemas

Here are the complete PocketBase schemas used in the Artistic Integrity project:

## Core Collections

### 1. Users (`pbc_1736455494`)
Stores user profiles and verification statistics.
```json
{
  "collectionId": "pbc_1736455494",
  "collectionName": "users",
  "schema": [
    {
      "name": "email",
      "type": "email",
      "required": true,
      "unique": true
    },
    {
      "name": "emailVisibility",
      "type": "bool",
      "required": false
    },
    {
      "name": "verified",
      "type": "bool",
      "required": false
    },
    {
      "name": "username",
      "type": "text",
      "required": true,
      "unique": true
    },
    {
      "name": "name",
      "type": "text",
      "required": true
    },
    {
      "name": "profilePicture",
      "type": "file",
      "required": false
    },
    {
      "name": "bio",
      "type": "text",
      "required": false
    },
    {
      "name": "authenticity_score",
      "type": "number",
      "required": false,
      "min": 0,
      "max": 100
    },
    {
      "name": "verifiedArtworks",
      "type": "number",
      "required": false,
      "min": 0
    }
  ]
}
```

### 2. Posts (`pbc_1125843985`)
Main collection for artwork submissions with verification tracking.
```json
{
  "collectionId": "pbc_1125843985",
  "collectionName": "posts",
  "schema": [
    {
      "name": "type",
      "type": "select",
      "required": true,
      "options": ["image", "text", "mixed"]
    },
    {
      "name": "media",
      "type": "file",
      "required": false
    },
    {
      "name": "author",
      "type": "relation",
      "required": true,
      "collectionId": "pbc_1736455494"
    },
    {
      "name": "caption",
      "type": "text",
      "required": false
    },
    {
      "name": "verified",
      "type": "select",
      "required": true,
      "options": ["pending", "scanning", "verified", "rejected"],
      "defaultValue": "pending"
    },
    {
      "name": "hashtags",
      "type": "relation",
      "required": false,
      "collectionId": "pbc_1638888438"
    },
    {
      "name": "ai_score",
      "type": "number",
      "required": false,
      "min": 0,
      "max": 100
    },
    {
      "name": "ai_checked",
      "type": "bool",
      "required": false,
      "defaultValue": false
    },
    {
      "name": "verified_by",
      "type": "relation",
      "required": false,
      "collectionId": "pbc_1736455494"
    },
    {
      "name": "verification_notes",
      "type": "text",
      "required": false
    }
  ]
}
```

### 3. Hashtags (`pbc_1638888438`)
Stores hashtag metadata and usage statistics.
```json
{
  "collectionId": "pbc_1638888438",
  "collectionName": "hashtags",
  "schema": [
    {
      "name": "tag",
      "type": "text",
      "required": true,
      "unique": true
    },
    {
      "name": "usage_count",
      "type": "number",
      "required": false,
      "min": 0
    }
  ]
}
```

### 4. Artwork Comments (`pbc_3183207505`)
User comments on verified artwork.
```json
{
  "collectionId": "pbc_3183207505",
  "collectionName": "artwork_comments",
  "schema": [
    {
      "name": "user",
      "type": "relation",
      "required": true,
      "collectionId": "pbc_1736455494"
    },
    {
      "name": "artwork",
      "type": "relation",
      "required": true,
      "collectionId": "pbc_1125843985"
    },
    {
      "name": "content",
      "type": "text",
      "required": true
    }
  ]
}
```

### 5. Artwork Likes (`pbc_823401238`)
Tracks user likes on artwork posts.
```json
{
  "collectionId": "pbc_823401238",
  "collectionName": "artwork_likes",
  "schema": [
    {
      "name": "user",
      "type": "relation",
      "required": true,
      "collectionId": "pbc_1736455494",
      "unique": true
    },
    {
      "name": "artwork",
      "type": "relation",
      "required": true,
      "collectionId": "pbc_1125843985",
      "unique": true
    }
  ]
}
```

### 6. Follows (`pbc_3660641689`)
User following relationships.
```json
{
  "collectionId": "pbc_3660641689",
  "collectionName": "follows",
  "schema": [
    {
      "name": "follower",
      "type": "relation",
      "required": true,
      "collectionId": "pbc_1736455494",
      "unique": true
    },
    {
      "name": "following",
      "type": "relation",
      "required": true,
      "collectionId": "pbc_1736455494",
      "unique": true
    }
  ]
}
```

### 7. Saved Artworks (`pbc_3958011512`)
User bookmarks for favorite artwork.
```json
{
  "collectionId": "pbc_3958011512",
  "collectionName": "saved_artworks",
  "schema": [
    {
      "name": "user",
      "type": "relation",
      "required": true,
      "collectionId": "pbc_1736455494",
      "unique": true
    },
    {
      "name": "artwork",
      "type": "relation",
      "required": true,
      "collectionId": "pbc_1125843985",
      "unique": true
    }
  ]
}
```

## Schema Relationships

```
Users (pbc_1736455494)
    │
    ├─── has many ──▶ Posts (pbc_1125843985) ── author
    │
    ├─── has many ──▶ Artwork Comments (pbc_3183207505) ── user
    │
    ├─── has many ──▶ Artwork Likes (pbc_823401238) ── user
    │
    ├─── has many ──▶ Follows (pbc_3660641689) ── follower/following
    │
    └─── has many ──▶ Saved Artworks (pbc_3958011512) ── user

Posts (pbc_1125843985)
    │
    ├─── has many ──▶ Artwork Comments (pbc_3183207505) ── artwork
    │
    ├─── has many ──▶ Artwork Likes (pbc_823401238) ── artwork
    │
    ├─── has many ──▶ Saved Artworks (pbc_3958011512) ── artwork
    │
    └─── has many ──▶ Hashtags (pbc_1638888438) ── hashtags
```

## Verification Flow Using Schemas

1. **Upload**: User creates a post in `posts` collection with `verified: "pending"`

2. **AI Processing**: Middleman backend:
   - Fetches post with `ai_checked: false`
   - Updates `ai_score` (0-100) and sets `ai_checked: true`
   - Updates `verified: "scanning"`

3. **Admin Review**: Admin dashboard shows posts where:
   - `verified: "scanning"` or `verified: "pending"`
   - `ai_checked: true`

4. **Human Decision**: Admin updates:
   - `verified: "verified"` or `"rejected"`
   - `verified_by`: Admin user ID
   - `verification_notes`: Optional explanation

5. **User Stats**: When post is verified:
   - Increment `users.verifiedArtworks`
   - Recalculate `users.authenticity_score` based on verification history

## Index Recommendations

For optimal performance:

```javascript
// Posts collection indexes
db.createIndex("posts", ["verified", "ai_checked", "created"]);
db.createIndex("posts", ["author", "created"]);
db.createIndex("posts", ["verified", "created"]);

// Users collection indexes
db.createIndex("users", ["authenticity_score", "verifiedArtworks"]);
db.createIndex("users", ["username"]);

// Relations indexes
db.createIndex("artwork_likes", ["artwork", "user"]);
db.createIndex("follows", ["follower", "following"]);
```

These schemas support the complete Artistic Integrity workflow while maintaining data consistency and enabling efficient queries for both user-facing and moderation interfaces.