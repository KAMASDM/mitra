// src/services/userService.js
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  onSnapshot
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../config/firebase';

// Collections
const USERS_COLLECTION = 'users';
const PROFESSIONALS_COLLECTION = 'professionals';
const REVIEWS_COLLECTION = 'reviews';

// Get all users (Admin only)
export const getAllUsers = async (userType = null, pageSize = 20, lastDoc = null) => {
  try {
    let q = collection(db, USERS_COLLECTION);
    
    if (userType) {
      q = query(q, where('role', '==', userType));
    }
    
    q = query(q, orderBy('createdAt', 'desc'), limit(pageSize));
    
    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }
    
    const querySnapshot = await getDocs(q);
    const users = [];
    
    querySnapshot.forEach((doc) => {
      users.push({ id: doc.id, ...doc.data() });
    });
    
    return {
      users,
      lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1],
      success: true
    };
  } catch (error) {
    console.error('Error getting users:', error);
    return { error: error.message, success: false };
  }
};

// Get user by ID
export const getUserById = async (userId) => {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return { user: { id: userSnap.id, ...userSnap.data() }, success: true };
    } else {
      return { error: 'User not found', success: false };
    }
  } catch (error) {
    console.error('Error getting user:', error);
    return { error: error.message, success: false };
  }
};

// Update user
export const updateUser = async (userId, userData) => {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    await updateDoc(userRef, {
      ...userData,
      updatedAt: new Date()
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating user:', error);
    return { error: error.message, success: false };
  }
};

// Delete user
export const deleteUser = async (userId) => {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    await deleteDoc(userRef);
    return { success: true };
  } catch (error) {
    console.error('Error deleting user:', error);
    return { error: error.message, success: false };
  }
};

// Ultra-simple query approach - NO INDEXES NEEDED
export const getProfessionals = async (filters = {}) => {
  try {
    const professionalsRef = collection(db, PROFESSIONALS_COLLECTION);
    const pageSize = filters.pageSize || 50; // Fetch more items for client-side filtering

    let q;
    
    // Strategy: Use only ONE constraint at a time to avoid composite indexes
    if (filters.category && filters.category !== 'All') {
      // If category is specified, filter by category only
      q = query(
        professionalsRef,
        where('category', '==', filters.category),
        limit(pageSize)
      );
    } else {
      // Otherwise, just get verified professionals
      q = query(
        professionalsRef,
        where('verification_status', '==', 'VERIFIED'),
        limit(pageSize)
      );
    }

    if (filters.lastDoc) {
      q = query(q, startAfter(filters.lastDoc));
    }

    const professionalsSnapshot = await getDocs(q);

    if (professionalsSnapshot.empty) {
      return { 
        professionals: [], 
        hasMore: false,
        lastDoc: null,
        success: true 
      }; 
    }

    // Process results and merge with user data
    const mergedDataPromises = professionalsSnapshot.docs.map(async (professionalDoc) => {
      const professionalData = { id: professionalDoc.id, ...professionalDoc.data() };
      
      if (!professionalData.user_id) {
        console.warn(`Professional document with ID ${professionalDoc.id} is MISSING the 'user_id' field.`);
        return professionalData;
      }

      const userRef = doc(db, USERS_COLLECTION, professionalData.user_id);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();
        return { ...userData, ...professionalData };
      } else {
        console.warn(`No matching user found for professional with user_id: ${professionalData.user_id}`);
        return professionalData;
      }
    });

    let professionals = await Promise.all(mergedDataPromises);

    // CLIENT-SIDE FILTERING AND SORTING (no indexes needed!)
    
    // Filter by verification if we didn't already
    if (filters.category && filters.category !== 'All') {
      professionals = professionals.filter(prof => prof.verification_status === 'VERIFIED');
    }

    // Client-side sorting
    if (filters.sortBy) {
      professionals.sort((a, b) => {
        switch (filters.sortBy) {
          case 'price':
            return (a.price || 0) - (b.price || 0); // ascending
          case 'experience':
            return (b.years_of_experience || 0) - (a.years_of_experience || 0); // descending
          case 'newest':
          default:
            // Sort by createdAt if available, otherwise by document creation order
            const aDate = a.createdAt?.toDate?.() || new Date(0);
            const bDate = b.createdAt?.toDate?.() || new Date(0);
            return bDate - aDate; // descending (newest first)
        }
      });
    }

    const lastDoc = professionalsSnapshot.docs[professionalsSnapshot.docs.length - 1];
    const hasMore = professionalsSnapshot.docs.length === pageSize;

    return { 
      professionals, 
      hasMore,
      lastDoc,
      success: true 
    };

  } catch (error) {
    console.error('Error getting professionals:', error);
    return { error: error.message, success: false };
  }
};

// Get total count of professionals (for pagination info)
export const getProfessionalsCount = async (filters = {}) => {
  try {
    const professionalsRef = collection(db, PROFESSIONALS_COLLECTION);
    const queryConstraints = [];

    // Always filter for verified professionals
    queryConstraints.push(where('verification_status', '==', 'VERIFIED'));

    // Add category filter if specified and not 'All'
    if (filters.category && filters.category !== 'All') {
      queryConstraints.push(where('category', '==', filters.category));
    }

    const q = query(professionalsRef, ...queryConstraints);
    const snapshot = await getDocs(q);
    
    return { 
      count: snapshot.size, 
      success: true 
    };
  } catch (error) {
    console.error('Error getting professionals count:', error);
    return { error: error.message, success: false };
  }
};

// Get professional by ID
export const getProfessionalById = async (professionalId) => {
  try {
    const professionalRef = doc(db, PROFESSIONALS_COLLECTION, professionalId);
    const professionalSnap = await getDoc(professionalRef);
    
    if (professionalSnap.exists()) {
      return {
        professional: { id: professionalSnap.id, ...professionalSnap.data() },
        success: true
      };
    } else {
      return { error: 'Professional not found', success: false };
    }
  } catch (error) {
    console.error('Error getting professional:', error);
    return { error: error.message, success: false };
  }
};

// Update professional profile
export const updateProfessionalProfile = async (professionalId, profileData) => {
  try {
    const professionalRef = doc(db, PROFESSIONALS_COLLECTION, professionalId);
    await updateDoc(professionalRef, {
      ...profileData,
      updatedAt: new Date()
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating professional profile:', error);
    return { error: error.message, success: false };
  }
};

// Upload profile picture
export const uploadProfilePicture = async (userId, file) => {
  try {
    const fileRef = ref(storage, `profile-pictures/${userId}/${file.name}`);
    const uploadResult = await uploadBytes(fileRef, file);
    const downloadURL = await getDownloadURL(uploadResult.ref);
    
    // Update user profile with new photo URL
    await updateUser(userId, { photoURL: downloadURL });
    
    return { photoURL: downloadURL, success: true };
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    return { error: error.message, success: false };
  }
};

// Delete profile picture
export const deleteProfilePicture = async (userId, photoURL) => {
  try {
    // Delete from storage
    const photoRef = ref(storage, photoURL);
    await deleteObject(photoRef);
    
    // Update user profile
    await updateUser(userId, { photoURL: null });
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting profile picture:', error);
    return { error: error.message, success: false };
  }
};

// Get user reviews
export const getUserReviews = async (userId, userType = 'professional') => {
  try {
    const field = userType === 'professional' ? 'professionalId' : 'clientId';
    const q = query(
      collection(db, REVIEWS_COLLECTION),
      where(field, '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const reviews = [];
    
    querySnapshot.forEach((doc) => {
      reviews.push({ id: doc.id, ...doc.data() });
    });
    
    return { reviews, success: true };
  } catch (error) {
    console.error('Error getting user reviews:', error);
    return { error: error.message, success: false };
  }
};

// Add review
export const addReview = async (reviewData) => {
  try {
    const reviewRef = await addDoc(collection(db, REVIEWS_COLLECTION), {
      ...reviewData,
      createdAt: new Date()
    });
    
    return { reviewId: reviewRef.id, success: true };
  } catch (error) {
    console.error('Error adding review:', error);
    return { error: error.message, success: false };
  }
};

// Subscribe to user updates (real-time)
export const subscribeToUserUpdates = (userId, callback) => {
  const userRef = doc(db, USERS_COLLECTION, userId);
  
  return onSnapshot(userRef, (doc) => {
    if (doc.exists()) {
      callback({ id: doc.id, ...doc.data() });
    }
  }, (error) => {
    console.error('Error listening to user updates:', error);
  });
};

// Get user statistics
export const getUserStatistics = async (userId, userType) => {
  try {
    let stats = {};
    
    if (userType === 'CLIENT') {
      // Get client statistics
      const bookingsQuery = query(
        collection(db, 'bookings'),
        where('clientId', '==', userId)
      );
      const bookingsSnapshot = await getDocs(bookingsQuery);
      
      stats = {
        totalBookings: bookingsSnapshot.size,
        completedSessions: bookingsSnapshot.docs.filter(doc =>
          doc.data().status === 'completed'
        ).length,
        favoriteProfessionals: 0, // You can implement favorites collection
        totalSpent: bookingsSnapshot.docs.reduce((total, doc) =>
          total + (doc.data().amount || 0), 0
        )
      };
    } else if (userType === 'PROFESSIONAL') {
      // Get professional statistics
      const bookingsQuery = query(
        collection(db, 'bookings'),
        where('professionalId', '==', userId)
      );
      const bookingsSnapshot = await getDocs(bookingsQuery);
      
      const reviewsQuery = query(
        collection(db, REVIEWS_COLLECTION),
        where('professionalId', '==', userId)
      );
      const reviewsSnapshot = await getDocs(reviewsQuery);
      
      const ratings = reviewsSnapshot.docs.map(doc => doc.data().rating);
      const averageRating = ratings.length > 0
        ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
        : 0;
      
      stats = {
        totalSessions: bookingsSnapshot.size,
        completedSessions: bookingsSnapshot.docs.filter(doc =>
          doc.data().status === 'completed'
        ).length,
        totalEarnings: bookingsSnapshot.docs.reduce((total, doc) =>
          total + (doc.data().amount || 0), 0
        ),
        averageRating: parseFloat(averageRating.toFixed(1)),
        totalReviews: reviewsSnapshot.size
      };
    }
    
    return { stats, success: true };
  } catch (error) {
    console.error('Error getting user statistics:', error);
    return { error: error.message, success: false };
  }
};