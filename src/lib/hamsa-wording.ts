import type { Avatar, Language, Symptom } from "./hamsa-session";

export function journeyWording(language: Language, avatar: Avatar | null) {
  const girl = avatar === "girl";
  if (language === "en")
    return {
      nameHeading: "What should I call you?",
      nameSubtitle: "Enter your name or nickname to continue.",
      nameLabel: "Tap the box to enter your name",
      keyboardHelp: "Tap letters below or type on your keyboard",
      backspace: "Delete letter",
      space: "Space",
      clear: "Clear name",
      required: "Name required to continue",
      continue: "Continue",
      back: "Back",
      hamsaSays: "HAMSA SAYS",
      stomachChoice: "Stomach Pain",
      restart: "Restart",
      end: "End",
      backSymptoms: "Back to symptoms",
      question: "Is this how you’re feeling?",
      yes: "Yes",
      no: "No",
      notSure: "Not sure",
      more: "Does anything else happen when your tummy hurts?",
      other: "What else would you like to tell me about?",
      done: "I’m done",
      reassurance: "That’s okay! Let’s try another way.",
      reassureDetail: "You can explore another feeling or watch the animation again.",
      otherFeelings: "Other feelings",
      watchAgain: "Watch again",
      thanks: "Great job!",
      thanksDetail: "Thank you for telling us how you feel.",
    };
  return {
    nameHeading: girl ? "إيش تحبي أناديكي؟" : "إيش تحب أناديك؟",
    nameSubtitle: girl
      ? "اكتبي اسمك أو الاسم اللي تحبي نناديكي فيه."
      : "اكتب اسمك أو الاسم اللي تحب نناديك فيه.",
    nameLabel: girl ? "اضغطي هنا واكتبي اسمك." : "اضغط هنا واكتب اسمك.",
    keyboardHelp: girl ? "اضغطي على الحروف واكتبي اسمك." : "اضغط على الحروف واكتب اسمك.",
    backspace: "حذف حرف",
    space: "مسافة",
    clear: "مسح الاسم",
    required: girl ? "اكتبي اسمك عشان نكمّل." : "اكتب اسمك عشان نكمّل.",
    continue: "يلا نكمّل!",
    back: "رجوع",
    hamsaSays: "همسة تقول",
    stomachChoice: "بطني يوجعني",
    restart: "البدء من جديد",
    end: "إنهاء",
    backSymptoms: "الرجوع للأعراض",
    question: girl ? "تحسي كذا؟" : "تحس كذا؟",
    yes: "أيوه",
    no: "لا",
    notSure: girl ? "مو متأكدة" : "مو متأكد",
    more: girl
      ? "لما بطنك يوجعك، تحسي بأعراض ثانية كمان؟"
      : "لما بطنك يوجعك، تحس بأعراض ثانية كمان؟",
    other: girl ? "إيش كمان تحسي فيه؟" : "إيش كمان تحس فيه؟",
    done: "خلاص، انتهيت.",
    reassurance: "ولا يهمك! يلا نجرب بطريقة ثانية.",
    reassureDetail: girl
      ? "تقدري تختاري شعور ثاني أو تشوفي الحركة مرة ثانية."
      : "تقدر تختار شعور ثاني أو تشوف الحركة مرة ثانية.",
    otherFeelings: "شعور ثاني",
    watchAgain: "أشوفها مرة ثانية.",
    thanks: "أحسنت!",
    thanksDetail: girl ? "شكرًا إنك وضّحتي لنا كيف تحسي!" : "شكرًا إنك وضّحت لنا كيف تحس!",
  };
}

export const symptomNames: Record<Language, Record<Symptom, string>> = {
  en: {
    stomach: "Stomach pain",
    vomiting: "Vomiting",
    constipation: "Constipation",
    diarrhea: "Diarrhea",
  },
  ar: {
    stomach: "ألم البطن",
    vomiting: "أرجّع",
    constipation: "عندي إمساك",
    diarrhea: "عندي إسهال",
  },
};
