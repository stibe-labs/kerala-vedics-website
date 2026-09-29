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

// Seed default certified Ayurvedic physicians if empty
if (globalDoctors.size === 0) {
  const seedDocs: StoredDoctor[] = [
    {
      id: "doc_arundhati",
      user_id: "usr_doc_arundhati",
      name: "Dr. Arundhati Menon",
      email: "dr.arundhati@keralavedics.com",
      registration_number: "TCMC-AYU-84920",
      council_name: "Travancore-Cochin Medical Council",
      degree: "B.A.M.S, M.D. (Ayurveda)",
      specialization: "Panchakarma & Gut Health",
      years_experience: 14,
      bio: "Senior Vaidya specializing in chronic digestive disorders, metabolic rebalancing, and classical Kerala Shodhana therapies.",
      languages: ["English", "Malayalam", "Hindi"],
      consultation_fee: 499,
      profile_photo: "https://images.unsplash.com/photo-1594824813580-0a2561571d79?q=80&w=600&auto=format&fit=crop",
      verification_status: "Approved",
      is_active: 1,
      rating: 4.98,
      total_consultations: 1420,
      created_at: new Date().toISOString(),
    },
    {
      id: "doc_radhakrishnan",
      user_id: "usr_doc_radhakrishnan",
      name: "Dr. K. Radhakrishnan Vaidyan",
      email: "dr.radhakrishnan@keralavedics.com",
      registration_number: "TCMC-AYU-41209",
      council_name: "Travancore-Cochin Medical Council",
      degree: "B.A.M.S, Ph.D. (Dravyaguna)",
      specialization: "Joint & Spine Health",
      years_experience: 22,
      bio: "Generational lineage practitioner of Ashtavaidya Marma Chikitsa and Sandhi Vata management using classical Taila Paka protocols.",
      languages: ["Malayalam", "English", "Tamil"],
      consultation_fee: 699,
      profile_photo: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=600&auto=format&fit=crop",
      verification_status: "Approved",
      is_active: 1,
      rating: 4.95,
      total_consultations: 2850,
      created_at: new Date().toISOString(),
    },
    {
      id: "doc_meenakshi",
      user_id: "usr_doc_meenakshi",
      name: "Dr. Meenakshi Pillai",
      email: "dr.meenakshi@keralavedics.com",
      registration_number: "TCMC-AYU-92381",
      council_name: "Travancore-Cochin Medical Council",
      degree: "B.A.M.S",
      specialization: "Skin & Hair Health",
      years_experience: 9,
      bio: "Holistic clinician guiding women's hormonal balance, Mukha Lepam therapeutic beauty, and scalp rejuvenation protocols.",
      languages: ["English", "Hindi", "Malayalam"],
      consultation_fee: 449,
      profile_photo: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=600&auto=format&fit=crop",
      verification_status: "Approved",
      is_active: 1,
      rating: 4.92,
      total_consultations: 980,
      created_at: new Date().toISOString(),
    },
    {
      id: "doc_anand",
      user_id: "usr_doc_anand",
      name: "Dr. Anand Namboodiri",
      email: "dr.anand@keralavedics.com",
      registration_number: "TCMC-AYU-63829",
      council_name: "Travancore-Cochin Medical Council",
      degree: "B.A.M.S, M.S. (Ayurveda)",
      specialization: "Stress & Sleep (Manovaha)",
      years_experience: 12,
      bio: "Cognitive Ayurveda researcher focused on Medhya Rasayana formulations, circadian alignment, and deep nervous system restoration.",
      languages: ["English", "Malayalam", "Kannada"],
      consultation_fee: 549,
      profile_photo: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?q=80&w=600&auto=format&fit=crop",
      verification_status: "Approved",
      is_active: 1,
      rating: 4.96,
      total_consultations: 1640,
      created_at: new Date().toISOString(),
    },
  ];

  seedDocs.forEach((doc) => {
    globalDoctors.set(doc.id, doc);
    globalDoctors.set(doc.email.toLowerCase().trim(), doc);
  });
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




export function saveScheduleToStore(doctorId: string, schedules: any[]) {
  globalSchedules.set(doctorId, schedules);
}

export function getScheduleFromStore(doctorId: string): any[] | undefined {
  return globalSchedules.get(doctorId);
}



