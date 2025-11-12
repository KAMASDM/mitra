// src/services/authService.js
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider,
  // FacebookAuthProvider,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  sendEmailVerification
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp, collection } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { sendWelcomeEmail } from './emailService';

const USERS_COLLECTION = 'users';
const PROFESSIONALS_COLLECTION = 'professionals';
let confirmationResult = null;

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

export const sendPhoneVerificationCode = async (phoneNumber, recaptchaContainerId) => {
  try {
    // Check if reCAPTCHA Verifier is already instantiated on the window object
    if (!window.recaptchaVerifier) {
      // 1. Initialize the Invisible reCAPTCHA Verifier
      window.recaptchaVerifier = new RecaptchaVerifier(auth, recaptchaContainerId, {
        'size': 'invisible',
        'callback': (response) => {
          console.log("Recaptcha solved automatically:", response);
        },
        'expired-callback': () => {
          console.error("Recaptcha expired. Please refresh.");
          if (window.recaptchaVerifier) window.recaptchaVerifier.clear();
          window.recaptchaVerifier = null;
        }
      });
    }

    // Render the verifier (mandatory step for invisible reCAPTCHA)
    await window.recaptchaVerifier.render();

    // 2. Initiate the Phone Sign-In process and send the code
    confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, window.recaptchaVerifier);

    // 3. Clear the reCAPTCHA instance after successful code send to allow for retries if needed
    if (window.recaptchaVerifier) window.recaptchaVerifier.clear();
    window.recaptchaVerifier = null;

    return { success: true };
  } catch (error) {
    console.error('Error sending phone verification code:', error);
    // Clear reCAPTCHA in case of failure
    if (window.recaptchaVerifier) {
      window.recaptchaVerifier.clear();
      window.recaptchaVerifier = null;
    }
    return { error: error.message, success: false };
  }
};


export const verifyPhoneNumber = async (otpCode, userData) => {
  if (!confirmationResult) {
    return { error: 'Confirmation result missing. Did you send the code?', success: false };
  }
  try {
    // 1. Confirm the code and sign the user in with the phone credential
    const result = await confirmationResult.confirm(otpCode);
    const user = result.user;

    const userRef = doc(db, USERS_COLLECTION, user.uid);
    const userSnap = await getDoc(userRef);

    // 2. Check if user exists, if not, create a new profile in Firestore
    if (!userSnap.exists()) {
      // If new user via phone, create profile with submitted form data
      const finalFirestoreUserData = {
        displayName: `${userData.firstName} ${userData.lastName}`,
        first_name: userData.firstName,
        last_name: userData.lastName,
        role: userData.accountType || 'USER',
        phone: user.phoneNumber,
        email: userData.email || null,
        emailVerified: false,
        status: 'active',
        ...userData,
      };

      await createUserProfile(user, finalFirestoreUserData);

      // Create professional profile if applicable
      if (finalFirestoreUserData.role === 'PROFESSIONAL') {
        const professionalDocRef = doc(db, PROFESSIONALS_COLLECTION, user.uid);
        await setDoc(professionalDocRef, {
          user_id: user.uid,
          first_name: userData.firstName,
          last_name: userData.lastName,
          email: userData.email || null,
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

      // Send welcome email if an email address was provided
      if (userData.email) {
        await sendWelcomeEmail(userData.email, {
          name: finalFirestoreUserData.displayName,
          role: finalFirestoreUserData.role
        });
      }
    }

    // 3. Update last login time
    await updateUserLastLogin(user.uid);

    // 4. Fetch the final user data from Firestore
    const finalUserSnap = await getDoc(userRef);
    const finalUserData = finalUserSnap.exists() ? finalUserSnap.data() : {};

    return { user, userData: finalUserData, success: true };

  } catch (error) {
    console.error('Error verifying phone code:', error);
    return { error: error.message, success: false };
  }
};

// export const verifyPhoneNumber = async (otpCode) => {
//   if (!confirmationResult) {
//     return { error: 'Confirmation result missing. Did you send the code?', success: false };
//   }
//   try {
//     // Confirm the code and sign the user in with the phone credential
//     const result = await confirmationResult.confirm(otpCode);
//     const user = result.user;

//     // Check if user already exists in Firestore (e.g., from an earlier social login)
//     const userRef = doc(db, USERS_COLLECTION, user.uid);
//     const userSnap = await getDoc(userRef);

//     if (userSnap.exists()) {
//       const userData = userSnap.data();
//       await updateUserLastLogin(user.uid);
//       return { user, userData, success: true };
//     } else {
//       // If new user via phone, create profile with temporary data (needs final registration form data)
//       const userData = {
//         displayName: user.displayName || 'New User',
//         email: user.email, // This will be null for pure phone sign-in
//         role: 'USER',
//         phone: user.phoneNumber,
//         emailVerified: false,
//         status: 'active',
//         first_name: '',
//         last_name: '',
//         // Add any other default fields required for registration
//       };
//       await createUserProfile(user, userData);
//       await updateUserLastLogin(user.uid);
//       return { user, userData, success: true };
//     }

//   } catch (error) {
//     console.error('Error verifying phone code:', error);
//     return { error: error.message, success: false };
//   }
// };

// export const signUpWithEmailAndPassword = async (email, password, userData) => {
//   try {
//     const { user } = await createUserWithEmailAndPassword(auth, email, password);

//     if (userData.displayName) {
//       await updateProfile(user, { displayName: userData.displayName });
//     }

//     const nameParts = (userData.displayName || '').split(' ');
//     const firstName = nameParts[0] || '';
//     const lastName = nameParts.slice(1).join(' ') || '';

//     await createUserProfile(user, {
//       ...userData,
//       first_name: firstName,
//       last_name: lastName,
//       role: userData.accountType || 'USER',
//       emailVerified: user.emailVerified,
//       isActive: true,
//       status: 'active',
//     });
//     await createUserProfile(user, firestoreUserData);

//     if (userData.accountType === 'PROFESSIONAL') {
//       const professionalDocRef = doc(db, PROFESSIONALS_COLLECTION, user.uid);
//       await setDoc(professionalDocRef, {
//         user_id: user.uid,
//         first_name: firstName,
//         last_name: lastName,
//         email: email,
//         professional_type_id: userData.professionalType || null,
//         verification_status: 'PENDING',
//         createdAt: serverTimestamp(),
//         updatedAt: serverTimestamp(),
//         years_of_experience: 0,
//         location: '',
//         profile_picture: '',
//         documents: [],
//       });
//     }
//     await sendWelcomeEmail(email, {
//       name: userData.displayName,
//       role: firestoreUserData.role
//     });
//     return { user, success: true };
//   } catch (error) {
//     console.error('Error signing up:', error);
//     return { error: error.message, success: false };
//   }
// };

export const signUpWithEmailAndPassword = async (email, password, userData) => {
  try {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);

    await sendEmailVerification(user); // Send verification email

    if (userData.displayName) {
      await updateProfile(user, { displayName: userData.displayName });
    }

    const nameParts = (userData.displayName || '').split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    // Data to be saved to Firestore for the user document
    const finalFirestoreUserData = {
      ...userData,
      first_name: firstName,
      last_name: lastName,
      role: userData.accountType || 'USER',
      emailVerified: false,
      isActive: true,
      status: 'active',
    };

    await createUserProfile(user, finalFirestoreUserData);

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

    // --- SEND CONFIRMATION EMAIL AFTER SUCCESSFUL REGISTRATION ---
    await sendWelcomeEmail(email, {
      name: userData.displayName,
      role: userData.accountType
    });
    await signOut(auth); // Sign out the user after registration to enforce email verification
    return { success: true, needsVerification: true }; // Indicate that verification is needed
    // return { user, success: true };
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

    if (!user.emailVerified) {
      // If not verified, sign out and return a specific error flag
      await signOut(auth);
      return {
        error: "Email not verified. Please check your inbox and click the verification link.",
        success: false,
        needsVerification: true // Custom flag for UI handling
      };
    }

    if (userSnap.exists()) {
      const userData = userSnap.data();
      // --- UPDATE FIRESTORE: If verified in Auth but not in Firestore ---
      if (userData.emailVerified === false || userData.emailVerified === undefined) {
        await updateDoc(userRef, {
          emailVerified: true // <<-- This line sets it to true
        });
        userData.emailVerified = true;
      }

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