import { useEffect, useRef, useState, type Dispatch } from "react";
import { ArrowLeft, Check, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { HamsaSession, SessionAction, Symptom, Answer } from "@/lib/hamsa-session";
import { journeyWording, symptomNames } from "@/lib/hamsa-wording";
import { media } from "@/lib/hamsa-media";
import { SessionControls } from "./session-controls";

export function SymptomRoom({
  session,
  dispatch,
}: {
  session: HamsaSession;
  dispatch: Dispatch<SessionAction>;
}) {
  const [replay, setReplay] = useState(0);
  const heading = useRef<HTMLHeadingElement>(null);
  const arabic = session.language === "ar";
  const text = journeyWording(session.language, session.avatar);
  const names = symptomNames[session.language];
  const avatar = session.avatar ?? "boy";
  const isAnimation = session.stage === "animation" && session.symptom;
  const character = isAnimation ? media.animation[isAnimation][avatar] : media.standing[avatar];
  useEffect(() => {
    heading.current?.focus();
  }, [session.stage, session.symptom]);
  return (
    <section
      className={`hamsa-room room-stage-${session.stage}`}
      dir={arabic ? "rtl" : "ltr"}
      aria-label={arabic ? "غرفة الأعراض" : "Symptom room"}
    >
      <img className="room-background" src={media.room} alt="" />
      <SessionControls session={session} dispatch={dispatch} />
      <Button variant="outline" className="room-back" onClick={() => dispatch({ type: "back" })}>
        <ArrowLeft className="back-arrow" />
        {text.back}
      </Button>
      <img
        key={`${session.stage}-${session.symptom}-${replay}`}
        className={`room-character character-${avatar} ${isAnimation ? "character-animation" : ""}`}
        src={character}
        alt={session.name}
      />
      <img className="room-fox" src={media.roomFox} alt="HAMSA" />
      {session.stage === "room" && (
        <>
          <div className="room-speech">
            <h1 ref={heading} tabIndex={-1}>
              {text.hamsaSays}
            </h1>
            <span aria-hidden="true">▽</span>
          </div>
          <Button
            className="room-stomach"
            onClick={() => dispatch({ type: "symptom", symptom: "stomach" })}
          >
            <span aria-hidden="true">
              <SymptomIcon symptom="stomach" />
            </span>
            {text.stomachChoice}
          </Button>
        </>
      )}
      {session.stage === "animation" && session.symptom && (
        <>
          <Button
            variant="outline"
            className="room-back-symptoms"
            onClick={() => dispatch({ type: "other-symptoms" })}
          >
            {text.backSymptoms}
          </Button>
          <div className="room-animation-label">
            <h1 ref={heading} tabIndex={-1}>
              {names[session.symptom]}
            </h1>
          </div>
          <Button
            variant="outline"
            size="icon"
            className="room-replay"
            title={text.watchAgain}
            aria-label={text.watchAgain}
            onClick={() => setReplay((value) => value + 1)}
          >
            <RotateCcw />
          </Button>
          <Button className="room-continue" onClick={() => dispatch({ type: "question" })}>
            {text.continue}
          </Button>
        </>
      )}
      {session.stage === "question" && session.symptom && (
        <div className="room-question">
          <span className="room-symptom-title">{names[session.symptom]}</span>
          <h1 ref={heading} tabIndex={-1}>
            {text.question}
          </h1>
          {(["yes", "no", "notSure"] as Answer[]).map((answer) => (
            <Button
              key={answer}
              className={`room-answer answer-${answer}`}
              aria-pressed={session.answers[session.symptom ?? "stomach"] === answer}
              onClick={() => dispatch({ type: "answer", answer })}
            >
              {text[answer]}
              {session.answers[session.symptom ?? "stomach"] === answer && <Check />}
            </Button>
          ))}
        </div>
      )}
      {session.stage === "reassurance" && (
        <div className="room-question room-reassurance">
          <h1 ref={heading} tabIndex={-1}>
            {text.reassurance}
          </h1>
          <p>{text.reassureDetail}</p>
          <Button
            className="room-answer answer-yes"
            onClick={() => dispatch({ type: "other-symptoms" })}
          >
            {text.otherFeelings}
          </Button>
          <Button className="room-answer answer-no" onClick={() => dispatch({ type: "replay" })}>
            {text.watchAgain}
          </Button>
        </div>
      )}
      {session.stage === "symptoms" && (
        <div className="room-symptom-options">
          <h1 ref={heading} tabIndex={-1}>
            {session.symptom === "stomach" && session.answers.stomach === "yes"
              ? text.more
              : text.other}
          </h1>
          {(["vomiting", "constipation", "diarrhea"] as Symptom[]).map((symptom) => (
            <Button
              key={symptom}
              className={`room-symptom-choice choice-${symptom}`}
              onClick={() => dispatch({ type: "symptom", symptom })}
            >
              <span aria-hidden="true">
                <SymptomIcon symptom={symptom} />
              </span>
              {names[symptom]}
              {session.answers[symptom] && (
                <Check
                  className="symptom-visited"
                  aria-label={arabic ? "تمت الإجابة" : "Answered"}
                />
              )}
            </Button>
          ))}
          <Button
            variant="outline"
            className="room-review"
            onClick={() => dispatch({ type: "summary" })}
          >
            {arabic ? "مراجعة الإجابات" : "Review answers"}
          </Button>
          <Button className="room-done" onClick={() => dispatch({ type: "done" })}>
            {text.done}
          </Button>
        </div>
      )}
    </section>
  );
}
// Reference-style selection symbols; original characters and room artwork stay unchanged.
function SymptomIcon({ symptom }: { symptom: Symptom }) {
  if (symptom === "stomach")
    return (
      <svg viewBox="0 0 32 32" aria-hidden="true">
        <path d="M18 2 8 18h8l-2 12 11-18h-9z" fill="currentColor" />
      </svg>
    );
  const icons = { vomiting: "🤢", constipation: "🧻", diarrhea: "🚽" };
  return <span aria-hidden="true">{icons[symptom]}</span>;
}
