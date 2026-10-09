import admin, { cert, initializeApp, getApps } from 'firebase-admin';

let firebaseInitialized = false;

export const initializeFirebase = () => {
  if (firebaseInitialized) return admin;

  if (getApps().length > 0) {
    firebaseInitialized = true;
    return admin;
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey) {
    console.warn('⚠️ [Firebase] Credentials missing in .env. Push notifications will be disabled.');
    return null;
  }

  // Format private key correctly if escaped with \n
  if (privateKey.includes('\\n')) {
    privateKey = privateKey.replace(/\\n/g, '\n');
  }

  try {
    const credential = cert({
      projectId,
      clientEmail,
      privateKey,
    });

    initializeApp({
      credential,
    });

    firebaseInitialized = true;
    console.log('✅ [Firebase] Admin SDK initialized successfully for project:', projectId);
    return admin;
  } catch (error) {
    console.error('❌ [Firebase] Initialization failed:', error.message);
    return null;
  }
};

export const getFirebaseAdmin = () => {
  if (!firebaseInitialized) {
    return initializeFirebase();
  }
  return admin;
};
