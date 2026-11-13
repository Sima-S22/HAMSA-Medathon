import { useEffect, useRef, useState, type Dispatch } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { HamsaSession, SessionAction } from '@/lib/hamsa-session';
import { journeyWording } from '@/lib/hamsa-wording';
import boy from '@/assets/boy-avatar.png.asset.json';
import girl from '@/assets/girl-avatar.png.asset.json';

export function NameEntry({ session, dispatch }: { session: HamsaSession; dispatch: Dispatch<SessionAction> }) {
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const text = journeyWording(session.language, session.avatar);
  const arabic = session.language === 'ar';
  const rows = arabic ? ['ض ص ث ق ف غ ع ه خ ح ج د', 'ش س ي ب ل ا ت ن م ك ط', 'ئ ء ؤ ر لا ى ة و ز ظ ذ'].map(row => row.split(' ')) : ['qwertyuiop', 'asdfghjkl', 'zxcvbnm'].map(row => [...row]);
  useEffect(() => { heading.current?.focus(); }, []);
  function insert(value: string) {
    const start = input.current?.selectionStart ?? session.name.length;
    const end = input.current?.selectionEnd ?? start;
    dispatch({ type: 'name', name: session.name.slice(0, start) + value + session.name.slice(end) });
    requestAnimationFrame(() => { input.current?.focus(); input.current?.setSelectionRange(start + value.length, start + value.length); });
  }
  return <section className={`hamsa-panel hamsa-name ${keyboardOpen ? 'keyboard-open' : ''}`} dir={arabic ? 'rtl' : 'ltr'} onPointerDown={event => { if (event.target === event.currentTarget) { setKeyboardOpen(false); input.current?.blur(); } }} onKeyDown={event => { if (event.key === 'Escape') { setKeyboardOpen(false); input.current?.blur(); } }}>
    <div className="name-confetti" aria-hidden="true"><i /><i /><i /><i /></div>
    <Button variant="ghost" className="name-back" onClick={() => dispatch({ type: 'back' })}>{arabic ? <ArrowRight /> : <ArrowLeft />}{text.back}</Button>
    <header><h1 ref={heading} tabIndex={-1}>{text.nameHeading}</h1><p>{text.nameSubtitle}</p></header>
    {!keyboardOpen && <img className="name-avatar" src={session.avatar === 'girl' ? girl.url : boy.url} alt="" />}
    <form className="name-form" onSubmit={event => { event.preventDefault(); dispatch({ type: 'enter-room' }); }}>
      <label htmlFor="child-name" className={keyboardOpen ? 'name-label' : 'sr-only'}>{text.nameLabel}</label>
      <input ref={input} id="child-name" value={session.name} autoComplete="off" inputMode="text" onFocus={() => setKeyboardOpen(true)} onChange={event => dispatch({ type: 'name', name: event.target.value })} dir={arabic ? 'rtl' : 'ltr'} aria-required="true" />
      {keyboardOpen && <div className="name-keyboard">
        <p>{text.keyboardHelp}</p>
        {rows.map((row, index) => <div className="keyboard-row" dir="ltr" key={index}>{row.map(letter => <Button type="button" variant="secondary" key={letter} onPointerDown={event => event.preventDefault()} onClick={() => insert(letter)}>{letter}</Button>)}</div>)}
        <div className="keyboard-actions" dir="ltr"><Button type="button" variant="secondary" onPointerDown={event => event.preventDefault()} onClick={() => insert(' ')}>{text.space}</Button><Button type="button" variant="secondary" onPointerDown={event => event.preventDefault()} onClick={() => { dispatch({ type: 'name', name: '' }); input.current?.focus(); }}>{text.clear}</Button></div>
        <span className="name-required">{!session.name.trim() ? text.required : '\u00a0'}</span>
      </div>}
      <Button type="submit" className="name-continue" disabled={!session.name.trim()}>{text.continue}</Button>
    </form>
  </section>;
}