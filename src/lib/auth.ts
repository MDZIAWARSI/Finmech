import { UserProfile } from '../types/finance';
import { StorageService } from './storage';

interface OtpRecord {
  email: string;
  code: string;
  expiresAt: number;
}

const OTP_STORAGE_KEY = 'finmech_pending_otp_v1';

export const AuthService = {
  // Generate and send OTP (Free in-app preview + optional backend email dispatch)
  requestOtp(email: string): { success: boolean; simulatedCode: string; message: string } {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, simulatedCode: '', message: 'Please enter a valid email address.' };
    }

    // Generate random 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    const record: OtpRecord = {
      email: cleanEmail,
      code,
      expiresAt,
    };

    if (typeof window !== 'undefined') {
      localStorage.setItem(OTP_STORAGE_KEY, JSON.stringify(record));
    }

    // Attempt background API call if backend is available
    if (typeof window !== 'undefined') {
      fetch('/api/auth/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, code }),
      }).catch(() => {
        // Silent catch for static/offline execution
      });
    }

    return {
      success: true,
      simulatedCode: code,
      message: `OTP dispatched to ${cleanEmail}. (Free mode: Use code ${code})`,
    };
  },

  // Verify entered OTP
  verifyOtp(email: string, enteredCode: string): { success: boolean; profile?: UserProfile; message: string } {
    const cleanEmail = email.trim().toLowerCase();
    if (typeof window === 'undefined') {
      return { success: false, message: 'Invalid runtime environment' };
    }

    const storedStr = localStorage.getItem(OTP_STORAGE_KEY);
    if (!storedStr) {
      return { success: false, message: 'No OTP requested. Please click Send OTP first.' };
    }

    try {
      const record: OtpRecord = JSON.parse(storedStr);
      if (record.email !== cleanEmail) {
        return { success: false, message: 'Email does not match OTP request.' };
      }
      if (Date.now() > record.expiresAt) {
        return { success: false, message: 'OTP has expired. Please request a fresh one.' };
      }
      if (record.code !== enteredCode.trim()) {
        return { success: false, message: 'Incorrect OTP code. Please double-check.' };
      }

      // Success! Clear pending OTP and authenticate
      localStorage.removeItem(OTP_STORAGE_KEY);

      const existingProfile = StorageService.getProfile();
      const updatedProfile: UserProfile = {
        ...existingProfile,
        email: cleanEmail,
        isLoggedIn: true,
        name: existingProfile.name || cleanEmail.split('@')[0],
      };

      StorageService.saveProfile(updatedProfile);
      return { success: true, profile: updatedProfile, message: 'Signed in successfully!' };
    } catch {
      return { success: false, message: 'Error verifying OTP.' };
    }
  },

  logout(): UserProfile {
    const profile = StorageService.getProfile();
    const loggedOut: UserProfile = {
      ...profile,
      isLoggedIn: false,
    };
    StorageService.saveProfile(loggedOut);
    return loggedOut;
  },
};

