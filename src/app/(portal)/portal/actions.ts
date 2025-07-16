'use server';

import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { revalidatePath } from 'next/cache';

interface ClockActionInput {
  userId: string;
  latitude: number;
  longitude: number;
}

export async function clockInAction({ userId, latitude, longitude }: ClockActionInput) {
  if (!userId) {
    return { success: false, error: 'User not found' };
  }

  try {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const attendanceRef = adminDb.collection('attendance').doc(`${userId}_${today}`);
    const userRef = adminDb.collection('employees').doc(userId);

    await adminDb.runTransaction(async (transaction) => {
        const attendanceDoc = await transaction.get(attendanceRef);
        if (attendanceDoc.exists && attendanceDoc.data()?.clockIn) {
            // Already clocked in
            return;
        }

        const userData = (await transaction.get(userRef)).data();
        if (!userData) {
            throw new Error('Employee not found');
        }

        const clockInData = {
            employeeId: userId,
            employeeName: userData.name,
            date: today,
            clockIn: new Date(),
            clockInLocation: { latitude, longitude },
            clockOut: null,
            status: 'Clocked In',
        };

        if(attendanceDoc.exists) {
            transaction.update(attendanceRef, clockInData);
        } else {
            transaction.set(attendanceRef, clockInData);
        }
        
        transaction.update(userRef, { lastStatus: 'Clocked In', lastClockIn: new Date() });
    });


    revalidatePath('/portal');
    return { success: true };
  } catch (error) {
    console.error('Error clocking in:', error);
    return { success: false, error: 'Failed to clock in.' };
  }
}

export async function clockOutAction({ userId, latitude, longitude }: ClockActionInput) {
    if (!userId) {
        return { success: false, error: 'User not found' };
    }

    try {
        const today = new Date().toISOString().split('T')[0];
        const attendanceRef = adminDb.collection('attendance').doc(`${userId}_${today}`);
        const userRef = adminDb.collection('employees').doc(userId);

        await adminDb.runTransaction(async (transaction) => {
            const attendanceDoc = await transaction.get(attendanceRef);
            if (!attendanceDoc.exists || !attendanceDoc.data()?.clockIn) {
                 throw new Error("Cannot clock out without clocking in first.");
            }

            if(attendanceDoc.data()?.clockOut) {
                // Already clocked out
                return;
            }

            const clockOutData = {
                clockOut: new Date(),
                clockOutLocation: { latitude, longitude },
                status: 'Clocked Out',
            };
            
            transaction.update(attendanceRef, clockOutData);
            transaction.update(userRef, { lastStatus: 'Clocked Out', lastClockOut: new Date() });
        });

        revalidatePath('/portal');
        return { success: true };
    } catch (error) {
        console.error('Error clocking out:', error);
        return { success: false, error: 'Failed to clock out.' };
    }
}
