// ============================================================
// 60 · Kapitler og trin: tekst, fakta, knapper
// ============================================================
const fact = (n, t) => ({ n, t });
const beforeVoyagerDay = NOW < VOYAGER_LIGHTDAY;

// Dybde-stop: s = log10(synsfelt i meter)
const DEPTH_STOPS = [
  { s: 7.35, dir: () => W.cosmos.earthDir(), title: 'Jorden', lead: '12.742 km på tværs. Alt, du nogensinde har kendt, er sket her.',
    facts: ['Kloden er vist, som den står lige nu. Er det aften i Danmark, ligger vi på natsiden.', 'Rul, knib eller brug skyderen for at zoome ud. Hvert trin på skalaen er 10 gange større end det forrige.'] },
  { s: 9.15, dir: () => new THREE.Vector3(0.25, 0.85, 0.6), title: 'Månen', lead: '384.400 km væk. Lyset er 1,3 sekunder om turen.',
    facts: [fact('3,8 cm', 'fjerner Månen sig fra Jorden hvert år.')] },
  { s: 11.75, dir: () => new THREE.Vector3(0.15, 0.9, 0.55), title: 'Det indre solsystem', lead: 'Lyset fra Solen er 8 minutter og 20 sekunder om at nå os.',
    facts: ['Merkur, Venus, Jorden og Mars er de fire klippeplaneter.'] },
  { s: 13.2, dir: () => new THREE.Vector3(0.2, 0.75, 0.75), title: 'Planeterne', lead: 'Neptun er 4,5 milliarder km fra Solen. Lyset er over 4 timer om at nå derud.',
    facts: ['Planeterne og deres måner er små prikker i et næsten tomt rum.'] },
  { s: 14.25, dir: () => new THREE.Vector3(0.35, 0.45, 1), title: 'Voyager 1',
    lead: beforeVoyagerDay ? 'Det fjerneste, vi har sendt afsted. Den 18. november 2026 bliver Voyager 1 det første menneskeskabte objekt ét lysdøgn fra Jorden.' : 'Det fjerneste, vi har sendt afsted. Siden 18. november 2026 har Voyager 1 været mere end ét lysdøgn fra Jorden.',
    facts: [fact(`${voyagerYears()} år`, 'har den været på vej. Den flyver 17 km i sekundet.')] },
  { s: 16.35, dir: () => new THREE.Vector3(0.3, 0.5, 1), title: 'Oortskyen', lead: 'En kæmpe kugle af iskolde kometer, der måske når 1,5 lysår ud. Ingen har set den direkte.',
    facts: ['Den hænger stadig fast i Solens tyngdekraft.'] },
  { s: 17.4, dir: () => new THREE.Vector3(0.4, 0.35, 1), title: 'Nabostjernerne', lead: 'Proxima Centauri er 4,24 lysår væk. Med Voyagers fart ville turen tage 75.000 år.',
    facts: ['De fleste af vores naboer er små røde dværge, som ingen kan se med det blotte øje.'] },
  { s: 21.1, dir: () => W.cosmos.galaxyDir(), title: 'Mælkevejen', lead: '100 til 400 milliarder stjerner. Solen er én af dem, ca. 26.000 lysår fra centrum.',
    facts: [fact('100.000 lysår', 'på tværs. Lyset er 100.000 år om at krydse galaksen.')] },
  { s: 23.0, dir: () => new THREE.Vector3(0.35, 0.6, 1), title: 'Lokalgruppen', lead: 'Andromeda er 2,5 millioner lysår væk. Lyset, du ser fra den i dag, blev sendt afsted, da de første mennesker af slægten Homo gik rundt i Afrika.',
    facts: ['Lokalgruppen er over 80 galakser, der holdes sammen af tyngdekraften.'] },
  { s: 25.0, dir: () => new THREE.Vector3(0.25, 0.5, 1), title: 'Laniakea', lead: 'Vores superhob: ca. 100.000 galakser fordelt over 520 millioner lysår. Navnet er hawaiiansk og betyder umådelig himmel.',
    facts: ['Galakserne ligger på lange tråde omkring store, tomme rum. Mønsteret kaldes det kosmiske net.'] },
  { s: 27.1, dir: () => new THREE.Vector3(0.3, 0.35, 1), title: 'Det observerbare univers', lead: '93 milliarder lysår på tværs med flere hundrede milliarder galakser.',
    facts: [() => `Jorden fylder nu <b id="earthPxFact">${earthPxText(27.1)}</b> pixel på din skærm.`, 'Der er flere stjerner derude end sandkorn på alle Jordens strande.'] },
];

const CHAPTERS = [
  {
    id: 'sol', short: 'Solen', name: 'Solen varmer Jorden', world: 'sunEarth',
    beats: [
      { title: 'En stjerne, der arbejder for os', scale: 11,
        lead: 'Hvert sekund omdanner Solen 4 millioner tons stof til ren energi.',
        facts: [fact('600 mio. tons', 'brint smelter hvert sekund sammen til helium i Solens kerne.'), fact('15 mio. °C', 'i kernen. På overfladen er der ca. 5.500 °C.'), fact('99,86 %', 'af al masse i solsystemet sidder i Solen.')],
        note: 'Solen og Jorden står i samme retning i forhold til hinanden som lige nu. Størrelser og afstande er ikke i skala endnu.',
        enter: (first) => W.sunEarth.beat(0, first) },
      { title: 'Lysets lange vej ud', scale: 9,
        lead: 'Energien i sollyset på din hud har været ca. 170.000 år om at slippe ud af Solen.',
        facts: [fact('170.000 år', 'arbejder energien sig gennem strålingszonen. Lyset bliver slugt og sendt videre i en ny retning igen og igen, under en millimeter ad gangen.'), fact('2 sekunder', 'er neutrinoerne fra de samme reaktioner om at komme ud. De flyver lige igennem.'), fact('8 min 20 s', 'tager det derefter lyset at nå Jorden.'), 'Da energien begyndte sin vej, gik der stadig neandertalere rundt i Europa.'],
        widget: (el) => button(el, 'Afspil fotonens rejse igen', () => W.sunEarth.replayPhoton()),
        enter: (first) => W.sunEarth.beat(1, first) },
      { title: 'Jorden fanger en brøkdel', scale: 11,
        lead: 'Kun én del ud af 2,2 milliarder af Solens lys rammer Jorden. Det er stadig 9.000 gange mere energi, end hele menneskeheden bruger.',
        facts: [fact('Under 1 time', 'sollys på Jorden rummer lige så meget energi, som menneskeheden bruger på et helt år (592 exajoule i 2024).'), fact('30 %', 'kastes direkte tilbage af skyer, is og lyse overflader (de blå partikler).'), fact('Under 0,1 %', 'fanges af planterne. Det driver næsten alt liv på kloden.')],
        enter: (first) => W.sunEarth.beat(2, first) },
      { title: 'Tæppet og skjoldet', scale: 7,
        lead: 'Uden atmosfære ville Jorden i gennemsnit være −18 °C. Med den er det +15 °C.',
        facts: ['Jorden sender varmen tilbage mod rummet som infrarød stråling (de røde partikler). Drivhusgasser som vanddamp og CO₂ sender en del af den tilbage mod jorden.', fact('+33 °C', 'så meget varmere gør atmosfæren kloden. Mere CO₂ gør dynen tykkere.'), 'Magnetfeltet bøjer solvinden af. Ved polerne slipper partikler ind og får luften til at lyse. Det er nordlys.'],
        widget: (el) => toggleChips(el, [['Med atmosfære', true], ['Uden atmosfære', false]], true, (v) => W.sunEarth.setAtmosphere(v)),
        enter: (first) => W.sunEarth.beat(3, first) },
    ],
  },
  {
    id: 'planeter', short: 'Planeterne', name: 'Solsystemet', world: 'solar',
    beats: [
      { title: 'Sådan står planeterne lige nu', scale: 13,
        lead: 'Positionerne er regnet ud fra NASA/JPL’s baneelementer for dags dato.',
        facts: ['Tryk på en planet for at se fakta. Størrelserne er forstørret, og afstandene er presset sammen, så alt kan ses på én gang.'],
        widget: (el) => { timeControls(el); planetChips(el); },
        enter: (first) => W.solar.setMode('today', first) },
      { title: 'Tyngdekraften er limen', scale: 13,
        lead: 'Alt falder. Planeterne falder hele tiden mod Solen, men de bevæger sig så hurtigt sidelæns, at de bliver ved med at ramme ved siden af.',
        facts: [fact('1,4 mm', 'falder Månen mod Jorden hvert sekund. Samtidig flytter den sig 1 km sidelæns, så den bliver i sin bane.'), fact('47 km/s', 'suser Merkur afsted tæt på Solen. Neptun, længst ude, bevæger sig 5,4 km/s.'), 'Gitteret er en 2D-model af Einsteins krumme rumtid. Tunge ting laver dybe fordybninger, og alt andet følger kurverne.'],
        enter: (first) => W.solar.setMode('gravity', first) },
      { title: 'Alt er i bevægelse', scale: 14,
        lead: 'Solen suser rundt om Mælkevejens centrum med ca. 230 km/s og trækker planeterne med sig.',
        facts: [fact('~230 mio. år', 'tager én omgang om galaksen. Sidst Solen var her, var de første dinosaurer lige kommet til.'), fact('7 mia. km', 'har du rejst gennem galaksen det seneste år.'), 'Set udefra tegner planeterne derfor spiraler. Her er spiralerne trykket 13 gange sammen, så de kan ses.'],
        enter: (first) => W.solar.setMode('travel', first) },
    ],
  },
  {
    id: 'tomhed', short: 'Tomheden', name: 'Tomheden', world: 'solar',
    beats: [
      { title: 'Solsystemet i ægte skala', scale: 13,
        lead: 'Planeterne er der stadig. De er bare for små til at ses. Ringene viser, hvor de er.',
        facts: ['Hvis Solen var en grapefrugt i København, ville Jorden være et sandkorn 11 meter væk.', 'Jupiter ville være en ært 56 meter væk og Neptun et peberkorn 320 meter væk.', 'Den nærmeste stjerne ville være endnu en grapefrugt i Casablanca, 2.900 km væk.'],
        widget: (el) => toggleChips(el, [['Pæn skala', 0], ['Ægte skala', 1]], 1, (v) => W.solar.setMorph(v, 3)),
        enter: (first) => W.solar.setMode('true', first) },
      { title: 'Rejs med lysets hastighed', scale: 13.5,
        lead: 'Lys er det hurtigste, der findes. Alligevel tager det over 4 timer at nå Neptun.',
        facts: ['Med samme fart når lyset Proxima Centauri, den nærmeste stjerne, efter 4 år og 3 måneder.'],
        widget: (el) => lightControls(el),
        enter: (first) => W.solar.setMode('light', first) },
      { title: 'Tomt helt ned i atomerne', scale: -10, world: 'atom',
        lead: 'Et atom er 99,9999999999996 % tomt rum.',
        facts: ['Hvis atomkernen var en ært midt på Parken, ville elektronen summe rundt langt uden for stadion.', 'Fjernede man al tom plads i atomerne i alle 8 milliarder mennesker, kunne hele menneskeheden være i et sukkerknald.', fact('~1 atom pr. m³', 'findes der i rummet mellem galakserne. Luften omkring dig har 25.000.000.000.000.000.000.000.000 molekyler pr. m³.'), 'Selv hvis Mælkevejen og Andromeda støder sammen, rammer næsten ingen stjerner hinanden. En analyse fra 2025 giver ca. 50 % chance for, at det sker inden for 10 mia. år.', fact('99 %', 'af protonens masse er energi fra de kræfter, der binder dens kvarker sammen.')],
        widget: (el) => { const row = div(el, 'row'); button(row, 'Zoom ind på kernen', () => W.atom.setZoom(4.6, 7), 'primary'); button(row, 'Tilbage', () => W.atom.setZoom(0, 2)); },
        enter: (first) => W.atom.beat(0, first) },
    ],
  },
  {
    id: 'stjerner', short: 'Stjernerne', name: 'Stjernernes liv og død', world: 'stars',
    beats: [
      { title: 'Stjerner fødes i mørke skyer', scale: 16,
        lead: 'En kold sky af gas og støv falder sammen under sin egen tyngde. Når kernen når 10 millioner grader, tænder fusionen, og en stjerne er født.',
        facts: [fact('1.344 lysår', 'væk ligger Oriontågen, den nærmeste store stjernefabrik. Du kan se den med det blotte øje.'), fact('~2 solmasser', 'ny stjerne dannes der i Mælkevejen hvert år.'), 'En stjerne som Solen er ca. 50 millioner år om at gå fra sky til stabil stjerne.'],
        widget: (el) => button(el, 'Se sammenfaldet igen', () => W.stars.startCollapse()),
        enter: (first) => W.stars.setMode('nebula', first) },
      { title: 'Massen bestemmer alt', scale: 9,
        lead: 'Jo tungere en stjerne er, jo hurtigere brænder den ud.',
        facts: ['Ingen røde dværge er nogensinde døde. Universet er ikke gammelt nok endnu.'],
        widget: (el) => massControls(el),
        enter: (first) => W.stars.setMode('mass', first) },
      { title: 'Sådan dør en stjerne', scale: 10,
        lead: () => deathLead(),
        facts: () => deathFacts(),
        widget: (el) => lifeControls(el),
        enter: (first) => { W.stars.setMode('life', first); setTimeout(() => { if (activeWorld === W.stars && W.stars.mode === 'life' && !W.stars.life) W.stars.playLife(); }, first ? 3000 : 2200); } },
      { title: 'Du er lavet af stjernestøv', scale: 14,
        lead: 'Jernet i dit blod, kalken i dine knogler og ilten, du indånder, blev skabt i stjerner, der døde, før Solen blev født.',
        facts: ['Solsystemet er bygget af genbrugsmateriale fra tidligere generationer af stjerner.'],
        widget: (el) => { elementTiles(el); button(el, 'Afspil igen', () => W.stars.setMode('elements')); },
        enter: (first) => W.stars.setMode('elements', first) },
    ],
  },
  {
    id: 'dybde', short: 'Dybden', name: 'Dybden', world: 'cosmos',
    beats: DEPTH_STOPS.map((st, i) => ({
      title: st.title, scale: st.s, lead: st.lead, facts: st.facts, depth: i,
      widget: (el) => depthControls(el),
      enter: (first) => { W.cosmos.setMode('depth'); if (first) { W.cosmos.s = W.cosmos.sGoal = i === 0 ? 7.9 : st.s - 0.6; cutTo(st.dir().normalize().multiplyScalar(W.cosmos.viewD()), new THREE.Vector3()); } W.cosmos.flyToStop(st.s, st.dir(), first ? 2.6 : undefined); },
    })),
  },
  {
    id: 'uendelig', short: 'Uendeligheden', name: 'Uendeligheden', world: 'cosmos',
    beats: [
      { title: 'Horisonten er ikke en kant', scale: 27,
        lead: 'Vi kan se 46,5 milliarder lysår ud i alle retninger. Længere væk har lyset endnu ikke nået os.',
        facts: [fact('13,8 mia. år', 'er universet gammelt. Horisonten er alligevel længere væk, fordi rummet har udvidet sig, mens lyset var på vej.'), 'Det fjerneste lys, vi kan se, er baggrundsstrålingen fra 380.000 år efter Big Bang.', 'Vi står i midten af vores synlige univers. Det gør alle andre også, uanset hvor de er.'],
        enter: (first) => { W.cosmos.setMode('edge'); if (first) { W.cosmos.s = W.cosmos.sGoal = 26.4; cutTo(new THREE.Vector3(0.3, 0.35, 1).normalize().multiplyScalar(W.cosmos.viewD()), new THREE.Vector3()); } W.cosmos.flyToStop(27.3, new THREE.Vector3(0.3, 0.35, 1), 3); } },
      { title: 'Uden kant og uden centrum', scale: 28.7,
        lead: 'Målinger viser, at rummet er fladt inden for 0,4 %. Det passer med et univers, der fortsætter i det uendelige.',
        facts: ['Vi ved det ikke med sikkerhed. Men vi har aldrig set tegn på en kant.', 'Hver boble er en horisont. Enhver observatør ser sit eget stykke af det samme rum.'],
        enter: (first) => { W.cosmos.setMode('beyond'); if (first) { W.cosmos.s = W.cosmos.sGoal = 27.3; } W.cosmos.flyToStop(28.75, new THREE.Vector3(0.2, 0.45, 1), 3.5); } },
      { title: 'Uendeligt betyder uendeligt', scale: 40,
        lead: 'Hvis rummet er uendeligt, gentager alt sig. Et sted derude sidder en nøjagtig kopi af dig og læser den her sætning.',
        facts: [fact('10<sup>10<sup>28</sup></sup> m', 'er fysikeren Max Tegmarks overslag over afstanden til den nærmeste kopi.'), 'Tallet er et 1-tal med 10<sup>28</sup> nuller efter. Skriver du ét nul i sekundet, tager det 23 milliarder gange universets alder.', 'Hele det observerbare univers er til sammenligning ca. 10<sup>27</sup> meter på tværs.'],
        widget: (el) => endlessControls(el),
        enter: (first) => { W.cosmos.setMode('endless'); if (first) W.cosmos.s = W.cosmos.sGoal = 28.4; W.cosmos.flyToStop(Math.max(28.6, W.cosmos.s), new THREE.Vector3(0.25, 0.4, 1), 1.5); setTimeout(() => startEndless(), 1600); } },
      { title: 'Tiden fortsætter også', scale: 26.4,
        lead: 'Om ca. 100 billioner år slukker den sidste stjerne.',
        facts: ['10<sup>14</sup> år: De sidste røde dværge brænder ud.', '10<sup>40</sup> år: Kun hvide dværge, neutronstjerner og sorte huller er tilbage. Måske henfalder selve protonerne. Det er ikke bevist.', '10<sup>100</sup> år: De største sorte huller er fordampet. Derefter er der mørke, og stadig uendeligt meget tid.'],
        widget: (el) => timeOfUniverseControls(el),
        enter: (first) => { W.cosmos.setMode('time'); if (first) { W.cosmos.s = W.cosmos.sGoal = 26.9; } W.cosmos.age = 10.14; W.cosmos.flyToStop(26.35, new THREE.Vector3(0.3, 0.5, 1), 3); } },
    ],
  },
  {
    id: 'asi', short: 'ASI', name: 'ASI derude', world: 'asi',
    beats: [
      { title: 'Hvor vi står', scale: 7,
        lead: 'Menneskeheden bruger ca. 19 terawatt. På Kardashev-skalaen er vi en type 0,73-civilisation.',
        facts: [fact('Type I', 'al den energi, der rammer planeten (ca. 10<sup>16</sup> W).'), fact('Type II', 'al energien fra en stjerne (ca. 10<sup>26</sup> W).'), fact('Type III', 'al energien fra en hel galakse (ca. 10<sup>36</sup> W).'), fact('3 % om året', 'Med den vækst når vi type I om ca. 200 år og type II om ca. 1.000 år. Type III tager mindst 100.000 år, fordi galaksen er 100.000 lysår bred.')],
        widget: (el) => kardashevGauge(el),
        enter: (first) => W.asi.setMode('kardashev', first) },
      { title: 'Dyson-sværmen', scale: 11,
        lead: 'En superintelligens med selvkopierende robotter kunne i princippet skille Merkur ad og bygge en sværm af solfangere rundt om Solen.',
        facts: [fact('2 × 10<sup>13</sup> gange', 'menneskehedens nuværende energiforbrug. Så meget kan en fuld sværm høste.'), 'Robotter, der bygger robotter, vokser eksponentielt: 1, 2, 4, 8 … Et overslag fra Oxford (Armstrong og Sandberg, 2013) lander på få årtier.', 'Set udefra ville Solen blive svagere og gløde i infrarødt. Sådan leder astronomer efter andre civilisationer. Project Hephaistos fandt 7 kandidater i 2024. De fleste kan nok forklares med baggrundsgalakser.'],
        spec: [3, '<b>Fysik:</b> tilladt. <b>Kræver:</b> selvkopierende fabrikker i rummet.'],
        widget: (el) => button(el, 'Byg sværmen igen', () => W.asi.replay()),
        enter: (first) => W.asi.setMode('dyson', first) },
      { title: 'Tænkekraft på stjerneniveau', scale: 11,
        lead: 'Fysikkens loft for en computer, der drives af hele Solens energi, er omkring 10<sup>47</sup> bitoperationer i sekundet.',
        facts: ['Alle 8 milliarder menneskehjerner laver groft sagt 10<sup>26</sup> operationer i sekundet tilsammen.', 'Skallerne kaldes en Matrjosjka-hjerne: lag på lag af computere, hvor hvert lag lever af det forriges spildvarme.', 'Loftet kommer fra Landauers princip: Det koster en minimal mængde energi at slette en bit.'],
        spec: [4, '<b>Fysik:</b> tilladt. <b>Kræver:</b> ingeniørkunst langt ud over alt, vi kan i dag.'],
        enter: (first) => W.asi.setMode('brain', first) },
      { title: 'Sonder til hele galaksen', scale: 21,
        lead: 'Selvkopierende sonder med 10 % af lysets hastighed kan nå hele Mælkevejen på 1 til 10 millioner år.',
        facts: ['Det er under 0,1 % af galaksens alder. Et øjeblik i kosmisk tid.', 'Heraf Fermis paradoks: Hvis det er muligt, hvorfor har ingen gjort det før os?', 'Lasersejl kan måske sende gram-lette sonder afsted med 20 % af lysets hastighed. Så tager turen til Alfa Centauri ca. 20 år.'],
        spec: [4, '<b>Fysik:</b> tilladt. <b>Kræver:</b> sonder, der kan bygge kopier af sig selv.'],
        widget: (el) => button(el, 'Send sonderne afsted igen', () => W.asi.replay()),
        enter: (first) => W.asi.setMode('probes', first) },
      { title: 'Lyset bestemmer tempoet', scale: 27,
        lead: 'Heller ikke en superintelligens kan rejse hurtigere end lyset. 94 % af de galakser, vi kan se, kan vi aldrig nå.',
        facts: ['Universet udvider sig hurtigere og hurtigere. Jo længere vi venter, jo færre galakser kan nås.', 'En tanke på tværs af Mælkevejen tager 100.000 år. En galaktisk superintelligens må derfor bestå af mange selvstændige sind.', 'Om ca. 1 mia. år gør Solens stigende lysstyrke Jorden ubeboelig. Det er den virkelige deadline.', 'Fysikken tillader det meste af det her. Om vi når dertil, afhænger af, om vi kommer klogt gennem overgangen til superintelligens. Det er ikke et fysikproblem.'],
        spec: [1, '<b>Fysik:</b> en fast grænse. Ingen kendt teknologi kommer uden om den.'],
        enter: (first) => W.asi.setMode('reach', first) },
    ],
  },
  {
    id: 'hjem', short: 'Den blå prik', name: 'Den blå prik', world: 'bluedot',
    beats: [
      { title: 'Den blå prik', scale: 12.8,
        lead: 'Den 14. februar 1990 vendte Voyager 1 kameraet hjem fra 6 milliarder kilometers afstand. Jorden fyldte 0,12 pixel.',
        facts: ['Carl Sagan kaldte den et støvkorn, der svæver i en solstråle.', 'Alle mennesker, der nogensinde har levet, har levet på den prik.', 'Så vidt vi ved, er vi de eneste i hele universet, der kan undre sig over det.'],
        widget: (el) => {
          const row = div(el, 'row');
          button(row, 'Start forfra', () => go(0, 0), 'primary');
          button(row, 'Fri flyvning', () => setFree(true));
          button(row, 'Tag dybden igen', () => go(4, 0));
          if (document.body.dataset.site) {
            const a = document.createElement('a');
            a.className = 'chip';
            a.href = '/';
            a.textContent = 'Til SiteDokAI';
            row.appendChild(a);
          }
        },
        enter: (first) => W.bluedot.beat(0, first) },
    ],
  },
];

// ---------- Dynamisk tekst til stjernernes død ----------
function deathLead() {
  const m = W.stars ? W.stars.model : starModel(1);
  if (m.cls === 'low') return 'En rød dværg brænder i billioner af år. Til sidst bliver den varmere og blå og derefter en hvid dværg. Det har ingen set ske endnu.';
  if (m.cls === 'mid') return 'Om ca. 5 mia. år svulmer Solen op til en rød kæmpe og sluger Merkur og Venus, måske også Jorden. Så kaster den sine yderste lag af og efterlader en hvid dværg på størrelse med Jorden.';
  return 'En tung stjerne ender med et brag. Kernen falder sammen på under et sekund, og stjernen eksploderer som supernova.';
}
function deathFacts() {
  const m = W.stars ? W.stars.model : starModel(1);
  if (m.cls === 'low') return [fact(yearsText(m.tMS), 'kan en rød dværg på den størrelse brænde. Universet er 13,8 mia. år gammelt.')];
  if (m.cls === 'mid') return [fact('1 teskefuld', 'hvid dværg vejer flere tons.'), 'Solen bliver aldrig en supernova. Den er for let.'];
  return [fact('1 døgn', 'varer det sidste brændingstrin, hvor silicium bliver til jern.'), fact('1 teskefuld', 'neutronstjerne vejer milliarder af tons.'), 'En supernova kan i nogle uger lyse stærkere end en hel galakse.', 'Over ca. 20 solmasser kan kernen blive til et sort hul, hvor ikke engang lys slipper ud.'];
}
