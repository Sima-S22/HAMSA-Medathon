import { describe, expect, it } from 'vitest';
import { initialSession, sessionReducer } from '@/lib/hamsa-session';

describe('HAMSA Phase 1 session', () => {
  it('starts at welcome and opens language selection', () => {
    expect(initialSession.stage).toBe('welcome');
    expect(sessionReducer(initialSession, { type: 'start' }).stage).toBe('language');
  });
  it.each(['en', 'ar'] as const)('remembers selected %s language through navigation', language => {
    const selected = sessionReducer(initialSession, { type: 'language', language });
    expect(selected.language).toBe(language);
    expect(selected.stage).toBe('avatar');
    expect(sessionReducer(selected, { type: 'back' }).language).toBe(language);
  });
  it.each(['boy', 'girl'] as const)('remembers the selected %s avatar when changing language', avatar => {
    const selected = sessionReducer(initialSession, { type: 'avatar', avatar });
    const switched = sessionReducer(sessionReducer(selected, { type: 'back' }), { type: 'language', language: 'ar' });
    expect(switched.avatar).toBe(avatar);
  });
  it('does not confirm without an avatar', () => {
    expect(sessionReducer(initialSession, { type: 'confirm' }).avatarConfirmed).toBe(false);
  });
  it('confirms an actual selection and clears confirmation when changing it', () => {
    const selected = sessionReducer(initialSession, { type: 'avatar', avatar: 'girl' });
    const confirmed = sessionReducer(selected, { type: 'confirm' });
    expect(confirmed.avatarConfirmed).toBe(true);
    expect(sessionReducer(confirmed, { type: 'avatar', avatar: 'boy' }).avatarConfirmed).toBe(false);
  });
});