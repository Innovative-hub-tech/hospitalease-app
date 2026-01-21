# Quick Start Guide

## 🚀 Get Started in 3 Steps

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Start Dev Server
```bash
npm run dev
```

### Step 3: Open Browser
```
http://localhost:4000
```

---

## 📝 First Time Setup

The database is already configured and all migrations are complete!

**Database Connection:** Neon PostgreSQL (eu-west-2)
**Status:** ✅ Ready to use

---

## 🧪 Test the App

### Create Account
1. Go to http://localhost:4000
2. Click "Sign Up"
3. Enter email and password
4. Create account

### Transfer a Patient
1. Navigate to Patients
2. Click on a patient
3. Click "Transfer" button
4. Select destination department
5. Confirm

### Reactivate a Patient
1. Find a discharged patient
2. Click "Reactivate" button
3. Select department
4. Confirm

### View Admin Dashboard
1. Log in as admin
2. Go to Admin Dashboard
3. View all transfers and reports

---

## 🧪 Run Tests

```bash
npm run test
```

This runs all 27 test cases covering:
- API endpoints
- React components
- Property-based tests

---

## 📦 Build for Production

```bash
npm run build
```

---

## 🌐 Deploy

### Vercel (Easiest)
1. Push to GitHub
2. Go to vercel.com
3. Import repository
4. Add DATABASE_URL environment variable
5. Deploy

### Other Platforms
- AWS Amplify
- DigitalOcean
- Netlify
- Heroku

---

## 📚 Documentation

- Requirements: `.kiro/specs/department-transfer-reactivation/requirements.md`
- Design: `.kiro/specs/department-transfer-reactivation/design.md`
- Deployment: `.kiro/specs/department-transfer-reactivation/DEPLOYMENT_COMPLETE.md`

---

## 🆘 Troubleshooting

**Port 4000 already in use?**
```bash
npm run dev -- --port 3000
```

**Database connection error?**
Check `.env.local` has correct DATABASE_URL

**Tests failing?**
```bash
npm run test -- --run
```

---

## ✅ You're All Set!

The app is production-ready. Start developing or deploy to production.

Questions? Check the documentation files in `.kiro/specs/department-transfer-reactivation/`
