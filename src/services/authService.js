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
import { doc, setDoc, getDoc, updateDoc, serverTimestamp, collection } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

const USERS_COLLECTION = 'users';
const PROFESSIONALS_COLLECTION = 'professionals';

const createUserProfile = async (user, additionalData = {}) => {
  if (!user) return;

  const userRef = doc(db, USERS_COLLECTION, user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    const { displayName, email, photoURL } = user;
    try {
      await setDoc(userRef, {
        displayName,
        email,
        photoURL,
        createdAt: serverTimestamp(),
        role: additionalData.role || 'USER',
        ...additionalData
      });
    } catch (error) {
      console.error('Error creating user profile:', error);
      throw error;
    }
  }
  return userRef;
};

export const signUpWithEmailAndPassword = async (email, password, userData) => {
  try {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);

    if (userData.displayName) {
      await updateProfile(user, { displayName: userData.displayName });
    }

    const nameParts = (userData.displayName || '').split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    await createUserProfile(user, {
      ...userData,
      first_name: firstName,
      last_name: lastName,
      role: userData.accountType || 'USER',
      emailVerified: user.emailVerified,
      isActive: true,
      status: 'active',
    });

    if (userData.accountType === 'PROFESSIONAL') {
      const professionalDocRef = doc(db, PROFESSIONALS_COLLECTION, user.uid);
      await setDoc(professionalDocRef, {
        user_id: user.uid,
        first_name: firstName,
        last_name: lastName,
        email: email,
        professional_type_id: userData.professionalType || null,
        verification_status: 'PENDING',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        years_of_experience: 0,
        location: '',
        profile_picture: '',
        documents: [],
      });
    }

    return { user, success: true };
  } catch (error) {
    console.error('Error signing up:', error);
    return { error: error.message, success: false };
  }
};

export const signInWithEmailAndPassword_Custom = async (email, password) => {
  try {
    const { user } = await signInWithEmailAndPassword(auth, email, password);
    const userRef = doc(db, USERS_COLLECTION, user.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const userData = userSnap.data();
      await updateUserLastLogin(user.uid);
      // Return auth user and firestore data separately
      return { user, userData, success: true };
    } else {
      return { error: 'User profile not found in database.', success: false };
    }
  } catch (error) {
    return { error: error.message, success: false };
  }
};

// --- THIS FUNCTION IS CORRECTED ---
export const signInWithGoogle = async (additionalData = {}) => {
  try {
    // Corrected constructor call
    const provider = new GoogleAuthProvider();
    const { user } = await signInWithPopup(auth, provider);

    const userRef = doc(db, USERS_COLLECTION, user.uid);
    const userSnap = await getDoc(userRef);

    // If user does not exist, create a new profile
    if (!userSnap.exists()) {
      const accountType = additionalData.accountType || 'USER';
      await createUserProfile(user, {
        provider: 'google',
        isActive: true,
        role: accountType,
        status: 'active',
        first_name: user.displayName.split(' ')[0] || '',
        last_name: user.displayName.split(' ').slice(1).join(' ') || '',
      });

      if (accountType === 'PROFESSIONAL') {
        const professionalDocRef = doc(db, PROFESSIONALS_COLLECTION, user.uid);
        const professionalSnap = await getDoc(professionalDocRef);
        if (!professionalSnap.exists()) {
          await setDoc(professionalDocRef, {
            user_id: user.uid,
            first_name: user.displayName.split(' ')[0] || '',
            last_name: user.displayName.split(' ').slice(1).join(' ') || '',
            email: user.email,
            professional_type_id: additionalData.professionalType || null,
            verification_status: 'PENDING',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            years_of_experience: 0,
            location: '',
          });
        }
      }
    }

    // Always fetch the latest user data from the database to get the correct role
    const finalUserSnap = await getDoc(userRef);
    const userData = finalUserSnap.exists() ? finalUserSnap.data() : {};

    await updateUserLastLogin(user.uid);

    // Return both the auth user and the firestore data separately
    return { user, userData, success: true };
  } catch (error) {
    console.error('Error signing in with Google:', error);
    return { error: error.message, success: false };
  }
};

export const signOutUser = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    console.error('Error signing out:', error);
    return { error: error.message, success: false };
  }
};

export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (error) {
    console.error('Error resetting password:', error);
    return { error: error.message, success: false };
  }
};

export const updateUserProfile = async (userId, userData) => {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    await updateDoc(userRef, {
      ...userData,
      updatedAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating user profile:', error);
    return { error: error.message, success: false };
  }
};

export const getCurrentUserProfile = async (userId) => {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
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

export const updateUserLastLogin = async (userId) => {
  if (!userId) return;
  const userRef = doc(db, USERS_COLLECTION, userId);
  try {
    await updateDoc(userRef, { last_login_at: serverTimestamp() });
  } catch (error) {
    console.error("Error updating last login time:", error);
  }
};