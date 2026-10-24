import { initializeApp, getApps, deleteApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  updateDoc, 
  deleteDoc, 
  onSnapshot,
  serverTimestamp 
} from 'firebase/firestore';

import { 
  getMockWorkers, 
  getMockSubmissions, 
  saveMockSubmission, 
  approveMockSubmission, 
  rejectMockSubmission, 
  updateMockWorker, 
  deleteMockWorker, 
  deleteMockSubmission,
  exportMockDatabaseJSON,
  importMockDatabaseJSON
} from './mockStorage';

const STORAGE_CONFIG_KEY = 'apnaworker_custom_firebase_config';

/**
 * Resolve Firebase Configuration:
 * Checks localStorage first (allows setting config without code change/recompile),
 * then falls back to Vite environment variables (import.meta.env).
 */
export function getActiveFirebaseConfig() {
  try {
    const customConfigStr = localStorage.getItem(STORAGE_CONFIG_KEY);
    if (customConfigStr) {
      const parsed = JSON.parse(customConfigStr);
      if (parsed && parsed.apiKey && parsed.projectId) {
        return {
          ...parsed,
          source: 'custom_storage'
        };
      }
    }
  } catch (err) {
    console.warn('Could not read custom Firebase config from localStorage:', err);
  }

  // Fallback to Vite env variables
  const env = import.meta.env || {};
  const apiKey = env.VITE_FIREBASE_API_KEY;
  const projectId = env.VITE_FIREBASE_PROJECT_ID;

  if (
    apiKey && 
    apiKey !== 'your_api_key_here' && 
    projectId && 
    projectId !== 'your_project_id' &&
    !projectId.includes('your_')
  ) {
    return {
      apiKey: env.VITE_FIREBASE_API_KEY,
      authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: env.VITE_FIREBASE_APP_ID,
      source: 'env_variables'
    };
  }

  return null;
}

const initialConfig = getActiveFirebaseConfig();
export let isFirebaseConfigured = Boolean(initialConfig);

let app = null;
let auth = null;
let db = null;

export function initializeFirebaseWithConfig(config) {
  if (!config || !config.apiKey || !config.projectId) {
    isFirebaseConfigured = false;
    auth = null;
    db = null;
    return false;
  }

  try {
    const existingApps = getApps();
    if (existingApps.length > 0) {
      app = existingApps[0];
    } else {
      app = initializeApp(config);
    }
    auth = getAuth(app);
    db = getFirestore(app);
    isFirebaseConfigured = true;
    return true;
  } catch (err) {
    console.error('Failed to initialize Firebase SDK:', err);
    isFirebaseConfigured = false;
    return false;
  }
}

if (initialConfig) {
  initializeFirebaseWithConfig(initialConfig);
}

export { auth, db };

/**
 * Save custom Firebase credentials from Admin UI and re-initialize
 */
export async function saveCustomFirebaseConfig(config) {
  if (!config || !config.apiKey || !config.projectId) {
    throw new Error('API Key and Project ID are required.');
  }

  const cleanConfig = {
    apiKey: config.apiKey.trim(),
    authDomain: (config.authDomain || `${config.projectId}.firebaseapp.com`).trim(),
    projectId: config.projectId.trim(),
    storageBucket: (config.storageBucket || `${config.projectId}.appspot.com`).trim(),
    messagingSenderId: (config.messagingSenderId || '').trim(),
    appId: (config.appId || '').trim()
  };

  localStorage.setItem(STORAGE_CONFIG_KEY, JSON.stringify(cleanConfig));
  window.location.reload();
}

/**
 * Reset Firebase configuration to offline mock mode
 */
export function clearCustomFirebaseConfig() {
  localStorage.removeItem(STORAGE_CONFIG_KEY);
  window.location.reload();
}

/**
 * Test Firebase Connection with provided credentials
 */
export async function testFirebaseConnection(config) {
  try {
    const testAppName = 'test-firebase-' + Date.now();
    const testApp = initializeApp(config, testAppName);
    const testDb = getFirestore(testApp);
    // Ping firestore
    const testDoc = doc(testDb, '_healthcheck', 'ping');
    await getDoc(testDoc).catch(() => {});
    await deleteApp(testApp);
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Check if the given authenticated user UID is a verified admin in the /admins collection
 */
export async function verifyAdminStatus(uid) {
  if (!isFirebaseConfigured) {
    return true;
  }
  if (!db || !uid) return false;

  try {
    const adminRef = doc(db, 'admins', uid);
    const snap = await getDoc(adminRef);
    if (snap.exists()) {
      const data = snap.data();
      return data.role === 'admin' && data.active === true;
    }
    return false;
  } catch (error) {
    console.error('Error verifying admin status:', error);
    return false;
  }
}

/**
 * Public Worker Registration Submission
 * Saves all fields including Aadhaar Number, Aadhaar Front & Back photos.
 */
export async function submitWorkerRegistration(formData) {
  if (!isFirebaseConfigured) {
    return saveMockSubmission(formData);
  }

  const submissionsCol = collection(db, 'workerSubmissions');
  const submissionRef = doc(submissionsCol);
  
  const payload = {
    ...formData,
    id: submissionRef.id,
    status: 'pending',
    createdAt: serverTimestamp()
  };

  await setDoc(submissionRef, payload);
  return payload;
}

/**
 * Real-time listener for worker submissions (Pending/Approved/Rejected)
 */
export function subscribeToSubmissions(callback) {
  if (!isFirebaseConfigured) {
    callback(getMockSubmissions());
    const interval = setInterval(() => {
      callback(getMockSubmissions());
    }, 3000);
    return () => clearInterval(interval);
  }

  const submissionsCol = collection(db, 'workerSubmissions');
  const q = query(submissionsCol, orderBy('createdAt', 'desc'));

  return onSnapshot(
    q,
    (snap) => {
      const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      callback(items);
    },
    (err) => {
      console.warn('Submissions snapshot listener error, falling back to one-time fetch:', err);
      fetchAllSubmissions().then(callback).catch(() => {});
    }
  );
}

/**
 * Fetch all worker registrations (Admin only)
 */
export async function fetchAllSubmissions() {
  if (!isFirebaseConfigured) {
    return getMockSubmissions();
  }

  const submissionsCol = collection(db, 'workerSubmissions');
  const q = query(submissionsCol, orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

/**
 * Real-time listener for approved workers
 */
export function subscribeToWorkers(callback) {
  if (!isFirebaseConfigured) {
    callback(getMockWorkers());
    const interval = setInterval(() => {
      callback(getMockWorkers());
    }, 4000);
    return () => clearInterval(interval);
  }

  const workersCol = collection(db, 'workers');
  const q = query(workersCol, orderBy('approvedAt', 'desc'));

  return onSnapshot(
    q,
    (snap) => {
      const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      callback(items);
    },
    (err) => {
      console.warn('Workers snapshot listener error:', err);
      fetchApprovedWorkers().then(callback).catch(() => {});
    }
  );
}

/**
 * Fetch all approved workers (Admin only)
 */
export async function fetchApprovedWorkers() {
  if (!isFirebaseConfigured) {
    return getMockWorkers();
  }

  const workersCol = collection(db, 'workers');
  const q = query(workersCol, orderBy('approvedAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

/**
 * Fetch a worker or submission by ID
 */
export async function fetchWorkerById(id) {
  if (!isFirebaseConfigured) {
    const workers = getMockWorkers();
    const foundWorker = workers.find(w => w.id === id || w.regId === id);
    if (foundWorker) return { ...foundWorker, source: 'workers' };

    const subs = getMockSubmissions();
    const foundSub = subs.find(s => s.id === id || s.regId === id);
    if (foundSub) return { ...foundSub, source: 'submissions' };
    return null;
  }

  // Check workers collection first
  const workerRef = doc(db, 'workers', id);
  const workerSnap = await getDoc(workerRef);
  if (workerSnap.exists()) {
    return { id: workerSnap.id, source: 'workers', ...workerSnap.data() };
  }

  // Check submissions collection
  const subRef = doc(db, 'workerSubmissions', id);
  const subSnap = await getDoc(subRef);
  if (subSnap.exists()) {
    return { id: subSnap.id, source: 'submissions', ...subSnap.data() };
  }

  return null;
}

/**
 * Approve a pending worker submission:
 * 1. Writes to 'workers/{regId}'
 * 2. Updates submission status in 'workerSubmissions/{subId}'
 */
export async function approveWorker(submission) {
  if (!isFirebaseConfigured) {
    return approveMockSubmission(submission.id || submission.regId);
  }

  const regId = submission.regId;
  const workerRef = doc(db, 'workers', regId);
  const subRef = doc(db, 'workerSubmissions', submission.id);

  const approvedPayload = {
    ...submission,
    id: regId,
    submissionId: submission.id,
    status: 'approved',
    active: true,
    approvedAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };

  // Safe idempotent write
  await setDoc(workerRef, approvedPayload, { merge: true });

  // Update original submission status
  await updateDoc(subRef, {
    status: 'approved',
    approvedAt: serverTimestamp()
  });

  return approvedPayload;
}

/**
 * Reject a worker submission
 */
export async function rejectWorker(submissionId, reason = '') {
  if (!isFirebaseConfigured) {
    return rejectMockSubmission(submissionId, reason);
  }

  const subRef = doc(db, 'workerSubmissions', submissionId);
  await updateDoc(subRef, {
    status: 'rejected',
    rejectReason: reason,
    rejectedAt: serverTimestamp()
  });

  return true;
}

/**
 * Update an approved worker's details
 */
export async function updateWorker(workerId, updatedData) {
  if (!isFirebaseConfigured) {
    return updateMockWorker(workerId, updatedData);
  }

  const workerRef = doc(db, 'workers', workerId);
  await updateDoc(workerRef, {
    ...updatedData,
    updatedAt: serverTimestamp()
  });
  return true;
}

/**
 * Archive / Deactivate worker without deleting
 */
export async function toggleWorkerActiveStatus(workerId, currentStatus) {
  return updateWorker(workerId, { active: !currentStatus });
}

/**
 * Delete a worker from directory
 */
export async function deleteWorker(workerId) {
  if (!isFirebaseConfigured) {
    return deleteMockWorker(workerId);
  }

  const workerRef = doc(db, 'workers', workerId);
  await deleteDoc(workerRef);
  return true;
}

/**
 * Delete a submission
 */
export async function deleteSubmission(submissionId) {
  if (!isFirebaseConfigured) {
    return deleteMockSubmission(submissionId);
  }

  const subRef = doc(db, 'workerSubmissions', submissionId);
  await deleteDoc(subRef);
  return true;
}

/**
 * Export all workers & submissions as CSV
 */
export async function exportWorkersCSV() {
  const [workers, submissions] = await Promise.all([
    fetchApprovedWorkers(),
    fetchAllSubmissions()
  ]);

  const allRecords = [
    ...workers.map(w => ({ ...w, type: 'Approved Worker' })),
    ...submissions.map(s => ({ ...s, type: 'Submission (' + s.status + ')' }))
  ];

  const headers = [
    'Registration ID',
    'Type',
    'Full Name',
    'Mobile Phone',
    'Aadhaar Number',
    'Category',
    'City',
    'Area',
    'Experience (Years)',
    'Status',
    'Has Aadhaar Photo',
    'Registered Date'
  ];

  const rows = allRecords.map(item => {
    const regDate = item.createdAt 
      ? (typeof item.createdAt === 'string' ? item.createdAt : item.createdAt.toDate ? item.createdAt.toDate().toISOString() : '')
      : '';
    const hasPhoto = (item.aadhaarFront || item.aadhaarBack) ? 'Yes' : 'No';

    return [
      `"${item.regId || item.id || ''}"`,
      `"${item.type || ''}"`,
      `"${(item.fullName || '').replace(/"/g, '""')}"`,
      `"${item.phone || ''}"`,
      `"${item.aadhaarNumber || ''}"`,
      `"${(item.categoryLabel || item.category || '').replace(/"/g, '""')}"`,
      `"${(item.city || '').replace(/"/g, '""')}"`,
      `"${(item.area || '').replace(/"/g, '""')}"`,
      `"${item.experience || ''}"`,
      `"${item.status || ''}"`,
      `"${hasPhoto}"`,
      `"${regDate}"`
    ].join(',');
  });

  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `ApnaWorker_Export_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Export complete database JSON backup
 */
export async function exportFullDatabaseJSON() {
  const [workers, submissions] = await Promise.all([
    fetchApprovedWorkers(),
    fetchAllSubmissions()
  ]);

  const data = {
    platform: 'ApnaWorker',
    exportedAt: new Date().toISOString(),
    isLiveCloud: isFirebaseConfigured,
    totalWorkers: workers.length,
    totalSubmissions: submissions.length,
    workers,
    submissions
  };

  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `ApnaWorker_DB_Backup_${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
