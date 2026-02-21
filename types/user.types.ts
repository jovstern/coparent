import { z } from 'zod';
import { Timestamp } from 'firebase/firestore';
import {
  userSchema,
  parentSchema,
  emergencyContactSchema,
  childInfoSchema,
} from '../schemas/user.schema';

// Infer TypeScript types from Zod schemas
export type User = z.infer<typeof userSchema>;
export type Parent = z.infer<typeof parentSchema>;
export type EmergencyContact = z.infer<typeof emergencyContactSchema>;
export type ChildInfo = z.infer<typeof childInfoSchema>;

// Re-export Timestamp for convenience
export type { Timestamp };
