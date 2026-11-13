import { describe, expect, it } from "vitest";
import {
  initialSession,
  sessionReducer,
  type HamsaSession,
  type SessionAction,
} from "@/lib/hamsa-session";
import { buildSummary } from "@/lib/hamsa-summary";

function journey(...actions: SessionAction[]) {
  return actions.reduce(sessionReducer, initialSession);
}

describe("completed child journey and clinician summary", () => {
  it("retains identity across all onboarding back steps and language changes", () => {
    const state = journey(
      { type: "start" },
      { type: "language", language: "ar" },
      { type: "avatar", avatar: "girl" },
      { type: "confirm" },
      { type: "name", name: "Test Noor" },
      { type: "back" },
      { type: "back" },
      { type: "language", language: "en" },
      { type: "confirm" },
      { type: "enter-room" },
    );
    expect(state).toMatchObject({
      stage: "room",
      language: "en",
      avatar: "girl",
      name: "Test Noor",
    });
  });
  it("summarizes exact answers, preserving uncertainty and unassessed symptoms", () => {
    const state: HamsaSession = {
      ...initialSession,
      name: "Test Sami",
      language: "ar",
      avatar: "boy",
      answers: { stomach: "yes", vomiting: "no", diarrhea: "notSure" },
    };
    expect(buildSummary(state)).toEqual({
      schemaVersion: 1,
      source: "HAMSA child-reported prototype session",
      isDiagnosis: false,
      childName: "Test Sami",
      language: "ar",
      avatar: "boy",
      symptoms: [
        { symptom: "stomach", answer: "yes" },
        { symptom: "vomiting", answer: "no" },
        { symptom: "constipation", answer: "notAssessed" },
        { symptom: "diarrhea", answer: "notSure" },
      ],
    });
  });
  it("changing a summary answer updates the report while retaining every other answer", () => {
    const state: HamsaSession = {
      ...initialSession,
      stage: "summary",
      answers: { stomach: "yes", vomiting: "yes" },
    };
    const question = sessionReducer(state, { type: "edit", symptom: "stomach" });
    expect(question.stage).toBe("question");
    const changed = sessionReducer(question, { type: "answer", answer: "no" });
    const report = sessionReducer(changed, { type: "summary" });
    expect(buildSummary(report).symptoms.slice(0, 2)).toEqual([
      { symptom: "stomach", answer: "no" },
      { symptom: "vomiting", answer: "yes" },
    ]);
  });
  it("back from export preserves the report; ending clears personal data and back history", () => {
    const report: HamsaSession = {
      ...initialSession,
      stage: "summary",
      name: "Test Noor",
      language: "ar",
      avatar: "girl",
      answers: { stomach: "notSure" },
    };
    const saving = sessionReducer(report, { type: "save" });
    expect(sessionReducer(saving, { type: "back" })).toMatchObject(report);
    const ended = sessionReducer(saving, { type: "end" });
    expect(ended).toMatchObject({
      stage: "ended",
      language: "ar",
      name: "",
      answers: {},
      avatar: null,
      history: [],
    });
    expect(sessionReducer(ended, { type: "back" }).name).toBe("");
  });
  it("does not count an animation as a reported answer", () => {
    const exploring = sessionReducer(initialSession, { type: "symptom", symptom: "vomiting" });
    expect(buildSummary(exploring).symptoms.every((row) => row.answer === "notAssessed")).toBe(
      true,
    );
  });
});
