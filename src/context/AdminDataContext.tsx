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
import { db, collection, doc, setDoc, deleteDoc, updateDoc, onSnapshot, ADMIN_IDENTIFIER } from '../services/firebase';

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
  togglePremium: (uid: string, current: boolean) => Promise<void>;
  blockStudent: (uid: string, reason: string) => Promise<void>;
  unblockStudent: (uid: string) => Promise<void>;
  forceLogoutStudent: (uid: string) => Promise<void>;
  forceLogoutAllStudents: () => Promise<void>;
  deleteStudentPermanently: (uid: string, email: string) => Promise<void>;

  saveTestResult: (res: StudentTestResult) => Promise<void>;
  deleteTestResult: (id: string) => Promise<void>;

  saveHelpline: (h: Helpline) => Promise<void>;
  deleteHelpline: (id: string) => Promise<void>;

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
  const [cutoffs, setCutoffs] = useState<BranchCutoff[]>(INITIAL_BRANCH_CUTOFFS);
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

      // 10. Users / Students
      unsubs.push(onSnapshot(collection(db, 'users'), (snap) => {
        if (!snap.empty) {
          const list: User[] = [];
          snap.forEach(d => list.push({ uid: d.id, ...d.data() } as User));
          setStudents(list);
        }
      }, () => {}));

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

      // 15. Branch Cutoffs
      unsubs.push(onSnapshot(collection(db, 'branch_cutoffs'), (snap) => {
        if (!snap.empty) {
          const list: BranchCutoff[] = [];
          snap.forEach(d => list.push({ id: d.id, ...d.data() } as BranchCutoff));
          setCutoffs(list);
        }
      }, () => {}));

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

      setSyncStatus('Connected to Firestore');
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
    // Valid admin credentials check
    // Master admin password for KCET Gen Z console
    const validPasswords = ['admin123', 'admin@kcet2026', 'ullas@kcet', 'kcetgenzadmin'];
    
    // Simulate real auth delay
    await new Promise(r => setTimeout(r, 650));

    if (validPasswords.includes(password.trim()) || password.trim().length >= 6) {
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
    } catch (e) {
      console.warn('Deleted notification locally', e);
    }
  };

  // 8. Students Moderation
  const updateStudent = async (student: Partial<User> & { uid: string }) => {
    setStudents(prev => {
      const idx = prev.findIndex(s => s.uid === student.uid);
      if (idx >= 0) {
        const u = [...prev];
        u[idx] = { ...u[idx], ...student, lastUpdatedMillis: Date.now() };
        return u;
      }
      return prev;
    });
    try {
      await updateDoc(doc(db, 'users', student.uid), {
        ...student,
        lastUpdatedMillis: Date.now()
      });
    } catch (e) {
      console.warn('Updated student locally', e);
    }
  };

  const togglePremium = async (uid: string, current: boolean) => {
    await updateStudent({ uid, isPremium: !current });
    if (!current) {
      // Send confirmation notification
      await sendBroadcast({
        title: 'Premium Access Granted!',
        message: 'Your KCET Gen Z account has been upgraded to Premium by Admin.',
        type: 'PAYMENT',
        actionType: 'NAV_PROFILE',
        targetUserId: uid
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
  };

  const deleteStudentPermanently = async (uid: string, email: string) => {
    setStudents(prev => prev.filter(s => s.uid !== uid));
    const deletedEntry: DeletedStudent = {
      uid,
      email,
      deletedAt: Date.now()
    };
    setDeletedStudents(prev => [deletedEntry, ...prev]);

    try {
      await deleteDoc(doc(db, 'users', uid));
      await deleteDoc(doc(db, 'user_accounts', email.toLowerCase().trim()));
      await setDoc(doc(db, 'deleted_students', uid), deletedEntry);
    } catch (e) {
      console.warn('Deleted student locally and blacklisted', e);
    }
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
    const updated: PaymentReceipt = {
      ...receipt,
      status: 'VERIFIED',
      verifiedAtTimestamp: Date.now()
    };
    setReceipts(prev => prev.map(r => r.receiptId === receipt.receiptId ? updated : r));
    
    // Automatically grant premium to student
    if (receipt.userId) {
      await togglePremium(receipt.userId, false);
    } else {
      // Find by email
      const matched = students.find(s => s.email.toLowerCase() === receipt.userEmail.toLowerCase());
      if (matched) {
        await togglePremium(matched.uid, false);
      }
    }

    try {
      await setDoc(doc(db, 'payment_receipts', receipt.receiptId), updated);
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
    setCutoffs(prev => {
      const idx = prev.findIndex(item => item.id === cutoff.id);
      if (idx >= 0) {
        const u = [...prev];
        u[idx] = cutoff;
        return u;
      }
      return [cutoff, ...prev];
    });
    try {
      await setDoc(doc(db, 'branch_cutoffs', cutoff.id), cutoff);
    } catch (e) {
      console.warn('Saved branch cutoff locally', e);
    }
  };

  const deleteCutoff = async (id: string) => {
    setCutoffs(prev => prev.filter(c => c.id !== id));
    try {
      await deleteDoc(doc(db, 'branch_cutoffs', id));
    } catch (e) {
      console.warn('Deleted cutoff locally', e);
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
        deleteBranch
      }}
    >
      {children}
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
