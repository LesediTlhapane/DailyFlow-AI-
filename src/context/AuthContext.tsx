import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  auth,
  googleProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  firebaseSignOut,
  updateProfile,
  onAuthStateChanged,
  db,
  doc,
  getDoc,
  setDoc,
  testFirestoreConnection,
  handleFirestoreError,
  User,
} from '../services/firebase';

export interface UserProfile {
  userId: string;
  email: string;
  displayName: string;
  photoURL?: string;
  roleContext?: string;
  createdAt: string;
  lastLoginAt: string;
}

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateUserBio: (roleContext: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  // Sync profile document from Firestore
  const syncUserProfileDoc = async (user: User) => {
    try {
      const userRef = doc(db, 'users', user.uid);
      const snapshot = await getDoc(userRef);

      const now = new Date().toISOString();
      if (!snapshot.exists()) {
        const initialProfile: UserProfile = {
          userId: user.uid,
          email: user.email || '',
          displayName: user.displayName || user.email?.split('@')[0] || 'DayFlow Pioneer',
          photoURL: user.photoURL || '',
          roleContext: 'Strategist & Builder',
          createdAt: now,
          lastLoginAt: now,
        };
        await setDoc(userRef, initialProfile);
        setUserProfile(initialProfile);
      } else {
        const existingData = snapshot.data() as UserProfile;
        const updatedProfile: UserProfile = {
          ...existingData,
          displayName: user.displayName || existingData.displayName || user.email?.split('@')[0] || 'DayFlow Pioneer',
          photoURL: user.photoURL || existingData.photoURL || '',
          lastLoginAt: now,
        };
        await setDoc(userRef, updatedProfile, { merge: true });
        setUserProfile(updatedProfile);
      }
    } catch (err) {
      console.error('Error syncing user profile:', err);
      // Fallback in-memory profile from user object
      setUserProfile({
        userId: user.uid,
        email: user.email || '',
        displayName: user.displayName || user.email?.split('@')[0] || 'DayFlow Pioneer',
        photoURL: user.photoURL || '',
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      });
    }
  };

  useEffect(() => {
    // Initial connection ping
    testFirestoreConnection();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await syncUserProfileDoc(user);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user) {
        await syncUserProfileDoc(result.user);
        setIsAuthModalOpen(false);
      }
    } catch (error: any) {
      const msg = handleFirestoreError(error, 'Google Sign-In');
      throw new Error(msg);
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, pass);
      if (result.user) {
        await syncUserProfileDoc(result.user);
        setIsAuthModalOpen(false);
      }
    } catch (error: any) {
      const msg = handleFirestoreError(error, 'Email Sign-In');
      throw new Error(msg);
    }
  };

  const signUpWithEmail = async (email: string, pass: string, name: string) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, pass);
      if (result.user) {
        if (name) {
          await updateProfile(result.user, { displayName: name });
        }
        await syncUserProfileDoc(result.user);
        setIsAuthModalOpen(false);
      }
    } catch (error: any) {
      const msg = handleFirestoreError(error, 'Account Registration');
      throw new Error(msg);
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setCurrentUser(null);
      setUserProfile(null);
    } catch (error: any) {
      const msg = handleFirestoreError(error, 'Sign Out');
      throw new Error(msg);
    }
  };

  const updateUserBio = async (roleContext: string) => {
    if (!currentUser || !userProfile) return;
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      const updated = { ...userProfile, roleContext };
      await setDoc(userRef, { roleContext }, { merge: true });
      setUserProfile(updated);
    } catch (err: any) {
      const msg = handleFirestoreError(err, 'Profile Update');
      throw new Error(msg);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        loading,
        isAuthModalOpen,
        openAuthModal: () => setIsAuthModalOpen(true),
        closeAuthModal: () => setIsAuthModalOpen(false),
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        signOut,
        updateUserBio,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
