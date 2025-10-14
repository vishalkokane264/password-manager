# SecureVault - Password Manager

A secure, web-based password manager built with React, TypeScript, and Firebase that helps you safely store and manage all your credentials in one place.

## 🔐 Features

- **Secure Authentication**: Firebase Authentication with master password encryption
- **End-to-End Encryption**: All passwords encrypted with your master password before storage
- **Password History**: Maintains up to 3 previous passwords for each account
- **Monthly Reminders**: Automatic notifications to change passwords every month
- **Category Management**: Organize credentials by type (Banking, Email, Social Media, etc.)
- **Favorites System**: Mark frequently used credentials as favorites
- **Strong Password Generator**: Built-in secure password creation tool
- **Search & Filter**: Quickly find credentials with advanced filtering
- **Responsive Design**: Works on desktop and mobile devices
- **Firebase Hosting**: Cloud deployment with global CDN

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Firebase account

### Installation

1. **Clone or download the project files**

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Set up Firebase**:

   - Create a new Firebase project at [https://console.firebase.google.com](https://console.firebase.google.com)
   - Enable Authentication (Email/Password)
   - Enable Firestore Database
   - Enable Hosting
   - Copy your Firebase config and update `src/config/firebase.ts`

4. **Initialize Firebase** (if not already done):

   ```bash
   npm install -g firebase-tools
   firebase login
   firebase init
   ```

5. **Start the development server**:

   ```bash
   npm start
   ```

6. **Build for production**:

   ```bash
   npm run build
   ```

7. **Deploy to Firebase**:
   ```bash
   firebase deploy
   ```

## 🔧 Configuration

### Firebase Setup

Update `src/config/firebase.ts` with your Firebase configuration:

```typescript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id",
};
```

### Security Rules

The included Firestore security rules ensure that:

- Users can only access their own credentials
- All operations require authentication
- Data is properly validated

## 📱 Usage

### First Time Setup

1. **Create Account**: Sign up with your email and create a strong master password
2. **Add Credentials**: Click the "+" button to add your first credential
3. **Organize**: Use categories and favorites to keep credentials organized

### Daily Usage

1. **Search**: Use the search bar to quickly find credentials
2. **Copy**: Click copy buttons to copy username/password to clipboard
3. **Update**: Regular password updates with history tracking
4. **Reminders**: Respond to monthly password change notifications

### Password Management

- **Generate**: Use built-in password generator for strong passwords
- **History**: View up to 3 previous passwords for each account
- **Reminders**: Get notified monthly to update passwords
- **Security**: All passwords encrypted with your master password

## 🛡️ Security Features

### Encryption

- **Client-side encryption**: Passwords encrypted before sending to Firebase
- **PBKDF2**: Key derivation with 10,000 iterations
- **AES encryption**: Industry-standard encryption algorithm
- **Zero-knowledge**: Firebase never sees your unencrypted passwords

### Authentication

- **Firebase Auth**: Secure authentication service
- **Master password**: Additional encryption layer
- **Session management**: Automatic logout on inactivity

### Best Practices

- **Strong passwords**: Built-in password strength checker
- **Regular updates**: Monthly password change reminders
- **Secure storage**: Encrypted storage in Firebase Firestore
- **HTTPS only**: All communication encrypted in transit

## 📊 Categories

Organize your credentials with predefined categories:

- Banking
- Email
- Social Media
- Work
- Shopping
- Entertainment
- Government
- Health
- Education
- Other

## 🔄 Password History

- Automatically saves previous passwords when updating
- Maintains up to 3 historical passwords per credential
- Easy access to previous passwords when needed
- Secure encryption for historical data

## ⏰ Password Reminders

- Monthly notifications for password updates
- Snooze functionality for flexible scheduling
- Visual indicators for overdue passwords
- Customizable reminder frequency

## 🎨 Tech Stack

- **Frontend**: React 18, TypeScript, Material-UI
- **Backend**: Firebase (Auth, Firestore, Hosting)
- **Encryption**: crypto-js, Web Crypto API
- **Build**: Create React App, Firebase CLI

## 📂 Project Structure

```
src/
├── components/
│   ├── Auth/
│   │   └── Login.tsx          # Authentication component
│   └── Dashboard/
│       └── Dashboard.tsx      # Main application interface
├── config/
│   └── firebase.ts           # Firebase configuration
├── services/
│   ├── credentialService.ts  # Credential CRUD operations
│   └── encryptionService.ts  # Encryption utilities
├── types/
│   └── credential.ts         # TypeScript type definitions
├── App.tsx                   # Main application component
├── index.tsx                 # Application entry point
└── index.css                 # Global styles
```

## 🚀 Deployment

### Firebase Hosting

1. **Build the application**:

   ```bash
   npm run build
   ```

2. **Deploy to Firebase**:

   ```bash
   firebase deploy
   ```

3. **Access your app**:
   Your app will be available at `https://your-project-id.web.app`

### Environment Variables

For production deployment, consider using environment variables for Firebase configuration:

```typescript
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  // ... other config
};
```

## 🔒 Privacy & Security

### Data Protection

- **Local encryption**: All sensitive data encrypted on your device
- **No plaintext storage**: Passwords never stored in plaintext
- **Secure transmission**: HTTPS for all data transmission
- **Zero-knowledge architecture**: Service provider cannot decrypt your data

### User Control

- **Data ownership**: You control all your data
- **Export capability**: Easy data export functionality
- **Account deletion**: Complete data removal when deleting account
- **Audit trail**: Track when credentials are accessed

## 🤝 Contributing

This is a personal project template. Feel free to:

- Fork and customize for your needs
- Submit issues for bugs or feature requests
- Contribute improvements via pull requests

## 📄 License

This project is for educational and personal use. Please ensure compliance with applicable laws and regulations when using this software.

## ⚠️ Important Notes

1. **Master Password**: Never forget your master password - it cannot be recovered
2. **Backup**: Consider exporting your data regularly as backup
3. **Security**: Use a strong, unique master password
4. **Updates**: Keep the application updated for security patches

## 🆘 Support

For issues or questions:

1. Check the Firebase console for authentication/database issues
2. Review browser developer tools for client-side errors
3. Ensure Firebase configuration is correct
4. Verify Firestore security rules are properly deployed

---

**⚡ Quick Start**: After setup, create an account, add a test credential, and explore the password management features. The application is designed to be intuitive and secure from day one.

## Firebase Deployment

The application is live and hosted on Firebase Hosting. You can access it here:

[Password Manager Live App](https://pwd-mgr-a9e5f.web.app)

### Deployment Steps

1. Ensure all changes are committed and pushed to the `main` branch.
2. The GitHub Actions workflow (`firebase-deploy.yml`) will automatically build and deploy the app.
3. Alternatively, you can deploy manually using the Firebase CLI:
   ```bash
   npm run build
   firebase deploy
   ```
