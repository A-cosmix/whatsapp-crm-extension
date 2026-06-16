# Firebase Setup Guide

## Step 1: Create Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click **Add project** → Name: `explain-like-whatsapp`
3. Disable Google Analytics (optional) → Create project

## Step 2: Enable Authentication

1. Build → Authentication → Get started
2. Sign-in method → Email/Password → Enable
3. (Optional) Enable Email link for passwordless login

## Step 3: Create Firestore Database

1. Build → Firestore Database → Create database
2. Start in **production mode**
3. Choose region: `asia-south1` (Mumbai) for India-first users

## Step 4: Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      match /explanations/{docId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
    match /analytics/{docId} {
      allow create: if request.auth != null;
      allow read: if false;
    }
  }
}
```

## Step 5: Get Web App Config

1. Project Settings → General → Your apps → Web app
2. Register app: `explain-like-whatsapp-extension`
3. Copy config values to `extension/.env`

## Step 6: User Document Schema

Each user document at `users/{uid}`:

```json
{
  "uid": "string",
  "email": "string",
  "displayName": "string",
  "createdAt": 1234567890,
  "trialStartDate": 1234567890,
  "trialEndDate": 1234567890,
  "subscriptionStatus": "trial | active | expired | none",
  "subscriptionExpiry": 1234567890,
  "dailyExplanationCount": 0,
  "lastExplanationDate": "2026-06-16",
  "streak": 0,
  "longestStreak": 0,
  "totalExplanations": 0,
  "achievements": [],
  "preferredMode": "whatsapp",
  "preferredLanguage": "en",
  "darkMode": false,
  "onboardingComplete": false
}
```

## Step 7: Email Verification

Firebase sends verification emails automatically on signup. Customize templates in Authentication → Templates.

## Troubleshooting

- **auth/invalid-api-key**: Check `VITE_FIREBASE_API_KEY` in `.env`
- **permission-denied**: Verify Firestore security rules
- **email-already-in-use**: User needs to login instead of signup
