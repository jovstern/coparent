# CoParent Application - Implementation Plan

## Phase 1: Project Setup & Foundation

### 1.1 Initialize Project Structure
- Create Vite + React + TypeScript project
- Install core dependencies (Tailwind, shadcn/ui, Lucide icons)
- Configure Tailwind with custom color palette
- Set up project folder structure (components, hooks, lib, types)

### 1.2 Firebase Configuration
- Create Firebase project
- Set up Firebase Auth (Email/Password, Google Sign-in)
- Configure Cloud Firestore database
- Set up Firebase Storage
- Initialize Cloud Functions project structure
- Configure environment variables

### 1.3 Design System Setup
- Configure Tailwind theme with CoParent color palette
  - Primary: Slate Blue (#475569)
  - Secondary: Sage Green (#84cc16)
  - Backgrounds: Off-white/Soft Zinc
  - Alerts: Soft Amber (#f59e0b)
- Set up typography (Inter or Roboto)
- Create base component library structure with shadcn/ui

---

## Phase 2: Core Data Models & Types

### 2.1 TypeScript Interfaces
- User/Parent model
- Child model
- Agreement model (parsed contract data)
- Custody schedule model
- Expense model
- Financial split configuration
- Holiday override model

### 2.2 Firestore Schema Design
- Collections structure:
  - `users` - Parent profiles
  - `agreements` - Parsed divorce agreements
  - `expenses` - Financial transactions
  - `schedules` - Custody calendar data
  - `notifications` - System notifications
  - `invites` - Co-parent invite links

---

## Phase 3: Authentication & Onboarding

### 3.1 Authentication Flow
- Sign up / Sign in pages
- Firebase Auth integration
- Protected route wrapper
- Session management

### 3.2 AI-Powered Onboarding (Admin Flow)
- Hero screen with upload zone
- PDF/Docx drag & drop component
- Cloud Function for AI parsing (Gemini/OpenAI)
- AI analysis progress indicator
- Verification screen with extracted data
- Edit/confirm extracted information
- Co-parent invite generation
- Invite link acceptance flow

---

## Phase 4: Dashboard (Command Center)

### 4.1 Dashboard Layout
- Header with greeting and live status
- Responsive grid layout
- Navigation component

### 4.2 Live Status Widget
- Display current custody status
- Real-time updates based on schedule
- Visual indicators (🟢/🔵)

### 4.3 Timeline Widget
- 48-hour horizontal timeline view
- Display pick-up times and locations
- Show contextual notes (e.g., "Judo bag")

### 4.4 Financial Snapshot Widget
- Display current balance
- Breakdown tooltip (child support + expenses)
- "Settle Up" action button

---

## Phase 5: Calendar Module

### 5.1 Calendar Core
- Monthly/Weekly view toggle
- Display base custody schedule
- Visual day cell components

### 5.2 Holiday Integration
- Import Jewish holidays automatically
- Holiday override logic and display
- Visual indicators for holiday days
- Lock days assigned by holiday schedule

### 5.3 Swap Requests
- Click day to request swap
- Swap request modal
- Notification system
- Approval/Decline workflow
- Calendar update on approval

---

## Phase 6: Wallet (Financial Management)

### 6.1 Split Slider Component
- Shadcn slider with dual colors
- Current ratio display (e.g., 50/50)
- Drag interaction
- Confirmation modal on change
- Cloud Function trigger for notifications

### 6.2 Expense Ledger
- Expense list view with filtering
- Add expense flow
- Receipt upload (camera/gallery)
- Category selection
- Auto-calculation based on current split
- Recurring payment tracking
- CPI-linked adjustment display

### 6.3 Balance & Settlement
- Real-time balance calculation
- Settlement request workflow
- Payment confirmation
- Transaction history

---

## Phase 7: The Vault (Document Management)

### 7.1 Digital Agreement
- Display parsed PDF as searchable text
- Section navigation
- Search functionality

### 7.2 Asset Tracker
- Kfar Saba Apartment tracker
- 18-month countdown timer
- Sale deadline notifications

### 7.3 Emergency Information
- Child medical ID display
- Blood type, HMO details
- Emergency contacts
- Quick access from dashboard

---

## Phase 8: Cloud Functions & Backend Logic

### 8.1 AI Parsing Function
- Trigger on PDF upload
- Parse with Gemini/OpenAI API
- Extract key data points (custody, finances, holidays)
- Store structured data in Firestore

### 8.2 Notification Functions
- Email notifications
- Push notifications (optional)
- Expense alerts
- Split ratio change alerts
- Swap request notifications

### 8.3 Scheduled Functions
- CPI index updates
- Holiday calendar sync
- Recurring payment automation

---

## Phase 9: Testing & Polish

### 9.1 Component Testing
- Unit tests for core components
- Integration tests for key flows
- E2E tests for critical paths

### 9.2 UI/UX Polish
- Responsive design testing
- Accessibility audit
- Loading states
- Error handling
- Empty states

### 9.3 Performance Optimization
- Code splitting
- Image optimization
- Firebase query optimization
- Caching strategy

---

## Phase 10: Deployment & Documentation

### 10.1 Deployment Setup
- Firebase Hosting configuration
- Production environment variables
- Domain setup
- SSL configuration

### 10.2 Documentation
- User guide
- Admin setup guide
- Technical documentation
- API documentation

---

## Unresolved Questions

1. **AI Provider**: Gemini API or OpenAI API for PDF parsing?
2. **Language**: Hebrew UI support required from day 1 or English first?
3. **Currency**: Support only ₪ (ILS) or multi-currency?
4. **CPI Updates**: Manual input or auto-fetch from external API?
5. **Payment Integration**: In-app payment processing (Stripe/PayPal) or manual settlement tracking only?
6. **Mobile App**: Web-only or native mobile apps planned?
7. **Notifications**: Email only or push notifications via FCM?
8. **Multiple Children**: Does one agreement cover multiple children or separate agreements per child?
9. **Historical Data**: How far back should expense/schedule history be retained?
10. **Privacy**: Should parents see each other's contact info or keep it hidden via system?