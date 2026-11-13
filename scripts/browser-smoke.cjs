const { chromium } = require("playwright");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const artifacts = path.resolve(process.env.HAMSA_ARTIFACTS_DIR || "work/browser-smoke");
fs.mkdirSync(artifacts, { recursive: true });
(async () => {
  const browser = await chromium.launch({
    ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}),
    headless: true,
    args: ["--no-sandbox"],
  });
  const errors = [];
  for (const scenario of [
    { lang: "en", avatar: "boy", w: 1194, h: 834 },
    { lang: "ar", avatar: "girl", w: 1194, h: 834 },
    { lang: "ar", avatar: "boy", w: 1180, h: 820 },
    { lang: "en", avatar: "girl", w: 1366, h: 768 },
    { lang: "en", avatar: "boy", w: 390, h: 844 },
  ]) {
    const ar = scenario.lang === "ar";
    const ctx = await browser.newContext({
      viewport: { width: scenario.w, height: scenario.h },
      acceptDownloads: true,
    });
    const p = await ctx.newPage();
    p.setDefaultTimeout(10000);
    p.on("pageerror", (e) => errors.push(e.message));
    p.on("response", (r) => {
      if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`);
    });
    const click = async (name) => p.getByRole("button", { name, exact: true }).click();
    const shot = async (name) =>
      p.screenshot({
        path: `${artifacts}/${scenario.lang}-${scenario.avatar}-${scenario.w}-${name}.png`,
        fullPage: true,
      });
    const bounds = async () => {
      const bad = await p.getByRole("button").evaluateAll((nodes) =>
        nodes
          .filter((n) => {
            const s = getComputedStyle(n);
            return (
              s.display !== "none" &&
              s.visibility !== "hidden" &&
              n.getBoundingClientRect().width > 0
            );
          })
          .filter((n) => {
            let r = n.getBoundingClientRect();
            return r.x < -1 || r.right > innerWidth + 1;
          })
          .map((n) => n.innerText),
      );
      assert.deepEqual(bad, [], "horizontal button overflow");
    };
    await p.goto(process.env.HAMSA_BASE_URL || "http://localhost:8080", {
      waitUntil: "domcontentloaded",
    });
    await p.waitForFunction(() => document.documentElement.getAttribute("dir") === "ltr");
    await click("Start");
    await click(ar ? "العربية" : "English");
    await click(
      ar
        ? scenario.avatar === "girl"
          ? "بنت"
          : "ولد"
        : scenario.avatar === "girl"
          ? "Girl"
          : "Boy",
    );
    await click(ar ? "يلا نكمّل!" : "Continue");
    const input = p.locator("#child-name");
    await input.click();
    await input.fill(ar ? "تجربة نور" : "Test Noor");
    await shot("keyboard");
    await bounds();
    await click(ar ? "يلا نكمّل!" : "Continue");
    await shot("room");
    await bounds();
    await click(ar ? "بطني يوجعني" : "Stomach Pain");
    await p
      .getByRole("button", { name: ar ? "أشوفها مرة ثانية." : "Watch again", exact: true })
      .click();
    await click(ar ? "يلا نكمّل!" : "Continue");
    await click(ar ? "أيوه" : "Yes");
    await shot("symptoms");
    await bounds();
    for (const [symptom, answer] of [
      ["vomiting", "no"],
      ["constipation", "notSure"],
      ["diarrhea", "yes"],
    ]) {
      const names = {
        vomiting: ar ? "أرجّع" : "Vomiting",
        constipation: ar ? "عندي إمساك" : "Constipation",
        diarrhea: ar ? "عندي إسهال" : "Diarrhea",
      };
      await click(names[symptom]);
      await click(ar ? "يلا نكمّل!" : "Continue");
      const answers = {
        no: ar ? "لا" : "No",
        notSure: ar ? (scenario.avatar === "girl" ? "مو متأكدة" : "مو متأكد") : "Not sure",
        yes: ar ? "أيوه" : "Yes",
      };
      await click(answers[answer]);
      if (answer !== "yes") await click(ar ? "شعور ثاني" : "Other feelings");
    }
    await click(ar ? "خلاص، انتهيت." : "I’m done");
    await click(ar ? "عرض الملخص" : "View clinical summary");
    await shot("summary");
    await bounds();
    assert.equal(await p.locator("html").getAttribute("dir"), ar ? "rtl" : "ltr");
    const initial = await p.locator("dd").allTextContents();
    assert.equal(initial.length, 4);
    // Edit stomach pain through the report and verify the conditional No route.
    await click(`${ar ? "تغيير الإجابة" : "Change answer"}: ${ar ? "ألم البطن" : "Stomach pain"}`);
    await click(ar ? "لا" : "No");
    await click(ar ? "إنهاء" : "End");
    await click(ar ? "عرض الملخص" : "View clinical summary");
    await click(ar ? "حفظ" : "Save");
    await shot("save");
    await bounds();
    const jsonPromise = p.waitForEvent("download");
    await click(ar ? "تنزيل ملف JSON" : "Download JSON");
    const jsonDownload = await jsonPromise;
    const jp = await jsonDownload.path();
    const report = JSON.parse(fs.readFileSync(jp, "utf8"));
    assert.deepEqual(
      report.symptoms.map((x) => x.answer),
      ["no", "no", "notSure", "yes"],
    );
    assert.equal(report.childName, ar ? "تجربة نور" : "Test Noor");
    assert.equal(report.isDiagnosis, false);
    const pngPromise = p.waitForEvent("download");
    await click(ar ? "تنزيل صورة PNG" : "Download PNG");
    const png = await pngPromise;
    const pngPath = await png.path();
    const pngBytes = fs.readFileSync(pngPath);
    assert.equal(pngBytes.subarray(1, 4).toString(), "PNG");
    fs.copyFileSync(pngPath, `${artifacts}/export-${scenario.lang}-${scenario.w}.png`);
    await p.emulateMedia({ media: "print" });
    await p.pdf({ path: `${artifacts}/print-${scenario.lang}-${scenario.w}.pdf` });
    await p.emulateMedia({ media: "screen" });
    await click(ar ? "العودة إلى الملخص" : "Back to summary");
    await click(ar ? "إنهاء" : "End");
    await click(ar ? "إلغاء" : "Cancel");
    await click(ar ? "إنهاء" : "End");
    await click(ar ? "مسح الجلسة والمتابعة" : "Clear session and continue");
    assert.ok(
      (await p.getByRole("heading").allTextContents()).includes(
        ar ? "انتهت الجلسة" : "Session ended",
      ),
    );
    await click(ar ? "البدء من جديد" : "Restart");
    await click("Start");
    await click("English");
    await click("Boy");
    await click("Continue");
    assert.equal(await p.locator("#child-name").inputValue(), "");
    const broken = await p
      .locator("img")
      .evaluateAll((imgs) =>
        imgs.filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.src),
      );
    assert.deepEqual(broken, []);
    await p.reload({ waitUntil: "domcontentloaded" });
    await p.waitForFunction(() => document.documentElement.getAttribute("dir") === "ltr");
    assert.equal(await p.getByRole("button", { name: "Start", exact: true }).count(), 1);
    console.log("PASS", JSON.stringify(scenario));
    await ctx.close();
  }
  assert.deepEqual(errors, []);
  await browser.close();
  console.log("All browser journeys and exports passed; no runtime or HTTP errors.");
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
