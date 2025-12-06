# Firestore Database Schema

## Collections Structure

### users
```
/users/{userId}
```
- `id`: string (document ID)
- `email`: string
- `displayName`: string
- `photoURL`: string (optional)
- `role`: "admin" | "parent"
- `agreementId`: string (reference to agreements collection)
- `createdAt`: timestamp
- `lastLogin`: timestamp

### agreements
```
/agreements/{agreementId}
```
- `id`: string (document ID)
- `createdAt`: timestamp
- `updatedAt`: timestamp
- `parent1Id`: string (reference to users)
- `parent2Id`: string (reference to users)
- `children`: array of child IDs
- `status`: "active" | "pending" | "archived"
- `originalDocumentUrl`: string (optional)
- `parsedData`: object
  - `custodySchedule`: object
  - `financialTerms`: object
  - `holidays`: array
  - `specialProvisions`: array (optional)
  - `assets`: array (optional)

### children
```
/agreements/{agreementId}/children/{childId}
```
- `id`: string (document ID)
- `agreementId`: string
- `firstName`: string
- `lastName`: string
- `dateOfBirth`: timestamp
- `bloodType`: string (optional)
- `healthInsurance`: string (optional)
- `medicalNotes`: string (optional)
- `emergencyContacts`: array of objects

### expenses
```
/agreements/{agreementId}/expenses/{expenseId}
```
- `id`: string (document ID)
- `agreementId`: string
- `addedBy`: string (parent user ID)
- `date`: timestamp
- `category`: "medical" | "education" | "clothing" | "extracurricular" | "childcare" | "other"
- `description`: string
- `amount`: number
- `currency`: string
- `receiptUrl`: string (optional)
- `splitRatio`: number
- `parent1Share`: number
- `parent2Share`: number
- `status`: "pending" | "approved" | "disputed" | "settled"
- `settledAt`: timestamp (optional)
- `notes`: string (optional)

### balances
```
/agreements/{agreementId}/balances/{balanceId}
```
- `agreementId`: string
- `parent1Id`: string
- `parent2Id`: string
- `parent1Owes`: number
- `parent2Owes`: number
- `currency`: string
- `lastUpdated`: timestamp
- `transactions`: array of transaction objects

### scheduleSwaps
```
/agreements/{agreementId}/scheduleSwaps/{swapId}
```
- `id`: string (document ID)
- `agreementId`: string
- `requestedBy`: string (parent user ID)
- `requestedFrom`: string (parent user ID)
- `date`: string (ISO date)
- `status`: "pending" | "approved" | "rejected"
- `reason`: string (optional)
- `createdAt`: timestamp
- `respondedAt`: timestamp (optional)

### notifications
```
/users/{userId}/notifications/{notificationId}
```
- `id`: string (document ID)
- `userId`: string
- `agreementId`: string
- `type`: notification type enum
- `title`: string
- `message`: string
- `data`: object (optional)
- `isRead`: boolean
- `createdAt`: timestamp
- `actionUrl`: string (optional)

### invites
```
/invites/{inviteId}
```
- `id`: string (document ID)
- `agreementId`: string
- `createdBy`: string (user ID)
- `email`: string
- `role`: "parent"
- `status`: "pending" | "accepted" | "expired"
- `token`: string
- `expiresAt`: timestamp
- `createdAt`: timestamp
- `acceptedAt`: timestamp (optional)

### documents
```
/agreements/{agreementId}/documents/{documentId}
```
- `id`: string (document ID)
- `agreementId`: string
- `uploadedBy`: string (user ID)
- `name`: string
- `type`: "agreement" | "court_order" | "receipt" | "medical" | "other"
- `url`: string (Firebase Storage URL)
- `size`: number (bytes)
- `mimeType`: string
- `uploadedAt`: timestamp
- `metadata`: object (optional)

## Security Rules Considerations

1. Users can only read/write their own data
2. Both parents in an agreement can read/write shared agreement data
3. Only the admin (creator) can invite new co-parents
4. Expenses can be added by either parent
5. Schedule swaps require approval from the other parent
6. Notifications are private to each user
7. Documents are shared between both parents in an agreement

## Indexes Required

1. `agreements`: Query by `parent1Id` or `parent2Id`
2. `expenses`: Query by `agreementId` + `date` (descending)
3. `notifications`: Query by `userId` + `createdAt` (descending)
4. `scheduleSwaps`: Query by `agreementId` + `status`
5. `invites`: Query by `token` and `email`
