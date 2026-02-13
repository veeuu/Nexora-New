# OTP-Based Email Verification System

## Overview
This system implements secure user registration with OTP (One-Time Password) email verification.

## Features
- User registration with email, full name, and password
- 6-digit OTP generation and email delivery
- OTP expiration (10 minutes)
- Email verification before login
- Secure password hashing with bcryptjs
- JWT-based session management
- Demo mode for testing without email credentials

## API Endpoints

### 1. POST `/api/auth/signup`
Create a new user account and send OTP to email.

**Request Body:**
```json
{
  "email": "user@example.com",
  "fullName": "John Doe",
  "password": "password123"
}
```

**Response (Success):**
```json
{
  "message": "Account created successfully. Please verify your email with the OTP sent.",
  "email": "user@example.com",
  "requiresVerification": true
}
```

### 2. POST `/api/auth/verify-otp`
Verify the OTP sent to user's email.

**Request Body:**
```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

**Response (Success):**
```json
{
  "message": "Email verified successfully. You can now login.",
  "email": "user@example.com"
}
```

### 3. POST `/api/auth/resend-otp`
Resend OTP if expired or not received.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response (Success):**
```json
{
  "message": "OTP resent to your email",
  "email": "user@example.com"
}
```

### 4. POST `/api/auth/login`
Login with verified email and password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (Success):**
```json
{
  "message": "Login successful",
  "token": "jwt_token_here",
  "user": {
    "email": "user@example.com",
    "fullName": "John Doe"
  }
}
```

## Demo Mode

When `EMAIL_USER=demo@example.com` in `.env`, the system runs in demo mode:
- OTP is logged to console instead of sending email
- Check backend console for OTP after signup
- Use the console OTP to verify email

**Console Output Example:**
```
==================================================
📧 DEMO MODE - Email not sent
To: user@example.com
OTP: 123456
==================================================
```

## Production Setup

To enable real email sending, update `.env`:

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
JWT_SECRET=your-secure-random-string
```

**For Gmail:**
1. Enable 2-factor authentication
2. Generate an App Password
3. Use the App Password in `EMAIL_PASSWORD`

## Database Collections

### users
- `email`: User email (unique)
- `fullName`: User's full name
- `password`: Hashed password
- `isVerified`: Email verification status
- `otp`: Current OTP (null after verification)
- `otpExpiry`: OTP expiration time
- `createdAt`: Account creation timestamp

### sessions
- `userId`: Reference to user
- `token`: JWT token
- `createdAt`: Session creation time
- `expiresAt`: Session expiration time (7 days)

## Security Features
- Passwords hashed with bcryptjs (10 salt rounds)
- OTP expires after 10 minutes
- JWT tokens expire after 7 days
- Email verification required before login
- Secure session management

## User Flow
1. User creates account → OTP sent to email
2. User enters OTP → Email verified
3. User logs in → JWT token issued
4. Token used for authenticated requests
