import { z } from 'zod';

export const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  displayName: z.string(),
  photoURL: z.string().optional(),
  role: z.enum(['admin', 'parent']),
  agreementId: z.string().optional(),
  hasCompletedOnboarding: z.boolean().optional(),
  createdAt: z.any(), // Firestore Timestamp
  lastLogin: z.any(), // Firestore Timestamp
});

export const parentSchema = z.object({
  id: z.string(),
  userId: z.string(),
  agreementId: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  phone: z.string().optional(),
  address: z.string().optional(),
});

export const emergencyContactSchema = z.object({
  name: z.string(),
  relationship: z.string(),
  phone: z.string(),
  isPrimary: z.boolean(),
});

export const childInfoSchema = z.object({
  id: z.string(),
  agreementId: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  dateOfBirth: z.any(), // Firestore Timestamp
  bloodType: z.string().optional(),
  healthInsurance: z.string().optional(),
  medicalNotes: z.string().optional(),
  emergencyContacts: z.array(emergencyContactSchema),
});
