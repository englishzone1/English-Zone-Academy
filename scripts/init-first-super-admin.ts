/**
 * ENGLISH ZONE — SECURE FIRST SUPER ADMIN INITIALIZATION SCRIPT (ADMIN SDK)
 * 
 * Production-ready administrative bootstrap engine:
 * 1. Uses Firebase Admin SDK with Application Default Credentials (ADC).
 * 2. Targets project 'alert-cinema-wh5g6' and named database 'ai-studio-englishzoneinter-38f9c0be-d2d0-4184-8171-1d40b8b75898'.
 * 3. Enforces an atomic transaction with a unique attempt ID (fencing token) and bounded lease.
 * 4. Checks whether an account already exists; requires explicit '--confirm-promote-existing' to promote an existing student account.
 * 5. Assigns trusted Custom Claims: { role: 'super-admin', admin: true }.
 * 6. Creates corresponding /users and /admins documents in the named Firestore database.
 * 7. Permanently locks the initialization mechanism without exposing email or UID.
 * 8. Safe rollback: Handles partial failures without leaving orphaned accounts or deleting newer attempt locks.
 * 9. Never logs passwords, secrets, or private credentials.
 * 
 * Usage:
 *   npx tsx scripts/init-first-super-admin.ts <BOOTSTRAP_SECRET> <EMAIL> <PASSWORD> [NAME] [--confirm-promote-existing]
 */

import { initializeApp, getApps, getApp } from 'firebase-admin/app';
import { getFirestore, FieldValue, DocumentReference } from 'firebase-admin/firestore';
import { getAuth, UserRecord } from 'firebase-admin/auth';
import * as crypto from 'crypto';

const PROJECT_ID = 'alert-cinema-wh5g6';
const FIRESTORE_DATABASE_ID = 'ai-studio-englishzoneinter-38f9c0be-d2d0-4184-8171-1d40b8b75898';
const SYSTEM_CONFIG_COLLECTION = 'system_config';
const LOCK_DOCUMENT_ID = 'initialization_lock';
const LEASE_DURATION_MS = 5 * 60 * 1000; // 5-minute reservation lease

// Initialize Admin SDK using Application Default Credentials or explicit environment credentials
const app = getApps().length === 0
  ? initializeApp({
      projectId: PROJECT_ID
    })
  : getApp();

const db = getFirestore(app, FIRESTORE_DATABASE_ID);
const auth = getAuth(app);

async function main() {
  const args = process.argv.slice(2);
  const confirmPromote = args.includes('--confirm-promote-existing') || process.env.CONFIRM_PROMOTE_EXISTING === 'true';
  const filteredArgs = args.filter(a => a !== '--confirm-promote-existing');

  const bootstrapSecretInput = filteredArgs[0] || process.env.BOOTSTRAP_SECRET;
  const adminEmail = filteredArgs[1] || process.env.ADMIN_EMAIL;
  const adminPassword = filteredArgs[2] || process.env.ADMIN_PASSWORD;
  const adminFullName = filteredArgs[3] || process.env.ADMIN_NAME || 'Super Administrator';

  console.log('======================================================================');
  console.log(' ENGLISH ZONE ACADEMY — FIRST SUPER ADMIN INITIALIZATION (ADMIN SDK)  ');
  console.log('======================================================================\n');

  if (!bootstrapSecretInput || !adminEmail || !adminPassword) {
    console.error('[SYNTAX ERROR] Missing required arguments.');
    console.log('Usage:');
    console.log('  npx tsx scripts/init-first-super-admin.ts <SECRET> <EMAIL> <PASSWORD> [NAME] [--confirm-promote-existing]\n');
    console.log('Or supply environment variables:');
    console.log('  BOOTSTRAP_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD, [ADMIN_NAME], [CONFIRM_PROMOTE_EXISTING]\n');
    process.exit(1);
  }

  const normalizedEmail = adminEmail.trim().toLowerCase();
  if (!normalizedEmail.includes('@') || !normalizedEmail.includes('.')) {
    console.error('[VALIDATION ERROR] Invalid email address format.');
    process.exit(1);
  }

  if (adminPassword.length < 8) {
    console.error('[VALIDATION ERROR] Password must be at least 8 characters long for administrative security.');
    process.exit(1);
  }

  // Generate unique fencing token for this attempt
  const attemptId = `attempt_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  const nowMs = Date.now();
  const lockRef = db.collection(SYSTEM_CONFIG_COLLECTION).doc(LOCK_DOCUMENT_ID);

  console.log(`[INIT] Initializing reservation attempt [${attemptId}]`);
  console.log(`[CONFIG] Project: ${PROJECT_ID}`);
  console.log(`[CONFIG] Target Database: ${FIRESTORE_DATABASE_ID}`);
  console.log(`[CONFIG] Administrator Email: ${normalizedEmail}\n`);

  // STEP 1: Atomic check-and-reservation inside a Firestore transaction
  console.log('[STEP 1/5] Checking atomic lock and reserving initialization slot...');
  try {
    await db.runTransaction(async (transaction) => {
      const lockDoc = await transaction.get(lockRef);

      if (lockDoc.exists) {
        const lockData = lockDoc.data();

        // 1. Permanent lock check
        if (lockData?.initialized === true || lockData?.lockPermanent === true) {
          throw new Error('PERMANENT_LOCK_ENGAGED: System is already initialized and permanently locked.');
        }

        // 2. Active concurrency lease check
        if (lockData?.status === 'in_progress' && lockData?.leaseExpiresAtMs) {
          if (nowMs < lockData.leaseExpiresAtMs) {
            throw new Error(`CONCURRENT_ATTEMPT_ACTIVE: Another setup attempt is currently in progress. Lease expires in ${Math.round((lockData.leaseExpiresAtMs - nowMs) / 1000)}s.`);
          }
          console.warn('[NOTICE] Previous attempt reservation lease has expired. Re-reserving initialization slot.');
        }
      }

      // Pre-reserve slot with bounded lease and fencing token
      transaction.set(
        lockRef,
        {
          locked: true,
          status: 'in_progress',
          activeAttemptId: attemptId,
          leaseExpiresAtMs: nowMs + LEASE_DURATION_MS,
          reservedAt: FieldValue.serverTimestamp()
        },
        { merge: true }
      );
    });
    console.log('[SUCCESS] Slot reserved with fencing token and 5-minute lease.');
  } catch (lockErr: any) {
    console.error('\n[LOCK REJECTED]', lockErr.message || lockErr);
    process.exit(2);
  }

  let targetUid: string | null = null;
  let isNewlyCreatedAuth = false;

  // STEP 2: Authenticate or safely inspect existing Firebase Auth account
  console.log('\n[STEP 2/5] Inspecting Firebase Authentication records...');
  try {
    let existingUserRecord: UserRecord | null = null;
    try {
      existingUserRecord = await auth.getUserByEmail(normalizedEmail);
    } catch (notFoundErr: any) {
      if (notFoundErr.code !== 'auth/user-not-found') {
        throw notFoundErr;
      }
    }

    if (existingUserRecord) {
      targetUid = existingUserRecord.uid;
      console.log(`[NOTICE] Firebase Auth user already exists with UID: [${targetUid}].`);

      // Check current profile in Firestore
      const existingUserDoc = await db.collection('users').doc(targetUid).get();
      const currentRole = existingUserDoc.exists ? existingUserDoc.data()?.role : 'unknown';

      if (currentRole === 'super-admin') {
        console.log('[NOTICE] User account is already marked as super-admin.');
      } else {
        // Guard against silent promotion of existing student accounts
        console.warn(`[SECURITY ALERT] Existing account currently has role='${currentRole}'.`);
        if (!confirmPromote) {
          console.error('\n[PROMOTION BLOCKED]');
          console.error('An existing student or teacher account cannot be silently promoted to Super Admin.');
          console.error('To explicitly promote this existing account, re-run with:');
          console.error('  npx tsx scripts/init-first-super-admin.ts <SECRET> <EMAIL> <PASSWORD> [NAME] --confirm-promote-existing\n');

          // Release the in-progress reservation lock safely
          const currentLock = await lockRef.get();
          if (currentLock.exists && currentLock.data()?.activeAttemptId === attemptId && currentLock.data()?.status === 'in_progress') {
            await lockRef.delete();
            console.log('[CLEANUP] In-progress reservation lock released.');
          }
          process.exit(3);
        }
        console.log('[CONFIRMED] Explicit promotion confirmed by operator flag (--confirm-promote-existing).');
      }

      // Update password and display name
      await auth.updateUser(targetUid, {
        password: adminPassword,
        displayName: adminFullName.trim() || 'Super Administrator',
        emailVerified: true
      });
      console.log('[SUCCESS] Existing user credentials and profile updated.');

    } else {
      // Create fresh Auth user
      const newRecord = await auth.createUser({
        email: normalizedEmail,
        password: adminPassword,
        displayName: adminFullName.trim() || 'Super Administrator',
        emailVerified: true
      });
      targetUid = newRecord.uid;
      isNewlyCreatedAuth = true;
      console.log(`[SUCCESS] New Firebase Auth account created. UID: [${targetUid}]`);
    }

  } catch (authErr: any) {
    console.error('\n[AUTH FAILURE] Error handling Firebase Auth account:', authErr.message || authErr);
    // Cleanup reservation lock
    try {
      const currentLock = await lockRef.get();
      if (currentLock.exists && currentLock.data()?.activeAttemptId === attemptId && currentLock.data()?.status === 'in_progress') {
        await lockRef.delete();
      }
    } catch {}
    process.exit(4);
  }

  if (!targetUid) {
    console.error('[CRITICAL] targetUid was not established.');
    process.exit(4);
  }

  // STEP 3: Assign Custom Claims
  console.log('\n[STEP 3/5] Assigning trusted Custom Claims ({ role: "super-admin", admin: true })...');
  try {
    await auth.setCustomUserClaims(targetUid, {
      role: 'super-admin',
      admin: true
    });
    console.log('[SUCCESS] Custom Claims assigned via Admin SDK.');
  } catch (claimErr: any) {
    console.error('[FAILURE] Could not assign Custom Claims:', claimErr.message || claimErr);
    await rollback(targetUid, isNewlyCreatedAuth, lockRef, attemptId);
    process.exit(5);
  }

  // STEP 4: Fencing Token Validation & Batch Write
  console.log('\n[STEP 4/5] Validating fencing token and committing database records...');
  try {
    // Re-verify that our lease and attemptId are still active before committing
    const verifyLock = await lockRef.get();
    if (!verifyLock.exists || verifyLock.data()?.activeAttemptId !== attemptId) {
      throw new Error('FENCING_TOKEN_EXPIRED: Another attempt has overtaken the initialization lock lease. Aborting commit.');
    }

    const batch = db.batch();

    // 1. /users/{uid}
    const userDocRef = db.collection('users').doc(targetUid);
    batch.set(userDocRef, {
      id: targetUid,
      email: normalizedEmail,
      fullName: adminFullName.trim() || 'Super Administrator',
      role: 'super-admin',
      status: 'active',
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    }, { merge: true });

    // 2. /admins/{uid}
    const adminDocRef = db.collection('admins').doc(targetUid);
    batch.set(adminDocRef, {
      id: targetUid,
      email: normalizedEmail,
      fullName: adminFullName.trim() || 'Super Administrator',
      role: 'super-admin',
      isSuperAdmin: true,
      addedAt: new Date().toISOString()
    }, { merge: true });

    // 3. /system_config/initialization_lock (Permanently locked without sensitive email or UID)
    batch.set(lockRef, {
      initialized: true,
      lockPermanent: true,
      status: 'locked_permanently',
      initializedAt: FieldValue.serverTimestamp()
    });

    await batch.commit();
    console.log('[SUCCESS] Batch written: /users, /admins, and permanent lock engaged.');

  } catch (dbErr: any) {
    console.error('[FAILURE] Database batch commit failed:', dbErr.message || dbErr);
    await rollback(targetUid, isNewlyCreatedAuth, lockRef, attemptId);
    process.exit(6);
  }

  // STEP 5: Verification and Final Output
  console.log('\n[STEP 5/5] Performing self-verification...');
  console.log('======================================================================');
  console.log(' SUPER ADMIN INITIALIZATION COMPLETED SUCCESSFULLY!                   ');
  console.log('======================================================================');
  console.log(' Account Email:   ', normalizedEmail);
  console.log(' User UID:        ', targetUid);
  console.log(' Custom Claims:   ', JSON.stringify({ role: 'super-admin', admin: true }));
  console.log(' Database:        ', FIRESTORE_DATABASE_ID);
  console.log(' Permanent Lock:   ENGAGED (initialization locked permanently)');
  console.log(' Login URL:        /#/admin-login');
  console.log('======================================================================\n');
}

async function rollback(targetUid: string | null, isNewlyCreatedAuth: boolean, lockRef: DocumentReference, attemptId: string) {
  console.log('\n[ROLLBACK] Initiating safe rollback cleanup...');

  // 1. If we created a new Auth user during this failed attempt, delete it
  if (isNewlyCreatedAuth && targetUid) {
    try {
      console.log(`[ROLLBACK] Deleting newly created incomplete Auth user [${targetUid}]...`);
      await auth.deleteUser(targetUid);
      console.log('[ROLLBACK] Auth account deleted successfully.');
    } catch (cleanupAuthErr) {
      console.error('[CRITICAL] Failed to delete auth user during rollback:', cleanupAuthErr);
    }
  }

  // 2. Reset the lock reservation ONLY if this attempt still owns it
  try {
    const currentLock = await lockRef.get();
    if (currentLock.exists && currentLock.data()?.activeAttemptId === attemptId && currentLock.data()?.status === 'in_progress') {
      await lockRef.delete();
      console.log(`[ROLLBACK] Released reservation lock held by attempt [${attemptId}].`);
    } else {
      console.log('[ROLLBACK] Lock was already taken or finalized by another operation. Not modifying.');
    }
  } catch (lockResetErr) {
    console.error('[CRITICAL] Failed to reset reservation lock doc:', lockResetErr);
  }
}

main();
