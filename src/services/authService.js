// src/services/authService.js
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

// Create user profile in Firestore
const createUserProfile = async (user, additionalData = {}) => {
  if (!user) return;

  const userRef = doc(db, 'users', user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    const { displayName, email, photoURL } = user;
    const createdAt = new Date();

    try {
      await setDoc(userRef, {
        displayName,
        email,
        photoURL,
        createdAt,
        // Ensure role is always set, defaulting to 'CLIENT'
        role: 'CLIENT',
        ...additionalData
      });
    } catch (error) {
      console.error('Error creating user profile:', error);
      throw error;
    }
  }

  return userRef;
};

// Sign up with email and password
export const signUpWithEmailAndPassword = async (email, password, userData) => {
  try {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);

    // Update display name
    if (userData.displayName) {
      await updateProfile(user, { displayName: userData.displayName });
    }

    // Create user profile in Firestore
    await createUserProfile(user, {
      ...userData,
      role: userData.accountType || 'CLIENT',
      emailVerified: user.emailVerified,
      isActive: true
    });

    return { user, success: true };
  } catch (error) {
    console.error('Error signing up:', error);
    return { error: error.message, success: false };
  }
};

// Sign in with email and password
export const signInWithEmailAndPassword_Custom = async (email, password) => {
  try {
    console.log("Attempting to sign in with email:", email);
    const { user } = await signInWithEmailAndPassword(auth, email, password);
    console.log("Firebase Authentication successful for user UID:", user.uid);

    // Get user profile from Firestore
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const userData = userSnap.data();
      console.log("Firestore data found:", userData); 

      return {
        user: {
          ...user,
          ...userData 
        },
        success: true
      };
    } else {
      console.error("USER NOT FOUND IN FIRESTORE. UID:", user.uid); 
      return { error: 'User profile not found in database.', success: false };
    }

  } catch (error) {
    console.error('CRITICAL SIGN-IN ERROR:', error); 
    return { error: error.message, success: false };
  }
};

// Sign out
export const signOutUser = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    console.error('Error signing out:', error);
    return { error: error.message, success: false };
  }
};

// Reset password
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (error) {
    console.error('Error resetting password:', error);
    return { error: error.message, success: false };
  }
};

// Google Sign In
export const signInWithGoogle = async () => {
  // debugger;
  try {
    const provider = new GoogleAuthProvider();
    const { user } = await signInWithPopup(auth, provider);
    const token = await user.getIdToken();
    // Create or update user profile, ensuring the role is set
    await createUserProfile(user, {
      provider: 'google',
      isActive: true
    });
    
    // Fetch the user's profile to get the role and other data
    const userProfile = await getDoc(doc(db, 'users', user.uid));
    const userData = userProfile.data();

    return { 
        user: { ...user, ...userData }, 
        success: true 
    };

  } catch (error) {
    console.error('Error signing in with Google:', error);
    return { error: error.message, success: false };
  }
};

// Facebook Sign In
export const signInWithFacebook = async () => {
  try {
    const provider = new FacebookAuthProvider();
    const { user } = await signInWithPopup(auth, provider);

    // Create or update user profile
    await createUserProfile(user, {
      provider: 'facebook',
      isActive: true
    });
    
    // Fetch the user's profile to get the role and other data
    const userProfile = await getDoc(doc(db, 'users', user.uid));
    const userData = userProfile.data();

    return { 
      user: { ...user, ...userData }, 
      success: true 
    };
  } catch (error) {
    console.error('Error signing in with Facebook:', error);
    return { error: error.message, success: false };
  }
};

// Update user profile
export const updateUserProfile = async (userId, userData) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      ...userData,
      updatedAt: new Date()
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating user profile:', error);
    return { error: error.message, success: false };
  }
};

// Get current user profile
export const getCurrentUserProfile = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      return { userData: userSnap.data(), success: true };
    } else {
      return { error: 'User profile not found', success: false };
    }
  } catch (error) {
    console.error('Error getting user profile:', error);
    return { error: error.message, success: false };
  }
};