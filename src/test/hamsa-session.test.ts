import { describe, expect, it } from "vitest";
import { initialSession, sessionReducer } from "@/lib/hamsa-session";

describe("HAMSA Phase 1 session", () => {
  it("starts at welcome and opens language selection", () => {
    expect(initialSession.stage).toBe("welcome");
    expect(sessionReducer(initialSession, { type: "start" }).stage).toBe("language");
  });
  it.each(["en", "ar"] as const)(
    "remembers selected %s language through navigation",
    (language) => {
      const selected = sessionReducer(initialSession, { type: "language", language });
      expect(selected.language).toBe(language);
      expect(selected.stage).toBe("avatar");
      expect(sessionReducer(selected, { type: "back" }).language).toBe(language);
    },
  );
  it.each(["boy", "girl"] as const)(
    "remembers the selected %s avatar when changing language",
    (avatar) => {
      const selected = sessionReducer(initialSession, { type: "avatar", avatar });
      const switched = sessionReducer(sessionReducer(selected, { type: "back" }), {
        type: "language",
        language: "ar",
      });
      expect(switched.avatar).toBe(avatar);
    },
  );
  it("does not confirm without an avatar", () => {
    expect(sessionReducer(initialSession, { type: "confirm" }).avatarConfirmed).toBe(false);
  });
  it("confirms an actual selection and clears confirmation when changing it", () => {
    const selected = sessionReducer(initialSession, { type: "avatar", avatar: "girl" });
    const confirmed = sessionReducer(selected, { type: "confirm" });
    expect(confirmed.avatarConfirmed).toBe(true);
    expect(sessionReducer(confirmed, { type: "avatar", avatar: "boy" }).avatarConfirmed).toBe(
      false,
    );
  });
});

describe("HAMSA onboarding and symptom rules", () => {
  const named = {
    ...initialSession,
    stage: "name" as const,
    avatar: "girl" as const,
    language: "ar" as const,
    name: "  نور  ",
  };
  it("requires a nonblank name before entering the room", () => {
    expect(sessionReducer({ ...named, name: "  " }, { type: "enter-room" }).stage).toBe("name");
    expect(sessionReducer(named, { type: "enter-room" })).toMatchObject({
      stage: "room",
      name: "نور",
      avatar: "girl",
      language: "ar",
    });
  });
  it("keeps language, avatar and name when navigating backward", () => {
    const room = sessionReducer(named, { type: "enter-room" });
    const animation = sessionReducer(room, { type: "symptom", symptom: "stomach" });
    expect(sessionReducer(animation, { type: "back" })).toMatchObject({
      stage: "room",
      name: "نور",
      avatar: "girl",
      language: "ar",
    });
  });
  it.each(["yes", "no", "notSure"] as const)(
    "stores the exact %s answer and its conditional path",
    (answer) => {
      const question = { ...named, stage: "question" as const, symptom: "stomach" as const };
      const result = sessionReducer(question, { type: "answer", answer });
      expect(result.answers.stomach).toBe(answer);
      expect(result.stage).toBe(answer === "yes" ? "symptoms" : "reassurance");
      expect(sessionReducer(result, { type: "back" }).answers.stomach).toBe(answer);
    },
  );
  it("does not turn unassessed symptoms into negative answers", () => {
    const result = sessionReducer(
      { ...named, stage: "question", symptom: "stomach" },
      { type: "answer", answer: "no" },
    );
    expect(result.answers).toEqual({ stomach: "no" });
    expect(Object.hasOwn(result.answers, "vomiting")).toBe(false);
  });
  it("preserves previous answers when another symptom is explored and changed", () => {
    const state = {
      ...named,
      stage: "question" as const,
      symptom: "vomiting" as const,
      answers: { stomach: "no" as const, vomiting: "yes" as const },
    };
    const result = sessionReducer(state, { type: "answer", answer: "notSure" });
    expect(result.answers).toEqual({ stomach: "no", vomiting: "notSure" });
    expect(sessionReducer(result, { type: "replay" }).answers).toEqual(result.answers);
  });
  it("retains completed answers on done and clears them only on restart", () => {
    const state = { ...named, answers: { stomach: "yes" as const } };
    expect(sessionReducer(state, { type: "done" }).answers).toEqual({ stomach: "yes" });
    expect(sessionReducer(state, { type: "restart" })).toEqual(initialSession);
  });
});
