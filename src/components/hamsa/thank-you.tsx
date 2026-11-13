import type { Dispatch } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { HamsaSession, SessionAction } from '@/lib/hamsa-session';
import { journeyWording } from '@/lib/hamsa-wording';
import fox from '@/assets/fox-still.png.asset.json';

export function ThankYou({ session, dispatch }: { session: HamsaSession; dispatch: Dispatch<SessionAction> }) {
  const text = journeyWording(session.language, session.avatar);
  return <section className="hamsa-panel hamsa-thanks" dir={session.language === 'ar' ? 'rtl' : 'ltr'}>
    <nav className="room-navigation"><Button variant="outline" onClick={() => dispatch({ type: 'restart' })}>{text.restart}</Button><Button variant="outline" onClick={() => dispatch({ type: 'back' })}><ArrowLeft />{text.back}</Button></nav>
    <header><span>HAMSA · همسة</span><h1>{text.thanks}</h1><p>{text.thanksDetail}</p></header>
    <img src={fox.url} alt="HAMSA" />
  </section>;
}