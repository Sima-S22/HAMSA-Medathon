# HAMSA MVP

- [x] Inspect the existing repository and review all 79 reference PDF pages.
- [x] Map unique screens separately from language, avatar and keyboard states.
- [x] Preserve welcome, language selection, avatar selection and original artwork.
- [x] Complete name input, physical/on-screen keyboard, backspace and backward navigation.
- [x] Preserve language, avatar, name and symptom responses in reducer memory.
- [x] Serve original media locally; use clean embedded room and room-fox artwork.
- [x] Connect stomach pain, vomiting, constipation and diarrhea animations and confirmations.
- [x] Preserve conditional Yes / No / Not sure, reassurance, replay and other-symptom paths.
- [x] Fix question-stage CSS collision, RTL keyboard layout and direct symptom navigation.
- [x] Complete thank you, editable clinician summary, save preview and final ending.
- [x] Export actual responses as PNG / JSON and provide report-only print/PDF styling.
- [x] Require confirmation before clearing a session; support restart and reload reset.
- [x] Verify bilingual rendered journeys and Chromium tablet/laptop/mobile journeys.

## Reference boundaries and remaining validation

- The reference supplies no detailed clinical follow-up questions beyond symptom
  confirmation and other-symptom choices; none were invented.
- It supplies one room environment and incomplete branded ending states. The
  ending uses a minimal functional extension, documented in `docs/mvp-review.md`.
- Original font names/files are unavailable. Existing Nunito and Noto Sans Arabic
  substitutes are bundled locally with their licenses.
- Physical iPad Safari, native keyboard and download/share behavior need device
  validation. Chromium dimensions are emulated, not physical hardware results.

See `docs/mvp-review.md` for the before/after page map, data handling, export
schema, checks and reproducible browser verification commands.
