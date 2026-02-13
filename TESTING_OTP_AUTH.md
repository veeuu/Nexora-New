# Testing OTP Authentication System

## Quick Test Guide

### Prerequisites
1. Backend server running on `http://localhost:5000`
2. Frontend running (Vite dev server)
3. MongoDB connection active

### Test Steps

#### 1. Start Backend Server
```bash
cd backend
npm start
```

You should see:
```
✓ Backend server listening on http://0.0.0.0:5000
✓ API available at http://localhost:5000/api
✓ MongoDB Connected
```

#### 2. Test User Registration

**Step 1: Create Account**
- Open the login page
- Click "Create Account"
- Fill in:
  - Full Name: `Test User`
  - Email: `test@example.com`
  - Password: `password123`
- Click "Create Account"

**Expected Result:**
- Success message: "Account created! Please check your email for the OTP."
- OTP verification screen appears
- Backend console shows:
  ```
  ==================================================
  📧 DEMO MODE - Email not sent
  To: test@example.com
  OTP: 123456
  ==================================================
  ```

**Step 2: Verify OTP**
- Copy the OTP from backend console
- Enter the 6-digit OTP in the verification screen
- Click "Verify OTP"

**Expected Result:**
- Success message: "Email verified successfully! You can now login."
- Redirected back to login screen

**Step 3: Login**
- Enter email: `test@example.com`
- Enter password: `password123`
- Click "Login"

**Expected Result:**
- Successfully logged in
- JWT token stored
- Redirected to dashboard

### Test Scenarios

#### Scenario 1: Resend OTP
1. Create account
2. Wait for OTP screen
3. Click "Resend OTP"
4. Check backend console for new OTP

#### Scenario 2: Expired OTP
1. Create account
2. Wait 10+ minutes
3. Try to verify with old OTP
4. Should show error: "OTP has expired. Please request a new one."
5. Click "Resend OTP"

#### Scenario 3: Invalid OTP
1. Create account
2. Enter wrong OTP (e.g., 000000)
3. Should show error: "Invalid OTP"

#### Scenario 4: Login Without Verification
1. Create account
2. Don't verify OTP
3. Try to login
4. Should show error: "Please verify your email first"
5. OTP verification screen appears

#### Scenario 5: Duplicate Email
1. Create and verify account with `test@example.com`
2. Try to create another account with same email
3. Should show error: "User already exists. Please login."

### API Testing with cURL

#### Create Account
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "fullName": "Test User",
    "password": "password123"
  }'
```

#### Verify OTP
```bash
curl -X POST http://localhost:5000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "otp": "123456"
  }'
```

#### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

#### Resend OTP
```bash
curl -X POST http://localhost:5000/api/auth/resend-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com"
  }'
```

### Database Verification

Check MongoDB collections:

**users collection:**
```javascript
db.users.find({ email: "test@example.com" })
```

Should show:
- `isVerified: true` (after OTP verification)
- `otp: null` (cleared after verification)
- `password`: hashed string

**sessions collection:**
```javascript
db.sessions.find({ userId: ObjectId("...") })
```

Should show active session with JWT token

### Troubleshooting

**Issue: OTP not showing in console**
- Check backend server is running
- Verify `EMAIL_USER=demo@example.com` in `.env`
- Check console output for errors

**Issue: "Server error during signup"**
- Check MongoDB connection
- Verify all required packages installed: `npm install`
- Check backend console for error details

**Issue: "Invalid credentials" on login**
- Ensure email is verified first
- Check password is correct
- Verify user exists in database

**Issue: Frontend can't connect to backend**
- Verify backend running on port 5000
- Check Vite proxy configuration in `vite.config.js`
- Ensure CORS is enabled in backend

### Production Setup

When ready for production:

1. Update `.env` with real email credentials:
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
JWT_SECRET=generate-secure-random-string
```

2. Generate secure JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

3. For Gmail, enable 2FA and create App Password

4. Test email delivery with real email address
