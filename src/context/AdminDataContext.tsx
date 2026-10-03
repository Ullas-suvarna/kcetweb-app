import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Question,
  TestSeriesSet,
  Mentor,
  SeniorChatBooking,
  Resource,
  ImportantDate,
  RankVsMarksTier,
  Notification,
  Announcement,
  User,
  StudentTestResult,
  Helpline,
  PaymentReceipt,
  College,
  BranchCutoff,
  EngineeringBranch,
  DeletedStudent,
  BookingStatus
} from '../types';
import {
  INITIAL_QUESTIONS,
  INITIAL_TEST_SERIES,
  INITIAL_MENTORS,
  INITIAL_BOOKINGS,
  INITIAL_RESOURCES,
  INITIAL_IMPORTANT_DATES,
  INITIAL_RANK_VS_MARKS,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_STUDENTS,
  INITIAL_STUDENT_TEST_RESULTS,
  INITIAL_HELPLINES,
  INITIAL_RECEIPTS,
  INITIAL_COLLEGES,
  INITIAL_BRANCH_CUTOFFS,
  INITIAL_BRANCHES
} from '../services/mockData';
import { ToastContainer, ToastItem, ToastType } from '../components/common/Toast';
import { ConfirmModal, ConfirmDialogState } from '../components/common/ConfirmModal';
import { db, rtdb, collection, doc, setDoc, deleteDoc, updateDoc, onSnapshot, writeBatch, ref, rtdbSet, onValue, ADMIN_IDENTIFIER } from '../services/firebase';
interface AdminDataContextType {
  // Auth
  isAuthenticated: boolean;
  adminEmail: string;
  loginAdmin: (password: string) => Promise<boolean>;
  logoutAdmin: () => void;
  // Firebase status
  isFirebaseLive: boolean;
  syncStatus: string;
  seedDefaultsToFirebase: () => Promise<void>;
  // Data collections
  questions: Question[];
  testSeries: TestSeriesSet[];
  mentors: Mentor[];
  bookings: SeniorChatBooking[];
  resources: Resource[];
  dates: ImportantDate[];
  rankTiers: RankVsMarksTier[];
  announcements: Announcement[];
  notifications: Notification[];
  students: User[];
  studentTestResults: StudentTestResult[];
  helplines: Helpline[];
  receipts: PaymentReceipt[];
  colleges: College[];
  cutoffs: BranchCutoff[];
  branches: EngineeringBranch[];
  deletedStudents: DeletedStudent[];
  // CRUD Actions
  saveQuestion: (q: Question) => Promise<void>;
  deleteQuestion: (id: number) => Promise<void>;
  saveTestSeries: (ts: TestSeriesSet) => Promise<void>;
  deleteTestSeries: (id: string) => Promise<void>;
  saveMentor: (m: Mentor) => Promise<void>;
  deleteMentor: (id: string) => Promise<void>;
  updateBooking: (b: SeniorChatBooking) => Promise<void>;
  saveBooking: (b: SeniorChatBooking) => Promise<void>;
  deleteBooking: (id: string) => Promise<void>;
  saveResource: (r: Resource, notifyStudents?: boolean) => Promise<void>;
  deleteResource: (id: string) => Promise<void>;
  saveDate: (d: ImportantDate) => Promise<void>;
  deleteDate: (id: string) => Promise<void>;
  saveRankTier: (tier: RankVsMarksTier) => Promise<void>;
  deleteRankTier: (id: string) => Promise<void>;
  sendBroadcast: (notif: Partial<Notification>, makeBanner?: boolean) => Promise<void>;
  deleteAnnouncement: (id: string) => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  updateStudent: (student: Partial<User> & { uid: string }) => Promise<void>;
  togglePremium: (uid: string, current: boolean, email?: string, studentId?: string) => Promise<void>;
  blockStudent: (uid: string, reason: string) => Promise<void>;
  unblockStudent: (uid: string) => Promise<void>;
  forceLogoutStudent: (uid: string) => Promise<void>;
  forceLogoutAllStudents: () => Promise<void>;
  deleteStudentPermanently: (uid: string, email: string) => Promise<void>;
  saveTestResult: (res: StudentTestResult) => Promise<void>;
  deleteTestResult: (id: string) => Promise<void>;
  saveHelpline: (h: Helpline) => Promise<void>;
  deleteHelpline: (id: string) => Promise<void>;
  // Responsive Toast System
  toasts: ToastItem[];
  showToast: (title: string, message?: string, type?: ToastType, duration?: number) => void;
  notifySuccess: (message: string, title?: string) => void;
  notifyError: (message: string, title?: string) => void;
  notifyInfo: (message: string, title?: string) => void;
  notifyWarning: (message: string, title?: string) => void;
  dismissToast: (id: string) => void;
  requestConfirm: (options: { title?: string; message: string; itemName?: string; confirmText?: string; cancelText?: string; isDestructive?: boolean; }) => Promise<boolean>;
  approveReceipt: (receipt: PaymentReceipt) => Promise<void>;
  rejectReceipt: (receiptId: string, reason: string) => Promise<void>;
  saveCollege: (c: College) => Promise<void>;
  deleteCollege: (id: string) => Promise<void>;
  saveCutoff: (cutoff: BranchCutoff) => Promise<void>;
  deleteCutoff: (id: string) => Promise<void>;
  saveBranch: (b: EngineeringBranch) => Promise<void>;
  deleteBranch: (id: string) => Promise<void>;
}
const AdminDataContext = createContext<AdminDataContextType | undefined>(undefined);
export const AdminDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('kcet_admin_auth') === 'true';
  });
  const [adminEmail] = useState(ADMIN_IDENTIFIER);
  const [isFirebaseLive, setIsFirebaseLive] = useState(false);
  const [syncStatus, setSyncStatus] = useState('Syncing with Firestore...');

  // Universal Warning & Confirmation Modal State
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState>({
    isOpen: false,
    title: 'Confirm Action',
    message: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    isDestructive: true,
    onConfirm: () => {},
    onCancel: () => {}
  });

  const requestConfirm = (options: { title?: string; message: string; itemName?: string; confirmText?: string; cancelText?: string; isDestructive?: boolean; }): Promise<boolean> => {
    return new Promise<boolean>((resolve) => {
      setConfirmDialog({
        isOpen: true,
        title: options.title || 'Warning: Action Required',
        message: options.message,
        itemName: options.itemName,
        confirmText: options.confirmText || (options.isDestructive !== false ? 'Confirm Delete' : 'Confirm'),
        cancelText: options.cancelText || 'Cancel',
        isDestructive: options.isDestructive !== false,
        onConfirm: () => {
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
          resolve(true);
        },
        onCancel: () => {
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
          resolve(false);
        }
      });
    });
  };

  // Responsive System Toast Notification State & Helpers
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const showToast = (title: string, message?: string, type: ToastType = 'success', duration = 3500) => {
    const id = 'toast_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    const newToast: ToastItem = { id, title, message, type, duration };
    setToasts(prev => [newToast, ...prev].slice(0, 5));
    setTimeout(() => {
      dismissToast(id);
    }, duration);
  };

  const notifySuccess = (message: string, title: string = 'Success') => {
    showToast(title, message, 'success');
  };

  const notifyError = (message: string, title: string = 'Error') => {
    showToast(title, message, 'error', 4500);
  };

  const notifyInfo = (message: string, title: string = 'Notice') => {
    showToast(title, message, 'info');
  };

  const notifyWarning = (message: string, title: string = 'Warning') => {
    showToast(title, message, 'warning', 4000);
  };
  // State collections initialized with local Karnataka defaults
  const [questions, setQuestions] = useState<Question[]>(INITIAL_QUESTIONS);
  const [testSeries, setTestSeries] = useState<TestSeriesSet[]>(INITIAL_TEST_SERIES);
  const [mentors, setMentors] = useState<Mentor[]>(INITIAL_MENTORS);
  const [bookings, setBookings] = useState<SeniorChatBooking[]>(INITIAL_BOOKINGS);
  const [resources, setResources] = useState<Resource[]>(INITIAL_RESOURCES);
  const [dates, setDates] = useState<ImportantDate[]>(INITIAL_IMPORTANT_DATES);
  const [rankTiers, setRankTiers] = useState<RankVsMarksTier[]>(INITIAL_RANK_VS_MARKS);
  const [announcements, setAnnouncements] = useState<Announcement[]>(INITIAL_ANNOUNCEMENTS);
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);
  const [students, setStudents] = useState<User[]>(INITIAL_STUDENTS);
  const [studentTestResults, setStudentTestResults] = useState<StudentTestResult[]>(INITIAL_STUDENT_TEST_RESULTS);
  const [helplines, setHelplines] = useState<Helpline[]>(INITIAL_HELPLINES);
  const [receipts, setReceipts] = useState<PaymentReceipt[]>(INITIAL_RECEIPTS);
  const [colleges, setColleges] = useState<College[]>(INITIAL_COLLEGES);
  const [cutoffs, setCutoffs] = useState<BranchCutoff[]>(() => {
    const saved = localStorage.getItem('kcet_admin_cutoffs');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return INITIAL_BRANCH_CUTOFFS;
  });
  const [branches, setBranches] = useState<EngineeringBranch[]>(INITIAL_BRANCHES);
  const [deletedStudents, setDeletedStudents] = useState<DeletedStudent[]>([]);
  // Real-time Firestore snapshot synchronization
  useEffect(() => {
    let unsubs: (() => void)[] = [];
    try {
      // 1. Questions
      unsubs.push(onSnapshot(collection(db, 'questions'), (snap) => {
        if (!snap.empty) {
          const list: Question[] = [];
          snap.forEach(d => list.push({ ...d.data() } as Question));
          setQuestions(list);
          setIsFirebaseLive(true);
        }
      }, () => {}));
      // 2. Test Series Sets
      unsubs.push(onSnapshot(collection(db, 'test_series_sets'), (snap) => {
        if (!snap.empty) {
          const list: TestSeriesSet[] = [];
          snap.forEach(d => list.push({ id: d.id, ...d.data() } as TestSeriesSet));
          setTestSeries(list);
        }
      }, () => {}));
      // 3. Mentors
      unsubs.push(onSnapshot(collection(db, 'mentors'), (snap) => {
        if (!snap.empty) {
          const list: Mentor[] = [];
          snap.forEach(d => list.push({ id: d.id, ...d.data() } as Mentor));
          setMentors(list);
        }
      }, () => {}));
      // 4. Senior Chat Bookings
      unsubs.push(onSnapshot(collection(db, 'senior_chat_bookings'), (snap) => {
        if (!snap.empty) {
          const list: SeniorChatBooking[] = [];
          snap.forEach(d => list.push({ bookingId: d.id, ...d.data() } as SeniorChatBooking));
          setBookings(list);
        }
      }, () => {}));
      // 5. Resources
      unsubs.push(onSnapshot(collection(db, 'resources'), (snap) => {
        if (!snap.empty) {
          const list: Resource[] = [];
          snap.forEach(d => list.push({ id: d.id, ...d.data() } as Resource));
          setResources(list);
        }
      }, () => {}));
      // 6. Important Dates
      unsubs.push(onSnapshot(collection(db, 'important_dates'), (snap) => {
        if (!snap.empty) {
          const list: ImportantDate[] = [];
          snap.forEach(d => list.push({ id: d.id, ...d.data() } as ImportantDate));
          setDates(list);
        }
      }, () => {}));
      // 7. Rank vs Marks
      unsubs.push(onSnapshot(collection(db, 'rank_vs_marks'), (snap) => {
        if (!snap.empty) {
          const list: RankVsMarksTier[] = [];
          snap.forEach(d => list.push({ id: d.id, ...d.data() } as RankVsMarksTier));
          setRankTiers(list);
        }
      }, () => {}));
      // 8. Announcements
      unsubs.push(onSnapshot(collection(db, 'announcements'), (snap) => {
        if (!snap.empty) {
          const list: Announcement[] = [];
          snap.forEach(d => list.push({ id: d.id, ...d.data() } as Announcement));
          setAnnouncements(list);
        }
      }, () => {}));
      // 9. Notifications
      unsubs.push(onSnapshot(collection(db, 'notifications'), (snap) => {
        if (!snap.empty) {
          const list: Notification[] = [];
          snap.forEach(d => list.push({ id: d.id, ...d.data() } as Notification));
          setNotifications(list);
        }
      }, () => {}));
      // 10. Users / Students (Deduplicated, Real-Time Synchronized & Live Updates)
      unsubs.push(onSnapshot(collection(db, 'users'), (snap) => {
        if (!snap.empty) {
          const userMap = new Map<string, User>();

          snap.forEach(d => {
            const data = d.data() as any;
            const docId = d.id;
            const studentUid = (data.uid || docId).trim();
            const studentEmail = (data.email || data.authEmail || '').toLowerCase().trim();
            const studentKey = studentEmail || studentUid;

            const existing = userMap.get(studentKey) || (studentUid ? userMap.get(studentUid) : undefined);

            const incomingMillis = Number(data.lastUpdatedMillis || data.updatedAt || 0);
            const existingMillis = Number(existing?.lastUpdatedMillis || 0);

            // Merge fields: newer timestamp or UID doc takes precedence
            let mergedUser: User = {
              ...(existing || {}),
              ...data,
              uid: studentUid,
              email: studentEmail || existing?.email || '',
              name: (incomingMillis >= existingMillis && data.name) ? data.name : (existing?.name || data.name || 'Student'),
              lastUpdatedMillis: Math.max(incomingMillis, existingMillis, Date.now())
            };

            // Detect if lastProfileUpdateNote has a stale target name compared to current name
            if (mergedUser.lastProfileUpdateNote && mergedUser.name) {
              const nameMatch = mergedUser.lastProfileUpdateNote.match(/• Name: '([^']+)' → '([^']+)'/);
              if (nameMatch) {
                const [_, fromName, toName] = nameMatch;
                if (toName !== mergedUser.name) {
                  // The name was recently updated in Android / Firestore to a newer name!
                  mergedUser.lastProfileUpdateNote = `• Name: '${toName}' → '${mergedUser.name}'`;
                  const dTime = new Date(mergedUser.lastUpdatedMillis || Date.now());
                  mergedUser.lastProfileUpdateTime = dTime.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) + ', ' + dTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase();
                }
              }
            }

            userMap.set(studentKey, mergedUser);
            if (studentUid) userMap.set(studentUid, mergedUser);
          });

          // Unique deduplicated list of students
          const uniqueStudents = Array.from(new Set(userMap.values()));
          setStudents(uniqueStudents);
        }
      }, (error) => {
        console.warn('Users snapshot listener notice:', error);
      }));
      // 11. Test Results
      unsubs.push(onSnapshot(collection(db, 'test_results'), (snap) => {
        if (!snap.empty) {
          const list: StudentTestResult[] = [];
          snap.forEach(d => list.push({ id: d.id, ...d.data() } as StudentTestResult));
          setStudentTestResults(list);
        }
      }, () => {}));
      // 12. Helplines
      unsubs.push(onSnapshot(collection(db, 'helplines'), (snap) => {
        if (!snap.empty) {
          const list: Helpline[] = [];
          snap.forEach(d => list.push({ id: d.id, ...d.data() } as Helpline));
          setHelplines(list);
        }
      }, () => {}));
      // 13. Payment Receipts
      unsubs.push(onSnapshot(collection(db, 'payment_receipts'), (snap) => {
        if (!snap.empty) {
          const list: PaymentReceipt[] = [];
          snap.forEach(d => list.push({ receiptId: d.id, ...d.data() } as PaymentReceipt));
          setReceipts(list);
        }
      }, () => {}));
      // 14. Colleges
      unsubs.push(onSnapshot(collection(db, 'colleges'), (snap) => {
        if (!snap.empty) {
          const list: College[] = [];
          snap.forEach(d => list.push({ id: d.id, ...d.data() } as College));
          setColleges(list);
        }
      }, () => {}));
      // 15. Branch Cutoffs (Exact match with Android /branch_cutoffs schema)
      unsubs.push(onSnapshot(collection(db, 'branch_cutoffs'), (snap) => {
        const list: BranchCutoff[] = [];
        snap.forEach(d => {
          const data = d.data() as any;
          const rawMap = data.categoryCutoffs || data.category_cutoffs;
          const categoryCutoffsMap: Record<string, number> = {
            GM: Number(rawMap?.GM ?? data.GM ?? data.gm ?? 1200),
            '2A': Number(rawMap?.['2A'] ?? data['2A'] ?? data.cat2A ?? 2100),
            '2B': Number(rawMap?.['2B'] ?? data['2B'] ?? data.cat2B ?? 2300),
            '3A': Number(rawMap?.['3A'] ?? data['3A'] ?? data.cat3A ?? 1400),
            '3B': Number(rawMap?.['3B'] ?? data['3B'] ?? data.cat3B ?? 1500),
            SC: Number(rawMap?.SC ?? data.SC ?? data.sc ?? 12000),
            ST: Number(rawMap?.ST ?? data.ST ?? data.st ?? 18000)
          };

          const rawCollegeId = data.collegeId || data.college_id || (d.id.includes('_') ? d.id.split('_')[0] : '');
          const rawBranchCode = (data.branchCode || data.branch_code || (d.id.includes('_') ? d.id.split('_')[1] : 'CSE')).toUpperCase().trim();

          list.push({
            id: d.id,
            collegeId: rawCollegeId,
            branchCode: rawBranchCode,
            branchName: data.branchName || data.branch_name || rawBranchCode,
            categoryCutoffs: categoryCutoffsMap
          });
        });

        if (list.length > 0) {
          setCutoffs(list);
          try { localStorage.setItem('kcet_admin_cutoffs', JSON.stringify(list)); } catch (e) {}
        }
      }, (error) => {
        console.warn('Firestore onSnapshot branch_cutoffs notice:', error);
      }));
      // 16. Engineering Branches
      unsubs.push(onSnapshot(collection(db, 'engineering_branches'), (snap) => {
        if (!snap.empty) {
          const list: EngineeringBranch[] = [];
          snap.forEach(d => list.push({ id: d.id, ...d.data() } as EngineeringBranch));
          setBranches(list);
        }
      }, () => {}));
      // 17. Deleted Students
      unsubs.push(onSnapshot(collection(db, 'deleted_students'), (snap) => {
        if (!snap.empty) {
          const list: DeletedStudent[] = [];
          snap.forEach(d => list.push({ ...d.data() } as DeletedStudent));
          setDeletedStudents(list);
        }
      }, () => {}));
      // 18. Realtime Database /user_premium (Instant socket listener ~50ms)
      try {
        const premiumRef = ref(rtdb, 'user_premium');
        const unsubRtdb = onValue(premiumRef, (snapshot) => {
          if (snapshot.exists()) {
            const val = snapshot.val() as Record<string, boolean | string>;
            if (val && typeof val === 'object') {
              setStudents(prev => {
                let changed = false;
                const updated = prev.map(student => {
                  const sUid = (student.uid || '').replace(/[@.]/g, '_');
                  const sEmail = (student.email || '').replace(/[@.]/g, '_');
                  const sId = (student.studentId || '').replace(/[@.]/g, '_');

                  const rtdbRaw = val[sUid] ?? (sEmail ? val[sEmail] : undefined) ?? (sId ? val[sId] : undefined);
                  if (rtdbRaw !== undefined) {
                    const rtdbStatus = rtdbRaw === true || rtdbRaw === 'true';
                    if (student.isPremium !== rtdbStatus) {
                      changed = true;
                      return { ...student, isPremium: rtdbStatus };
                    }
                  }
                  return student;
                });
                return changed ? updated : prev;
              });
            }
          }
        }, (err) => {
          console.warn('RTDB user_premium onValue listener notice:', err);
        });
        unsubs.push(() => unsubRtdb());
      } catch (e) {
        console.warn('Could not attach RTDB /user_premium listener:', e);
      }
      setSyncStatus('Connected to Firestore & Realtime DB');
      setIsFirebaseLive(true);
    } catch (e: any) {
      console.warn('Firestore real-time sync notice:', e?.message || e);
      setSyncStatus('Local Sync Active (Offline Resilient)');
    }
    return () => {
      unsubs.forEach(u => u());
    };
  }, []);
  // Admin Login authentication
  const loginAdmin = async (password: string): Promise<boolean> => {
    // Master admin password for KCET Gen Z console
    const ADMIN_MASTER_PASSWORD = 'Ullas@17082006';
    // Simulate real auth delay
    await new Promise(r => setTimeout(r, 650));
    if (password === ADMIN_MASTER_PASSWORD) {
      setIsAuthenticated(true);
      localStorage.setItem('kcet_admin_auth', 'true');
      return true;
    }
    return false;
  };
  const logoutAdmin = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('kcet_admin_auth');
  };
  // Seed default dataset to Firestore on demand
  const seedDefaultsToFirebase = async () => {
    try {
      setSyncStatus('Seeding initial dataset to Firestore...');
      // Seed Questions
      for (const q of INITIAL_QUESTIONS) {
        await setDoc(doc(db, 'questions', String(q.id)), q);
      }
      // Seed Test Series
      for (const ts of INITIAL_TEST_SERIES) {
        await setDoc(doc(db, 'test_series_sets', ts.id), ts);
      }
      // Seed Colleges
      for (const c of INITIAL_COLLEGES) {
        await setDoc(doc(db, 'colleges', c.id), c);
      }
      // Seed Cutoffs
      for (const cut of INITIAL_BRANCH_CUTOFFS) {
        await setDoc(doc(db, 'branch_cutoffs', cut.id), cut);
      }
      // Seed Branches
      for (const b of INITIAL_BRANCHES) {
        await setDoc(doc(db, 'engineering_branches', b.id), b);
      }
      // Seed Students
      for (const s of INITIAL_STUDENTS) {
        await setDoc(doc(db, 'users', s.uid), s);
      }
      // Seed Mentors
      for (const m of INITIAL_MENTORS) {
        await setDoc(doc(db, 'mentors', m.id), m);
      }
      // Seed Bookings
      for (const bk of INITIAL_BOOKINGS) {
        await setDoc(doc(db, 'senior_chat_bookings', bk.bookingId), bk);
      }
      // Seed Resources
      for (const r of INITIAL_RESOURCES) {
        await setDoc(doc(db, 'resources', r.id), r);
      }
      // Seed Dates
      for (const dt of INITIAL_IMPORTANT_DATES) {
        await setDoc(doc(db, 'important_dates', dt.id), dt);
      }
      // Seed Helplines
      for (const h of INITIAL_HELPLINES) {
        await setDoc(doc(db, 'helplines', h.id), h);
      }
      // Seed Receipts
      for (const rc of INITIAL_RECEIPTS) {
        await setDoc(doc(db, 'payment_receipts', rc.receiptId), rc);
      }
      // Seed Rank Tiers
      for (const rt of INITIAL_RANK_VS_MARKS) {
        await setDoc(doc(db, 'rank_vs_marks', rt.id), rt);
      }
      setSyncStatus('All collections seeded to Firestore!');
    } catch (e: any) {
      console.error('Seeding error:', e);
      setSyncStatus(`Seeding notice: ${e.message || 'Stored locally'}`);
    }
  };
  // --- CRUD ACTIONS ---
  // 1. Questions
  const saveQuestion = async (q: Question) => {
    setQuestions(prev => {
      const idx = prev.findIndex(item => item.id === q.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = q;
        return updated;
      }
      return [q, ...prev];
    });
    try {
      await setDoc(doc(db, 'questions', String(q.id)), q);
    } catch (e) {
      console.warn('Saved question locally', e);
    }
  };
  const deleteQuestion = async (id: number) => {
    setQuestions(prev => prev.filter(q => q.id !== id));
    try {
      await deleteDoc(doc(db, 'questions', String(id)));
    } catch (e) {
      console.warn('Deleted question locally', e);
    }
  };
  // 2. Test Series
  const saveTestSeries = async (ts: TestSeriesSet) => {
    setTestSeries(prev => {
      const idx = prev.findIndex(item => item.id === ts.id);
      if (idx >= 0) {
        const u = [...prev];
        u[idx] = ts;
        return u;
      }
      return [ts, ...prev];
    });
    try {
      await setDoc(doc(db, 'test_series_sets', ts.id), ts);
    } catch (e) {
      console.warn('Saved test set locally', e);
    }
  };
  const deleteTestSeries = async (id: string) => {
    setTestSeries(prev => prev.filter(ts => ts.id !== id));
    try {
      await deleteDoc(doc(db, 'test_series_sets', id));
    } catch (e) {
      console.warn('Deleted test set locally', e);
    }
  };
  // 3. Mentors & Bookings
  const saveMentor = async (m: Mentor) => {
    setMentors(prev => {
      const idx = prev.findIndex(item => item.id === m.id);
      if (idx >= 0) {
        const u = [...prev];
        u[idx] = m;
        return u;
      }
      return [m, ...prev];
    });
    try {
      await setDoc(doc(db, 'mentors', m.id), m);
    } catch (e) {
      console.warn('Saved mentor locally', e);
    }
  };
  const deleteMentor = async (id: string) => {
    setMentors(prev => prev.filter(m => m.id !== id));
    try {
      await deleteDoc(doc(db, 'mentors', id));
    } catch (e) {
      console.warn('Deleted mentor locally', e);
    }
  };
  const updateBooking = async (b: SeniorChatBooking) => {
    setBookings(prev => {
      const idx = prev.findIndex(item => item.bookingId === b.bookingId);
      if (idx >= 0) {
        const u = [...prev];
        u[idx] = b;
        return u;
      }
      return [b, ...prev];
    });
    try {
      await setDoc(doc(db, 'senior_chat_bookings', b.bookingId), b);
    } catch (e) {
      console.warn('Updated booking locally', e);
    }
  };
  const saveBooking = updateBooking;
  const deleteBooking = async (id: string) => {
    setBookings(prev => prev.filter(b => b.bookingId !== id));
    try {
      await deleteDoc(doc(db, 'senior_chat_bookings', id));
    } catch (e) {
      console.warn('Deleted booking locally', e);
    }
  };
  // 4. Resources
  const saveResource = async (r: Resource, notifyStudents = false) => {
    setResources(prev => {
      const idx = prev.findIndex(item => item.id === r.id);
      if (idx >= 0) {
        const u = [...prev];
        u[idx] = r;
        return u;
      }
      return [r, ...prev];
    });
    try {
      await setDoc(doc(db, 'resources', r.id), r);
      if (notifyStudents) {
        await sendBroadcast({
          title: `New Study Material: ${r.title}`,
          message: `New ${r.category} resource uploaded (${r.fileSize}). Tap to review and download.`,
          type: 'STUDY_MATERIAL',
          actionType: 'NAV_RESOURCES'
        });
      }
    } catch (e) {
      console.warn('Saved resource locally', e);
    }
  };
  const deleteResource = async (id: string) => {
    setResources(prev => prev.filter(r => r.id !== id));
    try {
      await deleteDoc(doc(db, 'resources', id));
    } catch (e) {
      console.warn('Deleted resource locally', e);
    }
  };
  // 5. Important Dates
  const saveDate = async (d: ImportantDate) => {
    setDates(prev => {
      const idx = prev.findIndex(item => item.id === d.id);
      if (idx >= 0) {
        const u = [...prev];
        u[idx] = d;
        return u;
      }
      return [d, ...prev];
    });
    try {
      await setDoc(doc(db, 'important_dates', d.id), d);
    } catch (e) {
      console.warn('Saved date locally', e);
    }
  };
  const deleteDate = async (id: string) => {
    setDates(prev => prev.filter(d => d.id !== id));
    try {
      await deleteDoc(doc(db, 'important_dates', id));
    } catch (e) {
      console.warn('Deleted date locally', e);
    }
  };
  // 6. Rank vs Marks
  const saveRankTier = async (tier: RankVsMarksTier) => {
    setRankTiers(prev => {
      const idx = prev.findIndex(item => item.id === tier.id);
      if (idx >= 0) {
        const u = [...prev];
        u[idx] = tier;
        return u;
      }
      return [tier, ...prev];
    });
    try {
      await setDoc(doc(db, 'rank_vs_marks', tier.id), tier);
    } catch (e) {
      console.warn('Saved rank tier locally', e);
    }
  };
  const deleteRankTier = async (id: string) => {
    setRankTiers(prev => prev.filter(t => t.id !== id));
    try {
      await deleteDoc(doc(db, 'rank_vs_marks', id));
    } catch (e) {
      console.warn('Deleted rank tier locally', e);
    }
  };
  // 7. Announcements & Notifications
  const sendBroadcast = async (notif: Partial<Notification>, makeBanner = false) => {
    const notifId = notif.id || `notif-${Date.now()}`;
    const newNotif: Notification = {
      id: notifId,
      title: notif.title || 'Platform Notice',
      message: notif.message || '',
      timestamp: 'Just now',
      type: notif.type || 'ANNOUNCEMENT',
      isRead: false,
      actionType: notif.actionType || 'NONE',
      targetUserId: notif.targetUserId,
      targetUserEmail: notif.targetUserEmail,
      createdAtMillis: Date.now()
    };
    setNotifications(prev => [newNotif, ...prev]);
    try {
      await setDoc(doc(db, 'notifications', notifId), newNotif);
    } catch (e) {
      console.warn('Saved notification locally', e);
    }
    if (makeBanner) {
      const ancId = `anc-${Date.now()}`;
      const newAnc: Announcement = {
        id: ancId,
        title: notif.title || 'Important Announcement',
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        message: notif.message || '',
        isImportant: true
      };
      setAnnouncements(prev => [newAnc, ...prev]);
      try {
        await setDoc(doc(db, 'announcements', ancId), newAnc);
      } catch (e) {
        console.warn('Saved announcement banner locally', e);
      }
    }
  };
  const deleteAnnouncement = async (id: string) => {
    setAnnouncements(prev => prev.filter(a => a.id !== id));
    try {
      await deleteDoc(doc(db, 'announcements', id));
    } catch (e) {
      console.warn('Deleted announcement locally', e);
    }
  };
  const deleteNotification = async (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    try {
      await deleteDoc(doc(db, 'notifications', id));
      await setDoc(doc(db, 'deleted_notifications', id), { deletedAt: Date.now() });
      await rtdbSet(ref(rtdb, `globally_deleted_notifications/${id}`), true);
    } catch (e) {
      console.warn('Deleted notification locally', e);
    }
  };
  // 8. Students Moderation
  const updateStudent = async (student: Partial<User> & { uid: string }) => {
    let targetStudent: User | undefined;
    setStudents(prev => {
      const idx = prev.findIndex(s => s.uid === student.uid);
      if (idx >= 0) {
        const u = [...prev];
        targetStudent = { ...u[idx], ...student, lastUpdatedMillis: Date.now() };
        u[idx] = targetStudent;
        return u;
      }
      return prev;
    });
    try {
      const nowMillis = Date.now();
      await setDoc(doc(db, 'users', student.uid), {
        ...student,
        lastUpdatedMillis: nowMillis
      }, { merge: true });

      if (targetStudent && targetStudent.email) {
        const sanitizedEmailDoc = targetStudent.email.replace(/[@.]/g, '_');
        await setDoc(doc(db, 'users', sanitizedEmailDoc), {
          ...student,
          lastUpdatedMillis: nowMillis
        }, { merge: true });

        await setDoc(doc(db, 'user_accounts', targetStudent.email.toLowerCase().trim()), {
          ...student,
          lastUpdatedMillis: nowMillis
        }, { merge: true });
      }
    } catch (e) {
      console.warn('Updated student locally', e);
    }
  };
  const togglePremium = async (uid: string, current: boolean, studentEmail?: string, studentId?: string) => {
    const newStatus = !current;
    const now = Date.now();

    // Identify target student and all aliases
    const target = students.find(s => s.uid === uid || (studentEmail && s.email?.toLowerCase() === studentEmail.toLowerCase()));
    const effectiveEmail = (studentEmail || target?.email || '').toLowerCase().trim();
    const effectiveStudentId = (studentId || target?.studentId || '').trim();
    const emailDocId = effectiveEmail.replace(/[@.]/g, '_');
    const sanitizedUid = (uid || '').replace(/[@.]/g, '_');

    // 1. Optimistic Local State Update
    setStudents(prev => prev.map(s => {
      if (s.uid === uid || (effectiveEmail && s.email?.toLowerCase() === effectiveEmail)) {
        return { ...s, isPremium: newStatus, lastUpdatedMillis: now };
      }
      return s;
    }));

    const updatePayload = {
      isPremium: Boolean(newStatus),
      premium: Boolean(newStatus),
      lastUpdatedMillis: now
    };

    // 2. Realtime Database (RTDB) Fast-Path (~50ms push to active student devices)
    try {
      if (sanitizedUid) {
        await rtdbSet(ref(rtdb, `user_premium/${sanitizedUid}`), Boolean(newStatus));
      }
      if (emailDocId && emailDocId !== sanitizedUid) {
        await rtdbSet(ref(rtdb, `user_premium/${emailDocId}`), Boolean(newStatus));
      }
      if (effectiveStudentId) {
        const sanitizedSid = effectiveStudentId.replace(/[@.]/g, '_');
        await rtdbSet(ref(rtdb, `user_premium/${sanitizedSid}`), Boolean(newStatus));
      }
    } catch (rtdbErr) {
      console.warn('RTDB user_premium update notice:', rtdbErr);
    }

    // 3. Cloud Firestore Persistent Storage (Multi-Key Invalidation & Merge)
    try {
      const batch = writeBatch(db);

      if (uid) {
        batch.set(doc(db, 'users', uid), updatePayload, { merge: true });
      }
      if (emailDocId && emailDocId !== uid) {
        batch.set(doc(db, 'users', emailDocId), updatePayload, { merge: true });
      }
      if (effectiveEmail) {
        batch.set(doc(db, 'user_accounts', effectiveEmail), {
          isPremium: Boolean(newStatus),
          lastUpdatedMillis: now
        }, { merge: true });
      }

      await batch.commit();
    } catch (fsErr) {
      console.warn('Firestore user premium batch update notice:', fsErr);
    }

    // 4. Send Broadcast Notification
    if (newStatus) {
      await sendBroadcast({
        title: '👑 Premium Access Granted!',
        message: 'Your KCET Gen Z account has been upgraded to Premium by Admin. All mock tests and college predictor features are unlocked.',
        type: 'PAYMENT',
        actionType: 'NAV_PROFILE',
        targetUserId: uid,
        targetUserEmail: effectiveEmail
      });
    } else {
      await sendBroadcast({
        title: 'Premium Access Revoked',
        message: 'Your KCET Gen Z Premium access has been set to Free plan by Admin.',
        type: 'PAYMENT',
        actionType: 'NAV_PROFILE',
        targetUserId: uid,
        targetUserEmail: effectiveEmail
      });
    }
  };
  const blockStudent = async (uid: string, reason: string) => {
    await updateStudent({
      uid,
      isBlocked: true,
      blockReason: reason,
      isForceLoggedOut: true
    });
  };
  const unblockStudent = async (uid: string) => {
    await updateStudent({
      uid,
      isBlocked: false,
      blockReason: ''
    });
  };
  const forceLogoutStudent = async (uid: string) => {
    await updateStudent({
      uid,
      isForceLoggedOut: true
    });
  };
  const forceLogoutAllStudents = async () => {
    setStudents(prev => prev.map(s => ({ ...s, isForceLoggedOut: true })));
    for (const s of students) {
      try {
        await updateDoc(doc(db, 'users', s.uid), { isForceLoggedOut: true });
      } catch (e) {}
    }
    try {
      await rtdbSet(ref(rtdb, 'system_config/force_logout_all'), true);
    } catch (e) {}
  };
  const deleteStudentPermanently = async (uid: string, email: string) => {
    const student = students.find(s => s.uid === uid || (email && s.email.toLowerCase() === email.toLowerCase()));
    const effectiveName = student?.name || 'Student';
    const effectiveEmail = (email || student?.email || '').toLowerCase().trim();
    const sanitizedEmailDoc = effectiveEmail ? effectiveEmail.replace(/[@.]/g, '_') : '';
    const sanitizedUid = (uid || '').replace(/[@.]/g, '_');

    setStudents(prev => prev.filter(s => s.uid !== uid && (effectiveEmail ? s.email.toLowerCase() !== effectiveEmail : true)));
    const deletedEntry: DeletedStudent = {
      uid,
      email: effectiveEmail,
      name: effectiveName,
      deletedAt: Date.now()
    };
    setDeletedStudents(prev => [deletedEntry, ...prev]);

    // 1. Cloud Firestore Multi-Collection Cleanup
    try {
      const batch = writeBatch(db);
      if (uid) batch.delete(doc(db, 'users', uid));
      if (sanitizedEmailDoc && sanitizedEmailDoc !== uid) batch.delete(doc(db, 'users', sanitizedEmailDoc));
      if (effectiveEmail) batch.delete(doc(db, 'user_accounts', effectiveEmail));
      if (uid) batch.delete(doc(db, 'leaderboard', uid));
      
      batch.set(doc(db, 'deleted_students', uid), {
        uid,
        email: effectiveEmail,
        name: effectiveName,
        deletedAtMillis: Date.now()
      });

      await batch.commit();
    } catch (e) {
      console.warn('Firestore multi-doc delete notice:', e);
    }

    // 2. Clean test_results for student
    try {
      const resultsToDelete = studentTestResults.filter(r => r.studentUid === uid || (effectiveEmail && r.studentEmail === effectiveEmail));
      for (const res of resultsToDelete) {
        await deleteDoc(doc(db, 'test_results', res.id));
      }
      setStudentTestResults(prev => prev.filter(r => r.studentUid !== uid && (effectiveEmail ? r.studentEmail !== effectiveEmail : true)));
    } catch (e) {}

    // 3. Realtime Database Cleanup
    try {
      if (sanitizedUid) {
        await rtdbSet(ref(rtdb, `presence/${sanitizedUid}`), null);
        await rtdbSet(ref(rtdb, `live_xp/${sanitizedUid}`), null);
        await rtdbSet(ref(rtdb, `user_premium/${sanitizedUid}`), null);
      }
      if (sanitizedEmailDoc && sanitizedEmailDoc !== sanitizedUid) {
        await rtdbSet(ref(rtdb, `user_premium/${sanitizedEmailDoc}`), null);
      }
    } catch (e) {}
  };
  // Student Test Results
  const saveTestResult = async (res: StudentTestResult) => {
    setStudentTestResults(prev => {
      const idx = prev.findIndex(r => r.id === res.id);
      if (idx >= 0) {
        const u = [...prev];
        u[idx] = res;
        return u;
      }
      return [res, ...prev];
    });
    try {
      await setDoc(doc(db, 'test_results', res.id), res);
    } catch (e) {
      console.warn('Saved test result locally', e);
    }
  };
  const deleteTestResult = async (id: string) => {
    setStudentTestResults(prev => prev.filter(r => r.id !== id));
    try {
      await deleteDoc(doc(db, 'test_results', id));
    } catch (e) {
      console.warn('Deleted test result locally', e);
    }
  };
  // 9. Helplines
  const saveHelpline = async (h: Helpline) => {
    setHelplines(prev => {
      const idx = prev.findIndex(item => item.id === h.id);
      if (idx >= 0) {
        const u = [...prev];
        u[idx] = h;
        return u;
      }
      return [h, ...prev];
    });
    try {
      await setDoc(doc(db, 'helplines', h.id), h);
    } catch (e) {
      console.warn('Saved helpline locally', e);
    }
  };
  const deleteHelpline = async (id: string) => {
    setHelplines(prev => prev.filter(h => h.id !== id));
    try {
      await deleteDoc(doc(db, 'helplines', id));
    } catch (e) {
      console.warn('Deleted helpline locally', e);
    }
  };
  // 10. Receipts
  const approveReceipt = async (receipt: PaymentReceipt) => {
    const now = Date.now();
    const updated: PaymentReceipt = {
      ...receipt,
      status: 'VERIFIED',
      verifiedAtTimestamp: now
    };
    setReceipts(prev => prev.map(r => r.receiptId === receipt.receiptId ? updated : r));

    // Automatically grant premium to student across RTDB & Firestore
    const targetUid = receipt.userId || (students.find(s => s.email.toLowerCase() === receipt.userEmail.toLowerCase())?.uid || '');
    if (targetUid) {
      await togglePremium(targetUid, false, receipt.userEmail);
    }

    try {
      await setDoc(doc(db, 'payment_receipts', receipt.receiptId), {
        ...updated,
        verifiedAtMillis: now
      }, { merge: true });

      // Send confirmation broadcast
      await sendBroadcast({
        title: '💳 Payment Verified!',
        message: 'Your payment receipt has been approved. Premium test series unlocked!',
        type: 'PAYMENT',
        actionType: 'NAV_PRACTICE',
        targetUserId: targetUid,
        targetUserEmail: receipt.userEmail
      });
    } catch (e) {
      console.warn('Approved receipt locally', e);
    }
  };
  const rejectReceipt = async (receiptId: string, reason: string) => {
    const target = receipts.find(r => r.receiptId === receiptId);
    if (!target) return;
    const updated: PaymentReceipt = {
      ...target,
      status: 'REJECTED',
      rejectionReason: reason
    };
    setReceipts(prev => prev.map(r => r.receiptId === receiptId ? updated : r));
    // Send push notification about rejection
    await sendBroadcast({
      title: 'Payment Verification Notice',
      message: `Your payment receipt of ?${target.amountPaid} was rejected. Reason: ${reason}. Please resubmit in the Profile tab.`,
      type: 'PAYMENT',
      actionType: 'NAV_PROFILE',
      targetUserId: target.userId,
      targetUserEmail: target.userEmail
    });
    try {
      await setDoc(doc(db, 'payment_receipts', receiptId), updated);
    } catch (e) {
      console.warn('Rejected receipt locally', e);
    }
  };
  // 11. Colleges & Cutoffs
  const saveCollege = async (c: College) => {
    setColleges(prev => {
      const idx = prev.findIndex(item => item.id === c.id);
      if (idx >= 0) {
        const u = [...prev];
        u[idx] = c;
        return u;
      }
      return [c, ...prev];
    });
    try {
      await setDoc(doc(db, 'colleges', c.id), c);
    } catch (e) {
      console.warn('Saved college locally', e);
    }
  };
  const deleteCollege = async (id: string) => {
    setColleges(prev => prev.filter(c => c.id !== id));
    // Also remove cutoffs for this college
    setCutoffs(prev => prev.filter(cut => cut.collegeId !== id));
    try {
      await deleteDoc(doc(db, 'colleges', id));
      await setDoc(doc(db, 'deleted_colleges', id), { collegeId: id, deletedAt: Date.now() });
    } catch (e) {
      console.warn('Deleted college locally', e);
    }
  };
  const saveCutoff = async (cutoff: BranchCutoff) => {
    const cleanBranch = cutoff.branchCode.toUpperCase().trim();
    const docId = `${cutoff.collegeId}_${cleanBranch}`;

    const categoryMap: Record<string, number> = {
      GM: Number(cutoff.categoryCutoffs?.GM) || 1200,
      '2A': Number(cutoff.categoryCutoffs?.['2A']) || 2100,
      '2B': Number(cutoff.categoryCutoffs?.['2B']) || 2300,
      '3A': Number(cutoff.categoryCutoffs?.['3A']) || 1400,
      '3B': Number(cutoff.categoryCutoffs?.['3B']) || 1500,
      SC: Number(cutoff.categoryCutoffs?.SC) || 12000,
      ST: Number(cutoff.categoryCutoffs?.ST) || 18000
    };

    const payload = {
      collegeId: cutoff.collegeId,
      branchCode: cleanBranch,
      branchName: cutoff.branchName || cleanBranch,
      categoryCutoffs: categoryMap,
      lastUpdated: Date.now()
    };

    // Update local state and persistent storage
    setCutoffs(prev => {
      const idx = prev.findIndex(item => item.id === docId || (item.collegeId === cutoff.collegeId && item.branchCode === cleanBranch));
      let updated: BranchCutoff[];
      const item: BranchCutoff = {
        id: docId,
        collegeId: cutoff.collegeId,
        branchCode: cleanBranch,
        branchName: cutoff.branchName || cleanBranch,
        categoryCutoffs: categoryMap
      };

      if (idx >= 0) {
        updated = [...prev];
        updated[idx] = item;
      } else {
        updated = [item, ...prev];
      }
      try { localStorage.setItem('kcet_admin_cutoffs', JSON.stringify(updated)); } catch (e) {}
      return updated;
    });

    // Writes to the exact Firestore path /branch_cutoffs/{collegeId}_{branchCode} used by Android
    await setDoc(doc(db, 'branch_cutoffs', docId), payload, { merge: true });
  };

  const deleteCutoff = async (id: string, collegeId?: string, branchCode?: string) => {
    let docId = id;
    if (collegeId && branchCode) {
      docId = `${collegeId}_${branchCode.toUpperCase().trim()}`;
    } else if (!docId.includes('_')) {
      const target = cutoffs.find(c => c.id === id);
      if (target) {
        docId = `${target.collegeId}_${target.branchCode.toUpperCase().trim()}`;
      }
    }

    setCutoffs(prev => {
      const updated = prev.filter(c => c.id !== id && c.id !== docId);
      try { localStorage.setItem('kcet_admin_cutoffs', JSON.stringify(updated)); } catch (e) {}
      return updated;
    });

    await deleteDoc(doc(db, 'branch_cutoffs', docId));
    if (docId !== id) {
      try { await deleteDoc(doc(db, 'branch_cutoffs', id)); } catch (e) {}
    }
  };
  // 12. Branch Explorer
  const saveBranch = async (b: EngineeringBranch) => {
    setBranches(prev => {
      const idx = prev.findIndex(item => item.id === b.id);
      if (idx >= 0) {
        const u = [...prev];
        u[idx] = b;
        return u;
      }
      return [b, ...prev];
    });
    try {
      await setDoc(doc(db, 'engineering_branches', b.id), b);
    } catch (e) {
      console.warn('Saved branch locally', e);
    }
  };
  const deleteBranch = async (id: string) => {
    setBranches(prev => prev.filter(b => b.id !== id));
    try {
      await deleteDoc(doc(db, 'engineering_branches', id));
      await setDoc(doc(db, 'deleted_branches', id), { branchId: id, deletedAt: Date.now() });
    } catch (e) {
      console.warn('Deleted branch locally', e);
    }
  };
  return (
    <AdminDataContext.Provider
      value={{
        isAuthenticated,
        adminEmail,
        loginAdmin,
        logoutAdmin,
        isFirebaseLive,
        syncStatus,
        seedDefaultsToFirebase,
        questions,
        testSeries,
        mentors,
        bookings,
        resources,
        dates,
        rankTiers,
        announcements,
        notifications,
        students,
        studentTestResults,
        helplines,
        receipts,
        colleges,
        cutoffs,
        branches,
        deletedStudents,
        saveQuestion,
        deleteQuestion,
        saveTestSeries,
        deleteTestSeries,
        saveMentor,
        deleteMentor,
        updateBooking,
        saveBooking,
        deleteBooking,
        saveResource,
        deleteResource,
        saveDate,
        deleteDate,
        saveRankTier,
        deleteRankTier,
        sendBroadcast,
        deleteAnnouncement,
        deleteNotification,
        updateStudent,
        togglePremium,
        blockStudent,
        unblockStudent,
        forceLogoutStudent,
        forceLogoutAllStudents,
        deleteStudentPermanently,
        saveTestResult,
        deleteTestResult,
        saveHelpline,
        deleteHelpline,
        approveReceipt,
        rejectReceipt,
        saveCollege,
        deleteCollege,
        saveCutoff,
        deleteCutoff,
        saveBranch,
        toasts,
        showToast,
        notifySuccess,
        notifyError,
        notifyInfo,
        notifyWarning,
        dismissToast,
        requestConfirm,
        deleteBranch
      }}
    >
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      <ConfirmModal dialog={confirmDialog} />
    </AdminDataContext.Provider>
  );
};
export const useAdminData = () => {
  const context = useContext(AdminDataContext);
  if (!context) {
    throw new Error('useAdminData must be used within an AdminDataProvider');
  }
  return context;
};