import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { createSession, deleteSession } from '@/lib/session';
import type { User } from '@/lib/types';

export async function POST(request: Request) {
  const body = await request.json();
  const { idToken } = body;

  try {
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const { uid, email, name, picture } = decodedToken;

    let userDoc = await adminDb.collection('employees').doc(uid).get();
    
    // For this example, if user doesn't exist in Firestore, create one.
    // In a real app, you might have a different registration flow.
    if (!userDoc.exists) {
        const newUser: Partial<User> = {
            email: email || null,
            name: name || 'New User',
            role: 'Employee', // Default role
            department: 'Unassigned',
            status: 'Active',
            hireDate: new Date().toISOString(),
            photoURL: picture || null,
        };
        await adminDb.collection('employees').doc(uid).set(newUser);
        userDoc = await adminDb.collection('employees').doc(uid).get();
    }
    
    const user = { uid, ...userDoc.data() } as User;

    await createSession(user);

    return NextResponse.json({ status: 'success', user });
  } catch (error) {
    console.error('Session login error:', error);
    return NextResponse.json({ status: 'error', message: 'Authentication failed.' }, { status: 401 });
  }
}

export async function DELETE() {
  try {
    await deleteSession();
    return NextResponse.json({ status: 'success' });
  } catch (error) {
    console.error('Session logout error:', error);
    return NextResponse.json({ status: 'error', message: 'Logout failed.' }, { status: 500 });
  }
}
