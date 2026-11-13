# HAMSA MVP implementation and reference review

## Reference and existing implementation

Reviewed the repository's source, routes, styles, configuration, tests and
Lovable documentation before implementation. Reviewed all 79 PDF pages using
rendered contact sheets, extracted text and enlarged representative screens.
The supplied PDF contains 79 pages, rather than approximately 100. Its content
is reference material; this implementation follows the current user request.
Earlier phase-only scope in `.lovable/reference-map.md` and `roadmap.md` is
historical, not the scope of this completion.

| PDF pages | Reusable screen / interaction states                    | Before this PR       | This PR                                                                             |
| --------- | ------------------------------------------------------- | -------------------- | ----------------------------------------------------------------------------------- |
| 1–2, 79   | Welcome / Start visible                                 | Working              | Preserved with locally served original artwork                                      |
| 3         | Bilingual language chooser                              | Working              | Preserved; corrected navigation history                                             |
| 4–5       | Avatar chooser                                          | Working              | Preserved across backward navigation                                                |
| 6–13      | Name entry, EN/AR, avatar, keyboard open/closed         | Working basic input  | Adds virtual backspace, bounded input, fixes RTL keyboard overflow                  |
| 14–17     | Room / stomach pain object                              | Working button       | Clean original room asset and original fox; preserved interaction                   |
| 18–25     | Stomach animation and Yes/No/Not sure                   | Implemented          | Fixes stage/card CSS collision that blocked answer taps                             |
| 26–37     | Other symptoms and reassurance / replay                 | Implemented          | Preserved; context-sensitive heading and answer review                              |
| 38–61     | Vomiting, constipation, diarrhea animation/confirmation | Implemented          | Preserved all 8 avatar GIFs; direct Back to symptoms works independently of history |
| 62–65     | Thank you / summary CTA                                 | Thank you only       | Working clinician summary CTA                                                       |
| 66–69     | Clinician summary                                       | Missing              | Name, all four exact responses, unassessed findings, answer editing                 |
| 70–73     | Summary save preview                                    | Missing              | Live preview, PNG, structured JSON, print/PDF                                       |
| 74–78     | Branding on empty backgrounds                           | No functional ending | Minimal branded ending, explicit clearing and restart                               |

Avatar, language, keyboard visibility, selected answer and replay are states of
reusable screens; they are not separate duplicated pages. The designs show one
room environment, a stomach-pain selection button and three subsequent symptom
cards. They do not supply other room environments or object-specific clinical
questions. These were not invented.

## End-to-end behavior

Welcome → language → avatar → name → room → animation → confirmation.
Yes opens the symptom chooser; No / Not sure opens reassurance with other
feelings or replay. Children may revisit symptoms, go backward and change their
answers. Done / End from a room retains responses and opens thank you, then the
summary. Unvisited or merely watched symptoms remain **Not assessed**, never No.
Summary editing opens the existing confirmation question. Back restores screen
location without undoing responses; later answers replace earlier ones.

The summary is explicitly child-reported and not a diagnosis. JSON schema v1
includes source, `isDiagnosis: false`, name, language, avatar, and four symptom
records (`yes`, `no`, `notSure`, or `notAssessed`). No inference, diagnosis,
treatment, additional medical questions or symptom narrative fields were added.
The PDF's text-input field is the child's name/nickname.

Save opens a live preview. PNG uses native canvas and local fonts; JSON uses a
Blob download; print CSS provides a report-only view for browser print / Save as
PDF. The OS/browser handles the actual file destination. Names are not included
in filenames. Download failures are reported in the UI.

## Data and dependencies

Session data remains in React reducer memory, consistent with `AGENTS.md`.
Reloading resets it. No accounts, backend, persistent browser storage, paid
services or AI APIs were introduced. Restart and final End require confirmation
before clearing name, avatar, answers and history. Browser Back cannot restore
cleared reducer data. Exported files are intentionally persistent copies selected
by the user; there is no automatic upload of the report.

Original pointer JSON files are retained. Local asset copies remove dependency
on Lovable's `/__l5e` gateway for development and hosting. The room and room fox
were extracted from original embedded PDF images, not redrawn. Fonts remain the
existing Nunito and Noto Sans Arabic substitutes, now locally served with their
SIL Open Font Licenses. Exact original font names cannot be recovered from the
PDF's Type3 glyphs. No runtime dependencies were added.

## Verification

- `npm test`: 23 tests, including bilingual rendered journeys, conditional
  responses, uncertainty/unassessed distinction, answer revision, export
  navigation, confirmation cancellation and clearing.
- `npm run typecheck`: TypeScript.
- `npm run lint`: zero errors; six existing shared-UI Fast Refresh warnings.
  The baseline had 309 Prettier errors; formatting the touched application and
  test files resolves those without changing shared UI components.
- `npm run build`: production client / SSR build.
- Chromium browser smoke: English/boy and Arabic/girl at 1194×834,
  Arabic/boy at 1180×820, English/girl at 1366×768, English/boy at 390×844.
  Exercises all four symptoms, all answer types, replay, report editing,
  PNG and JSON downloads, print rendering, cancel/end/restart and reload reset.
  Checks JSON content, PNG signature, horizontal control overflow, runtime
  errors and HTTP errors. See `scripts/browser-smoke.cjs`.

### Reproduce browser verification

Start `npm run dev` in one terminal. In another, install the optional browser
verification tool without adding it to app dependencies:

```sh
npm install --no-save --package-lock=false playwright
npx playwright install chromium
npm run test:browser
```

For an existing Chromium installation, set `CHROMIUM_PATH=/usr/bin/chromium`.
`HAMSA_BASE_URL` overrides `http://localhost:8080`; `HAMSA_ARTIFACTS_DIR` overrides
the ignored `work/browser-smoke` output folder. All test names are fictional.

## Limits / missing design content

- No detailed medical follow-up questions beyond the supplied confirmation and
  symptom choices exist in the reference. No other rooms or ending interaction
  designs are supplied; the ending is a minimal operational extension.
- The PDF has duplicated/truncated Arabic lines and blank branded ending pages.
  Existing coherent bilingual wording is reused instead of duplicating errors.
- Exact original font files and higher-resolution versions of some portraits
  are unavailable. All referenced character/room/animation assets are present.
- Browser tests emulate iPad dimensions in Chromium. Physical iPad Safari,
  native keyboard behavior, and its download/share dialogs still need device
  testing. This is a hackathon communication prototype, not a clinical system.
