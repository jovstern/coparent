# CoParent

A collaborative web application for divorced or separated parents to manage shared custody, finances, and legal obligations.

## Features

### ✅ Implemented

- **Authentication** - Email/password and Google OAuth
- **AI-Powered Onboarding** - Upload divorce agreements (PDF/DOCX) for automated parsing
- **Dashboard** - Overview of custody status, timeline, finances, and children
- **Calendar** - Monthly/weekly view with custody schedule, holiday overrides, and swap requests
- **Wallet** - Expense tracking, split ratio slider, balance management
- **Vault** - Document storage, asset tracking, medical ID, emergency contacts
- **Cloud Functions** - Automated notifications, CPI updates, agreement parsing
- **Security** - Firestore rules, Storage rules, protected routes

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS v4
- **Backend**: Firebase (Auth, Firestore, Storage, Functions, Hosting)
- **AI**: Google Gemini API (configured)
- **Date Management**: date-fns
- **Icons**: Lucide React
- **Routing**: React Router v6

## Getting Started

### Prerequisites

- Node.js 18+
- Firebase project
- Gemini API key (optional, for AI parsing)

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd coparent
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
Create a `.env` file with your Firebase credentials:
```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-bucket.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_GEMINI_API_KEY=your-gemini-key (optional)
```

4. Start development server
```bash
npm run dev
```

5. Open http://localhost:5173

### Firebase Setup

1. Create a Firebase project at https://console.firebase.google.com
2. Enable Authentication (Email/Password and Google)
3. Create Firestore database
4. Enable Storage
5. Deploy Firestore rules and indexes:
```bash
firebase deploy --only firestore:rules,firestore:indexes,storage
```

### Cloud Functions (Optional)

1. Navigate to functions directory
```bash
cd functions
npm install
```

2. Build and deploy functions
```bash
npm run build
firebase deploy --only functions
```

## Project Structure

```
coparent/
├── src/
│   ├── components/       # Reusable components (Navigation, ProtectedRoute)
│   ├── hooks/           # Custom hooks (useAuth)
│   ├── lib/             # Firebase config
│   ├── pages/           # Page components
│   │   ├── SignIn.tsx
│   │   ├── SignUp.tsx
│   │   ├── Onboarding.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Calendar.tsx
│   │   ├── Wallet.tsx
│   │   └── Vault.tsx
│   ├── types/           # TypeScript interfaces
│   ├── App.tsx          # Main app with routing
│   ├── main.tsx         # Entry point
│   └── index.css        # Global styles
├── functions/           # Cloud Functions
│   └── src/
│       └── index.ts     # Function definitions
├── firebase.json        # Firebase config
├── firestore.rules      # Firestore security rules
├── firestore.indexes.json  # Firestore indexes
├── storage.rules        # Storage security rules
└── PLAN.md             # Implementation plan
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `firebase deploy` - Deploy to Firebase Hosting

## Design Philosophy

**"De-escalation by Design"** - The interface is intentionally neutral, objective, and calming to reduce conflict:

- **Primary Color** (Slate Blue #475569) - Trust and authority
- **Secondary Color** (Sage Green #84cc16) - Balance and positive status
- **Alert Color** (Soft Amber #f59e0b) - Non-aggressive warnings
- **Background** - Off-white/Soft Zinc for reduced eye strain

## Key Features

### Calendar
- Monthly and weekly views
- Visual custody schedule
- Holiday override system (automatically handles Jewish holidays)
- Schedule swap requests with approval workflow

### Wallet
- Dynamic split slider (adjustable expense ratios)
- Expense ledger with categories
- Auto-calculation based on current split
- CPI-linked child support tracking
- Balance and settlement management

### Vault
- Searchable digital agreement
- Asset tracker with sale deadlines
- Medical ID with blood type and health insurance
- Emergency contacts
- Document management

### Cloud Functions
- `parseAgreement` - AI-powered PDF/DOCX parsing
- `notifyExpenseAdded` - Email notifications for new expenses
- `notifySplitRatioChanged` - Alerts when split ratio updates
- `notifySwapRequest` - Schedule swap notifications
- `updateCPILinkedPayments` - Monthly CPI adjustments

## Security

- Authentication required for all protected routes
- Firestore rules ensure parents can only access their own agreements
- Storage rules protect uploaded documents
- Email verification (optional)
- Secure token-based invite system

## Roadmap

- [ ] Real-time notifications
- [ ] Mobile app (React Native)
- [ ] Multi-language support (Hebrew)
- [ ] Payment gateway integration (Stripe/PayPal)
- [ ] Advanced analytics and insights
- [ ] Calendar export (iCal)
- [ ] SMS notifications

## Contributing

This is a private project. For issues or feature requests, please contact the development team.

## License

Proprietary - All rights reserved

## Support

For questions or support:
- GitHub Issues: [repository]/issues
- Documentation: See PLAN.md and PROGRESS.md
- Firebase Console: https://console.firebase.google.com/project/coparent-5597c

---

Built with ❤️ for co-parenting families
