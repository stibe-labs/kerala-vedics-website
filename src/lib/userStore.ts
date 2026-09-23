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

export const SEED_DOCTORS: StoredDoctor[] = [
  {
    id: "doc-madhavan-namboothiri",
    user_id: "user-doc-1",
    name: "Dr. Madhavan Namboothiri",
    email: "dr.madhavan@keralavedics.com",
    phone: "+91 94471 28901",
    registration_number: "KL-AYU-10492",
    council_name: "Travancore-Cochin Medical Council",
    degree: "BAMS, MD (Ayurveda Panchakarma)",
    specialization: "Panchakarma",
    years_experience: 24,
    bio: "Eighth-generation Ashtavaidya lineage practitioner with deep expertise in traditional Shodhana therapies, chronic autoimmune disorders, and cellular rejuvenation.",
    languages: ["English", "Malayalam", "Hindi", "Sanskrit"],
    consultation_fee: 1200,
    profile_photo: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=800&auto=format&fit=crop",
    verification_status: "Approved",
    is_active: 1,
    rating: 4.9,
    total_consultations: 342,
    created_at: "2024-01-15T00:00:00Z",
  },
  {
    id: "doc-ananya-warrier",
    user_id: "user-doc-2",
    name: "Dr. Ananya Warrier",
    email: "dr.ananya@keralavedics.com",
    phone: "+91 98460 31245",
    registration_number: "KL-AYU-14820",
    council_name: "Kerala State Ayurvedic Board",
    degree: "BAMS, MS (Ayurveda Prasuti & Stri Roga)",
    specialization: "Stri Roga (Women's Health)",
    years_experience: 16,
    bio: "Specialist in classical Ayurvedic gynecology, postpartum restoration, endocrine harmony, and herbal rasayana compounding for women's longevity.",
    languages: ["English", "Malayalam", "Tamil", "Hindi"],
    consultation_fee: 950,
    profile_photo: "https://images.unsplash.com/photo-1594824813583-492985f95c47?q=80&w=800&auto=format&fit=crop",
    verification_status: "Approved",
    is_active: 1,
    rating: 4.95,
    total_consultations: 289,
    created_at: "2024-02-10T00:00:00Z",
  },
  {
    id: "doc-sreedharan-vaidyan",
    user_id: "user-doc-3",
    name: "Dr. Sreedharan Vaidyan",
    email: "dr.sreedharan@keralavedics.com",
    phone: "+91 97455 89012",
    registration_number: "KL-AYU-08311",
    council_name: "Central Council of Indian Medicine (CCIM)",
    degree: "BAMS, Fellow in Marma Chikitsa",
    specialization: "Shalya Tantra (Surgery & Marma)",
    years_experience: 28,
    bio: "Master of Kalari Marma therapy and deep tissue kinetic healing. Renowned across South India for treating chronic arthritis, lumbar stenosis, and sports injuries.",
    languages: ["English", "Malayalam", "Tamil"],
    consultation_fee: 1500,
    profile_photo: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?q=80&w=800&auto=format&fit=crop",
    verification_status: "Approved",
    is_active: 1,
    rating: 5.0,
    total_consultations: 512,
    created_at: "2023-11-20T00:00:00Z",
  },
  {
    id: "doc-keerthi-menon",
    user_id: "user-doc-4",
    name: "Dr. Keerthi Menon",
    email: "dr.keerthi@keralavedics.com",
    phone: "+91 94961 77234",
    registration_number: "KL-AYU-19342",
    council_name: "NCISM New Delhi",
    degree: "BAMS, MD (Dravyaguna Vijnana)",
    specialization: "Twak Roga (Dermatology)",
    years_experience: 12,
    bio: "Expert pharmacognosist and dermatologist focusing on eczema, psoriasis, hyperpigmentation, and bespoke botanical formulation tailoring.",
    languages: ["English", "Malayalam", "Hindi"],
    consultation_fee: 850,
    profile_photo: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=800&auto=format&fit=crop",
    verification_status: "Approved",
    is_active: 1,
    rating: 4.88,
    total_consultations: 198,
    created_at: "2024-03-01T00:00:00Z",
  },
  {
    id: "doc-vishnu-sharma",
    user_id: "user-doc-5",
    name: "Dr. Vishnu Sharma",
    email: "dr.vishnu@keralavedics.com",
    phone: "+91 96562 44109",
    registration_number: "KL-AYU-12055",
    council_name: "CCIM",
    degree: "BAMS, MD (Kayachikitsa & Manasa Roga)",
    specialization: "Manasa Roga (Mental Health)",
    years_experience: 18,
    bio: "Integrative mind-body physician combining classical Medhya Rasayanas, Shirodhara protocols, and circadian sleep balancing for executive burnout.",
    languages: ["English", "Malayalam", "Hindi", "Kannada"],
    consultation_fee: 1100,
    profile_photo: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=800&auto=format&fit=crop",
    verification_status: "Approved",
    is_active: 1,
    rating: 4.92,
    total_consultations: 275,
    created_at: "2024-02-25T00:00:00Z",
  },
];

// Seed initial doctors if empty
if (globalDoctors.size === 0) {
  for (const doc of SEED_DOCTORS) {
    globalDoctors.set(doc.id, doc);
    globalDoctors.set(doc.email.toLowerCase().trim(), doc);
  }
}

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

// Generate standard schedules for seed doctors
function generateDefaultSchedules(doctorId: string) {
  const schedules: any[] = [];
  // Monday (1) to Saturday (6)
  for (let day = 1; day <= 6; day++) {
    schedules.push({
      id: `sch-${doctorId}-${day}`,
      doctor_id: doctorId,
      day_of_week: day,
      start_time: "09:00",
      end_time: "18:00",
      slot_duration: 30,
      buffer_mins: 10,
      is_active: 1,
    });
  }
  return schedules;
}

// Pre-seed schedules
if (globalSchedules.size === 0) {
  for (const doc of SEED_DOCTORS) {
    globalSchedules.set(doc.id, generateDefaultSchedules(doc.id));
  }
}

export function saveScheduleToStore(doctorId: string, schedules: any[]) {
  globalSchedules.set(doctorId, schedules);
}

export function getScheduleFromStore(doctorId: string): any[] | undefined {
  return globalSchedules.get(doctorId) || generateDefaultSchedules(doctorId);
}



