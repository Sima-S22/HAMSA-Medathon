export type Language = 'en' | 'ar';
export type Avatar = 'boy' | 'girl';
export type Symptom = 'stomach' | 'vomiting' | 'constipation' | 'diarrhea';
export type Answer = 'yes' | 'no' | 'notSure';
export type Stage = 'welcome' | 'language' | 'avatar' | 'name' | 'room' | 'animation' | 'question' | 'symptoms' | 'reassurance' | 'thanks';
export interface JourneyLocation { stage: Stage; symptom: Symptom | null; }

export interface HamsaSession {
  stage: Stage;
  language: Language;
  avatar: Avatar | null;
  avatarConfirmed: boolean;
  name: string;
  symptom: Symptom | null;
  answers: Partial<Record<Symptom, Answer>>;
  history: JourneyLocation[];
}

export const initialSession: HamsaSession = {
  stage: 'welcome', language: 'en', avatar: null, avatarConfirmed: false,
  name: '', symptom: null, answers: {}, history: [],
};

export type SessionAction =
  | { type: 'start' }
  | { type: 'language'; language: Language }
  | { type: 'avatar'; avatar: Avatar }
  | { type: 'back' }
  | { type: 'confirm' }
  | { type: 'name'; name: string }
  | { type: 'enter-room' }
  | { type: 'symptom'; symptom: Symptom }
  | { type: 'question' }
  | { type: 'answer'; answer: Answer }
  | { type: 'other-symptoms' }
  | { type: 'replay' }
  | { type: 'done' }
  | { type: 'restart' };

function move(state: HamsaSession, stage: Stage, symptom = state.symptom): HamsaSession {
  return { ...state, stage, symptom, history: [...state.history, { stage: state.stage, symptom: state.symptom }] };
}

export function sessionReducer(state: HamsaSession, action: SessionAction): HamsaSession {
  switch (action.type) {
    case 'start': return { ...state, stage: 'language' };
    case 'language': return { ...state, language: action.language, stage: 'avatar' };
    case 'avatar': return { ...state, avatar: action.avatar, avatarConfirmed: false };
    case 'back': {
      const previous = state.history.at(-1);
      if (previous) return { ...state, ...previous, history: state.history.slice(0, -1) };
      return { ...state, stage: state.stage === 'avatar' ? 'language' : 'welcome' };
    }
    case 'confirm': return state.avatar ? move({ ...state, avatarConfirmed: true }, 'name') : state;
    case 'name': return { ...state, name: action.name };
    case 'enter-room': return state.avatar && state.name.trim() ? move({ ...state, name: state.name.trim() }, 'room') : state;
    case 'symptom': return move(state, 'animation', action.symptom);
    case 'question': return state.symptom ? move(state, 'question') : state;
    case 'answer': {
      if (!state.symptom) return state;
      const answered = { ...state, answers: { ...state.answers, [state.symptom]: action.answer } };
      return move(answered, action.answer === 'yes' ? 'symptoms' : 'reassurance');
    }
    case 'other-symptoms': return move(state, 'symptoms');
    case 'replay': return move(state, 'animation');
    case 'done': return move(state, 'thanks');
    case 'restart': return { ...initialSession, answers: {}, history: [] };
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