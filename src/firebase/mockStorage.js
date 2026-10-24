// Local Storage Mock Database for offline/preview mode when Firebase credentials are not yet configured

const SUBMISSIONS_KEY = 'apnaworker_mock_submissions';
const WORKERS_KEY = 'apnaworker_mock_workers';

// Initial sample data for demonstration if empty
const INITIAL_WORKERS = [
  {
    id: 'w-101',
    regId: 'AW-582910',
    fullName: 'Ramesh Kumar',
    phone: '9812345678',
    aadhaarNumber: '5421 9832 1045',
    category: 'electrician',
    categoryLabel: 'Electrician (इलेक्ट्रीशियन)',
    city: 'Delhi NCR',
    area: 'Rohini Sector 15',
    experience: '6',
    description: 'Expert in house wiring, MCB tripping, fan repair, inverter installation and lighting.',
    status: 'approved',
    active: true,
    approvedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    consent: true
  },
  {
    id: 'w-102',
    regId: 'AW-439218',
    fullName: 'Mohammad Shahid',
    phone: '9876543210',
    aadhaarNumber: '7823 4512 8901',
    category: 'plumber',
    categoryLabel: 'Plumber (प्लंबर)',
    city: 'Delhi NCR',
    area: 'Laxmi Nagar',
    experience: '8',
    description: 'Pipe leakage specialist, water tank installation, bathroom sanitary fittings.',
    status: 'approved',
    active: true,
    approvedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    consent: true
  },
  {
    id: 'w-103',
    regId: 'AW-891043',
    fullName: 'Satish Sharma',
    phone: '9923456789',
    aadhaarNumber: '9012 3456 7812',
    category: 'carpenter',
    categoryLabel: 'Carpenter (कारपेंटर / बढ़ई)',
    city: 'Mumbai',
    area: 'Andheri West',
    experience: '10',
    description: 'Modular kitchen fittings, custom wooden furniture, door lock repairs.',
    status: 'approved',
    active: true,
    approvedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    consent: true
  }
];

const INITIAL_SUBMISSIONS = [
  {
    id: 'sub-201',
    regId: 'AW-712390',
    fullName: 'Vikram Singh',
    phone: '9845123456',
    aadhaarNumber: '6123 9045 1122',
    category: 'ac_technician',
    categoryLabel: 'AC & Appliance Technician (एसी व फ्रिज तकनीशियन)',
    city: 'Delhi NCR',
    area: 'Dwarka Sector 10',
    experience: '4',
    description: 'Split and window AC servicing, gas charging, compressor repair.',
    status: 'pending',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    consent: true
  },
  {
    id: 'sub-202',
    regId: 'AW-904321',
    fullName: 'Deepak Verma',
    phone: '9711223344',
    aadhaarNumber: '4455 6677 8899',
    category: 'painter',
    categoryLabel: 'Painter (पेंटर / रंगाई)',
    city: 'Delhi NCR',
    area: 'Pitampura',
    experience: '5',
    description: 'Interior & exterior putty, emulsion, waterproof wall coating.',
    status: 'pending',
    createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    consent: true
  }
];

export const getMockWorkers = () => {
  try {
    const data = localStorage.getItem(WORKERS_KEY);
    if (!data) {
      localStorage.setItem(WORKERS_KEY, JSON.stringify(INITIAL_WORKERS));
      return INITIAL_WORKERS;
    }
    return JSON.parse(data);
  } catch (err) {
    console.warn('Error reading mock workers:', err);
    return INITIAL_WORKERS;
  }
};

export const getMockSubmissions = () => {
  try {
    const data = localStorage.getItem(SUBMISSIONS_KEY);
    if (!data) {
      localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(INITIAL_SUBMISSIONS));
      return INITIAL_SUBMISSIONS;
    }
    return JSON.parse(data);
  } catch (err) {
    console.warn('Error reading mock submissions:', err);
    return INITIAL_SUBMISSIONS;
  }
};

export const saveMockSubmission = (submission) => {
  const items = getMockSubmissions();
  const newItem = {
    ...submission,
    id: 'sub-' + Date.now(),
    createdAt: new Date().toISOString(),
    status: 'pending'
  };
  items.unshift(newItem);
  try {
    localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(items));
  } catch (e) {
    console.warn('Storage quota warning in localStorage for submission:', e);
  }
  return newItem;
};

export const approveMockSubmission = (submissionId) => {
  const submissions = getMockSubmissions();
  const subIndex = submissions.findIndex(s => s.id === submissionId || s.regId === submissionId);
  if (subIndex === -1) throw new Error('Submission not found');

  const sub = submissions[subIndex];
  if (sub.status === 'approved') return sub; // Prevent duplicate

  sub.status = 'approved';
  sub.approvedAt = new Date().toISOString();
  submissions[subIndex] = sub;
  localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(submissions));

  const workers = getMockWorkers();
  // Check if worker already exists
  const existingWorker = workers.find(w => w.regId === sub.regId || w.phone === sub.phone);
  if (!existingWorker) {
    const newWorker = {
      ...sub,
      id: 'w-' + Date.now(),
      active: true
    };
    workers.unshift(newWorker);
    localStorage.setItem(WORKERS_KEY, JSON.stringify(workers));
  }
  return sub;
};

export const rejectMockSubmission = (submissionId, reason = '') => {
  const submissions = getMockSubmissions();
  const subIndex = submissions.findIndex(s => s.id === submissionId || s.regId === submissionId);
  if (subIndex === -1) throw new Error('Submission not found');

  submissions[subIndex].status = 'rejected';
  submissions[subIndex].rejectReason = reason;
  submissions[subIndex].rejectedAt = new Date().toISOString();
  localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(submissions));
  return submissions[subIndex];
};

export const updateMockWorker = (workerId, updateData) => {
  const workers = getMockWorkers();
  const index = workers.findIndex(w => w.id === workerId);
  if (index === -1) throw new Error('Worker not found');

  workers[index] = { ...workers[index], ...updateData, updatedAt: new Date().toISOString() };
  localStorage.setItem(WORKERS_KEY, JSON.stringify(workers));
  return workers[index];
};

export const deleteMockWorker = (workerId) => {
  const workers = getMockWorkers().filter(w => w.id !== workerId);
  localStorage.setItem(WORKERS_KEY, JSON.stringify(workers));
  return true;
};

export const deleteMockSubmission = (submissionId) => {
  const submissions = getMockSubmissions().filter(s => s.id !== submissionId);
  localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(submissions));
  return true;
};

export const exportMockDatabaseJSON = () => {
  return JSON.stringify({
    version: '1.0',
    exportedAt: new Date().toISOString(),
    workers: getMockWorkers(),
    submissions: getMockSubmissions()
  }, null, 2);
};

export const importMockDatabaseJSON = (jsonString) => {
  const parsed = JSON.parse(jsonString);
  if (Array.isArray(parsed.workers)) {
    localStorage.setItem(WORKERS_KEY, JSON.stringify(parsed.workers));
  }
  if (Array.isArray(parsed.submissions)) {
    localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(parsed.submissions));
  }
  return true;
};
