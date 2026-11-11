import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';
import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();
const auth = admin.auth();

// Secure Bootstrap Secret defined through Firebase Secret Manager
const bootstrapSecret = defineSecret('BOOTSTRAP_SECRET');

const SYSTEM_CONFIG_COLLECTION = 'system_config';
const LOCK_DOCUMENT_ID = 'initialization_lock';

/**
 * SECURE ONE-TIME FIRST SUPER ADMIN INITIALIZATION
 * 
 * Performs initialization exclusively on the backend:
 * 1. Verifies the caller possesses the authentic Bootstrap Secret from Secret Manager.
 * 2. Uses an atomic Firestore transaction to check the permanent initialization lock.
 * 3. Prevents concurrent initialization race conditions.
 * 4. Creates the Firebase Auth account.
 * 5. Assigns trusted Custom Claims { role: 'super-admin', admin: true }.
 * 6. Creates corresponding /users and /admins Firestore documents.
 * 7. Permanently locks the initialization mechanism.
 * 8. Automatic Rollback: If any step fails, cleans up any created Auth account.
 */
export const initializeFirstSuperAdmin = onCall(
  {
    secrets: [bootstrapSecret],
    cors: true,
    maxInstances: 1 // Concurrency safety
  },
  async (request) => {
    const rawData = request.data || {};
    const providedSecret = rawData.bootstrapSecret;
    const configuredSecret = bootstrapSecret.value() || process.env.BOOTSTRAP_SECRET;

    // 1. Strict secret validation
    if (!configuredSecret) {
      console.error('[CRITICAL] BOOTSTRAP_SECRET is not configured in Firebase Secret Manager.');
      throw new HttpsError(
        'failed-precondition',
        'System security error: Bootstrap Secret has not been provisioned in Secret Manager.'
      );
    }

    if (!providedSecret || typeof providedSecret !== 'string' || providedSecret !== configuredSecret) {
      console.warn('[SECURITY] Unauthorized first-admin initialization attempt with invalid bootstrap secret.');
      throw new HttpsError(
        'permission-denied',
        'Authorization failed: Invalid or missing bootstrap secret.'
      );
    }

    const { email, password, fullName } = rawData;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      throw new HttpsError('invalid-argument', 'A valid email address is required.');
    }

    if (!password || typeof password !== 'string' || password.length < 8) {
      throw new HttpsError('invalid-argument', 'Super Admin password must be at least 8 characters long.');
    }

    const normalizedEmail = email.trim().toLowerCase();
    const lockRef = db.collection(SYSTEM_CONFIG_COLLECTION).doc(LOCK_DOCUMENT_ID);

    let createdUid: string | null = null;

    try {
      // 2. Atomic check-and-lock inside a Firestore transaction
      await db.runTransaction(async (transaction) => {
        const lockDoc = await transaction.get(lockRef);

        if (lockDoc.exists) {
          const lockData = lockDoc.data();
          if (lockData?.initialized === true || lockData?.lockPermanent === true) {
            throw new HttpsError(
              'already-exists',
              'Initial setup operation has already been permanently completed and locked.'
            );
          }
        }

        // Pre-reserve lock to prevent race condition
        transaction.set(
          lockRef,
          {
            locked: true,
            status: 'in_progress',
            attemptedAt: admin.firestore.FieldValue.serverTimestamp()
          },
          { merge: true }
        );
      });

      // 3. Create Firebase Authentication account
      const userRecord = await auth.createUser({
        email: normalizedEmail,
        password: password,
        displayName: fullName?.trim() || 'Super Administrator',
        emailVerified: true
      });
      createdUid = userRecord.uid;

      // 4. Assign trusted Custom Claims
      await auth.setCustomUserClaims(createdUid, {
        role: 'super-admin',
        admin: true
      });

      // 5. Atomic Batch write for Firestore records & permanent lock
      const batch = db.batch();

      const userDocRef = db.collection('users').doc(createdUid);
      batch.set(userDocRef, {
        id: createdUid,
        email: normalizedEmail,
        fullName: fullName?.trim() || 'Super Administrator',
        role: 'super-admin',
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      const adminDocRef = db.collection('admins').doc(createdUid);
      batch.set(adminDocRef, {
        id: createdUid,
        email: normalizedEmail,
        fullName: fullName?.trim() || 'Super Administrator',
        role: 'super-admin',
        addedAt: new Date().toISOString(),
        isSuperAdmin: true
      });

      batch.set(lockRef, {
        initialized: true,
        lockPermanent: true,
        status: 'locked_permanently',
        superAdminUid: createdUid,
        superAdminEmail: normalizedEmail,
        initializedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      await batch.commit();

      console.log(`[AUDIT] Super Admin [${createdUid}] initialized successfully. Lock engaged permanently.`);

      return {
        success: true,
        message: 'Super Admin successfully initialized, custom claims assigned, and setup permanently locked.',
        uid: createdUid,
        email: normalizedEmail
      };

    } catch (err: any) {
      console.error('[FAILURE] Error during first Super Admin initialization:', err);

      // 6. FAILURE HANDLING & CLEANUP RECOVERY
      // If the Auth user was created but subsequent operations failed, rollback and delete user!
      if (createdUid) {
        try {
          await auth.deleteUser(createdUid);
          console.log(`[ROLLBACK] Cleaned up partially created Auth user [${createdUid}].`);
        } catch (cleanupErr) {
          console.error('[CRITICAL] Failed to cleanup Auth user during rollback:', cleanupErr);
        }
      }

      // Reset in_progress lock status so genuine operator can retry
      try {
        const checkDoc = await lockRef.get();
        if (checkDoc.exists && checkDoc.data()?.status === 'in_progress') {
          await lockRef.delete();
          console.log('[ROLLBACK] Reset in-progress lock document.');
        }
      } catch (lockResetErr) {
        console.error('[CRITICAL] Failed to reset in-progress lock doc:', lockResetErr);
      }

      if (err instanceof HttpsError) {
        throw err;
      }
      throw new HttpsError('internal', err?.message || 'Failed to initialize Super Admin account.');
    }
  }
);

/**
 * PUBLIC/ADMIN STATUS CHECK
 * Returns whether the system is already locked without exposing sensitive data.
 */
export const checkInitializationStatus = onCall(
  { cors: true },
  async () => {
    try {
      const lockDoc = await db.collection(SYSTEM_CONFIG_COLLECTION).doc(LOCK_DOCUMENT_ID).get();
      if (!lockDoc.exists) {
        return { isInitialized: false };
      }
      const data = lockDoc.data();
      return {
        isInitialized: data?.initialized === true || data?.lockPermanent === true
      };
    } catch (err: any) {
      console.error('Error checking initialization lock:', err);
      return { isInitialized: false };
    }
  }
);

/**
 * ROLE ASSIGNMENT FUNCTION (Super Admin Only)
 * Allows the initialized Super Admin to assign or modify roles for teachers and admins.
 * Verifies caller has { role: 'super-admin' } custom claims.
 */
export const setRoleCustomClaims = onCall(
  { cors: true },
  async (request) => {
    // 1. Verify caller authentication
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Authentication required.');
    }

    // 2. Verify caller has super-admin custom claims
    const callerClaims = request.auth.token || {};
    const callerRole = callerClaims.role;
    const isSuper = callerRole === 'super-admin' || callerRole === 'super_admin';

    if (!isSuper) {
      throw new HttpsError(
        'permission-denied',
        'Only an authorized Super Administrator can assign role custom claims.'
      );
    }

    const { targetUid, targetRole } = request.data || {};
    if (!targetUid || !targetRole) {
      throw new HttpsError('invalid-argument', 'targetUid and targetRole are required.');
    }

    const validRoles = ['super-admin', 'admin', 'teacher', 'student'];
    if (!validRoles.includes(targetRole)) {
      throw new HttpsError('invalid-argument', `Invalid role: ${targetRole}. Must be one of: ${validRoles.join(', ')}`);
    }

    try {
      await auth.setCustomUserClaims(targetUid, {
        role: targetRole,
        admin: targetRole === 'super-admin' || targetRole === 'admin'
      });

      // Update in Firestore
      await db.collection('users').doc(targetUid).set({
        role: targetRole,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      if (targetRole === 'super-admin' || targetRole === 'admin') {
        await db.collection('admins').doc(targetUid).set({
          id: targetUid,
          role: targetRole,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      }

      return {
        success: true,
        message: `Successfully assigned role [${targetRole}] to UID [${targetUid}].`
      };
    } catch (err: any) {
      throw new HttpsError('internal', err?.message || 'Failed to update custom claims.');
    }
  }
);
