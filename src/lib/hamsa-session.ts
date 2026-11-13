export type Language = 'en' | 'ar';
export type Avatar = 'boy' | 'girl';
export type Stage = 'welcome' | 'language' | 'avatar';

export interface HamsaSession {
  stage: Stage;
  language: Language;
  avatar: Avatar | null;
  avatarConfirmed: boolean;
}

export const initialSession: HamsaSession = {
  stage: 'welcome', language: 'en', avatar: null, avatarConfirmed: false,
};

export type SessionAction =
  | { type: 'start' }
  | { type: 'language'; language: Language }
  | { type: 'avatar'; avatar: Avatar }
  | { type: 'back' }
  | { type: 'confirm' };

export function sessionReducer(state: HamsaSession, action: SessionAction): HamsaSession {
  switch (action.type) {
    case 'start': return { ...state, stage: 'language' };
    case 'language': return { ...state, language: action.language, stage: 'avatar' };
    case 'avatar': return { ...state, avatar: action.avatar, avatarConfirmed: false };
    case 'back': return { ...state, stage: state.stage === 'avatar' ? 'language' : 'welcome' };
    case 'confirm': return state.avatar ? { ...state, avatarConfirmed: true } : state;
  }
}

export const wording = {
  en: {
    heading: 'Choose your character!', subtitle: 'Who would you like to be?',
    boy: 'Boy', girl: 'Girl', back: 'Back', continue: 'Continue',
  },
  ar: {
    heading: 'يلا، اختار الشخصية اللي تعجبك!', subtitle: 'مين الشخصية اللي تبغى تختارها؟',
    boy: 'ولد', girl: 'بنت', back: 'رجوع', continue: 'يلا نكمّل!',
  },
} satisfies Record<Language, Record<string, string>>;