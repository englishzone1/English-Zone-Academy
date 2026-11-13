import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../services/firebase';
import { UserProfile, UserRole, AvatarConfiguration } from '../types/auth';

interface AuthContextType {
  firebaseUser: FirebaseUser | null;
  user: UserProfile | null;
  hasProfile: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
  authError: string | null;
  customClaims: Record<string, any>;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  adminLogin: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  registerStudentAccount: (email: string, password: string, fullName: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  saveAvatarConfig: (config: AvatarConfiguration) => Promise<void>;
  refreshProfile: () => Promise<void>;
  isSuperAdmin: boolean;
  isAdmin: boolean;
  isTeacher: boolean;
  isStudent: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [hasProfile, setHasProfile] = useState<boolean>(false);
  const [customClaims, setCustomClaims] = useState<Record<string, any>>({});
  const [hasAdminDoc, setHasAdminDoc] = useState<boolean>(false);
  const [isAdminDocSuper, setIsAdminDocSuper] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);

  // Helper to fetch user profile document and custom claims
  const fetchProfile = async (fbUser: FirebaseUser) => {
    try {
      // 1. Refresh token to get latest Custom Claims
      let tokenClaims: Record<string, any> = {};
      try {
        const idTokenResult = await fbUser.getIdTokenResult(true);
        tokenClaims = idTokenResult.claims || {};
        setCustomClaims(tokenClaims);
      } catch (tokenErr) {
        console.warn('Could not refresh ID token claims:', tokenErr);
      }

      // 2. Check admins/{uid} document in Firestore
      let resolvedProfile: UserProfile | null = null;
      let adminDocExists = false;
      let adminDocSuper = false;
      
      try {
        const adminSnap = await getDoc(doc(db, 'admins', fbUser.uid));
        if (adminSnap.exists()) {
          adminDocExists = true;
          const adminData = adminSnap.data() || {};
          const docRole = typeof adminData.role === 'string' ? adminData.role : '';
          adminDocSuper =
            docRole === 'super-admin' ||
            docRole === 'super_admin' ||
            adminData.isSuperAdmin === true;

          resolvedProfile = {
            id: fbUser.uid,
            email: fbUser.email || adminData.email || '',
            fullName: adminData.fullName || fbUser.displayName || 'Academy Administrator',
            role: (tokenClaims.role as any) || (adminDocSuper ? 'super-admin' : (docRole as any) || 'admin'),
            createdAt: adminData.addedAt || adminData.createdAt || new Date().toISOString()
          };
        }
      } catch {
        // Non-admin or unreadable admins/{uid}
      }

      setHasAdminDoc(adminDocExists);
      setIsAdminDocSuper(adminDocSuper);

      if (!resolvedProfile) {
        const userSnap = await getDoc(doc(db, 'users', fbUser.uid));
        if (userSnap.exists()) {
          const data = userSnap.data() as UserProfile;
          const assignedRole = (tokenClaims.role as any) || data.role || 'student';
          resolvedProfile = { ...data, id: fbUser.uid, email: fbUser.email || data.email, role: assignedRole };
        }
      }

      if (resolvedProfile) {
        setUser(resolvedProfile);
        setHasProfile(true);
      } else {
        const defaultRole = (tokenClaims.role as any) || 'student';
        setUser({
          id: fbUser.uid,
          email: fbUser.email || '',
          fullName: fbUser.displayName || fbUser.email?.split('@')[0] || 'Enrolled Student',
          role: defaultRole,
          createdAt: new Date().toISOString()
        });
        setHasProfile(false);
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
      setHasProfile(false);
    }
  };

  useEffect(() => {
    // Listen for permanent Firebase Authentication state
    const unsubscribe = onAuthStateChanged(auth, async (currentFbUser) => {
      setIsLoading(true);
      setAuthError(null);

      if (currentFbUser) {
        setFirebaseUser(currentFbUser);
        await fetchProfile(currentFbUser);
      } else {
        setFirebaseUser(null);
        setUser(null);
        setHasProfile(false);
        setCustomClaims({});
        setHasAdminDoc(false);
        setIsAdminDocSuper(false);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const refreshProfile = async () => {
    if (auth.currentUser) {
      await fetchProfile(auth.currentUser);
    }
  };

  /**
   * Real Firebase Authentication with Email & Password
   * Invalid credentials are strictly rejected by the Firebase Authentication backend.
   */
  const login = async (email: string, password: string): Promise<{ success: boolean; message?: string }> => {
    setIsLoading(true);
    setAuthError(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setIsLoading(false);
      const msg = 'Please enter both your email address and password.';
      setAuthError(msg);
      return { success: false, message: msg };
    }

    try {
      const cred = await signInWithEmailAndPassword(auth, trimmedEmail, password);
      setFirebaseUser(cred.user);
      await fetchProfile(cred.user);
      setIsLoading(false);
      return { success: true };
    } catch (error: any) {
      setIsLoading(false);
      let userMessage = 'Authentication failed. Please verify your credentials.';

      if (error?.code) {
        switch (error.code) {
          case 'auth/invalid-credential':
          case 'auth/user-not-found':
          case 'auth/wrong-password':
            userMessage = 'Invalid email or password. Access to the student portal is restricted to authorized accounts.';
            break;
          case 'auth/invalid-email':
            userMessage = 'The email address format is invalid. Please check and try again.';
            break;
          case 'auth/user-disabled':
            userMessage = 'This account has been deactivated by the academy administration.';
            break;
          case 'auth/too-many-requests':
            userMessage = 'Access to this account has been temporarily disabled due to many failed login attempts. Please reset your password or try again later.';
            break;
          case 'auth/network-request-failed':
            userMessage = 'A network error occurred. Please check your internet connection.';
            break;
          default:
            userMessage = error.message || userMessage;
        }
      }

      setAuthError(userMessage);
      return { success: false, message: userMessage };
    }
  };

  /**
   * Dedicated Administrator Authentication
   * Validates credentials against Firebase Authentication, forces token refresh to
   * retrieve Custom Claims, and strictly verifies administrative authorization.
   */
  const adminLogin = async (email: string, password: string): Promise<{ success: boolean; message?: string }> => {
    setIsLoading(true);
    setAuthError(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setIsLoading(false);
      const msg = 'Please enter both your administrator email and password.';
      setAuthError(msg);
      return { success: false, message: msg };
    }

    try {
      const cred = await signInWithEmailAndPassword(auth, trimmedEmail, password);
      
      // Force token refresh to fetch custom claims from Firebase Auth backend
      const tokenResult = await cred.user.getIdTokenResult(true);
      const claims = tokenResult.claims || {};
      setCustomClaims(claims);

      // Authorization: admin/super-admin custom claim OR an existing admins/{uid} document in Firestore
      const claimRole = (claims.role as string) || '';
      const isClaimAdmin = 
        claimRole === 'super-admin' || 
        claimRole === 'super_admin' || 
        claimRole === 'admin' || 
        claims.admin === true;

      let adminDocExists = false;
      try {
        const adminSnap = await getDoc(doc(db, 'admins', cred.user.uid));
        adminDocExists = adminSnap.exists();
      } catch {
        adminDocExists = false;
      }

      if (!isClaimAdmin && !adminDocExists) {
        // Automatically revoke session and reject unauthorized users
        await signOut(auth);
        setFirebaseUser(null);
        setUser(null);
        setCustomClaims({});
        setHasAdminDoc(false);
        setIsAdminDocSuper(false);
        setIsLoading(false);
        const deniedMsg = 'Access Denied: This account lacks administrative custom claims or an admins/{uid} record in Firestore. Access to the Administration Console is restricted.';
        setAuthError(deniedMsg);
        return { success: false, message: deniedMsg };
      }

      setFirebaseUser(cred.user);
      await fetchProfile(cred.user);
      setIsLoading(false);
      return { success: true };
    } catch (error: any) {
      setIsLoading(false);
      let userMessage = 'Administrative authentication failed. Please verify your credentials.';
      if (error?.code) {
        switch (error.code) {
          case 'auth/invalid-credential':
          case 'auth/user-not-found':
          case 'auth/wrong-password':
            userMessage = 'Invalid administrator credentials. Access to the Admin Portal is strictly restricted.';
            break;
          case 'auth/invalid-email':
            userMessage = 'The email address format is invalid.';
            break;
          case 'auth/user-disabled':
            userMessage = 'This administrator account has been deactivated by the system.';
            break;
          case 'auth/too-many-requests':
            userMessage = 'Access temporarily disabled due to multiple failed login attempts. Please try again later.';
            break;
          case 'auth/network-request-failed':
            userMessage = 'A network connection error occurred.';
            break;
          default:
            userMessage = error.message || userMessage;
        }
      }
      setAuthError(userMessage);
      return { success: false, message: userMessage };
    }
  };

  /**
   * Register a new student account using Firebase Authentication
   */
  const registerStudentAccount = async (
    email: string, 
    password: string, 
    fullName: string
  ): Promise<{ success: boolean; message?: string }> => {
    setIsLoading(true);
    setAuthError(null);

    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const newUid = cred.user.uid;

      // Create initial isolated student profile in Firestore
      const newProfile: UserProfile = {
        id: newUid,
        email: email.trim(),
        fullName: fullName.trim(),
        role: 'student',
        points: 0,
        starOfTheWeekCount: 0,
        starOfTheMonthCount: 0,
        subscriptionStatus: 'pending',
        createdAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'users', newUid), newProfile);
      setFirebaseUser(cred.user);
      setUser(newProfile);
      setHasProfile(true);
      setIsLoading(false);
      return { success: true };
    } catch (error: any) {
      setIsLoading(false);
      let msg = 'Could not create account.';
      if (error.code === 'auth/email-already-in-use') {
        msg = 'An account with this email address already exists. Please sign in.';
      } else if (error.code === 'auth/weak-password') {
        msg = 'Password is too weak. Please use at least 6 characters.';
      } else if (error.code === 'auth/invalid-email') {
        msg = 'Invalid email address format.';
      } else {
        msg = error.message || msg;
      }
      setAuthError(msg);
      return { success: false, message: msg };
    }
  };

  /**
   * Secure Logout - Cleans up active Firebase Auth session
   */
  const logout = async (): Promise<void> => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Error during signOut:', err);
    } finally {
      setFirebaseUser(null);
      setUser(null);
      setHasProfile(false);
      setCustomClaims({});
      setHasAdminDoc(false);
      setIsAdminDocSuper(false);
    }
  };

  /**
   * Update student non-administrative profile details
   */
  const updateProfile = async (updates: Partial<UserProfile>): Promise<void> => {
    if (!firebaseUser) return;
    try {
      const path = `users/${firebaseUser.uid}`;
      await setDoc(doc(db, 'users', firebaseUser.uid), updates, { merge: true });
      setUser((prev) => (prev ? { ...prev, ...updates } : null));
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${firebaseUser.uid}`);
    }
  };

  /**
   * Save customized 3D avatar configuration
   */
  const saveAvatarConfig = async (config: AvatarConfiguration): Promise<void> => {
    await updateProfile({ avatarConfig: config });
  };

  // Admin authorization: admin/super-admin custom claim OR a document exists at admins/{uid} in Firestore
  const isSuperAdmin = 
    customClaims.role === 'super-admin' || 
    customClaims.role === 'super_admin' ||
    (hasAdminDoc && isAdminDocSuper);

  const isAdmin = 
    isSuperAdmin || 
    customClaims.role === 'admin' || 
    customClaims.admin === true ||
    hasAdminDoc;

  const isTeacher = customClaims.role === 'teacher' || user?.role === 'teacher';
  const isStudent = !isAdmin && !isTeacher;

  return (
    <AuthContext.Provider
      value={{
        firebaseUser,
        user,
        hasProfile,
        isAuthenticated: !!firebaseUser,
        isLoading,
        authError,
        customClaims,
        login,
        adminLogin,
        registerStudentAccount,
        logout,
        updateProfile,
        saveAvatarConfig,
        refreshProfile,
        isSuperAdmin,
        isAdmin,
        isTeacher,
        isStudent
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
