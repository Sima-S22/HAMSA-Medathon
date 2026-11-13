import { useReducer, useState, useEffect, useRef } from 'react';
import { ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { initialSession, sessionReducer, wording } from '@/lib/hamsa-session';
import background from '@/assets/welcome-scene.png.asset.json';
import logo from '@/assets/hamsa-logo.png.asset.json';
import fox from '@/assets/fox.gif.asset.json';
import stillFox from '@/assets/fox-still.png.asset.json';
import boy from '@/assets/boy-avatar.png.asset.json';
import girl from '@/assets/girl-avatar.png.asset.json';

function Confetti({ language = false }: { language?: boolean }) {
  return <div className={`hamsa-confetti ${language ? 'language-confetti' : ''}`} aria-hidden="true">
    <i /><i /><i /><i />
  </div>;
}

export function PhaseOne() {
  const [session, dispatch] = useReducer(sessionReducer, initialSession);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const text = wording[session.language];

  useEffect(() => {
    if (session.stage !== 'welcome') heading.current?.focus();
    document.documentElement.lang = session.stage === 'language' ? 'en' : session.language;
    return () => { document.documentElement.lang = 'en'; };
  }, [session.stage, session.language]);

  return <main className={`hamsa-app stage-${session.stage}`}>
    {session.stage === 'welcome' ? (
      <section className="hamsa-welcome" aria-label="HAMSA welcome">
        <img className="welcome-background" src={background.url} alt="" />
        <h1 className="welcome-logo"><img src={logo.url} alt="HAMSA" /></h1>
        <img className="welcome-fox animated-fox" src={fox.url} alt="HAMSA fox mascot" />
        <img className="welcome-fox still-fox" src={stillFox.url} alt="HAMSA fox mascot" />
        <Button className="hamsa-start" onClick={() => dispatch({ type: 'start' })}>Start</Button>
      </section>
    ) : session.stage === 'language' ? (
      <section className="hamsa-panel hamsa-language" aria-label="Language selection">
        <Confetti language />
        <Button variant="ghost" className="hamsa-back language-back" aria-label="Back to welcome" onClick={() => dispatch({ type: 'back' })}><ArrowRight /></Button>
        <header>
          <h1 ref={heading} tabIndex={-1} lang="ar" dir="rtl">تبغى نتكلم بأي لغة؟</h1>
          <p>Which language would you like to use?</p>
        </header>
        <div className="language-options">
          <Button variant="outline" className="language-option language-ar" lang="ar" onClick={() => dispatch({ type: 'language', language: 'ar' })}>
            <span>العربية</span><span className="language-flag" aria-hidden="true">🇸🇦</span>
          </Button>
          <Button variant="outline" className="language-option language-en" onClick={() => dispatch({ type: 'language', language: 'en' })}>
            <span className="language-flag" aria-hidden="true">🇺🇸</span><span>English</span>
          </Button>
        </div>
      </section>
    ) : (
      <section className={`hamsa-panel hamsa-avatar ${session.language === 'ar' ? 'avatar-ar' : ''}`} dir={session.language === 'ar' ? 'rtl' : 'ltr'} aria-label={text.heading}>
        <Confetti />
        <Button variant="ghost" className="hamsa-back" onClick={() => dispatch({ type: 'back' })}>{text.back}<ArrowRight /></Button>
        <header><h1 ref={heading} tabIndex={-1}>{text.heading}</h1><p>{text.subtitle}</p></header>
        <div className="avatar-options">
          {(['boy', 'girl'] as const).map(avatar => <Button key={avatar} variant="outline" className={`avatar-option avatar-${avatar} ${session.avatar === avatar ? 'is-selected' : ''}`} aria-pressed={session.avatar === avatar} onClick={() => dispatch({ type: 'avatar', avatar })}>
            <img src={avatar === 'boy' ? boy.url : girl.url} alt="" />
            <span>{text[avatar]}</span>
            {session.avatar === avatar && <Check className="avatar-check" aria-hidden="true" />}
          </Button>)}
        </div>
        <Button className="hamsa-continue" disabled={!session.avatar} onClick={() => { dispatch({ type: 'confirm' }); setConfirmationOpen(true); }}>
          {text.continue}{session.avatarConfirmed && <Check aria-hidden="true" />}
        </Button>
        <Dialog open={confirmationOpen} onOpenChange={setConfirmationOpen}>
          <DialogContent className="avatar-confirmation" aria-describedby={undefined}>
            {session.avatar && <><img src={session.avatar === 'boy' ? boy.url : girl.url} alt="" /><DialogTitle>{text[session.avatar]}</DialogTitle><Check className="confirmation-check" aria-label={session.language === 'ar' ? 'تم اختيار الشخصية' : 'Character selected'} /></>}
          </DialogContent>
        </Dialog>
      </section>
    )}
  </main>;
}