export interface ContactInfo {
    email: string;
    phone: string;
}

export interface PersonalInfo {
    name: string;
    lastName: string;
    role: string;
    photo: string;
    photos: string[];
    contactInfo: ContactInfo;
}

export interface SkillSet {
    professional: string[];
}

export interface Experience {
    id: number;
    period: string;
    title: string;
    description: string;
    bullets: string[];
}

export interface Education {
    id: number;
    period: string;
    degree: string;
    institution: string;
}

export interface ProfileData {
    personalInfo: PersonalInfo;
    skills: SkillSet;
    experience: Experience[];
    education: Education[];
    objective: string;
    themeColor: string;
}
export interface Document {
    id: string;
    name: string;
    file_url: string;
    created_at: string;
    user_id: string;
}

// Server Action Response Types
export interface ActionSuccess {
    success: true;
    url?: string;
    error?: never;
}

export interface ActionError {
    success: false;
    error: string;
    url?: never;
}

export type ActionResult = ActionSuccess | ActionError;
