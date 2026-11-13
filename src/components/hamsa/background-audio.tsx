import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Language } from "@/lib/hamsa-session";

export type BackgroundAudioControls = { start: () => void };

export const BackgroundAudio = forwardRef<
  BackgroundAudioControls,
  {
    src: string;
    language: Language;
    stopped: boolean;
  }
>(function BackgroundAudio({ src, language, stopped }, ref) {
  const audio = useRef<HTMLAudioElement>(null);
  const operation = useRef(0);
  const [playing, setPlaying] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const ar = language === "ar";
  const label = playing
    ? ar
      ? "إيقاف صوت الخلفية"
      : "Turn background audio off"
    : ar
      ? "تشغيل صوت الخلفية"
      : "Turn background audio on";

  const start = useCallback(() => {
    const player = audio.current;
    if (!player) return;
    const request = ++operation.current;
    player.volume = 0.25;
    // Call play directly from Start / the sound button so iPad Safari receives
    // the user gesture. Playback failure never interrupts the child journey.
    if (player.error) player.load();
    void player
      .play()
      .then(() => {
        if (request !== operation.current) return;
        setBlocked(false);
        setPlaying(!player.paused);
      })
      .catch(() => {
        if (request !== operation.current) return;
        setPlaying(false);
        setBlocked(true);
      });
  }, []);

  useImperativeHandle(ref, () => ({ start }), [start]);
  useEffect(() => {
    if (!stopped || !audio.current) return;
    operation.current++;
    audio.current.pause();
    if (audio.current.currentTime > 0) audio.current.currentTime = 0;
    setPlaying(false);
    setBlocked(false);
  }, [stopped]);
  useEffect(() => {
    const player = audio.current;
    const playback = operation;
    return () => {
      playback.current++;
      player?.pause();
    };
  }, []);

  return (
    <div className="hamsa-background-audio" dir={ar ? "rtl" : "ltr"}>
      <audio
        ref={audio}
        src={src}
        loop
        preload="none"
        onPlaying={() => {
          setPlaying(true);
          setBlocked(false);
        }}
        onPause={() => setPlaying(false)}
        onError={() => {
          setPlaying(false);
          setBlocked(true);
        }}
      />
      <Button
        type="button"
        variant="outline"
        size="icon"
        title={label}
        aria-label={label}
        aria-pressed={playing}
        onClick={() => {
          if (playing) {
            operation.current++;
            audio.current?.pause();
            setPlaying(false);
          } else start();
        }}
      >
        {playing ? <Volume2 aria-hidden="true" /> : <VolumeX aria-hidden="true" />}
      </Button>
      {blocked && (
        <span role="status" className="audio-playback-status">
          {ar
            ? "اضغط على زر الصوت لتشغيل صوت الخلفية. يمكنك المتابعة بدون صوت."
            : "Tap the sound button to retry background audio. You can continue without sound."}
        </span>
      )}
    </div>
  );
});
