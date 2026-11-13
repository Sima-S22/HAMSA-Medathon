# HAMSA reference analysis

The uploaded PDF has 79 readable pages, not approximately 100. All pages were reviewed using rendered contact sheets; first-stage screens were inspected full-size. Page order is grouped by language, avatar, and interaction state rather than a linear journey.

## Unique screens and states
- 1–2: welcome before/after Start appears; 79 repeats welcome.
- 3: shared bilingual language chooser.
- 4–5: avatar chooser in English and Arabic; same two original portraits.
- 6–13: name entry, boy/girl and EN/AR; keyboard-open states are not separate workflows.
- 14–17: interactive room / stomach-pain prompt for each avatar and language.
- 18–21: stomach-pain animation, replay/back and Continue controls.
- 22–25: stomach-pain confirmation with Yes, No, Not sure.
- 26–29: other symptoms after a positive stomach-pain answer.
- 30–33: alternate symptom chooser; 34–37: reassurance/replay states.
- 38–45: vomiting animation and confirmation, same template across language/avatar.
- 46–53: constipation animation and confirmation.
- 54–61: diarrhea animation and confirmation.
- 62–65: thank-you screen.
- 66–69: clinician summary with initial Not assessed findings.
- 70–73: summary save preview.
- 74–78: branding only on empty backgrounds; no complete ending content or navigation is supplied.

## Intended flow
Welcome → language → avatar → name → interactive room → symptom animation → confirmation → other symptoms/replay/done → thank you → clinician summary → save/end/restart.

The reference does not supply detailed symptom follow-up questions beyond confirmation, a real download implementation, or complete ending states. Do not invent medical content. Several later Arabic pages include duplicated or truncated lines; inspect full-size before implementing those phases.

## Phase 1 scope
Welcome, language, avatar, navigation, and in-memory selection only. Continue confirms the selected avatar in a minimal dismissible confirmation state because proceeding to name entry is explicitly deferred. No new journey screen, name input, medical content, accounts, persistence, or integrations.

Typography is embedded as Type3 glyphs without recoverable original font names. Nunito and Noto Sans Arabic are close available substitutes; original artwork and sampled colors are reused.