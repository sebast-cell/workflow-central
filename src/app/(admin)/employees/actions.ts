'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { adminAuth, adminDb } from '@/lib/firebase-admin';

const createUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  department: z.string().min(2),
  role: z.enum(['Admin', 'Employee']),
});

export async function createUserAction(values: z.infer<typeof createUserSchema>): Promise<{ success: boolean, error?: string }> {
  const validation = createUserSchema.safeParse(values);

  if (!validation.success) {
    return { success: false, error: 'Invalid data provided.' };
  }

  const { email, password, name, role, department } = validation.data;

  try {
    // 1. Create user in Firebase Auth
    const userRecord = await adminAuth.createUser({
      email,
      password,
      displayName: name,
    });

    // 2. Create user profile in Firestore
    await adminDb.collection('employees').doc(userRecord.uid).set({
      name,
      email,
      role,
      department,
      status: 'Active',
      hireDate: new Date().toISOString().split('T')[0], // aaaa-mm-dd
    });
    
    // Revalidate the employees page to show the new user
    revalidatePath('/employees');

    return { success: true };
  } catch (error: any) {
    console.error('Error creating user:', error);
    if (error.code === 'auth/email-already-exists') {
      return { success: false, error: 'This email is already in use.' };
    }
    return { success: false, error: 'An unexpected error occurred. Please try again.' };
  }
}
