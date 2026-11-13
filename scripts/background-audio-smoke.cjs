const { chromium } = require("playwright");
const assert = require("node:assert/strict");

(async () => {
  const browser = await chromium.launch({
    ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}),
    headless: true,
    args: ["--no-sandbox", "--autoplay-policy=user-gesture-required"],
  });
  try {
    for (const scenario of [
      { language: "en", width: 1194, height: 834, blocked: false },
      { language: "ar", width: 390, height: 844, blocked: true },
    ]) {
      const context = await browser.newContext({
        viewport: { width: scenario.width, height: scenario.height },
      });
      const page = await context.newPage();
      const errors = [];
      let audioRequests = 0;
      page.setDefaultTimeout(15000);
      page.on("pageerror", (error) => errors.push(error.message));
      page.on("response", (response) => {
        if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`);
      });
      page.on("request", (request) => {
        if (request.url().endsWith("/AUDIO-2026-11-13-19-25-24.mp3")) audioRequests++;
      });
      if (scenario.blocked) {
        await page.addInitScript(() => {
          const play = HTMLMediaElement.prototype.play;
          let first = true;
          HTMLMediaElement.prototype.play = function (...args) {
            if (first) {
              first = false;
              return Promise.reject(new DOMException("Gesture required", "NotAllowedError"));
            }
            return play.apply(this, args);
          };
        });
      }
      const click = (name) => page.getByRole("button", { name, exact: true }).click();
      const ar = scenario.language === "ar";
      await page.goto(process.env.HAMSA_BASE_URL || "http://127.0.0.1:4176", {
        waitUntil: "domcontentloaded",
      });
      await page.waitForFunction(() => document.documentElement.getAttribute("dir") === "ltr");
      const initial = await page.locator("audio").evaluate((player) => ({
        paused: player.paused,
        time: player.currentTime,
        loop: player.loop,
        preload: player.preload,
      }));
      assert.deepEqual(initial, { paused: true, time: 0, loop: true, preload: "none" });
      assert.equal(audioRequests, 0, "audio is not downloaded before a gesture");
      await click("Start");
      if (scenario.blocked) {
        await page.getByRole("status").waitFor();
        assert.equal(await page.locator("audio").evaluate((player) => player.paused), true);
        await click("Turn background audio on");
      }
      await page.waitForFunction(() => {
        const player = document.querySelector("audio");
        return !player.paused && player.currentTime > 0.1 && !player.error;
      });
      await page.locator("audio").evaluate((player) => {
        window.__originalAudioPlayer = player;
      });
      assert.ok(audioRequests > 0);
      await click(ar ? "العربية" : "English");
      await click(ar ? "بنت" : "Girl");
      await click(ar ? "يلا نكمّل!" : "Continue");
      await page.locator("#child-name").fill(ar ? "تجربة نور" : "Test Noor");
      await click(ar ? "يلا نكمّل!" : "Continue");
      assert.equal(
        await page
          .locator("audio")
          .evaluate((player) => player === window.__originalAudioPlayer && !player.paused),
        true,
        "one playing element survives navigation",
      );
      const on = ar ? "تشغيل صوت الخلفية" : "Turn background audio on";
      const off = ar ? "إيقاف صوت الخلفية" : "Turn background audio off";
      await click(off);
      const pausedTime = await page.locator("audio").evaluate((player) => player.currentTime);
      await page.waitForTimeout(350);
      const paused = await page
        .locator("audio")
        .evaluate((player) => ({ time: player.currentTime, paused: player.paused }));
      assert.equal(paused.paused, true);
      assert.equal(paused.time, pausedTime);
      await click(on);
      await page.waitForFunction(
        (time) => document.querySelector("audio").currentTime > time,
        pausedTime,
      );
      await click(ar ? "بطني يوجعني" : "Stomach Pain");
      await click(ar ? "يلا نكمّل!" : "Continue");
      await click(ar ? "أيوه" : "Yes");
      // Seek to the end and verify the real recording loops, without waiting 3.5 minutes.
      const duration = await page.locator("audio").evaluate((player) => player.duration);
      assert.ok(duration > 207 && duration < 209, `valid decoded MP3 duration: ${duration}`);
      await page.locator("audio").evaluate((player) => {
        player.currentTime = player.duration - 0.2;
      });
      await page.waitForFunction(() => {
        const player = document.querySelector("audio");
        return !player.paused && player.currentTime < 3;
      });
      await click(ar ? "خلاص، انتهيت." : "I’m done");
      await click(ar ? "عرض الملخص" : "View clinical summary");
      // The fixed audio button remains outside all other visible controls.
      const overlaps = await page
        .getByRole("button", { name: off, exact: true })
        .evaluate((button) => {
          const a = button.getBoundingClientRect();
          return [...document.querySelectorAll("button")]
            .filter((other) => other !== button && other.getBoundingClientRect().width)
            .filter((other) => {
              const b = other.getBoundingClientRect();
              return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
            })
            .map((other) => other.textContent);
        });
      assert.deepEqual(overlaps, []);
      await click(ar ? "إنهاء" : "End");
      await click(ar ? "مسح الجلسة والمتابعة" : "Clear session and continue");
      await page.waitForFunction(() => {
        const player = document.querySelector("audio");
        return player.paused && player.currentTime === 0;
      });
      assert.deepEqual(errors, []);
      console.log(
        `PASS actual MP3 playback, looping, EN/AR controls, navigation, mute/resume, and end reset: ${JSON.stringify(scenario)}`,
      );
      await context.close();
    }
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
