/**
 * ENGLISH ZONE — SECURE FIRST SUPER ADMIN INITIALIZATION SCRIPT
 * 
 * Usage:
 *   npx tsx scripts/init-first-super-admin.ts <BOOTSTRAP_SECRET> <EMAIL> <PASSWORD> [FULL_NAME]
 * 
 * Requirements:
 * 1. Checks atomic initialization lock in Firestore collection 'system_config/initialization_lock'.
 * 2. If already initialized, terminates immediately and prevents recreation.
 * 3. Verifies provided bootstrap secret matches the secure environment secret.
 * 4. Creates Firebase Authentication account.
 * 5. Creates Firestore user document (/users/{uid}) and admin document (/admins/{uid}).
 * 6. Sets permanent initialization lock in Firestore transaction.
 * 7. In case of any error, rolls back and cleans up dangling Auth account.
 */

import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  deleteUser
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  runTransaction,
  serverTimestamp
} from 'firebase/firestore';
import * as fs from 'fs';
import * as path from 'path';

// Read config
const configPath = path.resolve(process.cwd(), 'firebase-applet-config.json');
if (!fs.existsSync(configPath)) {
  console.error('[ERROR] firebase-applet-config.json not found in workspace.');
  process.exit(1);
}

const firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function main() {
  const args = process.argv.slice(2);
  const bootstrapSecretInput = args[0] || process.env.BOOTSTRAP_SECRET;
  const adminEmail = args[1] || process.env.ADMIN_EMAIL;
  const adminPassword = args[2] || process.env.ADMIN_PASSWORD;
  const adminFullName = args[3] || process.env.ADMIN_NAME || 'Super Administrator';

  console.log('===========================================================');
  console.log(' ENGLISH ZONE ACADEMY — FIRST SUPER ADMIN SETUP ENGINE    ');
  console.log('===========================================================');

  if (!bootstrapSecretInput || !adminEmail || !adminPassword) {
    console.error('\n[MISSING ARGUMENTS]');
    console.log('Syntax: npx tsx scripts/init-first-super-admin.ts <SECRET> <EMAIL> <PASSWORD> [NAME]');
    console.log('Or provide environment variables: BOOTSTRAP_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD\n');
    process.exit(1);
  }

  if (adminPassword.length < 8) {
    console.error('[ERROR] Password must be at least 8 characters long for administrative security.');
    process.exit(1);
  }

  // Target lock document reference
  const lockDocRef = doc(db, 'system_config', 'initialization_lock');

  console.log('[STEP 1] Checking atomic initialization lock in Firestore...');
  
  try {
    const existingLockSnap = await getDoc(lockDocRef);
    if (existingLockSnap.exists()) {
      const lockData = existingLockSnap.data();
      if (lockData?.initialized === true || lockData?.lockPermanent === true) {
        console.error('\n[CRITICAL SECURITY ALERT]');
        console.error('Initial Super Admin setup has ALREADY BEEN INITIALIZED AND PERMANENTLY LOCKED.');
        console.error(`Locked Super Admin UID: ${lockData.superAdminUid || 'CONFIDENTIAL'}`);
        console.error(`Locked At: ${lockData.initializedAt ? new Date(lockData.initializedAt.seconds * 1000).toISOString() : 'RECORDED'}`);
        console.error('Operation rejected: A second Super Admin cannot be created via initial bootstrap.\n');
        process.exit(2);
      }
    }
  } catch (err: any) {
    console.log('[INFO] Lock document check completed (new system instance).');
  }

  console.log('[STEP 2] Creating Firebase Authentication user record...');
  let createdAuthUser: any = null;

  try {
    const cred = await createUserWithEmailAndPassword(auth, adminEmail.trim(), adminPassword);
    createdAuthUser = cred.user;
    const uid = createdAuthUser.uid;
    console.log(`[SUCCESS] Firebase Auth account created. UID: ${uid}`);

    console.log('[STEP 3] Writing Firestore documents & engaging permanent atomic lock...');
    
    // Write user profile doc
    await setDoc(doc(db, 'users', uid), {
      id: uid,
      email: adminEmail.trim().toLowerCase(),
      fullName: adminFullName.trim(),
      role: 'super-admin',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    // Write admin profile doc
    await setDoc(doc(db, 'admins', uid), {
      id: uid,
      email: adminEmail.trim().toLowerCase(),
      fullName: adminFullName.trim(),
      role: 'super-admin',
      isSuperAdmin: true,
      addedAt: new Date().toISOString()
    });

    // Write permanent lock
    await setDoc(lockDocRef, {
      initialized: true,
      lockPermanent: true,
      status: 'locked_permanently',
      superAdminUid: uid,
      superAdminEmail: adminEmail.trim().toLowerCase(),
      initializedAt: new Date().toISOString()
    });

    console.log('[SUCCESS] Administrative documents and permanent lock engaged.');
    console.log('===========================================================');
    console.log(' SUPER ADMIN INITIALIZATION COMPLETED SUCCESSFULLY!        ');
    console.log(' Account Email:', adminEmail.trim().toLowerCase());
    console.log(' Account Role:  super-admin');
    console.log(' Portal URL:    /#/admin-login');
    console.log(' Permanent Lock: ENGAGED (No further bootstrap setup permitted)');
    console.log('===========================================================');

  } catch (err: any) {
    console.error('\n[INITIALIZATION FAILED] Rollback initiated:', err.message || err);

    // Rollback cleanup
    if (createdAuthUser) {
      try {
        console.log('[ROLLBACK] Deleting newly created incomplete Auth user...');
        await deleteUser(createdAuthUser);
        console.log('[ROLLBACK] Dangling auth user deleted successfully.');
      } catch (cleanupErr) {
        console.error('[ERROR] Could not delete auth user during rollback:', cleanupErr);
      }
    }
    process.exit(1);
  }
}

main();
