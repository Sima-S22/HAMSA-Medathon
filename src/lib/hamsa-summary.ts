import type { Answer, HamsaSession, Language, Symptom } from "./hamsa-session";

export const symptoms: readonly Symptom[] = ["stomach", "vomiting", "constipation", "diarrhea"];
export const summaryWording = {
  en: {
    title: "Clinical summary",
    disclaimer: "Child-reported answers from this prototype session • Not a diagnosis",
    name: "Child name",
    view: "View clinical summary",
    save: "Save",
    saveTitle: "Save your clinical summary",
    back: "Back to summary",
    review: "Back to journey",
    edit: "Change answer",
    png: "Download PNG",
    json: "Download JSON",
    print: "Print / Save as PDF",
    saveHelp:
      "Save a copy for the healthcare professional. Downloads include the child’s name and answers.",
    downloadError: "The download could not be created. Try again or use Print / Save as PDF.",
    downloaded: "Download ready. Check your browser’s downloads.",
    yes: "Yes",
    no: "No",
    notSure: "Not sure",
    notAssessed: "Not assessed",
  },
  ar: {
    title: "الملخص السريري",
    disclaimer: "إجابات أبلغ عنها الطفل في هذه الجلسة التجريبية • لا يُعد تشخيصًا طبيًا",
    name: "اسم الطفل",
    view: "عرض الملخص",
    save: "حفظ",
    saveTitle: "حفظ الملخص السريري",
    back: "العودة إلى الملخص",
    review: "العودة إلى التجربة",
    edit: "تغيير الإجابة",
    png: "تنزيل صورة PNG",
    json: "تنزيل ملف JSON",
    print: "طباعة / حفظ PDF",
    saveHelp: "احفظ نسخة لمختص الرعاية الصحية. تتضمن الملفات اسم الطفل وإجاباته.",
    downloadError: "تعذّر إنشاء الملف. حاول مجددًا أو استخدم الطباعة / حفظ PDF.",
    downloaded: "الملف جاهز. تحقق من تنزيلات المتصفح.",
    yes: "نعم",
    no: "لا",
    notSure: "غير متأكد",
    notAssessed: "لم يتم الاستفسار عنه",
  },
} satisfies Record<Language, Record<string, string>>;

// Use the clinician-facing Arabic labels shown on PDF summary pages 68–69.
export const summarySymptomNames: Record<Language, Record<Symptom, string>> = {
  en: {
    stomach: "Stomach pain",
    vomiting: "Vomiting",
    constipation: "Constipation",
    diarrhea: "Diarrhea",
  },
  ar: { stomach: "ألم البطن", vomiting: "القيء", constipation: "الإمساك", diarrhea: "الإسهال" },
};

// Missing answers stay explicitly unassessed; an explored animation is not a response.
export function buildSummary(session: HamsaSession) {
  return {
    schemaVersion: 1,
    source: "HAMSA child-reported prototype session",
    isDiagnosis: false,
    childName: session.name,
    language: session.language,
    avatar: session.avatar,
    symptoms: symptoms.map((symptom) => ({
      symptom,
      answer: session.answers[symptom] ?? ("notAssessed" as Answer | "notAssessed"),
    })),
  };
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  // Keep the URL alive long enough for Safari to begin its download.
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
