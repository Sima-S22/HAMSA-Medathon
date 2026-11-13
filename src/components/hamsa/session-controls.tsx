import { useState, type Dispatch } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import type { HamsaSession, SessionAction } from "@/lib/hamsa-session";
import { journeyWording } from "@/lib/hamsa-wording";

export function SessionControls({
  session,
  dispatch,
  restartOnly = false,
  finish = false,
}: {
  session: HamsaSession;
  dispatch: Dispatch<SessionAction>;
  restartOnly?: boolean;
  finish?: boolean;
}) {
  const [pending, setPending] = useState<"restart" | "end" | null>(null);
  const ar = session.language === "ar";
  const text = journeyWording(session.language, session.avatar);
  function restart() {
    if (session.name || Object.keys(session.answers).length) setPending("restart");
    else dispatch({ type: "restart" });
  }
  return (
    <>
      <nav className="room-navigation" aria-label={ar ? "التنقل في الجلسة" : "Session navigation"}>
        <Button variant="outline" onClick={restart}>
          {text.restart}
        </Button>
        {!restartOnly && (
          <Button
            className="room-end"
            onClick={() => (finish ? setPending("end") : dispatch({ type: "done" }))}
          >
            {text.end}
          </Button>
        )}
      </nav>
      <Dialog
        open={pending !== null}
        onOpenChange={(open) => {
          if (!open) setPending(null);
        }}
      >
        <DialogContent dir={ar ? "rtl" : "ltr"}>
          <DialogTitle>
            {pending === "end"
              ? ar
                ? "إنهاء الجلسة؟"
                : "End this session?"
              : ar
                ? "البدء من جديد؟"
                : "Start again?"}
          </DialogTitle>
          <DialogDescription>
            {ar
              ? "سيتم مسح الاسم والإجابات. احفظ الملخص أولًا إذا كنت تحتاجه."
              : "This clears the name and answers. Save the summary first if you need it."}
          </DialogDescription>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPending(null)}>
              {ar ? "إلغاء" : "Cancel"}
            </Button>
            <Button
              onClick={() => {
                if (pending) dispatch({ type: pending });
                setPending(null);
              }}
            >
              {ar ? "مسح الجلسة والمتابعة" : "Clear session and continue"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
