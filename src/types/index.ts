export type SubjectType = 'PHYSICS' | 'CHEMISTRY' | 'MATHEMATICS' | 'BIOLOGY';

export type CorrectOption = 'A' | 'B' | 'C' | 'D';

export interface Question {
  id: number;
  subject: SubjectType;
  questionText: string;
  imageUrl?: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: CorrectOption;
  explanation: string;
  testSetId: string;
  isPremium: boolean;
}

export type TestCategory = 
  | 'Full Mock Tests' 
  | 'Previous Year Papers' 
  | 'Chapter-wise Tests' 
  | 'Daily Practice';

export interface TestSeriesSet {
  id: string;
  title: string;
  category: TestCategory;
  questionCount: number;
  durationMins: number;
  isPremium: boolean;
  description: string;
  createdDate: string;
}

export interface Mentor {
  id: string;
  name: string;
  branch: string;
  college: string;
  currentYear: string;
  kcetRank: string;
  rating: number;
  bio: string;
  email: string;
  instagram: string;
  photoUrl: string;
}

export type BookingStatus = 
  | 'Under Verification' 
  | 'Waiting for Senior Confirmation' 
  | 'Confirmed' 
  | 'Reschedule Needed' 
  | 'Declined' 
  | 'Expired';

export interface SeniorChatBooking {
  bookingId: string;
  userId: string;
  userName: string;
  userEmail: string;
  selectedDate: string;
  selectedTime: string;
  mentorName: string;
  assignedMentorEmail: string;
  amountPaid: number;
  paymentRefNumber: string;
  bookedAtTimestamp: number;
  status: BookingStatus;
  adminMessage?: string;
  rejectionReason?: string;
}

export type ResourceCategory = 'Syllabus' | 'PYQ' | 'Formula' | 'Tips' | 'Notes';

export interface Resource {
  id: string;
  title: string;
  category: ResourceCategory;
  fileFormat: 'PDF' | string;
  fileSize: string;
  yearOrSubject: string;
  downloadUrl: string;
  description: string;
}

export type DateCategory = 'Exam' | 'Counselling' | 'Application' | 'Results' | 'Admit Card';
export type DateStatus = 'Upcoming' | 'Active Now' | 'Completed' | 'Crucial';

export interface ImportantDate {
  id: string;
  eventTitle: string;
  dateOrDeadline: string;
  status: DateStatus;
  description: string;
  category: DateCategory;
  isHighlighted: boolean;
}

export interface RankVsMarksTier {
  id: string;
  marksRange: string;
  expectedRankRange: string;
  year: string;
  description: string;
  minMarks: number;
  maxMarks: number;
}

export type NotificationType = 
  | 'ANNOUNCEMENT' 
  | 'EXAM_ALERT' 
  | 'STUDY_MATERIAL' 
  | 'COUNSELLING' 
  | 'SYSTEM' 
  | 'PAYMENT' 
  | 'BOOKING';

export type ActionRoute = 
  | 'NAV_PRACTICE' 
  | 'NAV_RESOURCES' 
  | 'NAV_COUNSELLING' 
  | 'NAV_TEST_SERIES' 
  | 'NAV_PROFILE' 
  | 'NONE';

export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: NotificationType;
  isRead: boolean;
  actionType?: ActionRoute;
  targetUserId?: string;
  targetUserEmail?: string;
  createdAtMillis: number;
}

export interface Announcement {
  id: string;
  title: string;
  date: string;
  message: string;
  isImportant: boolean;
}

export interface User {
  uid: string;
  name: string;
  email: string;
  phone?: string;
  photoUrl?: string;
  isPremium: boolean;
  kcetTargetRank: string;
  targetStream: string;
  registrationDate: string;
  isForceLoggedOut: boolean;
  isBlocked: boolean;
  blockReason: string;
  signInMethod: string;
  studentId: string;
  lastUpdatedMillis: number;
  isActiveNow?: boolean;
}

export interface UserAccount {
  uid: string;
  email: string;
  phone: string;
  name: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  isPremium: boolean;
  isBlocked: boolean;
  isForceLoggedOut: boolean;
  createdAt: number;
}

export interface StudentTestResult {
  id: string;
  studentUid: string;
  studentName: string;
  testSetId: string;
  testTitle: string;
  score: number;
  maxScore: number;
  correctCount: number;
  wrongCount: number;
  percentage: number;
  attemptDate: string;
}

export type HelplineType = 'EMAIL' | 'PHONE' | 'WHATSAPP' | 'INSTAGRAM';

export interface Helpline {
  id: string;
  title: string;
  contactValue: string;
  type: HelplineType;
  description: string;
  actionUrl: string;
  isHighlighted: boolean;
}

export type ReceiptStatus = 'UNDER_VERIFICATION' | 'VERIFIED' | 'REJECTED';

export interface PaymentReceipt {
  receiptId: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  amountPaid: number;
  transactionRef: string;
  receiptImageUri: string;
  submittedAtTimestamp: number;
  status: ReceiptStatus;
  rejectionReason: string;
  verifiedAtTimestamp?: number;
}

export type CollegeType = 'Autonomous' | 'Government' | 'Private' | 'Deemed University' | 'Private University';
export type NaacGrade = 'A++' | 'A+' | 'A' | 'B++' | 'B+' | 'B' | 'NA';

export interface College {
  id: string;
  name: string;
  code: string;
  district: string;
  collegeType: CollegeType;
  imageResUrl: string;
  logoResUrl?: string;
  naacGrade: NaacGrade;
  nirfRank: number;
  tuitionFeePerYear: number;
  hostelFeePerYear: number;
  highestPackageLpa: number;
  avgPackageLpa: number;
  placementPercentage: number;
  topRecruiters: string[];
  studentRating: number;
  hasHostel: boolean;
  websiteUrl: string;
  mapLocationQuery: string;
  distanceKmFromBlr: number;
  brochureUrl?: string;
}

export interface BranchCutoff {
  id: string;
  collegeId: string;
  branchCode: string;
  branchName: string;
  categoryCutoffs: Record<string, number>; // GM, 2A, 2B, 3A, 3B, SC, ST
}

export type BranchCategory = 'Tech & AI' | 'Core' | 'Allied & Emerging';

export interface EngineeringBranch {
  id: string;
  branchCode: string;
  branchName: string;
  iconEmoji: string;
  category: BranchCategory;
  overview: string;
  futureDemandLevel: string;
  futureScope: string;
  careerOpportunities: string[];
  higherStudiesOptions: string[];
  requiredSkills: string[];
  avgStartingSalaryLpa: number;
  topOfferingCollegesCount: number;
  districtOrPlace: string;
}

export interface DeletedStudent {
  email: string;
  uid: string;
  deletedAt: number;
}

export const KARNATAKA_DISTRICTS = [
  'Bagalkote',
  'Ballari',
  'Belagavi',
  'Bengaluru Rural',
  'Bengaluru Urban',
  'Bidar',
  'Chamarajanagara',
  'Chikkaballapura',
  'Chikkamagaluru',
  'Chitradurga',
  'Dakshina Kannada',
  'Davanagere',
  'Dharwad',
  'Gadag',
  'Hassan',
  'Haveri',
  'Kalaburagi',
  'Kodagu',
  'Kolar',
  'Koppal',
  'Mandya',
  'Mysuru',
  'Raichur',
  'Ramanagara',
  'Shivamogga',
  'Tumakuru',
  'Udupi',
  'Uttara Kannada',
  'Vijayanagara',
  'Vijayapura',
  'Yadgir'
] as const;

export const CUTOFF_CATEGORIES = ['GM', '2A', '2B', '3A', '3B', 'SC', 'ST'] as const;

export const STANDARD_BRANCHES = [
  { code: 'CSE', name: 'Computer Science and Engineering' },
  { code: 'AIML', name: 'Artificial Intelligence & Machine Learning' },
  { code: 'DS', name: 'Data Science' },
  { code: 'ISE', name: 'Information Science & Engineering' },
  { code: 'ECE', name: 'Electronics & Communication Engineering' },
  { code: 'EEE', name: 'Electrical & Electronics Engineering' },
  { code: 'ME', name: 'Mechanical Engineering' },
  { code: 'CE', name: 'Civil Engineering' },
  { code: 'AE', name: 'Aeronautical Engineering' },
  { code: 'BT', name: 'Biotechnology Engineering' }
];
