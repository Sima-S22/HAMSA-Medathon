import { useReducer, useEffect, useRef } from "react";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NameEntry } from "./name-entry";
import { SymptomRoom } from "./symptom-room";
import { ThankYou } from "./thank-you";
import { initialSession, sessionReducer, wording } from "@/lib/hamsa-session";
import { media } from "@/lib/hamsa-media";
import { ClinicalSummary } from "./clinical-summary";
import { SessionControls } from "./session-controls";

function Confetti({ language = false }: { language?: boolean }) {
  return (
    <div className={`hamsa-confetti ${language ? "language-confetti" : ""}`} aria-hidden="true">
      <i />
      <i />
      <i />
      <i />
    </div>
  );
}

export function PhaseOne() {
  const [session, dispatch] = useReducer(sessionReducer, initialSession);
  const heading = useRef<HTMLHeadingElement>(null);
  const text = wording[session.language];

  useEffect(() => {
    if (session.stage !== "welcome") heading.current?.focus();
    document.documentElement.lang = session.stage === "language" ? "en" : session.language;
    document.documentElement.dir =
      session.language === "ar" && session.stage !== "language" ? "rtl" : "ltr";
    return () => {
      document.documentElement.lang = "en";
      document.documentElement.dir = "ltr";
    };
  }, [session.stage, session.language]);

  return (
    <main className={`hamsa-app stage-${session.stage}`}>
      {session.stage === "welcome" ? (
        <section className="hamsa-welcome" aria-label="HAMSA welcome">
          <img className="welcome-background" src={media.welcome} alt="" />
          <h1 className="welcome-logo">
            <img src={media.logo} alt="HAMSA" />
          </h1>
          <img className="welcome-fox animated-fox" src={media.fox} alt="HAMSA fox mascot" />
          <img className="welcome-fox still-fox" src={media.stillFox} alt="HAMSA fox mascot" />
          <Button className="hamsa-start" onClick={() => dispatch({ type: "start" })}>
            Start
          </Button>
        </section>
      ) : session.stage === "language" ? (
        <section className="hamsa-panel hamsa-language" aria-label="Language selection">
          <Confetti language />
          <Button
            variant="ghost"
            className="hamsa-back language-back"
            aria-label="Back to welcome"
            onClick={() => dispatch({ type: "back" })}
          >
            <ArrowRight />
          </Button>
          <header>
            <h1 ref={heading} tabIndex={-1} lang="ar" dir="rtl">
              تبغى نتكلم بأي لغة؟
            </h1>
            <p>Which language would you like to use?</p>
          </header>
          <div className="language-options">
            <Button
              variant="outline"
              className="language-option language-ar"
              lang="ar"
              onClick={() => dispatch({ type: "language", language: "ar" })}
            >
              <span>العربية</span>
              <span className="language-flag" aria-hidden="true">
                🇸🇦
              </span>
            </Button>
            <Button
              variant="outline"
              className="language-option language-en"
              onClick={() => dispatch({ type: "language", language: "en" })}
            >
              <span className="language-flag" aria-hidden="true">
                🇺🇸
              </span>
              <span>English</span>
            </Button>
          </div>
        </section>
      ) : session.stage === "summary" || session.stage === "save" ? (
        <ClinicalSummary session={session} dispatch={dispatch} />
      ) : session.stage === "ended" ? (
        <section
          className="hamsa-panel hamsa-ended"
          dir={session.language === "ar" ? "rtl" : "ltr"}
        >
          <span>HAMSA · همسة</span>
          <h1 tabIndex={-1} ref={heading}>
            {session.language === "ar" ? "انتهت الجلسة" : "Session ended"}
          </h1>
          <p>
            {session.language === "ar"
              ? "تم مسح الاسم والإجابات من هذه الجلسة."
              : "The name and answers have been cleared from this session."}
          </p>
          <SessionControls session={session} dispatch={dispatch} restartOnly />
        </section>
      ) : session.stage === "name" ? (
        <NameEntry session={session} dispatch={dispatch} />
      ) : session.stage === "thanks" ? (
        <ThankYou session={session} dispatch={dispatch} />
      ) : session.stage !== "avatar" ? (
        <SymptomRoom session={session} dispatch={dispatch} />
      ) : (
        <section
          className={`hamsa-panel hamsa-avatar ${session.language === "ar" ? "avatar-ar" : ""}`}
          dir={session.language === "ar" ? "rtl" : "ltr"}
          aria-label={text.heading}
        >
          <Confetti />
          <Button variant="ghost" className="hamsa-back" onClick={() => dispatch({ type: "back" })}>
            {text.back}
            <ArrowRight />
          </Button>
          <header>
            <h1 ref={heading} tabIndex={-1}>
              {text.heading}
            </h1>
            <p>{text.subtitle}</p>
          </header>
          <div className="avatar-options">
            {(["boy", "girl"] as const).map((avatar) => (
              <Button
                key={avatar}
                variant="outline"
                className={`avatar-option avatar-${avatar} ${session.avatar === avatar ? "is-selected" : ""}`}
                aria-pressed={session.avatar === avatar}
                onClick={() => dispatch({ type: "avatar", avatar })}
              >
                <img src={media.portrait[avatar]} alt="" />
                <span>{text[avatar]}</span>
                {session.avatar === avatar && <Check className="avatar-check" aria-hidden="true" />}
              </Button>
            ))}
          </div>
          <Button
            className="hamsa-continue"
            disabled={!session.avatar}
            onClick={() => dispatch({ type: "confirm" })}
          >
            {text.continue}
            {session.avatarConfirmed && <Check aria-hidden="true" />}
          </Button>
        </section>
      )}
    </main>
  );
}
