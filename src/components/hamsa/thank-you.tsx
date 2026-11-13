import type { Dispatch } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { HamsaSession, SessionAction } from "@/lib/hamsa-session";
import { journeyWording } from "@/lib/hamsa-wording";
import { media } from "@/lib/hamsa-media";
import { summaryWording } from "@/lib/hamsa-summary";
import { SessionControls } from "./session-controls";
import { useEffect, useRef } from "react";

export function ThankYou({
  session,
  dispatch,
}: {
  session: HamsaSession;
  dispatch: Dispatch<SessionAction>;
}) {
  const text = journeyWording(session.language, session.avatar);
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    heading.current?.focus();
  }, []);
  return (
    <section className="hamsa-panel hamsa-thanks" dir={session.language === "ar" ? "rtl" : "ltr"}>
      <SessionControls
        session={session}
        dispatch={(action) => dispatch(action.type === "done" ? { type: "summary" } : action)}
      />
      <Button variant="outline" className="room-back" onClick={() => dispatch({ type: "back" })}>
        <ArrowLeft className="back-arrow" />
        {text.back}
      </Button>
      <header>
        <span>HAMSA · همسة</span>
        <h1 ref={heading} tabIndex={-1}>
          {text.thanks}
        </h1>
        <p>{text.thanksDetail}</p>
      </header>
      <img src={media.stillFox} alt="HAMSA" />
      <Button className="thanks-summary" onClick={() => dispatch({ type: "summary" })}>
        {summaryWording[session.language].view}
      </Button>
    </section>
  );
}
