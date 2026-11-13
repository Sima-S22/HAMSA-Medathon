# Original HAMSA artwork

These files are local copies of the original assets already referenced by
`src/assets/*.asset.json` in the Lovable project. The JSON pointers remain
unchanged. No unrelated character or room artwork was substituted.

- `room-original.jpg`: embedded image object 464 from page 26 of the supplied
  79-page `HAMSA_complete_Figma_reference.pdf`. This clean original room replaces
  the visibly patched `room-layer.png` used in the previous implementation.
- `fox-room.png`: embedded image object 461 with its original transparency mask
  from the same page. The original portrait-shaped room fox is separate from
  the landscape-shaped welcome animation.
- Remaining PNG/GIF files: copied byte-for-byte from their existing Lovable
  asset URLs, with the names used by their source pointer files.

Room text, buttons, state, answers, and summary are live HTML/React components;
PDF screenshots are not used as application screens. Existing eight symptom
GIFs and the welcome fox GIF are preserved.
