import { 
  GoogleAuthProvider, 
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  User
} from 'firebase/auth';
import { auth } from '../config/firebase';

export interface AuthError {
  code: string;
  message: string;
}

export async function signInWithGoogle(): Promise<User> {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error: any) {
    throw {
      code: error.code,
      message: getErrorMessage(error.code)
    };
  }
}

export async function signUpWithEmail(email: string, password: string): Promise<User> {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error: any) {
    throw {
      code: error.code,
      message: getErrorMessage(error.code)
    };
  }
}

export async function signInWithEmail(email: string, password: string): Promise<User> {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error: any) {
    throw {
      code: error.code,
      message: getErrorMessage(error.code)
    };
  }
}

export async function logOut(): Promise<void> {
  await signOut(auth);
}

function getErrorMessage(code: string): string {
  switch (code) {
    case 'auth/email-already-in-use':
      return 'This email is already registered. Please sign in instead.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/operation-not-allowed':
      return 'Email/password accounts are not enabled. Please contact support.';
    case 'auth/weak-password':
      return 'Please choose a stronger password (at least 6 characters).';
    case 'auth/user-disabled':
      return 'This account has been disabled. Please contact support.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
      return 'Invalid email or password.';
    case 'auth/popup-closed-by-user':
      return 'Sign in was cancelled. Please try again.';
    default:
      return 'An error occurred during authentication. Please try again.';
  }
}