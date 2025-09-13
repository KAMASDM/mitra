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

// Get professionals with filters
export const getProfessionals = async (filters = {}) => {
  try {
    let q = collection(db, PROFESSIONALS_COLLECTION);
    
    // Apply filters
    if (filters.category) {
      q = query(q, where('category', '==', filters.category));
    }
    
    if (filters.location) {
      q = query(q, where('location', '==', filters.location));
    }
    
    if (filters.verified !== undefined) {
      q = query(q, where('verified', '==', filters.verified));
    }
    
    if (filters.available !== undefined) {
      q = query(q, where('available', '==', filters.available));
    }
    
    // Order by rating or creation date
    const orderField = filters.sortBy || 'rating';
    const orderDirection = filters.sortOrder || 'desc';
    q = query(q, orderBy(orderField, orderDirection));
    
    if (filters.limit) {
      q = query(q, limit(filters.limit));
    }
    
    const querySnapshot = await getDocs(q);
    const professionals = [];
    
    querySnapshot.forEach((doc) => {
      professionals.push({ id: doc.id, ...doc.data() });
    });
    
    return { professionals, success: true };
  } catch (error) {
    console.error('Error getting professionals:', error);
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