// src/services/userService.js
import {
  collection,
  doc,
  getDocs,
  getDoc,
  // addDoc,
  // updateDoc,
  // deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  // onSnapshot,
  // getCountFromServer,
  // runTransaction,
  Timestamp,
  writeBatch
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../config/firebase';

// Collections
const USERS_COLLECTION = 'users';
const PROFESSIONALS_COLLECTION = 'professionals';
const REVIEWS_COLLECTION = 'reviews';
const BOOKINGS_COLLECTION = 'bookings';

export const uploadProfilePicture = async (userId, file) => {
  if (!userId || !file) {
    return { success: false, error: 'User ID and file are required.' };
  }
  try {
    const filePath = `profile-pictures/${userId}/${Date.now()}_${file.name}`;
    const fileRef = ref(storage, filePath);
    const uploadResult = await uploadBytes(fileRef, file);
    const downloadURL = await getDownloadURL(uploadResult.ref);
    return { success: true, profile_picture: downloadURL };
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    return { success: false, error: error.message };
  }
};

// ... (rest of your functions in userService.js) ...
// Fetches the list of professional types (categories) from Firestore.
export const getProfessionalTypes = async () => {
  try {
    const typesSnapshot = await getDocs(collection(db, 'professional_types'));
    const types = [];
    typesSnapshot.forEach((doc) => {
      // We use the document ID as the unique key for filtering
      types.push({ firestoreId: doc.id, ...doc.data() });
    });
    return { types, success: true };
  } catch (error) {
    console.error('Error getting professional types:', error);
    return { error: error.message, success: false };
  }
};


// --- UPDATED FUNCTION ---
// Fetches professionals, now with filtering by professional_type_id.
export const getProfessionals = async (filters = {}) => {
  try {
    const professionalsRef = collection(db, PROFESSIONALS_COLLECTION);
    const pageSize = filters.pageSize || 100;

    const queryConstraints = [];

    // Filter for verified professionals and pending verification (more inclusive)
    // This allows showing professionals who are either verified or pending approval
    // queryConstraints.push(where('verification_status', 'in', ['VERIFIED', 'PENDING']));

    // If a specific category ID is provided (and it's not 'All'), add a where clause.
    if (filters.professionalTypeId && filters.professionalTypeId !== 'All') {
      // Your Firestore 'professional_type_id' seems to be a number.
      // The ID from the dropdown will be a string. So we convert it to a number.
      queryConstraints.push(where('professional_type_id', '==', Number(filters.professionalTypeId)));
    }

    // Add pagination and limit
    queryConstraints.push(limit(pageSize));
    if (filters.lastDoc) {
      queryConstraints.push(startAfter(filters.lastDoc));
    }

    const q = query(professionalsRef, ...queryConstraints);
    const professionalsSnapshot = await getDocs(q);

    if (professionalsSnapshot.empty) {
      return { professionals: [], hasMore: false, lastDoc: null, success: true };
    }

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

    // Client-side sorting can remain here
    if (filters.sortBy) {
      professionals.sort((a, b) => {
        switch (filters.sortBy) {
          case 'price':
            return (a.hourly_rate || 0) - (b.hourly_rate || 0);
          case 'experience':
            return (b.years_of_experience || 0) - (a.years_of_experience || 0);
          case 'newest':
          default:
            const aDate = a.created_at?.toDate?.() || new Date(0);
            const bDate = b.created_at?.toDate?.() || new Date(0);
            return bDate - aDate;
        }
      });
    }

    const lastDoc = professionalsSnapshot.docs[professionalsSnapshot.docs.length - 1];
    const hasMore = professionalsSnapshot.docs.length === pageSize;

    return { professionals, hasMore, lastDoc, success: true };

  } catch (error) {
    console.error('Error getting professionals:', error);
    return { error: error.message, success: false };
  }
};

// ... (rest of your functions in userService.js) ...
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
export const getAllSpecializations = async () => {
  try {
    const specializationsSnapshot = await getDocs(collection(db, 'specializations'));
    const specializations = [];
    specializationsSnapshot.forEach((doc) => {
      specializations.push({ id: doc.id, ...doc.data() });
    });
    return { specializations, success: true };
  } catch (error) {
    console.error('Error getting all specializations:', error);
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

export const getProfessionalProfileByUserId = async (userId) => {
  try {
    const q = query(collection(db, 'professionals'), where('user_id', '==', userId), limit(1));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      // This can happen if a professional user was created but their professional profile wasn't.
      return { success: false, error: 'Professional profile not found.' };
    }
    const professionalDoc = querySnapshot.docs[0];
    return { success: true, profile: { id: professionalDoc.id, ...professionalDoc.data() } };
  } catch (error) {
    console.error('Error fetching professional profile:', error);
    return { success: false, error: error.message };
  }
};

export const updateProfessionalProfile = async (userId, professionalId, data) => {
  try {
    const batch = writeBatch(db);

    const userRef = doc(db, 'users', userId);
    const userData = {
      displayName: `${data.firstName || ''} ${data.lastName || ''}`.trim(),
      phone: data.phone,
      ...(data.profile_picture && { profile_picture: data.photoURL })
    };
    batch.update(userRef, userData);

    const professionalRef = doc(db, 'professionals', professionalId);
    const professionalData = {
      first_name: data.firstName || '',
      last_name: data.lastName || '',
      profession: data.profession || '',
      specialization: data.specialization || '',
      years_of_experience: data.experience || 0,
      location: data.location || '',
      hourly_rate: data.sessionRate || 0,
      biography: data.biography || '',
      educational_qualification: (data.qualifications || []).join(', '),
      languages_spoken: (data.languages || []).join(', '),
      updated_at: Timestamp.now(),
      ...(data.profile_picture && { profile_picture: data.profile_picture })
    };
    batch.update(professionalRef, professionalData);

    await batch.commit();
    return { success: true };
  } catch (error) {
    console.error("Error updating professional profile:", error);
    return { success: false, error: error.message };
  }
};