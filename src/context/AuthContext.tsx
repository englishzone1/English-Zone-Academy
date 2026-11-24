import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  browserPopupRedirectResolver,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../services/firebase';
import { setGender } from '../i18n/gender';
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
  registerVisitor: (p: { email?: string; password?: string; name: string; phone?: string; country?: string; age?: string; google?: boolean; kind?: 'visitor' | 'registrant'; source?: string }) => Promise<{ success: boolean; code?: string; uid?: string; email?: string }>;
  isVisitor: boolean;
  loginWithGoogle: () => Promise<{ success: boolean; code?: string }>;
  adminLoginWithGoogle: () => Promise<{ success: boolean; code?: string }>;
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

// بيانات «حساب زائر مجاني» تُحفظ مؤقتًا قبل الدخول، ثم تُستعمل عند إنشاء الملف
const VISITOR_KEY = 'ez_visitor_signup';
const readVisitorSignup = (): { name?: string; phone?: string; country?: string; age?: string; kind?: 'visitor' | 'registrant'; source?: string } | null => {
  try {
    const raw = localStorage.getItem(VISITOR_KEY);
    if (!raw) return null;
    const v = JSON.parse(raw);
    // صالحة لمدة ساعة فقط
    if (!v || Date.now() - Number(v.at || 0) > 3600 * 1000) return null;
    return v;
  } catch {
    return null;
  }
};
const clearVisitorSignup = () => {
  try {
    localStorage.removeItem(VISITOR_KEY);
  } catch {
    // ignore
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [hasProfile, setHasProfile] = useState<boolean>(false);
  const [customClaims, setCustomClaims] = useState<Record<string, any>>({});
  const [hasAdminDoc, setHasAdminDoc] = useState<boolean>(false);
  const [isAdminDocSuper, setIsAdminDocSuper] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);
  // أثناء محاولة دخول الأدمن بجوجل لا نُنشئ ملف طالب تلقائيًا
  const adminAttemptRef = useRef(false);

  // Helper to fetch user profile document and custom claims
  // طلب واحد لكل حساب في اللحظة نفسها، حتى لا يتسابق إنشاء الملف مرتين
  const profileInflight = useRef<Record<string, Promise<void> | undefined>>({});
  const fetchProfile = (fbUser: FirebaseUser): Promise<void> => {
    const running = profileInflight.current[fbUser.uid];
    if (running) return running;
    const p = fetchProfileOnce(fbUser).finally(() => {
      delete profileInflight.current[fbUser.uid];
    });
    profileInflight.current[fbUser.uid] = p;
    return p;
  };

  const fetchProfileOnce = async (fbUser: FirebaseUser) => {
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

      // حساب دخول بلا وثيقة في users (مثلًا فشل حفظها لحظة التسجيل): ننشئها الآن بحالة pending
      if (!resolvedProfile && !adminDocExists && !tokenClaims.role && fbUser.email && !adminAttemptRef.current) {
        let isTeacherAccount = false;
        try {
          isTeacherAccount = (await getDoc(doc(db, 'teachers', fbUser.uid))).exists();
        } catch {
          // الطالب لا يملك صلاحية قراءة teachers، وهذا متوقع
        }
        if (!isTeacherAccount) {
          try {
            const vs = readVisitorSignup();
            const createdProfile: UserProfile = {
              id: fbUser.uid,
              email: fbUser.email,
              fullName: (vs?.name || '').trim().slice(0, 100) || fbUser.displayName || fbUser.email.split('@')[0],
              ...(vs ? { accountType: (vs.kind === 'registrant' ? 'registrant' : 'visitor') as 'visitor' | 'registrant' } : {}),
              ...(vs?.phone ? { phone: String(vs.phone).trim().slice(0, 30) } : {}),
              ...(vs?.country ? { country: String(vs.country).trim().slice(0, 60) } : {}),
              ...(vs?.age && Number(vs.age) > 0 ? { age: Number(vs.age) } : {}),
              role: 'student',
              points: 0,
              starOfTheWeekCount: 0,
              starOfTheMonthCount: 0,
              subscriptionStatus: 'pending',
              createdAt: new Date().toISOString(),
              ...(vs?.source === 'workshop' ? ({ signupSource: 'workshop' } as any) : {})
            };
            // قبل نشر قواعد signupSource: إن رُفض الحقل نحفظ الملف بدونه
            let saved = false;
            if ((createdProfile as any).signupSource) {
              try {
                await Promise.race([setDoc(doc(db, 'users', fbUser.uid), createdProfile), new Promise((r) => setTimeout(r, 8000))]);
                saved = true;
              } catch {
                delete (createdProfile as any).signupSource;
              }
            }
            // الشبكة البطيئة لا تُجمّد التسجيل: الكتابة تبقى في الانتظار وتُرسل وحدها عند الاتصال
            if (!saved) await Promise.race([setDoc(doc(db, 'users', fbUser.uid), createdProfile), new Promise((r) => setTimeout(r, 8000))]);
            resolvedProfile = createdProfile;
          } catch (createErr) {
            // قد يكون طلب آخر أنشأ الملف في اللحظة نفسها: نقرؤه من جديد بدل اعتباره مفقودًا
            try {
              const again = await getDoc(doc(db, 'users', fbUser.uid));
              if (again.exists()) {
                resolvedProfile = { ...(again.data() as UserProfile), id: fbUser.uid };
              } else {
                console.error('Could not create missing student profile:', createErr);
              }
            } catch {
              console.error('Could not create missing student profile:', createErr);
            }
          }
        }
      }

      clearVisitorSignup();
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

  // صيغة المخاطبة حسب جنس المشترك (طالب/طالبة)، ومن الأفاتار إن لم يُحدَّد
  useEffect(() => {
    const u: any = user;
    const g = u?.gender === 'male' || u?.gender === 'female' ? u.gender : u?.avatarConfig?.gender === 'male' || u?.avatarConfig?.gender === 'female' ? u.avatarConfig.gender : '';
    setGender(g);
  }, [user]);

  useEffect(() => {
    // إكمال الدخول بجوجل إن تم بالتحويل بدل النافذة المنبثقة
    // فقط إن كان هناك دخول بجوجل بالتحويل قيد الإكمال
    let pending = false;
    try {
      pending = sessionStorage.getItem('ez_google_redirect') === '1';
      sessionStorage.removeItem('ez_google_redirect');
    } catch {
      /* ignore */
    }
    if (pending) getRedirectResult(auth, browserPopupRedirectResolver).catch((err) => console.error('Google redirect sign-in failed:', err));
  }, []);

  useEffect(() => {
    // Listen for permanent Firebase Authentication state
    const unsubscribe = onAuthStateChanged(auth, async (currentFbUser) => {
      setIsLoading(true);
      setAuthError(null);

      if (currentFbUser) {
        // البريد المحظور من الإدارة: خروج فوري ولا يرى شيئًا داخل المنصة
        const em = String(currentFbUser.email || '').toLowerCase();
        if (em) {
          const blocked = await getDoc(doc(db, 'blocked_emails', em))
            .then((s) => s.exists())
            .catch(() => false);
          if (blocked) {
            await signOut(auth).catch(() => undefined);
            setFirebaseUser(null);
            setUser(null);
            setHasProfile(false);
            setAuthError('blocked');
            setIsLoading(false);
            window.location.hash = '#/blocked';
            return;
          }
        }
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
   * الدخول بحساب جوجل (Gmail). يعمل على الكمبيوتر والهاتف، ومنه الآيفون.
   * إن لم يكن للطالب ملف بعد، يُنشأ تلقائيًا بحالة "بانتظار التفعيل".
   */
  const googleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    try {
      return (await signInWithPopup(auth, provider, browserPopupRedirectResolver)).user;
    } catch (err: any) {
      // بعض المتصفحات تمنع النافذة المنبثقة: نكمل بالتحويل للصفحة
      if (err?.code === 'auth/popup-blocked' || err?.code === 'auth/operation-not-supported-in-this-environment') {
        try {
          sessionStorage.setItem('ez_google_redirect', '1');
        } catch {
          /* ignore */
        }
        await signInWithRedirect(auth, provider, browserPopupRedirectResolver);
        return null;
      }
      throw err;
    }
  };

  const loginWithGoogle = async (): Promise<{ success: boolean; code?: string }> => {
    setAuthError(null);
    try {
      const fbUser = await googleSignIn();
      if (!fbUser) return { success: false, code: 'redirect' };
      setFirebaseUser(fbUser);
      await fetchProfile(fbUser);
      return { success: true };
    } catch (err: any) {
      console.error('Google sign-in failed:', err);
      return { success: false, code: err?.code || 'unknown' };
    }
  };

  const adminLoginWithGoogle = async (): Promise<{ success: boolean; code?: string }> => {
    setAuthError(null);
    adminAttemptRef.current = true;
    try {
      const fbUser = await googleSignIn();
      if (!fbUser) return { success: false, code: 'redirect' };
      const claims = (await fbUser.getIdTokenResult(true)).claims || {};
      const claimRole = (claims.role as string) || '';
      const isClaimAdmin = ['super-admin', 'super_admin', 'admin'].includes(claimRole) || claims.admin === true;
      let adminDocExists = false;
      try {
        adminDocExists = (await getDoc(doc(db, 'admins', fbUser.uid))).exists();
      } catch {
        adminDocExists = false;
      }
      if (!isClaimAdmin && !adminDocExists) {
        await signOut(auth);
        setFirebaseUser(null);
        setUser(null);
        return { success: false, code: 'not-admin' };
      }
      setCustomClaims(claims);
      setFirebaseUser(fbUser);
      await fetchProfile(fbUser);
      return { success: true };
    } catch (err: any) {
      console.error('Google admin sign-in failed:', err);
      return { success: false, code: err?.code || 'unknown' };
    } finally {
      adminAttemptRef.current = false;
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
  // حساب زائر مجاني: بالبريد وكلمة المرور أو بحساب Google
  const registerVisitor = async (p: { email?: string; password?: string; name: string; phone?: string; country?: string; age?: string; google?: boolean; kind?: 'visitor' | 'registrant'; source?: string }): Promise<{ success: boolean; code?: string; uid?: string; email?: string }> => {
    setAuthError(null);
    try {
      localStorage.setItem(VISITOR_KEY, JSON.stringify({ name: p.name, phone: p.phone || '', country: p.country || '', age: p.age || '', kind: p.kind || 'visitor', source: p.source || '', at: Date.now() }));
    } catch {
      // ignore
    }
    try {
      if (p.google) {
        const fbUser = await googleSignIn();
        if (!fbUser) return { success: false, code: 'redirect' };
        setFirebaseUser(fbUser);
        await fetchProfile(fbUser);
        return { success: true, uid: fbUser.uid, email: fbUser.email || '' };
      }
      const cred = await createUserWithEmailAndPassword(auth, String(p.email || '').trim(), String(p.password || ''));
      setFirebaseUser(cred.user);
      // الحساب أُنشئ: لا ننتظر تحميل الملف أكثر من 15 ثانية (يكمل في الخلفية)
      await Promise.race([fetchProfile(cred.user), new Promise((r) => setTimeout(r, 15000))]);
      return { success: true, uid: cred.user.uid, email: cred.user.email || '' };
    } catch (err: any) {
      clearVisitorSignup();
      return { success: false, code: err?.code || 'unknown' };
    }
  };

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
        registerVisitor,
        isVisitor: !!user && (user as any).accountType === 'visitor' && String((user as any).subscriptionStatus || '') !== 'active',
        loginWithGoogle,
        adminLoginWithGoogle,
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
