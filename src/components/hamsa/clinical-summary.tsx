import { useEffect, useRef, useState, type Dispatch } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { HamsaSession, SessionAction } from "@/lib/hamsa-session";
import {
  buildSummary,
  downloadBlob,
  summaryWording,
  summarySymptomNames,
} from "@/lib/hamsa-summary";
import { media } from "@/lib/hamsa-media";
import { SessionControls } from "./session-controls";

export function ClinicalSummary({
  session,
  dispatch,
}: {
  session: HamsaSession;
  dispatch: Dispatch<SessionAction>;
}) {
  const saving = session.stage === "save";
  const ar = session.language === "ar";
  const text = summaryWording[session.language];
  const summary = buildSummary(session);
  const names = summarySymptomNames[session.language];
  const heading = useRef<HTMLHeadingElement>(null);
  const [status, setStatus] = useState("");
  const [downloading, setDownloading] = useState(false);
  useEffect(() => {
    heading.current?.focus();
  }, [session.stage]);

  async function download(format: "png" | "json") {
    setStatus("");
    setDownloading(true);
    try {
      if (format === "json") {
        downloadBlob(
          new Blob([JSON.stringify(summary, null, 2)], { type: "application/json;charset=utf-8" }),
          "hamsa-summary.json",
        );
      } else {
        await document.fonts.ready;
        const canvas = document.createElement("canvas");
        canvas.width = 1400;
        canvas.height = 1100;
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Canvas unavailable");
        ctx.fillStyle = "#f6f7ff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(60, 60, 1280, 980);
        ctx.direction = ar ? "rtl" : "ltr";
        ctx.textAlign = "center";
        ctx.fillStyle = "#1f3556";
        const family = ar ? '"Noto Sans Arabic"' : "Nunito";
        ctx.font = `800 42px ${family}`;
        ctx.fillText(text.title, 700, 150, 1150);
        ctx.font = `24px ${family}`;
        ctx.fillText(text.disclaimer, 700, 220, 1150);
        ctx.font = `700 30px ${family}`;
        ctx.fillText(`${text.name}: ${session.name}`, 700, 325, 1150);
        ctx.font = `30px ${family}`;
        summary.symptoms.forEach((item, index) => {
          ctx.fillText(
            `${names[item.symptom]}: ${text[item.answer]}`,
            700,
            455 + index * 100,
            1150,
          );
        });
        ctx.font = `700 26px ${family}`;
        ctx.fillText("HAMSA · همسة", 700, 970);
        const blob = await new Promise<Blob>((resolve, reject) =>
          canvas.toBlob(
            (value) => (value ? resolve(value) : reject(new Error("PNG unavailable"))),
            "image/png",
          ),
        );
        downloadBlob(blob, "hamsa-summary.png");
      }
      setStatus(text.downloaded);
    } catch {
      setStatus(text.downloadError);
    } finally {
      setDownloading(false);
    }
  }

  return (
    <section
      className={`hamsa-panel hamsa-summary ${saving ? "summary-saving" : ""}`}
      dir={ar ? "rtl" : "ltr"}
    >
      {!saving && (
        <div className="summary-scene" aria-hidden="true">
          <img className="room-background" src={media.room} alt="" />
          <img className="room-character" src={media.standing[session.avatar ?? "boy"]} alt="" />
          <img className="room-fox" src={media.roomFox} alt="" />
        </div>
      )}
      <Button variant="outline" className="summary-back" onClick={() => dispatch({ type: "back" })}>
        <ArrowLeft className="back-arrow" />
        {saving ? text.back : text.review}
      </Button>
      {saving && (
        <h1 className="save-heading" ref={heading} tabIndex={-1}>
          {text.saveTitle}
        </h1>
      )}
      <article className="summary-card" aria-label={text.title}>
        <h1 ref={saving ? undefined : heading} tabIndex={-1}>
          {text.title}
        </h1>
        <p className="summary-disclaimer">{text.disclaimer}</p>
        <p className="summary-name">
          <strong>{text.name}:</strong> <bdi>{session.name}</bdi>
        </p>
        <dl>
          {summary.symptoms.map((item) => (
            <div className="summary-finding" key={item.symptom}>
              <dt>{names[item.symptom]}</dt>
              <dd>{text[item.answer]}</dd>
              {!saving && (
                <Button
                  variant="ghost"
                  className="summary-edit"
                  aria-label={`${text.edit}: ${names[item.symptom]}`}
                  onClick={() => dispatch({ type: "edit", symptom: item.symptom })}
                >
                  {text.edit}
                </Button>
              )}
            </div>
          ))}
        </dl>
        {!saving && (
          <div className="summary-actions">
            <Button onClick={() => dispatch({ type: "save" })}>{text.save}</Button>
            <SessionControls session={session} dispatch={dispatch} finish />
          </div>
        )}
        {saving && <span className="summary-brand">HAMSA · همسة</span>}
      </article>
      {saving && (
        <div className="summary-downloads">
          <p>{text.saveHelp}</p>
          <div>
            <Button disabled={downloading} onClick={() => void download("png")}>
              {text.png}
            </Button>
            <Button variant="outline" disabled={downloading} onClick={() => void download("json")}>
              {text.json}
            </Button>
            <Button variant="outline" onClick={() => window.print()}>
              {text.print}
            </Button>
          </div>
          <p role="status" aria-live="polite">
            {status}
          </p>
        </div>
      )}
    </section>
  );
}
