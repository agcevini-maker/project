// Traste: lógica principal de la app
import "./styles.css";

/* ---------- Datos básicos ---------- */
const NOTES=['C','C#','D','Eb','E','F','F#','G','Ab','A','Bb','B'];
const LAT=['Do','Do#','Re','Mib','Mi','Fa','Fa#','Sol','Lab','La','Sib','Si'];
const OPEN=[40,45,50,55,59,64]; // E2 A2 D3 G3 B3 E4 (índice 0 = 6ª cuerda)
const STR_NAMES=['6ª','5ª','4ª','3ª','2ª','1ª'];
const DEG={0:'1',1:'b2',2:'2',3:'b3',4:'3',5:'4',6:'b5',7:'5',8:'b6',9:'6',10:'b7',11:'7'};
const pc=m=>((m%12)+12)%12;
const store={
  get(k,d){try{const v=localStorage.getItem('traste:'+k);return v==null?d:JSON.parse(v)}catch(e){return d}},
  set(k,v){try{localStorage.setItem('traste:'+k,JSON.stringify(v))}catch(e){}}
};

/* ---------- Acordes ---------- */
// f: trastes de 6ª a 1ª (x = no se toca); fi: dedos
const CHORDS=[
 {id:'C',n:'C',es:'Do mayor',cat:'Mayores',f:'x32010',fi:'x32010'},
 {id:'D',n:'D',es:'Re mayor',cat:'Mayores',f:'xx0232',fi:'xx0132'},
 {id:'E',n:'E',es:'Mi mayor',cat:'Mayores',f:'022100',fi:'023100'},
 {id:'F',n:'F',es:'Fa mayor (fácil)',cat:'Mayores',f:'xx3211',fi:'xx3211',barre:1},
 {id:'G',n:'G',es:'Sol mayor',cat:'Mayores',f:'320003',fi:'210003'},
 {id:'A',n:'A',es:'La mayor',cat:'Mayores',f:'x02220',fi:'x01230'},
 {id:'Am',n:'Am',es:'La menor',cat:'Menores',f:'x02210',fi:'x02310'},
 {id:'Dm',n:'Dm',es:'Re menor',cat:'Menores',f:'xx0231',fi:'xx0231'},
 {id:'Em',n:'Em',es:'Mi menor',cat:'Menores',f:'022000',fi:'023000'},
 {id:'A7',n:'A7',es:'La séptima',cat:'Séptimas',f:'x02020',fi:'x02030'},
 {id:'B7',n:'B7',es:'Si séptima',cat:'Séptimas',f:'x21202',fi:'x21304'},
 {id:'C7',n:'C7',es:'Do séptima',cat:'Séptimas',f:'x32310',fi:'x32410'},
 {id:'D7',n:'D7',es:'Re séptima',cat:'Séptimas',f:'xx0212',fi:'xx0213'},
 {id:'E7',n:'E7',es:'Mi séptima',cat:'Séptimas',f:'020100',fi:'020100'},
 {id:'G7',n:'G7',es:'Sol séptima',cat:'Séptimas',f:'320001',fi:'320001'},
 {id:'Cmaj7',n:'Cmaj7',es:'Do mayor 7',cat:'Color',f:'x32000',fi:'x32000'},
 {id:'Fmaj7',n:'Fmaj7',es:'Fa mayor 7',cat:'Color',f:'xx3210',fi:'xx3210'},
 {id:'Amaj7',n:'Amaj7',es:'La mayor 7',cat:'Color',f:'x02120',fi:'x02130'},
 {id:'Am7',n:'Am7',es:'La menor 7',cat:'Color',f:'x02010',fi:'x02010'},
 {id:'Em7',n:'Em7',es:'Mi menor 7',cat:'Color',f:'020000',fi:'020000'},
 {id:'Dm7',n:'Dm7',es:'Re menor 7',cat:'Color',f:'xx0211',fi:'xx0211',barre:1},
 {id:'Dsus2',n:'Dsus2',es:'Re sus2',cat:'Color',f:'xx0230',fi:'xx0130'},
 {id:'Dsus4',n:'Dsus4',es:'Re sus4',cat:'Color',f:'xx0233',fi:'xx0134'},
 {id:'Asus2',n:'Asus2',es:'La sus2',cat:'Color',f:'x02200',fi:'x01200'},
 {id:'Asus4',n:'Asus4',es:'La sus4',cat:'Color',f:'x02230',fi:'x01230'},
 {id:'Esus4',n:'Esus4',es:'Mi sus4',cat:'Color',f:'022200',fi:'023400'},
 {id:'Fbar',n:'F',es:'Fa mayor (cejilla)',cat:'Cejilla',f:'133211',fi:'134211',barre:1},
 {id:'Fm',n:'Fm',es:'Fa menor',cat:'Cejilla',f:'133111',fi:'134111',barre:1},
 {id:'Bb',n:'Bb',es:'Si bemol mayor',cat:'Cejilla',f:'x13331',fi:'x12341',barre:1},
 {id:'B',n:'B',es:'Si mayor',cat:'Cejilla',f:'x24442',fi:'x12341',barre:2},
 {id:'Bm',n:'Bm',es:'Si menor',cat:'Cejilla',f:'x24432',fi:'x13421',barre:2},
 {id:'F#m',n:'F#m',es:'Fa# menor',cat:'Cejilla',f:'244222',fi:'134111',barre:2},
 {id:'Cm',n:'Cm',es:'Do menor',cat:'Cejilla',f:'x35543',fi:'x13421',barre:3},
 {id:'Gm',n:'Gm',es:'Sol menor',cat:'Cejilla',f:'355333',fi:'134111',barre:3},
 {id:'E5',n:'E5',es:'Mi quinta',cat:'Power chords',f:'022xxx',fi:'012xxx'},
 {id:'A5',n:'A5',es:'La quinta',cat:'Power chords',f:'x022xx',fi:'x012xx'},
 {id:'G5',n:'G5',es:'Sol quinta',cat:'Power chords',f:'355xxx',fi:'134xxx'},
 {id:'C5',n:'C5',es:'Do quinta',cat:'Power chords',f:'x355xx',fi:'x134xx'},
 {id:'D5',n:'D5',es:'Re quinta',cat:'Power chords',f:'x577xx',fi:'x134xx'}
];
CHORDS.forEach(c=>{c.frets=[...c.f].map(ch=>ch==='x'?-1:parseInt(ch,10));c.fing=[...c.fi].map(ch=>ch==='x'?0:parseInt(ch,10))});
const byId=Object.fromEntries(CHORDS.map(c=>[c.id,c]));
function chordNotes(c){const s=[];c.frets.forEach((f,i)=>{if(f>=0){const p=pc(OPEN[i]+f);if(!s.includes(p))s.push(p)}});return s}

/* ---------- Audio (síntesis de cuerda pulsada) ---------- */
let ctx=null,master=null;const bufCache={};const active=[null,null,null,null,null,null];
function ac(){
  if(!ctx){const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return null;ctx=new AC();master=ctx.createGain();master.gain.value=.55;const lp=ctx.createBiquadFilter();lp.type='lowpass';lp.frequency.value=4200;master.connect(lp);lp.connect(ctx.destination)}
  if(ctx.state==='suspended')ctx.resume();return ctx;
}
function stringBuf(midi){
  if(bufCache[midi])return bufCache[midi];
  const sr=ctx.sampleRate,freq=440*Math.pow(2,(midi-69)/12),N=Math.max(2,Math.round(sr/freq)),len=Math.floor(sr*2.6);
  const buf=ctx.createBuffer(1,len,sr),d=buf.getChannelData(0),ring=new Float32Array(N);
  for(let i=0;i<N;i++)ring[i]=Math.random()*2-1;
  let prev=0;for(let i=0;i<N;i++){ring[i]=(ring[i]+prev)*.5;prev=ring[i]}
  const decay=midi<52?.9965:.994;let idx=0;
  for(let i=0;i<len;i++){const nx=(idx+1)%N;const v=(ring[idx]+ring[nx])*.5*decay;d[i]=ring[idx];ring[idx]=v;idx=nx}
  bufCache[midi]=buf;return buf;
}
function playNote(midi,when,s,vol){
  if(!ac())return;const t=when||ctx.currentTime;
  if(s!=null&&active[s]){try{active[s].g.gain.setTargetAtTime(0,t,.015);active[s].src.stop(t+.12)}catch(e){}}
  const src=ctx.createBufferSource();src.buffer=stringBuf(midi);
  const g=ctx.createGain();g.gain.value=vol==null?.5:vol;src.connect(g);g.connect(master);src.start(t);
  if(s!=null)active[s]={src,g};
}
function strum(frets,when,dir,vm){vm=vm==null?1:vm;
  if(!ac())return;let t=when||ctx.currentTime;const order=dir==='U'?[5,4,3,2,1,0]:[0,1,2,3,4,5];
  let n=0;order.forEach(i=>{const f=frets[i];if(f<0)return;if(dir==='U'&&n>=4)return;playNote(OPEN[i]+f,t+n*.022,i,(dir==='U'?.32:.42)*vm);n++});
}

/* ---------- Diagramas ---------- */
function chordSVG(c){
  const pos=c.frets.filter(f=>f>0),max=pos.length?Math.max(...pos):0;
  const base=max<=4?1:Math.min(...pos);
  const x0=22,dx=16,y0=30,dy=20,W=x0+dx*5+18,H=y0+dy*5+10;
  let s=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Diagrama de ${c.n}">`;
  for(let r=0;r<=5;r++)s+=`<line x1="${x0}" y1="${y0+r*dy}" x2="${x0+dx*5}" y2="${y0+r*dy}" stroke="var(--muted)" stroke-width="${r===0&&base===1?5:1.2}"/>`;
  for(let i=0;i<6;i++)s+=`<line x1="${x0+i*dx}" y1="${y0}" x2="${x0+i*dx}" y2="${y0+dy*5}" stroke="var(--muted)" stroke-width="1.2"/>`;
  if(base>1)s+=`<text x="${x0-8}" y="${y0+dy*.5+5}" text-anchor="end" font-size="12" fill="var(--muted)" font-weight="700">${base}</text>`;
  let bStart=-1,bEnd=-1;
  if(c.barre){c.frets.forEach((f,i)=>{if(f===c.barre&&c.fing[i]===1){if(bStart<0)bStart=i;bEnd=i}});
    if(bEnd>bStart){const y=y0+(c.barre-base+.5)*dy;s+=`<rect x="${x0+bStart*dx-7}" y="${y-7}" width="${(bEnd-bStart)*dx+14}" height="14" rx="7" fill="var(--ink)"/><text x="${x0+(bStart+bEnd)/2*dx}" y="${y+4}" text-anchor="middle" font-size="11" fill="var(--surface)" font-weight="700">1</text>`}}
  c.frets.forEach((f,i)=>{const x=x0+i*dx;
    if(f<0)s+=`<text x="${x}" y="${y0-9}" text-anchor="middle" font-size="13" fill="var(--muted)" font-weight="700">×</text>`;
    else if(f===0)s+=`<circle cx="${x}" cy="${y0-13}" r="4.5" fill="none" stroke="var(--muted)" stroke-width="1.6"/>`;
    else{ if(c.barre&&f===c.barre&&c.fing[i]===1&&bEnd>bStart)return;
      const y=y0+(f-base+.5)*dy;s+=`<circle cx="${x}" cy="${y}" r="7" fill="var(--ink)"/>`;
      if(c.fing[i])s+=`<text x="${x}" y="${y+4}" text-anchor="middle" font-size="11" fill="var(--surface)" font-weight="700">${c.fing[i]}</text>`}
  });
  return s+'</svg>';
}

/* ---------- Diapasón ---------- */
const FW=56,OX=46,TOP=22,SP=26,FRETS=12;
function boardSVG(mark){
  const W=OX+FW*FRETS+14,H=TOP+SP*5+34;
  let s=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Diapasón de guitarra">`;
  s+=`<rect x="${OX}" y="${TOP-12}" width="${FW*FRETS}" height="${SP*5+24}" rx="4" fill="var(--wood)"/>`;
  [3,5,7,9].forEach(f=>s+=`<circle cx="${OX+(f-.5)*FW}" cy="${TOP+SP*2.5}" r="6" fill="var(--wood2)" stroke="#d8cfb8" stroke-opacity=".35"/>`);
  s+=`<circle cx="${OX+11.5*FW}" cy="${TOP+SP*1.5}" r="6" fill="var(--wood2)" stroke="#d8cfb8" stroke-opacity=".35"/><circle cx="${OX+11.5*FW}" cy="${TOP+SP*3.5}" r="6" fill="var(--wood2)" stroke="#d8cfb8" stroke-opacity=".35"/>`;
  s+=`<rect x="${OX-5}" y="${TOP-12}" width="6" height="${SP*5+24}" fill="#E9E4D6"/>`;
  for(let f=1;f<=FRETS;f++)s+=`<line x1="${OX+f*FW}" y1="${TOP-12}" x2="${OX+f*FW}" y2="${TOP+SP*5+12}" stroke="var(--fret)" stroke-width="2.4"/>`;
  for(let f=1;f<=FRETS;f++)s+=`<text x="${OX+(f-.5)*FW}" y="${H-4}" text-anchor="middle" font-size="12" fill="var(--muted)" font-weight="700">${f}</text>`;
  for(let r=0;r<6;r++){const si=5-r,y=TOP+r*SP;
    s+=`<line x1="${OX-2}" y1="${y}" x2="${OX+FW*FRETS}" y2="${y}" stroke="var(--string)" stroke-width="${1+si*.35}"/>`;
    s+=`<text x="8" y="${y+4}" font-size="12" fill="var(--muted)" font-weight="700">${NOTES[pc(OPEN[si])]}</text>`}
  for(let r=0;r<6;r++){const si=5-r,y=TOP+r*SP;
    for(let f=0;f<=FRETS;f++){const x=f===0?OX-20:OX+(f-.5)*FW;
      const m=mark&&mark(si,f);
      if(m){const fill=m.kind==='root'?'var(--accent)':m.kind==='hit'?'var(--amber)':'var(--surface)';const tc=m.kind==='root'?'var(--accent-ink)':m.kind==='hit'?'#1E2427':'var(--ink)';
        s+=`<circle cx="${x}" cy="${y}" r="11" fill="${fill}" stroke="${m.kind==='plain'?'var(--muted)':'none'}" stroke-width="1"/><text x="${x}" y="${y+4}" text-anchor="middle" font-size="${m.label.length>2?9.5:11}" font-weight="700" fill="${tc}">${m.label}</text>`}
      const hx=f===0?OX-38:OX+(f-1)*FW;
      s+=`<rect data-s="${si}" data-f="${f}" x="${hx}" y="${y-SP/2}" width="${f===0?36:FW}" height="${SP}" fill="transparent" style="cursor:pointer"><title>${STR_NAMES[si]} cuerda, ${f===0?'al aire':'traste '+f}</title></rect>`}}
  return s+'</svg>';
}
function boardClick(el,cb){el.addEventListener('click',e=>{const r=e.target.closest('[data-s]');if(!r)return;const s=+r.dataset.s,f=+r.dataset.f;playNote(OPEN[s]+f,null,s);cb&&cb(s,f)})}

/* Hero */
const heroEl=document.getElementById('heroBoard');let heroHit=null;
function drawHero(){const all=document.getElementById('showAll').checked;
  heroEl.innerHTML=boardSVG((s,f)=>{const p=pc(OPEN[s]+f);
    if(heroHit&&heroHit.s===s&&heroHit.f===f)return{label:NOTES[p],kind:'hit'};
    if(heroHit&&all&&pc(OPEN[heroHit.s]+heroHit.f)===p)return{label:NOTES[p],kind:'root'};
    if(all)return{label:NOTES[p],kind:'plain'};return null})}
boardClick(heroEl,(s,f)=>{heroHit={s,f};const m=OPEN[s]+f,p=pc(m);
  document.getElementById('heroNote').textContent=`${NOTES[p]}  ${LAT[p]}`;
  document.getElementById('heroSub').textContent=`${STR_NAMES[s]} cuerda, ${f===0?'al aire':'traste '+f}, octava ${Math.floor(m/12)-1}`;drawHero()});
document.getElementById('showAll').addEventListener('change',drawHero);drawHero();

/* ---------- Ruta ---------- */
const LEVELS=[
 {t:'Nivel 1: primeros pasos',d:'Postura, afinación y tus primeros sonidos.',ls:[
  {t:'Conocé tu guitarra',b:`<p>Las partes que vas a nombrar todo el tiempo: <b>clavijas</b> (afinan), <b>cejuela</b> (la pieza blanca donde empiezan las cuerdas), <b>trastes</b> (las barritas de metal), <b>diapasón</b> (la madera donde apoyás los dedos), <b>boca</b> y <b>puente</b>.</p>
  <p>Las cuerdas se numeran de la más fina a la más gruesa: la <b>1ª</b> es el Mi agudo y la <b>6ª</b> el Mi grave. Los dedos de la mano que pisa también tienen número: 1 índice, 2 mayor, 3 anular, 4 meñique.</p>
  <ul><li>Sentate derecho, con la guitarra apoyada en la pierna derecha (si sos diestro).</li><li>El pulgar va detrás del mástil, más o menos a la altura del dedo mayor.</li><li>Pisá con la yema, justo detrás del traste, no encima.</li></ul>`,tip:'Si una nota suena "zumbando", acercá el dedo al traste antes de apretar más fuerte.'},
  {t:'Afinar la guitarra',b:`<p>La afinación estándar, de la 6ª a la 1ª, es <b>E A D G B E</b>: Mi, La, Re, Sol, Si, Mi. Una frase para recordarla: "Mi Lado Rebelde Sólo Sigue Mintiendo".</p>
  <p>Usá la afinación de referencia en la pestaña Práctica, o un afinador con micrófono. También existe el método del quinto traste: pisá la 6ª en el traste 5 y debería sonar igual que la 5ª al aire. Repetí lo mismo hacia abajo, salvo entre la 3ª y la 2ª, donde se pisa el traste 4.</p>`,tip:'Afiná siempre subiendo hacia la nota: si te pasás, bajá un poco y volvé a subir. La cuerda se mantiene mejor.'},
  {t:'Leer diagramas y tablaturas',b:`<p>En un <b>diagrama de acorde</b> la guitarra está parada frente a vos: las líneas verticales son las cuerdas (la de la izquierda es la 6ª) y las horizontales, los trastes. Los números indican qué dedo usar.</p>
  <p>La <b>tablatura</b> tiene seis líneas: la de arriba es la 1ª cuerda. Cada número es el traste a pisar y se lee de izquierda a derecha.</p>
  <pre>e|-----------0---|
B|---------1-----|
G|-------0-------|
D|-----2---------|
A|---3-----------|
E|---------------|</pre><p>Eso es un acorde de Do tocado nota por nota (un arpegio).</p>`},
  {t:'Tus primeros acordes: Em y Am',b:`<p>Em usa solo dos dedos y suenan las seis cuerdas. Am se toca desde la 5ª cuerda: no toques la 6ª.</p><p>Ejercicio: cuatro golpes hacia abajo en Em, cuatro en Am, y así durante dos minutos. No importa la velocidad, importa que cada nota suene.</p>`,ch:['Em','Am'],prog:['Em','Am','Em','Am'],tip:'Antes de rasguear, tocá cuerda por cuerda para encontrar la que está apagada.'},
  {t:'Rasgueo básico',b:`<p>El movimiento sale de la muñeca, no del codo. Podés usar púa o el costado del índice. Contá en voz alta "1, 2, 3, 4" y rasgueá hacia abajo en cada número.</p><p>Poné el metrónomo a 60 bpm en Práctica, elegí el patrón "Básico" y el acorde Em. Tocá junto con él hasta que los golpes coincidan con el click.</p>`,ch:['Em'],tip:'La mano derecha nunca se detiene: aunque no toque, sigue subiendo y bajando como un péndulo.'}
 ]},
 {t:'Nivel 2: acordes abiertos',d:'Los acordes que aparecen en miles de canciones.',ls:[
  {t:'E, A y D',b:`<p>Con estos tres acordes ya tenés el I, IV y V de La mayor: la base del rock and roll y del blues. Fijate que E tiene la misma forma que Am, pero una cuerda más arriba.</p><p>D se toca solo desde la 4ª cuerda: las dos graves no suenan.</p>`,ch:['E','A','D'],prog:['A','D','E','A']},
  {t:'G y C',b:`<p>Son los más incómodos al principio porque estiran la mano. En G, el dedo 3 va en la 1ª cuerda. En C, cuidá que el dedo 3 no apague la 4ª cuerda.</p>`,ch:['G','C'],prog:['G','C','G','C'],tip:'Dejá los dedos arqueados como si sostuvieras una pelota: así no tocan cuerdas vecinas.'},
  {t:'Cambiar de acorde sin cortar',b:`<p>Los cambios son la habilidad que más se nota. Buscá <b>dedos pivote</b>: de Am a C, los dedos 1 y 2 no se mueven, solo el 3 salta de cuerda. De Em a G, mové todo junto como una figura.</p><p>Usá "Cambios en un minuto" en Práctica con Am y C, y anotá tu número cada día.</p>`,ch:['Am','C'],tip:'Mirá el acorde de destino antes de soltar el actual. La mano llega a donde mira la cabeza.'},
  {t:'Tu primera progresión: G, D, Em, C',b:`<p>Estos cuatro acordes, en este orden, sostienen una enorme cantidad de canciones pop. Son el I, V, vi y IV de Sol mayor.</p><p>Tocá cuatro golpes en cada uno. Cuando salga sin pausas, probá cantar encima cualquier melodía que se te ocurra.</p>`,ch:['G','D','Em','C'],prog:['G','D','Em','C']},
  {t:'El rasgueo pop',b:`<p>El patrón más usado: <b>abajo, abajo arriba, arriba abajo arriba</b>. Contado en corcheas: 1, 2 y, y 4 y. Hay un golpe "fantasma" en el 3: la mano baja pero no toca.</p><p>Elegí el patrón "Pop" en Práctica a 70 bpm con el acorde G.</p>`,ch:['G'],tip:'Si te perdés, volvé a cuatro golpes hacia abajo y sumá los de arriba de a uno.'}
 ]},
 {t:'Nivel 3: teoría aplicada',d:'Entender por qué las cosas suenan como suenan.',ls:[
  {t:'Las 12 notas',b:`<p>Hay doce notas: Do, Do#, Re, Mib, Mi, Fa, Fa#, Sol, Lab, La, Sib, Si. Después se repite el Do, una octava más agudo. Cada traste es un <b>semitono</b>; dos trastes son un <b>tono</b>.</p><p>En el traste 12 cualquier cuerda vuelve a su nota al aire. Mirá las doce en la pestaña Teoría y probá encontrar todas las Do del diapasón.</p>`},
  {t:'La escala mayor',b:`<p>Su fórmula es <b>T T S T T T S</b> (tono y semitono). Empezando en Do, da Do Re Mi Fa Sol La Si, sin alteraciones. Empezando en cualquier otra nota, la misma fórmula te da su escala mayor.</p><pre>e|-----------------------|
B|-------------------0-1-|
G|-------------0-2-------|
D|-------0-2-3-----------|
A|---3-------------------|
E|-----------------------|</pre>`,tip:'Cantá las notas mientras las tocás. Entrenás el oído al mismo tiempo que los dedos.'},
  {t:'Cómo se forma un acorde',b:`<p>Un acorde básico (tríada) toma la 1ª, 3ª y 5ª nota de una escala. Do mayor: Do, Mi, Sol. La menor: La, Do, Mi.</p><p>Mayor = 4 semitonos + 3. Menor = 3 + 4. Esa única nota de diferencia es lo que hace sonar alegre o melancólico al acorde. La tabla completa está en Teoría.</p>`,ch:['C','Am']},
  {t:'Campo armónico',b:`<p>Si armás una tríada sobre cada nota de la escala mayor, salen siete acordes: I, ii, iii, IV, V, vi, vii°. Los romanos en mayúscula son mayores y en minúscula, menores.</p><p>En Do mayor: C, Dm, Em, F, G, Am, Bdim. Probá la clásica I, V, vi, IV en Do: C, G, Am, F.</p>`,ch:['C','G','Am','F'],prog:['C','G','Am','F']},
  {t:'Pentatónica menor',b:`<p>Cinco notas que casi nunca suenan mal sobre rock, blues y pop. Esta es la primera "caja" en La, empezando en el traste 5. Tocala subiendo y bajando, alternando la púa.</p><pre>e|---------------------------5-8-|
B|-----------------------5-8-----|
G|-------------------5-7---------|
D|-------------5-7---------------|
A|-------5-7---------------------|
E|-5-8---------------------------|</pre><p>Podés verla en todo el mástil en el explorador de Teoría.</p>`,tip:'Corré la misma caja a otro traste y cambia la tonalidad: en el 3 es Sol menor, en el 8 es Do menor.'}
 ]},
 {t:'Nivel 4: intermedio',d:'Técnicas que te abren el resto del repertorio.',ls:[
  {t:'Cejilla: F y Bm',b:`<p>El índice pisa varias cuerdas a la vez. Ponelo bien plano, pegado al traste, y usá el lado más duro del dedo (el que mira al cabezal). La fuerza sale del peso del brazo, no solo del pulgar.</p><p>Si cuesta, empezá con el F fácil del nivel 1 y agregá cuerdas de a una.</p>`,ch:['Fbar','Bm','F'],tip:'Practicá la cejilla de a ratos cortos. Forzar la mano durante mucho tiempo puede lastimar.'},
  {t:'Acordes de séptima',b:`<p>Una séptima menor sobre el acorde mayor le da un sonido tenso que "pide" resolver. Es el sonido del blues. El blues de 12 compases en La usa A7, D7 y E7.</p>`,ch:['A7','D7','E7','B7'],prog:['A7','D7','A7','E7']},
  {t:'Power chords',b:`<p>Solo tónica y quinta: ni mayor ni menor, por eso funcionan con distorsión. La forma de la 6ª cuerda es <b>móvil</b>: corrida al traste 3 es G5, al 5 es A5.</p><p>Probá apoyar el canto de la mano derecha sobre el puente para conseguir el sonido apagado (palm mute).</p>`,ch:['E5','A5','G5','C5'],prog:['E5','G5','A5','C5']},
  {t:'Fingerpicking',b:`<p>Cada dedo de la mano derecha tiene una tarea. <b>p</b> (pulgar) las cuerdas 6, 5 y 4; <b>i</b> (índice) la 3ª; <b>m</b> (mayor) la 2ª; <b>a</b> (anular) la 1ª.</p><p>Patrón base sobre C: p (5ª), i, m, a, m, i. Sobre Am igual. Repetilo lento hasta que sea automático.</p><pre>e|-------0-------|
B|-----1---1-----|
G|---0-------0---|
D|---------------|
A|-3-------------|
E|---------------|</pre>`,ch:['C','Am']},
  {t:'Formas móviles y capo',b:`<p>Toda forma con cejilla se puede mover: la forma de F en el traste 3 es G, en el 5 es A. Con eso tocás cualquier acorde mayor o menor.</p><p>El <b>capo</b> hace de cejilla fija: con capo en el 2 y la forma de G suena A. Sirve para cantar en tu tono sin aprender formas nuevas.</p>`,ch:['Fbar','Gm','Cm'],tip:'Con lo que ya sabés podés tocar casi cualquier canción. Elegí una que te guste y aprendela entera.'}
 ]}
];
let done=store.get('done',[]);
const levelsEl=document.getElementById('levels');
function renderRuta(){let k=0,html='';
  LEVELS.forEach(L=>{html+=`<div class="level"><h3>${L.t}</h3><p>${L.d}</p>`;
    L.ls.forEach(l=>{k++;const isDone=done.includes(k);
      html+=`<div class="lesson${isDone?' done':''}" data-k="${k}"><button class="lh" aria-expanded="false"><span class="lnum">${isDone?'✓':k}</span><span class="ltitle">${l.t}</span><svg class="chev" width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M5 3l5 5-5 5" fill="none" stroke="currentColor" stroke-width="2"/></svg></button><div class="lbody">${l.b}`;
      if(l.ch)html+=`<div class="minis">${l.ch.map(id=>{const c=byId[id];return`<button class="mini" data-chord="${id}" aria-label="Escuchar ${c.n}"><b>${c.n}</b>${chordSVG(c)}</button>`}).join('')}</div>`;
      if(l.tip)html+=`<div class="tip">${l.tip}</div>`;
      html+=`<div class="actions">${l.prog?`<button class="btn primary" data-prog="${l.prog.join(',')}">Escuchar ${l.prog.map(i=>byId[i].n).join(' ')}</button>`:''}<button class="btn ${isDone?'ok':''}" data-done="${k}">${isDone?'Completada':'Marcar como completada'}</button></div></div></div>`});
    html+='</div>'});
  levelsEl.innerHTML=html;updProg()}
function updProg(){document.getElementById('progFill').style.width=(done.length/20*100)+'%';document.getElementById('progText').textContent=`${done.length} de 20`}
levelsEl.addEventListener('click',e=>{
  const h=e.target.closest('.lh');if(h){const ls=h.parentElement;ls.classList.toggle('open');h.setAttribute('aria-expanded',ls.classList.contains('open'));return}
  const m=e.target.closest('[data-chord]');if(m){strum(byId[m.dataset.chord].frets);return}
  const p=e.target.closest('[data-prog]');if(p){if(!ac())return;const ids=p.dataset.prog.split(',');let t=ctx.currentTime+.05;ids.forEach(id=>{for(let i=0;i<2;i++){strum(byId[id].frets,t);t+=.7}});return}
  const d=e.target.closest('[data-done]');if(d){const k=+d.dataset.done;done=done.includes(k)?done.filter(x=>x!==k):[...done,k];store.set('done',done);
    const ls=d.closest('.lesson');const isDone=done.includes(k);ls.classList.toggle('done',isDone);ls.querySelector('.lnum').textContent=isDone?'✓':k;d.className='btn'+(isDone?' ok':'');d.textContent=isDone?'Completada':'Marcar como completada';updProg()}
});
renderRuta();

/* ---------- Acordes ---------- */
const CATS=['Todos','Mayores','Menores','Séptimas','Color','Cejilla','Power chords'];let cat='Todos';
const chipsEl=document.getElementById('catChips'),gridEl=document.getElementById('chordGrid');
function renderChips(){chipsEl.innerHTML=CATS.map(c=>`<button class="chip" aria-pressed="${c===cat}" data-cat="${c}">${c}</button>`).join('')}
function renderGrid(){gridEl.innerHTML=CHORDS.filter(c=>cat==='Todos'||c.cat===cat).map(c=>`<div class="card" data-id="${c.id}"><button aria-label="Escuchar ${c.es}"><h4>${c.n}</h4><div class="es">${c.es}</div>${chordSVG(c)}<div class="notes">${chordNotes(c).map(p=>NOTES[p]).join(' ')}</div></button></div>`).join('')}
chipsEl.addEventListener('click',e=>{const b=e.target.closest('[data-cat]');if(!b)return;cat=b.dataset.cat;renderChips();renderGrid()});
gridEl.addEventListener('click',e=>{const card=e.target.closest('.card');if(!card)return;strum(byId[card.dataset.id].frets);card.classList.add('playing');setTimeout(()=>card.classList.remove('playing'),700)});
renderChips();renderGrid();

/* ---------- Teoría ---------- */
document.getElementById('notes12').innerHTML=NOTES.map((n,i)=>`<button class="n12${n.length>1?' sharp':''}" data-m="${60+i}"><b>${n}</b><small>${LAT[i]}</small></button>`).join('');
document.getElementById('notes12').addEventListener('click',e=>{const b=e.target.closest('[data-m]');if(b)playNote(+b.dataset.m,null,null,.55)});

const TYPES=[
 {g:'Escalas',n:'Escala mayor',iv:[0,2,4,5,7,9,11]},
 {g:'Escalas',n:'Escala menor natural',iv:[0,2,3,5,7,8,10]},
 {g:'Escalas',n:'Pentatónica menor',iv:[0,3,5,7,10]},
 {g:'Escalas',n:'Pentatónica mayor',iv:[0,2,4,7,9]},
 {g:'Escalas',n:'Escala de blues',iv:[0,3,5,6,7,10]},
 {g:'Acordes',n:'Acorde mayor',iv:[0,4,7],suf:'',feel:'Estable, luminoso'},
 {g:'Acordes',n:'Acorde menor',iv:[0,3,7],suf:'m',feel:'Melancólico'},
 {g:'Acordes',n:'Séptima',iv:[0,4,7,10],suf:'7',feel:'Tenso, bluesero'},
 {g:'Acordes',n:'Mayor 7',iv:[0,4,7,11],suf:'maj7',feel:'Suave, jazzero'},
 {g:'Acordes',n:'Menor 7',iv:[0,3,7,10],suf:'m7',feel:'Relajado, soul'},
 {g:'Acordes',n:'Sus2',iv:[0,2,7],suf:'sus2',feel:'Abierto, flotante'},
 {g:'Acordes',n:'Sus4',iv:[0,5,7],suf:'sus4',feel:'Suspendido, pide resolver'},
 {g:'Acordes',n:'Disminuido',iv:[0,3,6],suf:'dim',feel:'Inestable, de paso'}
];
const exRoot=document.getElementById('exRoot'),exType=document.getElementById('exType'),exLabel=document.getElementById('exLabel');
exRoot.innerHTML=NOTES.map((n,i)=>`<option value="${i}"${i===9?' selected':''}>${n} (${LAT[i]})</option>`).join('');
exType.innerHTML=['Escalas','Acordes'].map(g=>`<optgroup label="${g}">${TYPES.map((t,i)=>t.g===g?`<option value="${i}"${i===2?' selected':''}>${t.n}</option>`:'').join('')}</optgroup>`).join('');
const exBoard=document.getElementById('exBoard');
function drawEx(){const r=+exRoot.value,T=TYPES[+exType.value],lab=exLabel.value;const set=T.iv.map(i=>pc(r+i));
  exBoard.innerHTML=boardSVG((s,f)=>{const p=pc(OPEN[s]+f),k=set.indexOf(p);if(k<0)return null;const iv=pc(p-r);return{label:lab==='deg'?DEG[iv]:NOTES[p],kind:iv===0?'root':'plain'}});
  document.getElementById('exDegrees').innerHTML=T.iv.map(i=>`<div class="deg${i===0?' root':''}"><b>${NOTES[pc(r+i)]}</b><small>${DEG[i]}</small></div>`).join('')}
[exRoot,exType,exLabel].forEach(el=>el.addEventListener('change',drawEx));drawEx();
boardClick(exBoard);
document.getElementById('exPlay').addEventListener('click',()=>{if(!ac())return;const r=+exRoot.value,T=TYPES[+exType.value];const base=48+r;let t=ctx.currentTime+.05;
  if(T.g==='Escalas'){[...T.iv,12].forEach(i=>{playNote(base+i,t,null,.5);t+=.32})}
  else{T.iv.forEach(i=>{playNote(base+i,t,null,.45);t+=.25});t+=.15;T.iv.forEach((i,k)=>playNote(base+i,t+k*.02,null,.38))}});

document.getElementById('formulaBody').innerHTML=TYPES.filter(t=>t.g==='Acordes').map(t=>`<tr><td><b>${t.n}</b></td><td>${t.iv.map(i=>DEG[i]).join(' ')}</td><td>${t.iv.join(', ')}</td><td>C${t.suf}: ${t.iv.map(i=>NOTES[i]).join(' ')}</td><td>${t.feel}</td></tr>`).join('');

const keySel=document.getElementById('keySel'),fieldEl=document.getElementById('field'),fieldDet=document.getElementById('fieldDetail');
const MAJ=[0,2,4,5,7,9,11],QUAL=['','m','m','','','m','dim'],ROM=['I','ii','iii','IV','V','vi','vii°'];
keySel.innerHTML=NOTES.map((n,i)=>`<option value="${i}"${i===7?' selected':''}>${n} mayor (${LAT[i]})</option>`).join('');
function rootPcOf(name){const m=name.match(/^([A-G])(#|b)?/);const base={C:0,D:2,E:4,F:5,G:7,A:9,B:11}[m[1]];return pc(base+(m[2]==='#'?1:m[2]==='b'?-1:0))}
function findChord(p,q){return CHORDS.find(c=>{const suf=c.n.replace(/^[A-G](#|b)?/,'');return suf===q&&rootPcOf(c.n)===p&&c.cat!=='Power chords'})}
function triad(p,q){const iv=q==='m'?[0,3,7]:q==='dim'?[0,3,6]:[0,4,7];return iv.map(i=>p+i)}
function renderField(){const k=+keySel.value;fieldDet.innerHTML='';
  fieldEl.innerHTML=MAJ.map((iv,d)=>{const p=pc(k+iv);return`<button class="fc${d===0?' key':''}" data-p="${p}" data-q="${QUAL[d]}"><span class="rn">${ROM[d]}</span><b>${NOTES[p]}${QUAL[d]}</b></button>`}).join('')}
fieldEl.addEventListener('click',e=>{const b=e.target.closest('.fc');if(!b)return;const p=+b.dataset.p,q=b.dataset.q;const c=findChord(p,q);
  const notes=triad(p,q).map(m=>NOTES[pc(m)]).join(' ');
  if(c){strum(c.frets);fieldDet.innerHTML=`${chordSVG(c)}<div><b style="font-family:'Bricolage Grotesque',sans-serif;font-size:22px">${c.n}</b><br><span class="muted">${c.es}. Notas: ${notes}</span></div>`}
  else{if(ac()){const t=ctx.currentTime;triad(48+p,q).forEach((m,i)=>playNote(m,t+i*.03,null,.4))}
    fieldDet.innerHTML=`<div><b style="font-family:'Bricolage Grotesque',sans-serif;font-size:22px">${NOTES[p]}${q}</b><br><span class="muted">Notas: ${notes}. Este acorde no está en el diccionario: se toca con una forma de cejilla o buscalo con el explorador.</span></div>`}});
keySel.addEventListener('change',renderField);renderField();

/* ---------- Práctica ---------- */
const tunerEl=document.getElementById('tuner');let tuneIdx=null,tuneTimer=null;
tunerEl.innerHTML=OPEN.map((m,i)=>`<button class="sbtn" data-i="${i}"><b>${NOTES[pc(m)]}</b><small>${STR_NAMES[i]} ${LAT[pc(m)]}</small></button>`).join('');
function tunePlay(){if(tuneIdx!=null)playNote(OPEN[tuneIdx],null,tuneIdx,.55)}
tunerEl.addEventListener('click',e=>{const b=e.target.closest('.sbtn');if(!b)return;tuneIdx=+b.dataset.i;tunerEl.querySelectorAll('.sbtn').forEach(x=>x.classList.toggle('on',x===b));tunePlay();setLoop()});
const loopCb=document.getElementById('tuneLoop');
function setLoop(){clearInterval(tuneTimer);if(loopCb.checked&&tuneIdx!=null)tuneTimer=setInterval(tunePlay,2200)}
loopCb.addEventListener('change',setLoop);

const PATTERNS=[
 {n:'Básico (4 abajo)',p:['D','','D','','D','','D','']},
 {n:'Pop',p:['D','','D','U','','U','D','U']},
 {n:'Folk',p:['D','','D','U','D','','D','U']},
 {n:'Balada',p:['D','','','U','D','U','D','U']},
 {n:'Rock (corcheas)',p:['D','D','D','D','D','D','D','D']}
];
const patSel=document.getElementById('patSel'),patChord=document.getElementById('patChord'),slotsEl=document.getElementById('slots'),beatsEl=document.getElementById('beats');
patSel.innerHTML=PATTERNS.map((p,i)=>`<option value="${i}">${p.n}</option>`).join('');
patChord.innerHTML+=CHORDS.map(c=>`<option value="${c.id}">${c.n} (${c.es})</option>`).join('');
const savedPat=store.get('pat',{p:1,c:'G',bpm:70});patSel.value=savedPat.p;patChord.value=savedPat.c;
const bpmEl=document.getElementById('bpm'),bpmOut=document.getElementById('bpmOut');bpmEl.value=savedPat.bpm;bpmOut.textContent=savedPat.bpm;
const COUNT=['1','y','2','y','3','y','4','y'];
function renderSlots(){const P=PATTERNS[+patSel.value].p;slotsEl.innerHTML=P.map((d,i)=>`<div class="slot" data-i="${i}"><span class="arrow" aria-hidden="true">${d==='D'?'↓':d==='U'?'↑':''}</span><small>${COUNT[i]}</small></div>`).join('');
  beatsEl.innerHTML=[0,1,2,3].map(i=>`<span class="beat" data-b="${i}"></span>`).join('')}
function savePat(){store.set('pat',{p:+patSel.value,c:patChord.value,bpm:+bpmEl.value})}
patSel.addEventListener('change',()=>{renderSlots();savePat()});patChord.addEventListener('change',savePat);
bpmEl.addEventListener('input',()=>{bpmOut.textContent=bpmEl.value;savePat()});
renderSlots();
const metro={on:false,next:0,slot:0,timer:null};
function click(t,accent){const o=ctx.createOscillator(),g=ctx.createGain();o.frequency.value=accent?1500:1000;g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(accent?.5:.3,t+.002);g.gain.exponentialRampToValueAtTime(.0001,t+.05);o.connect(g);g.connect(master);o.start(t);o.stop(t+.06)}
function schedule(slot,t){if(slot%2===0)click(t,slot===0);const P=PATTERNS[+patSel.value].p;const c=patChord.value;if(c&&P[slot])strum(byId[c].frets,t,P[slot]);
  const delay=Math.max(0,(t-ctx.currentTime)*1000);setTimeout(()=>{if(!metro.on)return;slotsEl.querySelectorAll('.slot').forEach(s=>s.classList.toggle('now',+s.dataset.i===slot));if(slot%2===0)beatsEl.querySelectorAll('.beat').forEach(b=>b.classList.toggle('now',+b.dataset.b===slot/2))},delay)}
function tick(){while(metro.next<ctx.currentTime+.12){schedule(metro.slot,metro.next);metro.next+=60/(+bpmEl.value)/2;metro.slot=(metro.slot+1)%8}}
const metroBtn=document.getElementById('metroBtn');
metroBtn.addEventListener('click',()=>{if(!ac())return;metro.on=!metro.on;
  if(metro.on){metro.slot=0;metro.next=ctx.currentTime+.08;metro.timer=setInterval(tick,25);metroBtn.textContent='Detener'}
  else{clearInterval(metro.timer);metroBtn.textContent='Empezar';slotsEl.querySelectorAll('.now').forEach(x=>x.classList.remove('now'));beatsEl.querySelectorAll('.now').forEach(x=>x.classList.remove('now'))}});

const trA=document.getElementById('trA'),trB=document.getElementById('trB');
const opts=CHORDS.filter(c=>c.cat!=='Power chords'||true).map(c=>`<option value="${c.id}">${c.n} (${c.es})</option>`).join('');
trA.innerHTML=opts;trB.innerHTML=opts;trA.value='Am';trB.value='C';
const trTap=document.getElementById('trTap'),trCount=document.getElementById('trCount'),trTimer=document.getElementById('trTimer'),trBest=document.getElementById('trBest'),trStart=document.getElementById('trStart');
let tr={on:false,n:0,end:0,iv:null};
function pairKey(){return[trA.value,trB.value].sort().join('-')}
function showBest(){const b=store.get('best',{})[pairKey()];trBest.textContent=b?`Récord ${byId[trA.value].n} y ${byId[trB.value].n}: ${b} cambios`:'Sin récord todavía para este par'}
[trA,trB].forEach(el=>el.addEventListener('change',showBest));showBest();
trStart.addEventListener('click',()=>{if(tr.on)return finish(true);tr={on:true,n:0,end:Date.now()+60000,iv:null};trCount.textContent=0;trTap.disabled=false;trStart.textContent='Cortar';
  tr.iv=setInterval(()=>{const left=Math.max(0,Math.ceil((tr.end-Date.now())/1000));trTimer.textContent=left+' s';if(left<=0)finish(false)},200)});
function finish(aborted){clearInterval(tr.iv);tr.on=false;trTap.disabled=true;trStart.textContent='Empezar minuto';trTimer.textContent='60 s';
  if(!aborted){const all=store.get('best',{}),k=pairKey();if(!all[k]||tr.n>all[k]){all[k]=tr.n;store.set('best',all)}showBest();if(ac())click(ctx.currentTime,true)}}
trTap.addEventListener('click',()=>{if(!tr.on)return;tr.n++;trCount.textContent=tr.n});


/* ---------- Sonido de guitarra eléctrica para punteo ---------- */
let lead=null;const leadActive={};
function leadBus(){if(lead)return lead;
  const pre=ctx.createGain();pre.gain.value=3;const ws=ctx.createWaveShaper();const n=2048,cv=new Float32Array(n),k=40;
  for(let i=0;i<n;i++){const x=i*2/n-1;cv[i]=(1+k)*x/(1+k*Math.abs(x))}ws.curve=cv;ws.oversample='4x';
  const hp=ctx.createBiquadFilter();hp.type='highpass';hp.frequency.value=110;
  const lp=ctx.createBiquadFilter();lp.type='lowpass';lp.frequency.value=3000;lp.Q.value=.8;
  const out=ctx.createGain();out.gain.value=.2;
  const dl=ctx.createDelay(1);dl.delayTime.value=.34;const fb=ctx.createGain();fb.gain.value=.3;const wet=ctx.createGain();wet.gain.value=.3;
  pre.connect(ws);ws.connect(hp);hp.connect(lp);lp.connect(out);out.connect(master);out.connect(dl);dl.connect(fb);fb.connect(dl);dl.connect(wet);wet.connect(master);
  lead={in:pre};return lead}
const R=x=>Math.pow(2,x/12);
function playLead(s,f,t,dur,tech,to){if(!ac())return;const L=leadBus();
  const prev=leadActive[s];if(prev){try{prev.g.gain.setTargetAtTime(0,t,.01);prev.src.stop(t+.1)}catch(e){}}
  const src=ctx.createBufferSource();src.buffer=stringBuf(OPEN[s]+f);const g=ctx.createGain();
  const vol=(tech==='h'||tech==='p')?.55:.85;g.gain.setValueAtTime(vol,t);g.gain.setTargetAtTime(0,t+dur,.06);
  src.connect(g);g.connect(L.in);const rate=src.playbackRate;rate.setValueAtTime(1,t);
  const vib=(start,amt)=>{const o=ctx.createOscillator(),og=ctx.createGain();o.frequency.value=5.6;og.gain.setValueAtTime(0,t);og.gain.linearRampToValueAtTime(amt,start+.15);o.connect(og);og.connect(rate);o.start(start);o.stop(t+dur+.3)};
  if(tech==='b'||tech==='bv'){const up=Math.min(.2,dur*.35);rate.linearRampToValueAtTime(R(to),t+up);if(tech==='bv')vib(t+up+.05,R(to)*.012)}
  else if(tech==='br'){rate.linearRampToValueAtTime(R(to),t+dur*.3);rate.setValueAtTime(R(to),t+dur*.55);rate.linearRampToValueAtTime(1,t+dur*.85)}
  else if(tech==='/'){rate.setValueAtTime(1,t+dur*.12);rate.linearRampToValueAtTime(R(to-f),t+dur*.4)}
  else if(tech==='v')vib(t+.1,.013);
  src.start(t);src.stop(t+dur+.4);leadActive[s]={src,g}}

/* ---------- Licks ---------- */
const PMIN=[0,3,5,7,10],NAT=[0,2,3,5,7,8,10],HARM=[0,2,3,5,7,8,11],BLUES=[0,3,5,6,7,10];
const E=(s,f,d,t,to,s2,f2)=>({s,f,d,t,to,s2,f2});
const LICKS=[
 {t:'Púa alternada en la caja 1',bpm:80,sc:PMIN,b:`<p>La pentatónica menor de La en el traste 5 es la "caja 1", el lugar donde nacen la mayoría de los solos de rock. Tocala con púa alternada (abajo, arriba, abajo, arriba) y un dedo por traste: el índice cubre el 5 y el meñique o anular el 8.</p>`,
  ev:[E(0,5,1),E(0,8,1),E(1,5,1),E(1,7,1),E(2,5,1),E(2,7,1),E(3,5,1),E(3,7,1),E(4,5,1),E(4,8,1),E(5,5,1),E(5,8,1),E(5,5,1),E(4,8,1),E(4,5,1),E(3,7,1),E(3,5,1),E(2,7,1),E(2,5,1),E(1,7,1),E(1,5,1),E(0,8,1),E(0,5,2)],tip:'Empezá al 50 % de velocidad. Subí solo cuando salga diez veces seguidas sin errores.'},
 {t:'Vibrato que canta',bpm:70,sc:PMIN,b:`<p>El vibrato es la firma de un guitarrista. En el rock melódico es ancho y parejo: la cuerda sube y baja de afinación moviendo la muñeca, como girando un picaporte, no solo el dedo.</p>`,
  ev:[E(3,7,2),E(3,5,2),E(4,5,4,'v'),E(4,8,2),E(5,5,6,'v')],tip:'Grabate con el celular. Un vibrato demasiado rápido suena nervioso; buscá un pulso regular.'},
 {t:'Bends afinados',bpm:70,sc:PMIN,b:`<p>Empujá la cuerda hacia arriba hasta que suene como la nota dos trastes más arriba. Usá tres dedos juntos (anular apoyado por el mayor y el índice) para tener fuerza y control.</p><p>Para chequear la afinación, tocá primero la nota destino (por ejemplo el traste 9) y después hacé el bend desde el 7 hasta igualarla.</p>`,
  ev:[E(3,7,4,'bv',2),E(4,8,4,'bv',2),E(4,5,2),E(3,7,6,'v')],tip:'Un bend que no llega a la nota suena desafinado. Es lo primero que delata a un principiante.'},
 {t:'Bend y vuelta',bpm:75,sc:PMIN,b:`<p>Subir con el bend, sostener y bajar sin volver a pulsar la cuerda. Es uno de los gestos más clásicos del hard rock: da la sensación de que la guitarra "habla".</p>`,
  ev:[E(4,8,1),E(4,5,1),E(3,7,4,'br',2),E(3,5,2),E(2,7,8,'v')]},
 {t:'Ligados: hammer-on y pull-off',bpm:80,sc:PMIN,b:`<p>Con los ligados tocás varias notas con un solo golpe de púa. Así ganás velocidad y fluidez. En el hammer-on el dedo cae como un martillo; en el pull-off tirás levemente de la cuerda hacia abajo al soltarla.</p>`,
  ev:[E(3,5,1),E(3,7,1,'h'),E(3,5,1,'p'),E(2,7,1),E(2,5,1),E(2,7,1,'h'),E(2,5,1,'p'),E(1,7,1),E(1,5,1),E(1,7,1,'h'),E(1,5,1,'p'),E(0,8,1),E(0,5,4,'v')]},
 {t:'Slides y la caja 2',bpm:80,sc:PMIN,b:`<p>Los solos melódicos no se quedan quietos en una caja. Con un slide pasás de la caja 1 a la caja 2 y llegás a las notas agudas, donde las frases suenan más épicas.</p>`,
  ev:[E(3,5,1),E(3,7,3,'/',9),E(4,8,1),E(4,10,1),E(5,8,1),E(5,10,1),E(5,12,6,'v')],tip:'Mirá en el explorador de Teoría la pentatónica de La en todo el mástil para descubrir las otras cajas.'},
 {t:'Double stops',bpm:90,sc:PMIN,b:`<p>Dos notas a la vez, normalmente en las cuerdas 1 y 2 o 2 y 3. Le dan peso y actitud rockera a una frase. Pisá las dos cuerdas con el mismo dedo, acostado.</p>`,
  ev:[E(4,5,1,null,null,5,5),E(4,5,1,null,null,5,5),E(4,8,2,null,null,5,8),E(4,5,1,null,null,5,5),E(4,5,1,null,null,5,5),E(3,7,2,null,null,4,8),E(3,5,2,null,null,4,5),E(2,7,6,'v')]},
 {t:'Menor natural: el sonido melódico',bpm:72,sc:NAT,b:`<p>Si a la pentatónica le sumás dos notas, Si y Fa, obtenés la escala menor natural. Esas notas extra son las que vuelven una frase más "cantable" y emotiva, típicas de los solos de balada rockera.</p><p>Fijate cómo la frase termina en el Fa: sobre un acorde de F suena tensa y hermosa a la vez.</p>`,
  ev:[E(4,5,1),E(4,6,1),E(4,8,1),E(5,5,1),E(5,7,1),E(5,8,3,'v'),E(5,7,1),E(5,5,1),E(4,6,6,'v')]},
 {t:'Menor armónica sobre el E',bpm:76,sc:HARM,b:`<p>Cuando la base pasa por un acorde de E (Mi mayor) en una canción en La menor, cambiá el Sol por Sol#. Esa nota crea una tensión casi neoclásica que resuelve al volver a La.</p>`,
  ev:[E(5,8,1),E(5,7,1),E(5,5,1),E(5,4,1),E(4,6,1),E(4,5,1),E(5,4,2),E(5,5,8,'v')],tip:'Probalo en la zapada "Andaluza": tocá esta frase justo cuando suena el E.'},
 {t:'Frase completa',bpm:84,sc:PMIN,b:`<p>Juntá todo: bend con vibrato para abrir, una bajada rápida, bend y vuelta, ligados y una nota larga para cerrar. Una buena frase de solo tiene principio, desarrollo y final, como una oración.</p>`,
  ev:[E(3,5,1),E(3,7,3,'bv',2),E(5,8,1),E(5,5,1),E(4,8,1),E(4,5,1),E(3,7,2,'br',2),E(3,5,1),E(2,5,1),E(2,7,1,'h'),E(2,5,1,'p'),E(1,7,1),E(2,7,6,'v')],tip:'Ahora inventá tu propia frase en la zapada usando estas mismas técnicas.'},
 {t:'Sacar un solo de oído',bpm:0,b:`<p>Así se aprenden los punteos de tus guitarristas favoritos:</p><ul><li><b>Encontrá la tonalidad.</b> Tocá notas graves sobre la canción hasta dar con la que "descansa". Casi siempre es la tónica.</li><li><b>Ubicá la caja.</b> La mayoría de los solos de rock se mueven en la pentatónica o la menor natural de esa tónica.</li><li><b>Frase por frase.</b> Escuchá dos o tres segundos, cantalos y buscá esas notas en la caja.</li><li><b>Bajá la velocidad.</b> YouTube y muchas apps permiten reproducir al 50 o 75 % sin cambiar la afinación.</li><li><b>Copiá también el gesto:</b> dónde hay bend, vibrato o slide.</li></ul><p>Los ejercicios de "Melodía" y "Nota en el diapasón" de la pestaña Oído entrenan justamente esto.</p>`,tip:'Si buscás tablaturas, contrastalas siempre con la grabación: muchas tienen errores.'}
];
let pdone=store.get('pdone',[]);
const licksEl=document.getElementById('licks');let lickPlay=null;
function lab(e,s){const f=s===e.s?e.f:e.f2;if(s!==e.s)return String(f);
  return e.t==='h'?'h'+f:e.t==='p'?'p'+f:e.t==='b'?f+'b'+(f+e.to):e.t==='bv'?f+'b'+(f+e.to)+'~':e.t==='br'?f+'b'+(f+e.to)+'r'+f:e.t==='/'?f+'/'+e.to:e.t==='v'?f+'~':String(f)}
function tabHTML(ev){const names=['E','A','D','G','B','e'];const lines=[5,4,3,2,1,0].map(s=>names[s]+'|-');
  ev.forEach((e,i)=>{const cells={};cells[e.s]=lab(e,e.s);if(e.s2!=null)cells[e.s2]=lab(e,e.s2);const w=Math.max(...Object.values(cells).map(x=>x.length))+1+(e.d>1?1:0);
    [5,4,3,2,1,0].forEach((s,r)=>{const c=cells[s]||'';lines[r]+=`<span class="ev${i}">${c}</span>`+'-'.repeat(w-c.length)})});
  return lines.map(l=>l+'|').join('\n')}
function lickBoard(L,cur){const set=L.sc.map(i=>pc(9+i));return boardSVG((s,f)=>{
  if(cur&&((cur.s===s&&cur.f===f)||(cur.s2===s&&cur.f2===f)||(cur.t==='/'&&cur.s===s&&f===cur.to&&false)))return{label:NOTES[pc(OPEN[s]+f)],kind:'hit'};
  const p=pc(OPEN[s]+f);if(f<3||!set.includes(p))return null;return{label:NOTES[p],kind:p===9?'root':'plain'}})}
function renderLicks(){licksEl.innerHTML=LICKS.map((L,i)=>{const isDone=pdone.includes(i+1);
  return `<div class="lesson${isDone?' done':''}" data-i="${i}"><button class="lh" aria-expanded="false"><span class="lnum">${isDone?'✓':i+1}</span><span class="ltitle">${L.t}</span><svg class="chev" width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M5 3l5 5-5 5" fill="none" stroke="currentColor" stroke-width="2"/></svg></button><div class="lbody">${L.b}
  ${L.ev?`<div class="tab" id="tab${i}">${tabHTML(L.ev)}</div><div class="board-wrap" id="lb${i}" style="margin-top:0">${lickBoard(L)}</div>
  <div class="controls" style="margin-top:12px"><label>Velocidad<select data-speed="${i}"><option value=".5">50 %</option><option value=".75">75 %</option><option value="1" selected>100 %</option></select></label><label class="toggle" style="margin:0 0 8px"><input type="checkbox" data-loop="${i}"> Repetir</label></div>`:''}
  ${L.tip?`<div class="tip">${L.tip}</div>`:''}
  <div class="actions">${L.ev?`<button class="btn primary" data-play="${i}">Escuchar y ver</button>`:''}<button class="btn ${isDone?'ok':''}" data-pdone="${i+1}">${isDone?'Completada':'Marcar como completada'}</button></div></div></div>`}).join('');updPProg()}
function updPProg(){document.getElementById('pProgFill').style.width=(pdone.length/LICKS.length*100)+'%';document.getElementById('pProgText').textContent=`${pdone.length} de ${LICKS.length}`}
function stopLick(){if(!lickPlay)return;lickPlay.timers.forEach(clearTimeout);const b=licksEl.querySelector(`[data-play="${lickPlay.i}"]`);if(b)b.textContent='Escuchar y ver';
  const tb=document.getElementById('tab'+lickPlay.i);if(tb)tb.querySelectorAll('.cur').forEach(x=>x.classList.remove('cur'));
  Object.values(leadActive).forEach(a=>{try{a.g.gain.setTargetAtTime(0,ctx.currentTime,.03)}catch(e){}});lickPlay=null}
function startLick(i){if(!ac())return;stopLick();const L=LICKS[i];const sp=+licksEl.querySelector(`[data-speed="${i}"]`).value;
  const q=60/L.bpm/2/sp;let t=ctx.currentTime+.08;const t0=t;const timers=[];const tb=document.getElementById('tab'+i),bd=document.getElementById('lb'+i);
  L.ev.forEach((e,k)=>{const dur=e.d*q;playLead(e.s,e.f,t,dur,e.t,e.to);if(e.s2!=null)playLead(e.s2,e.f2,t,dur,null);
    timers.push(setTimeout(()=>{tb.querySelectorAll('.cur').forEach(x=>x.classList.remove('cur'));tb.querySelectorAll('.ev'+k).forEach(x=>{if(x.textContent)x.classList.add('cur')});bd.innerHTML=lickBoard(L,e.t==='/'?{...e}:e)},(t-ctx.currentTime)*1000));t+=dur});
  timers.push(setTimeout(()=>{const loop=licksEl.querySelector(`[data-loop="${i}"]`).checked;if(loop&&lickPlay&&lickPlay.i===i)startLick(i);else{stopLick();bd.innerHTML=lickBoard(L)}},(t-ctx.currentTime+.6)*1000));
  lickPlay={i,timers};licksEl.querySelector(`[data-play="${i}"]`).textContent='Detener'}
licksEl.addEventListener('click',e=>{
  const h=e.target.closest('.lh');if(h){const ls=h.parentElement;ls.classList.toggle('open');h.setAttribute('aria-expanded',ls.classList.contains('open'));return}
  const p=e.target.closest('[data-play]');if(p){const i=+p.dataset.play;if(lickPlay&&lickPlay.i===i)stopLick();else startLick(i);return}
  const d=e.target.closest('[data-pdone]');if(d){const k=+d.dataset.pdone;pdone=pdone.includes(k)?pdone.filter(x=>x!==k):[...pdone,k];store.set('pdone',pdone);
    const ls=d.closest('.lesson'),on=pdone.includes(k);ls.classList.toggle('done',on);ls.querySelector('.lnum').textContent=on?'✓':k;d.className='btn'+(on?' ok':'');d.textContent=on?'Completada':'Marcar como completada';updPProg()}});
licksEl.addEventListener('click',e=>{const r=e.target.closest('[data-s]');if(!r)return;const s=+r.dataset.s,f=+r.dataset.f;if(ac())playLead(s,f,ctx.currentTime,.9,'v')});
renderLicks();

/* ---------- Zapada ---------- */
const JAMS=[
 {n:'Rock melódico: Am F C G',ch:['Am','F','C','G'],sc:NAT,txt:'Usá la menor natural de La: todas sus notas encajan en los cuatro acordes.'},
 {n:'Andaluza: Am G F E',ch:['Am','G','F','E'],sc:NAT,harm:'E',txt:'Menor natural de La, y cuando suena el E cambiá Sol por Sol# (menor armónica).'},
 {n:'Hard rock: Am G Am F',ch:['Am','G','Am','F'],sc:PMIN,txt:'Pentatónica menor de La. Probá bends en la 3ª cuerda, traste 7.'},
 {n:'Blues en La',ch:['A7','A7','D7','A7','E7','D7','A7','E7'],sc:BLUES,txt:'Escala de blues de La: la pentatónica con una nota extra, el Mib.'}
];
const jamSel=document.getElementById('jamSel'),jamBpm=document.getElementById('jamBpm'),jamBtn=document.getElementById('jamBtn'),jamBoard=document.getElementById('jamBoard');
jamSel.innerHTML=JAMS.map((j,i)=>`<option value="${i}">${j.n}</option>`).join('');
const jam={on:false,next:0,slot:0,bar:0,timer:null};let noiseBuf=null;
function noise(){if(noiseBuf)return noiseBuf;const b=ctx.createBuffer(1,ctx.sampleRate*.5,ctx.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;return noiseBuf=b}
function drum(type,t){if(type==='k'){const o=ctx.createOscillator(),g=ctx.createGain();o.frequency.setValueAtTime(140,t);o.frequency.exponentialRampToValueAtTime(42,t+.12);g.gain.setValueAtTime(.9,t);g.gain.exponentialRampToValueAtTime(.001,t+.3);o.connect(g);g.connect(master);o.start(t);o.stop(t+.32);return}
  const n=ctx.createBufferSource();n.buffer=noise();const f=ctx.createBiquadFilter();f.type='highpass';f.frequency.value=type==='s'?1200:7000;const g=ctx.createGain();const dec=type==='s'?.16:.04;g.gain.setValueAtTime(type==='s'?.5:.13,t);g.gain.exponentialRampToValueAtTime(.001,t+dec);n.connect(f);f.connect(g);g.connect(master);n.start(t);n.stop(t+dec+.02)}
function chordRootPc(id){return rootPcOf(byId[id].n)}
function jamDraw(barIdx){const J=JAMS[+jamSel.value],id=J.ch[barIdx%J.ch.length],nx=J.ch[(barIdx+1)%J.ch.length];
  const sc=(J.harm&&byId[id].n===J.harm?HARM:J.sc).map(i=>pc(9+i));const tones=chordNotes(byId[id]);
  document.getElementById('jamChord').textContent=byId[id].n;document.getElementById('jamNext').textContent='Sigue '+byId[nx].n;document.getElementById('jamTxt').textContent=J.txt;
  document.getElementById('jamBars').innerHTML=J.ch.map((c,i)=>`<span class="${i===barIdx%J.ch.length&&jam.on?'now':''}">${byId[c].n}</span>`).join('');
  jamBoard.innerHTML=boardSVG((s,f)=>{const p=pc(OPEN[s]+f);if(tones.includes(p))return{label:NOTES[p],kind:'root'};if(sc.includes(p))return{label:NOTES[p],kind:'plain'};return null})}
const RHY=['D','','D','U','','U','D','U'];
function jamSched(slot,bar,t){const J=JAMS[+jamSel.value],id=J.ch[bar%J.ch.length];
  drum('h',t);if(slot===0||slot===4||slot===5&&bar%2)drum('k',t);if(slot===2||slot===6)drum('s',t);
  if(RHY[slot])strum(byId[id].frets,t,RHY[slot],.45);
  if(slot%2===0){const rp=chordRootPc(id);playNote(28+pc(rp-4)+12,t,null,.55)}
  if(slot===0)setTimeout(()=>{if(jam.on)jamDraw(bar)},Math.max(0,(t-ctx.currentTime)*1000))}
function jamTick(){while(jam.next<ctx.currentTime+.12){jamSched(jam.slot,jam.bar,jam.next);jam.next+=60/(+jamBpm.value)/2;jam.slot++;if(jam.slot===8){jam.slot=0;jam.bar++}}}
jamBtn.addEventListener('click',()=>{if(!ac())return;jam.on=!jam.on;
  if(jam.on){jam.slot=0;jam.bar=0;jam.next=ctx.currentTime+.1;jam.timer=setInterval(jamTick,25);jamBtn.textContent='Detener zapada'}
  else{clearInterval(jam.timer);jamBtn.textContent='Empezar zapada';jamDraw(0)}});
jamSel.addEventListener('change',()=>{jam.bar=0;jam.slot=0;jamDraw(0)});
boardClick(jamBoard);jamDraw(0);

/* ---------- Oído ---------- */
const IV_NAMES={1:'2ª menor',2:'2ª mayor',3:'3ª menor',4:'3ª mayor',5:'4ª justa',6:'Tritono',7:'5ª justa',8:'6ª menor',9:'6ª mayor',10:'7ª menor',11:'7ª mayor',12:'Octava'};
const CH_T={'Mayor':[0,4,7],'Menor':[0,3,7],'Séptima':[0,4,7,10],'Mayor 7':[0,4,7,11],'Menor 7':[0,3,7,10],'Sus4':[0,5,7],'Disminuido':[0,3,6]};
const MODES=[
 {id:'pitch',n:'Agudo o grave',lv:['Fácil','Medio','Difícil'],d:'Vas a escuchar dos notas. ¿Cuál es más aguda?'},
 {id:'iv',n:'Intervalos',lv:['Básico','Medio','Completo'],d:'¿Qué distancia hay entre las dos notas?'},
 {id:'ch',n:'Acordes',lv:['Mayor o menor','Con séptimas','Todos'],d:'¿Qué tipo de acorde suena?'},
 {id:'mel',n:'Melodía',lv:['3 notas','4 notas'],d:'Primero suena un La menor de referencia. Después, una melodía con la pentatónica de La. Tocá los grados en orden.'},
 {id:'fret',n:'Nota en el diapasón',lv:['Con ayuda','Sin ayuda'],d:'Suena un La de referencia y después una nota de la caja 1. Encontrala tocando el diapasón.'}
];
let earMode='pitch',earQ=null,earLock=false;const earStats=store.get('ear',{});const earLv=store.get('earLv',{});
const rnd=(a,b)=>a+Math.floor(Math.random()*(b-a+1)),pick=a=>a[Math.floor(Math.random()*a.length)];
function clean(m,t,v){playNote(m,t,null,v==null?.5:v)}
function earModes(){document.getElementById('earModes').innerHTML=MODES.map(m=>`<button class="chip" aria-pressed="${m.id===earMode}" data-m="${m.id}">${m.n}</button>`).join('')}
document.getElementById('earModes').addEventListener('click',e=>{const b=e.target.closest('[data-m]');if(!b)return;earMode=b.dataset.m;earModes();earRender()});
const PENT_DEG=[{iv:0,l:'1 (La)'},{iv:3,l:'b3 (Do)'},{iv:5,l:'4 (Re)'},{iv:7,l:'5 (Mi)'},{iv:10,l:'b7 (Sol)'}];
const BOX1=[];[[0,5],[0,8],[1,5],[1,7],[2,5],[2,7],[3,5],[3,7],[4,5],[4,8],[5,5],[5,8]].forEach(([s,f])=>BOX1.push({s,f,m:OPEN[s]+f}));
function newQ(){const lv=earLv[earMode]||0;let q={};
  if(earMode==='pitch'){const a=rnd(50,70),rg=[[5,12],[2,4],[1,1]][lv],d=rnd(rg[0],rg[1])*(Math.random()<.5?-1:1);q={play:t=>{clean(a,t);clean(a+d,t+.8)},ans:d>0?'2':'1',opts:[['1','La primera'],['2','La segunda']]}}
  if(earMode==='iv'){const set=[[4,7,12],[2,3,4,5,7,12],[1,2,3,4,5,6,7,8,9,10,11,12]][lv],iv=pick(set),a=rnd(52,64);q={play:t=>{clean(a,t);clean(a+iv,t+.75)},ans:String(iv),opts:set.map(i=>[String(i),IV_NAMES[i]])}}
  if(earMode==='ch'){const set=[['Mayor','Menor'],['Mayor','Menor','Séptima','Mayor 7','Menor 7'],Object.keys(CH_T)][lv],k=pick(set),r=rnd(48,57);q={play:t=>{CH_T[k].forEach((iv,i)=>clean(r+iv,t+i*.04,.4));CH_T[k].forEach((iv,i)=>clean(r+iv,t+1.1+i*.22,.4))},ans:k,opts:set.map(x=>[x,x])}}
  if(earMode==='mel'){const n=lv?4:3,seq=[];while(seq.length<n){const d=pick(PENT_DEG);if(!seq.length||seq[seq.length-1]!==d)seq.push(d)}
    q={play:t=>{[0,3,7].forEach((iv,i)=>clean(45+12+iv,t+i*.03,.35));seq.forEach((d,i)=>clean(57+d.iv,t+1.2+i*.6,.55))},seq,got:[]}}
  if(earMode==='fret'){const tg=pick(BOX1);q={play:t=>{clean(57,t,.45);playNote(tg.m,t+.9,tg.s,.55)},tg}}
  return q}
function earRender(){const M=MODES.find(m=>m.id===earMode),lv=earLv[earMode]||0;earQ=newQ();earLock=false;
  let h=`<div class="controls"><label>Nivel<select id="earLv">${M.lv.map((l,i)=>`<option value="${i}"${i===lv?' selected':''}>${l}</option>`).join('')}</select></label><button class="btn primary" id="earPlay">Escuchar</button><button class="btn" id="earNext">Otra</button></div><p class="q">${M.d}</p>`;
  if(earMode==='mel')h+=`<div class="answers">${PENT_DEG.map((d,i)=>`<button class="ans" data-deg="${i}">${d.l}</button>`).join('')}</div><div class="seq" id="earSeq"></div>`;
  else if(earMode==='fret')h+=`<div class="board-wrap" id="earBoard" style="margin-top:0"></div>`;
  else h+=`<div class="answers">${earQ.opts.map(o=>`<button class="ans" data-a="${o[0]}">${o[1]}</button>`).join('')}</div>`;
  h+=`<div class="feedback" id="earFb"></div><div class="stats" id="earStats"></div>`;
  const P=document.getElementById('earPanel');P.innerHTML=h;
  if(earMode==='fret')drawEarBoard();
  document.getElementById('earLv').addEventListener('change',e=>{earLv[earMode]=+e.target.value;store.set('earLv',earLv);earRender()});
  document.getElementById('earPlay').addEventListener('click',()=>{if(ac())earQ.play(ctx.currentTime+.05)});
  document.getElementById('earNext').addEventListener('click',()=>{earRender();if(ac())earQ.play(ctx.currentTime+.05)});
  showStats()}
function drawEarBoard(hit,ok){const help=(earLv.fret||0)===0;document.getElementById('earBoard').innerHTML=boardSVG((s,f)=>{
  if(hit&&hit.s===s&&hit.f===f)return{label:NOTES[pc(OPEN[s]+f)],kind:ok?'root':'hit'};
  if(ok===false&&earQ.tg.s===s&&earQ.tg.f===f)return{label:NOTES[pc(OPEN[s]+f)],kind:'root'};
  if(help&&BOX1.some(b=>b.s===s&&b.f===f))return{label:'',kind:'plain'};return null})}
function showStats(){const st=earStats[earMode]||{ok:0,n:0,run:0,best:0};document.getElementById('earStats').innerHTML=`<div><b>${st.n?Math.round(st.ok/st.n*100):0} %</b>aciertos</div><div><b>${st.ok}/${st.n}</b>respuestas</div><div><b>${st.run}</b>racha</div><div><b>${st.best}</b>mejor racha</div>`}
function score(ok,msg){const st=earStats[earMode]||{ok:0,n:0,run:0,best:0};st.n++;if(ok){st.ok++;st.run++;st.best=Math.max(st.best,st.run)}else st.run=0;earStats[earMode]=st;store.set('ear',earStats);
  const fb=document.getElementById('earFb');fb.textContent=msg;fb.style.color=ok?'var(--done)':'#B5483B';showStats();earLock=true;
  if(ok)setTimeout(()=>{if(document.getElementById('earFb')===fb){earRender();if(ac())earQ.play(ctx.currentTime+.05)}},1300)}
document.getElementById('earPanel').addEventListener('click',e=>{
  const a=e.target.closest('[data-a]');if(a&&!earLock){const ok=a.dataset.a===earQ.ans;a.classList.add(ok?'right':'wrong');if(!ok){const r=document.querySelector(`[data-a="${earQ.ans}"]`);if(r)r.classList.add('right')}score(ok,ok?'¡Bien!':'Era la marcada en verde. Escuchala de nuevo con "Escuchar".');return}
  const d=e.target.closest('[data-deg]');if(d&&!earLock){const deg=PENT_DEG[+d.dataset.deg];clean(57+deg.iv,null,.5);earQ.got.push(deg);
    document.getElementById('earSeq').innerHTML=earQ.got.map(g=>`<span>${g.l}</span>`).join('');
    if(earQ.got.length===earQ.seq.length){const ok=earQ.got.every((g,i)=>g===earQ.seq[i]);score(ok,ok?'¡Exacto!':'Era: '+earQ.seq.map(x=>x.l).join(', '))}return}
  const r=e.target.closest('[data-s]');if(r&&earMode==='fret'&&!earLock){const s=+r.dataset.s,f=+r.dataset.f;playNote(OPEN[s]+f,null,s);const ok=OPEN[s]+f===earQ.tg.m;drawEarBoard({s,f},ok);
    score(ok,ok?'¡Encontrada! Era '+NOTES[pc(earQ.tg.m)]:'No. Era '+NOTES[pc(earQ.tg.m)]+', marcada en azul.')}});
earModes();earRender();

/* ---------- Pestañas ---------- */
const tabs=document.querySelectorAll('nav.tabs button');
function go(id){if(typeof stopLick==='function')stopLick();tabs.forEach(t=>t.setAttribute('aria-selected',t.dataset.tab===id));document.querySelectorAll('section.view').forEach(v=>v.classList.toggle('on',v.id==='v-'+id));window.scrollTo(0,0);store.set('tab',id)}
tabs.forEach(t=>t.addEventListener('click',()=>go(t.dataset.tab)));
const lastTab=store.get('tab','ruta');if(lastTab!=='ruta')go(lastTab);


/* ---------- PWA: funciona offline y se puede instalar ---------- */
if ("serviceWorker" in navigator && import.meta.env.PROD) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  });
}
