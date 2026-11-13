import { useEffect, useRef, useState, type Dispatch } from 'react';
import { ArrowLeft, Check, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { HamsaSession, SessionAction, Symptom, Answer } from '@/lib/hamsa-session';
import { journeyWording, symptomNames } from '@/lib/hamsa-wording';
import room from '@/assets/room.png.asset.json';
import standingBoy from '@/assets/boy-standing.png.asset.json';
import standingGirl from '@/assets/girl-standing.png.asset.json';
import stomachBoy from '@/assets/stomach-boy.gif.asset.json';
import stomachGirl from '@/assets/stomach-girl.gif.asset.json';
import vomitingBoy from '@/assets/vomiting-boy.gif.asset.json';
import vomitingGirl from '@/assets/vomiting-girl.gif.asset.json';
import constipationBoy from '@/assets/constipation-boy.gif.asset.json';
import constipationGirl from '@/assets/constipation-girl.gif.asset.json';
import diarrheaBoy from '@/assets/diarrhea-boy.gif.asset.json';
import diarrheaGirl from '@/assets/diarrhea-girl.gif.asset.json';

const animations = {
  stomach: { boy: stomachBoy, girl: stomachGirl }, vomiting: { boy: vomitingBoy, girl: vomitingGirl },
  constipation: { boy: constipationBoy, girl: constipationGirl }, diarrhea: { boy: diarrheaBoy, girl: diarrheaGirl },
};
const symbols: Record<Symptom, string> = { stomach: 'ϟ', vomiting: '🤢', constipation: '🧻', diarrhea: '🚽' };

export function SymptomRoom({ session, dispatch }: { session: HamsaSession; dispatch: Dispatch<SessionAction> }) {
  const [replay, setReplay] = useState(0);
  const heading = useRef<HTMLHeadingElement>(null);
  const arabic = session.language === 'ar';
  const text = journeyWording(session.language, session.avatar);
  const names = symptomNames[session.language];
  const avatar = session.avatar ?? 'boy';
  const isAnimation = session.stage === 'animation' && session.symptom;
  const character = isAnimation ? animations[isAnimation][avatar].url : (avatar === 'boy' ? standingBoy.url : standingGirl.url);
  useEffect(() => { heading.current?.focus(); }, [session.stage, session.symptom]);
  return <section className={`hamsa-room room-${session.stage}`} dir={arabic ? 'rtl' : 'ltr'} aria-label={arabic ? 'غرفة الأعراض' : 'Symptom room'}>
    <img className="room-background" src={room.url} alt="" />
    <nav className="room-navigation" aria-label={arabic ? 'التنقل' : 'Session navigation'}>
      <Button variant="outline" onClick={() => dispatch({ type: 'restart' })}>{text.restart}</Button>
      <Button className="room-end" onClick={() => dispatch({ type: 'done' })}>{text.end}</Button>
    </nav>
    <Button variant="outline" className="room-back" onClick={() => dispatch({ type: 'back' })}><ArrowLeft />{text.back}</Button>
    <img key={`${session.stage}-${session.symptom}-${replay}`} className={`room-character character-${avatar} ${isAnimation ? 'character-animation' : ''}`} src={character} alt={session.name} />
    {session.stage === 'room' && <>
      <div className="room-speech"><h1 ref={heading} tabIndex={-1}>{text.hamsaSays}</h1><span aria-hidden="true">▽</span></div>
      <Button className="room-stomach" onClick={() => dispatch({ type: 'symptom', symptom: 'stomach' })}><span aria-hidden="true">{symbols.stomach}</span>{text.stomachChoice}</Button>
    </>}
    {session.stage === 'animation' && session.symptom && <>
      <Button variant="outline" className="room-back-symptoms" onClick={() => dispatch({ type: 'back' })}>{text.backSymptoms}</Button>
      <div className="room-animation-label"><h1 ref={heading} tabIndex={-1}>{names[session.symptom]}</h1></div>
      <Button variant="outline" size="icon" className="room-replay" title={text.watchAgain} aria-label={text.watchAgain} onClick={() => setReplay(value => value + 1)}><RotateCcw /></Button>
      <Button className="room-continue" onClick={() => dispatch({ type: 'question' })}>{text.continue}</Button>
    </>}
    {session.stage === 'question' && session.symptom && <div className="room-question">
      <span className="room-symptom-title">{names[session.symptom]}</span>
      <h1 ref={heading} tabIndex={-1}>{text.question}</h1>
      {(['yes', 'no', 'notSure'] as Answer[]).map(answer => <Button key={answer} className={`room-answer answer-${answer}`} aria-pressed={session.answers[session.symptom ?? 'stomach'] === answer} onClick={() => dispatch({ type: 'answer', answer })}>{text[answer]}{session.answers[session.symptom ?? 'stomach'] === answer && <Check />}</Button>)}
    </div>}
    {session.stage === 'reassurance' && <div className="room-question room-reassurance">
      <h1 ref={heading} tabIndex={-1}>{text.reassurance}</h1><p>{text.reassureDetail}</p>
      <Button className="room-answer answer-yes" onClick={() => dispatch({ type: 'other-symptoms' })}>{text.otherFeelings}</Button>
      <Button className="room-answer answer-no" onClick={() => dispatch({ type: 'replay' })}>{text.watchAgain}</Button>
    </div>}
    {session.stage === 'symptoms' && <div className="room-symptom-options">
      <h1 ref={heading} tabIndex={-1}>{session.answers.stomach === 'yes' ? text.more : text.other}</h1>
      {(['vomiting', 'constipation', 'diarrhea'] as Symptom[]).map(symptom => <Button key={symptom} className={`room-symptom-choice choice-${symptom}`} onClick={() => dispatch({ type: 'symptom', symptom })}><span aria-hidden="true">{symbols[symptom]}</span>{names[symptom]}{session.answers[symptom] && <Check className="symptom-visited" aria-label={arabic ? 'تمت الإجابة' : 'Answered'} />}</Button>)}
      <Button className="room-done" onClick={() => dispatch({ type: 'done' })}>{text.done}</Button>
    </div>}
  </section>;
}