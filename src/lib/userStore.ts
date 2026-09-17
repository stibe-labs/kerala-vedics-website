export interface StoredUser {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  dosha_affinity: string;
  phone?: string;
  created_at: string;
}

// Global in-memory user registry for persistent development and verified signups
const globalUsers: Map<string, StoredUser> = (globalThis as any).__kvUsers || new Map<string, StoredUser>();
(globalThis as any).__kvUsers = globalUsers;

export function saveUser(user: StoredUser) {
  globalUsers.set(user.email.toLowerCase().trim(), user);
}

export function findUserByEmail(email: string): StoredUser | undefined {
  return globalUsers.get(email.toLowerCase().trim());
}


export interface StoredDoctor {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone?: string;
  registration_number: string;
  council_name: string;
  degree: string;
  specialization: string;
  years_experience: number;
  bio?: string;
  languages: string[];
  consultation_fee: number;
  certificate_url?: string;
  profile_photo?: string;
  bank_account_name?: string;
  bank_account_number?: string;
  bank_ifsc?: string;
  verification_status: "Pending" | "Approved" | "Rejected" | "Suspended";
  is_active: number;
  rating?: number;
  total_consultations?: number;
  created_at: string;
}

// Global in-memory doctor registry
const globalDoctors: Map<string, StoredDoctor> = (globalThis as any).__kvDoctors || new Map<string, StoredDoctor>();
(globalThis as any).__kvDoctors = globalDoctors;

export function saveDoctorToStore(doctor: StoredDoctor) {
  globalDoctors.set(doctor.id, doctor);
  if (doctor.email) {
    globalDoctors.set(doctor.email.toLowerCase().trim(), doctor);
  }
}

export function findDoctorById(id: string): StoredDoctor | undefined {
  return globalDoctors.get(id);
}

export function findDoctorByEmail(email: string): StoredDoctor | undefined {
  return globalDoctors.get(email.toLowerCase().trim());
}

export function getAllDoctorsFromStore(): StoredDoctor[] {
  const unique = new Map<string, StoredDoctor>();
  for (const doc of globalDoctors.values()) {
    unique.set(doc.id, doc);
  }
  return Array.from(unique.values());
}

// Global in-memory schedule registry
const globalSchedules: Map<string, any[]> = (globalThis as any).__kvSchedules || new Map<string, any[]>();
(globalThis as any).__kvSchedules = globalSchedules;

export function saveScheduleToStore(doctorId: string, schedules: any[]) {
  globalSchedules.set(doctorId, schedules);
}

export function getScheduleFromStore(doctorId: string): any[] | undefined {
  return globalSchedules.get(doctorId);
}



