// src/utils/addSampleData.js
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';

const sampleProfessionals = [
  {
    user_id: 'user_1',
    professional_type_id: 1,
    specialization: 'Cardiologist',
    years_of_experience: 5,
    hourly_rate: 200,
    location: 'Mumbai, India',
    bio: 'Experienced cardiologist with expertise in heart disease prevention and treatment.',
    verification_status: 'VERIFIED',
    average_rating: 4.8,
    total_reviews: 25,
    created_at: Timestamp.now(),
    availability_schedule: {
      monday: { start: '09:00', end: '17:00' },
      tuesday: { start: '09:00', end: '17:00' },
      wednesday: { start: '09:00', end: '17:00' },
      thursday: { start: '09:00', end: '17:00' },
      friday: { start: '09:00', end: '17:00' }
    }
  },
  {
    user_id: 'user_2', 
    professional_type_id: 2,
    specialization: 'Clinical Psychologist',
    years_of_experience: 8,
    hourly_rate: 150,
    location: 'Delhi, India',
    bio: 'Licensed clinical psychologist specializing in anxiety and depression counseling.',
    verification_status: 'VERIFIED',
    average_rating: 4.9,
    total_reviews: 45,
    created_at: Timestamp.now(),
    availability_schedule: {
      monday: { start: '10:00', end: '18:00' },
      tuesday: { start: '10:00', end: '18:00' },
      wednesday: { start: '10:00', end: '18:00' },
      thursday: { start: '10:00', end: '18:00' },
      friday: { start: '10:00', end: '18:00' }
    }
  },
  {
    user_id: 'user_3',
    professional_type_id: 3,
    specialization: 'Dermatologist', 
    years_of_experience: 3,
    hourly_rate: 180,
    location: 'Bangalore, India',
    bio: 'Board-certified dermatologist with focus on skin care and cosmetic treatments.',
    verification_status: 'VERIFIED',
    average_rating: 4.6,
    total_reviews: 18,
    created_at: Timestamp.now(),
    availability_schedule: {
      monday: { start: '09:00', end: '16:00' },
      tuesday: { start: '09:00', end: '16:00' },
      wednesday: { start: '09:00', end: '16:00' },
      thursday: { start: '09:00', end: '16:00' },
      friday: { start: '09:00', end: '16:00' }
    }
  }
];

const sampleUsers = [
  {
    id: 'user_1',
    displayName: 'Dr. Sarah Johnson',
    first_name: 'Sarah',
    last_name: 'Johnson',
    email: 'sarah.johnson@example.com',
    phone: '+91-9876543210',
    role: 'PROFESSIONAL',
    profile_picture: null,
    createdAt: Timestamp.now()
  },
  {
    id: 'user_2',
    displayName: 'Dr. Michael Chen',
    first_name: 'Michael',
    last_name: 'Chen',
    email: 'michael.chen@example.com',
    phone: '+91-9876543211',
    role: 'PROFESSIONAL',
    profile_picture: null,
    createdAt: Timestamp.now()
  },
  {
    id: 'user_3',
    displayName: 'Dr. Priya Sharma',
    first_name: 'Priya',
    last_name: 'Sharma',
    email: 'priya.sharma@example.com',
    phone: '+91-9876543212',
    role: 'PROFESSIONAL',
    profile_picture: null,
    createdAt: Timestamp.now()
  }
];

export const addSampleData = async () => {
  try {
    console.log('Adding sample professionals...');
    
    // Add sample users first
    for (const user of sampleUsers) {
      await addDoc(collection(db, 'users'), user);
      console.log(`Added user: ${user.displayName}`);
    }
    
    // Add sample professionals
    for (const professional of sampleProfessionals) {
      await addDoc(collection(db, 'professionals'), professional);
      console.log(`Added professional: ${professional.specialization}`);
    }
    
    console.log('Sample data added successfully!');
    return { success: true };
  } catch (error) {
    console.error('Error adding sample data:', error);
    return { success: false, error: error.message };
  }
};

// Function to add sample availability slots
export const addSampleAvailabilitySlots = async () => {
  try {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const sampleSlots = [
      {
        professional_id: 'professional_1', // This would be the actual ID after creating professionals
        title: 'Available for consultation',
        start_date: Timestamp.fromDate(new Date(tomorrow.setHours(10, 0, 0, 0))),
        end_date: Timestamp.fromDate(new Date(tomorrow.setHours(11, 0, 0, 0))),
        is_booked: false,
        created_at: Timestamp.now()
      },
      {
        professional_id: 'professional_1',
        title: 'Available for consultation',
        start_date: Timestamp.fromDate(new Date(tomorrow.setHours(14, 0, 0, 0))),
        end_date: Timestamp.fromDate(new Date(tomorrow.setHours(15, 0, 0, 0))),
        is_booked: false,
        created_at: Timestamp.now()
      }
    ];
    
    for (const slot of sampleSlots) {
      await addDoc(collection(db, 'availability_slots'), slot);
    }
    
    console.log('Sample availability slots added!');
    return { success: true };
  } catch (error) {
    console.error('Error adding sample slots:', error);
    return { success: false, error: error.message };
  }
};