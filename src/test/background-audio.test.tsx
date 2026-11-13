import { createRef } from "react";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { BackgroundAudio, type BackgroundAudioControls } from "@/components/hamsa/background-audio";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("background audio controls", () => {
  it("waits for a user action, loops quietly, and survives journey navigation", async () => {
    const play = vi.spyOn(HTMLMediaElement.prototype, "play").mockImplementation(function (
      this: HTMLMediaElement,
    ) {
      Object.defineProperty(this, "paused", { configurable: true, value: false });
      return Promise.resolve();
    });
    vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => {});
    const controls = createRef<BackgroundAudioControls>();
    const view = render(
      <BackgroundAudio ref={controls} src="/background.mp3" language="en" stopped />,
    );
    const player = view.container.querySelector("audio")!;
    expect(play).not.toHaveBeenCalled();
    expect(player.loop).toBe(true);
    expect(player.preload).toBe("none");
    act(() => controls.current?.start());
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Turn background audio off" })).toBeInTheDocument(),
    );
    expect(player.volume).toBe(0.25);
    view.rerender(
      <BackgroundAudio ref={controls} src="/background.mp3" language="ar" stopped={false} />,
    );
    expect(view.container.querySelector("audio")).toBe(player);
    expect(play).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("button", { name: "إيقاف صوت الخلفية" })).toBeInTheDocument();
  });
  it("pauses on the sound control, and resets on restart or session end", async () => {
    vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue();
    const pause = vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => {});
    const view = render(<BackgroundAudio src="/background.mp3" language="en" stopped={false} />);
    const player = view.container.querySelector("audio")!;
    fireEvent.playing(player);
    fireEvent.click(screen.getByRole("button", { name: "Turn background audio off" }));
    expect(pause).toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Turn background audio on" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    player.currentTime = 12;
    fireEvent.playing(player);
    view.rerender(<BackgroundAudio src="/background.mp3" language="en" stopped />);
    expect(player.currentTime).toBe(0);
    expect(screen.getByRole("button", { name: "Turn background audio on" })).toBeInTheDocument();
  });
  it("handles blocked playback without affecting navigation and allows retry", async () => {
    const play = vi
      .spyOn(HTMLMediaElement.prototype, "play")
      .mockRejectedValueOnce(new DOMException("Gesture required", "NotAllowedError"))
      .mockResolvedValueOnce();
    vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => {});
    render(<BackgroundAudio src="/background.mp3" language="en" stopped={false} />);
    fireEvent.click(screen.getByRole("button", { name: "Turn background audio on" }));
    await waitFor(() =>
      expect(screen.getByRole("status")).toHaveTextContent("continue without sound"),
    );
    fireEvent.click(screen.getByRole("button", { name: "Turn background audio on" }));
    await waitFor(() => expect(screen.queryByRole("status")).not.toBeInTheDocument());
    expect(play).toHaveBeenCalledTimes(2);
  });
  it("does not show a playback warning when a session stops while play is pending", async () => {
    let rejectPlay!: (error: Error) => void;
    vi.spyOn(HTMLMediaElement.prototype, "play").mockImplementation(
      () =>
        new Promise((_, reject) => {
          rejectPlay = reject;
        }),
    );
    vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => {});
    const view = render(<BackgroundAudio src="/background.mp3" language="en" stopped={false} />);
    fireEvent.click(screen.getByRole("button", { name: "Turn background audio on" }));
    view.rerender(<BackgroundAudio src="/background.mp3" language="en" stopped />);
    await act(async () => {
      rejectPlay(new DOMException("Playback was paused", "AbortError"));
    });
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Turn background audio on" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });
});
