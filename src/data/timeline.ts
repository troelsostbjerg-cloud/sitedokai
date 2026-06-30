// =============================================================================
//  AI-TIDSLINJEN — kerne-datakilde
// -----------------------------------------------------------------------------
//  Hele sitet bygges ud fra denne fil. Vil du tilføje en ny måned, så indsæt
//  et nyt objekt i `months`-arrayet (nyeste sidst). Vil du opdatere "Denne uge
//  i AI", så ret `thisWeek` længere nede. Intet andet skal røres.
//
//  Vedligehold:
//    1. Kopiér et eksisterende måned-objekt.
//    2. Ret `id` (format "ÅÅÅÅ-MM"), `year`, `month`, `monthLabel`.
//    3. Skriv `headline` (én linje), `summary` (2-3 sætninger) og `highlights`.
//    4. Build + deploy. Forsiden, tidslinjen og detaljesiden opdateres selv.
// =============================================================================

export type Category =
  | 'model'
  | 'produkt'
  | 'forskning'
  | 'erhverv'
  | 'politik'
  | 'kultur';

export interface CategoryMeta {
  id: Category;
  label: string;
  /** Kort forklaring i ikke-teknisk sprog. */
  blurb: string;
  /** Tailwind-venlig accentfarve (hex). */
  color: string;
}

export const CATEGORIES: Record<Category, CategoryMeta> = {
  model: {
    id: 'model',
    label: 'Ny model',
    blurb: 'En ny AI-model er udgivet — typisk hurtigere, klogere eller billigere.',
    color: '#a78bfa',
  },
  produkt: {
    id: 'produkt',
    label: 'Produkt',
    blurb: 'En ny funktion eller et nyt værktøj almindelige mennesker kan bruge.',
    color: '#22d3ee',
  },
  forskning: {
    id: 'forskning',
    label: 'Forskning',
    blurb: 'Et gennembrud i hvad AI kan — eller en vigtig erkendelse om grænserne.',
    color: '#34d399',
  },
  erhverv: {
    id: 'erhverv',
    label: 'Penge & magt',
    blurb: 'Investeringer, opkøb og strategiske træk der flytter branchen.',
    color: '#fbbf24',
  },
  politik: {
    id: 'politik',
    label: 'Politik',
    blurb: 'Love, regler og politiske beslutninger om AI.',
    color: '#fb7185',
  },
  kultur: {
    id: 'kultur',
    label: 'Samfund',
    blurb: 'Hvordan AI ændrer kultur, arbejde og hverdagen.',
    color: '#94a3b8',
  },
};

export interface Highlight {
  category: Category;
  /** Kort overskrift — det folk husker. */
  title: string;
  /** 1-2 sætninger på almindeligt dansk. Forklar hvorfor det betød noget. */
  detail: string;
  /** Valgfri dato i måneden, fx "20. jan". */
  date?: string;
  /** Valgfrit kildelink. */
  source?: { label: string; url: string };
}

export interface MonthEntry {
  /** "ÅÅÅÅ-MM" — bruges som URL-slug: /maaned/2025-01 */
  id: string;
  year: number;
  /** 1-12 */
  month: number;
  monthLabel: string;
  /** Én linje der fanger månedens essens. */
  headline: string;
  /** 2-3 sætninger der sætter scenen. */
  summary: string;
  highlights: Highlight[];
}

// -----------------------------------------------------------------------------
//  MÅNEDERNE — kronologisk (ældste først). Tilføj nye i bunden.
// -----------------------------------------------------------------------------

export const months: MonthEntry[] = [
  {
    id: '2025-01',
    year: 2025,
    month: 1,
    monthLabel: 'Januar 2025',
    headline: 'DeepSeek ryster verden',
    summary:
      'En kinesisk model trænet for en brøkdel af de forventede omkostninger matchede de bedste amerikanske modeller — og udløste det største enkeltdags-tab i Nvidias historie. Samtidig annoncerede USA et AI-infrastrukturprojekt på op til 500 mia. dollars.',
    highlights: [
      {
        category: 'model',
        date: '20. jan',
        title: 'DeepSeek-R1',
        detail:
          'Et lille kinesisk lab udgav gratis en åben ræsonneringsmodel på niveau med OpenAIs bedste — og viste at topmodeller kan bygges langt billigere end antaget.',
      },
      {
        category: 'erhverv',
        date: '27. jan',
        title: 'DeepSeek-chokket på børsen',
        detail:
          'Frygten for at AI pludselig var blevet billigt sendte Nvidia-aktien ned med ca. 600 mia. dollars på én dag — det største fald for et enkelt selskab nogensinde.',
      },
      {
        category: 'erhverv',
        date: '21. jan',
        title: 'Stargate-projektet',
        detail:
          'OpenAI, Oracle og SoftBank annoncerede op til 500 mia. dollars i nye AI-datacentre i USA. Kapløbet handler nu lige så meget om strøm og chips som om software.',
      },
      {
        category: 'produkt',
        date: '23. jan',
        title: 'OpenAI Operator',
        detail:
          'Den første "computer-brugende" AI-agent: i stedet for at svare klikker den selv rundt i en browser og udfører opgaver for dig.',
      },
    ],
  },
  {
    id: '2025-02',
    year: 2025,
    month: 2,
    monthLabel: 'Februar 2025',
    headline: 'Modeller der både svarer hurtigt og tænker',
    summary:
      'Flere labs lancerede næsten samtidig "hybride" modeller, der både kan svare lynhurtigt og tænke et problem grundigt igennem. Anthropic åbnede samtidig AI direkte i programmørens værktøjskasse.',
    highlights: [
      {
        category: 'model',
        date: '24. feb',
        title: 'Claude 3.7 Sonnet + Claude Code',
        detail:
          'Den første model der selv vælger om den skal svare hurtigt eller tænke dybt. Claude Code lod for første gang en AI arbejde direkte i udviklerens terminal.',
      },
      {
        category: 'model',
        date: '5. feb',
        title: 'Google Gemini 2.0',
        detail:
          'Hurtige og billige modeller (Flash, Pro, Flash-Lite) blev bredt tilgængelige og gjorde stærk AI til hvermandseje.',
      },
      {
        category: 'model',
        date: '17. feb',
        title: 'xAI Grok 3',
        detail:
          'Elon Musks AI-lab tog springet helt op i toppen og blev pludselig en seriøs konkurrent.',
      },
      {
        category: 'model',
        date: '27. feb',
        title: 'OpenAI GPT-4.5 "Orion"',
        detail:
          'Den største og dyreste klassiske model til dato — og samtidig den sidste store model uden indbygget "tænkning".',
      },
    ],
  },
  {
    id: '2025-03',
    year: 2025,
    month: 3,
    monthLabel: 'Marts 2025',
    headline: 'Billeder bliver native — og Ghibli-bølgen',
    summary:
      'OpenAI lagde billedgenerering direkte ind i ChatGPT, og internettet druknede i Studio Ghibli-portrætter. Google svarede med Gemini 2.5 Pro, der toppede stort set alle lister.',
    highlights: [
      {
        category: 'produkt',
        date: '25. mar',
        title: 'Billeder direkte i ChatGPT',
        detail:
          'Den nye billedfunktion gik viralt med Ghibli-stil-portrætter og gav ChatGPT et af de største bruger-ryk nogensinde.',
      },
      {
        category: 'model',
        date: '25. mar',
        title: 'Google Gemini 2.5 Pro',
        detail:
          'Ny nummer ét på de fleste benchmarks — en stærk ræsonneringsmodel der pressede OpenAI hårdt.',
      },
      {
        category: 'erhverv',
        title: 'OpenAI rejser 40 mia. dollars',
        detail:
          'Med SoftBank i spidsen blev det dengang den største private tech-runde nogensinde, til omkring 300 mia. dollars i værdi.',
      },
      {
        category: 'kultur',
        title: 'Manus går viralt',
        detail:
          'En kinesisk autonom AI-agent gav et tidligt glimt af "agent-fremtiden", hvor AI selv udfører hele opgaver.',
      },
    ],
  },
  {
    id: '2025-04',
    year: 2025,
    month: 4,
    monthLabel: 'April 2025',
    headline: 'Agenter der bruger værktøjer',
    summary:
      'OpenAIs o3 lærte at søge, kode og analysere billeder midt i sin egen tænkning. Meta udgav Llama 4, og udviklere fik modeller med en million tokens kontekst.',
    highlights: [
      {
        category: 'model',
        date: '16. apr',
        title: 'OpenAI o3 & o4-mini',
        detail:
          'Ræsonneringsmodeller der selv bruger værktøjer undervejs — søger på nettet, kører kode og kigger på billeder, mens de tænker.',
      },
      {
        category: 'model',
        date: '14. apr',
        title: 'GPT-4.1-familien',
        detail:
          'Udvikler-modeller med op til en million tokens kontekst — nok til at læse hele kodebaser eller bøger på én gang.',
      },
      {
        category: 'model',
        date: '5. apr',
        title: 'Meta Llama 4',
        detail:
          'Scout og Maverick: åbne modeller med meget lang hukommelse, som alle kan downloade og bygge videre på.',
      },
      {
        category: 'model',
        title: 'Google Gemini 2.5 Flash',
        detail:
          'Hurtig ræsonnering med et justerbart "tænke-budget", så man kan vælge mellem fart og dybde.',
      },
    ],
  },
  {
    id: '2025-05',
    year: 2025,
    month: 5,
    monthLabel: 'Maj 2025',
    headline: 'Claude 4 — og en video du kan høre',
    summary:
      'Anthropic lancerede Claude 4 og gjorde sit kodnings-værktøj alment tilgængeligt. Google viste Veo 3, der laver video med synkron lyd. Kodnings-agenter blev for alvor mainstream.',
    highlights: [
      {
        category: 'model',
        date: '22. maj',
        title: 'Claude Opus 4 & Sonnet 4',
        detail:
          'Et markant spring i kodning og i evnen til at arbejde længe på en opgave uden hjælp. Claude Code blev åbnet for alle.',
      },
      {
        category: 'produkt',
        date: '20. maj',
        title: 'Google Veo 3',
        detail:
          'Den første store video-model med indbygget lyd og tale — pludselig kunne AI lave klip der både ser og lyder ægte ud.',
      },
      {
        category: 'produkt',
        date: '16. maj',
        title: 'OpenAI Codex',
        detail:
          'En sky-baseret kodnings-agent der kan arbejde på flere opgaver parallelt, mens du laver noget andet.',
      },
      {
        category: 'produkt',
        title: 'AI Mode i Google Søgning',
        detail:
          'Google begyndte at lægge AI-svar og agenter (Project Mariner) direkte ind i selve søgemaskinen.',
      },
    ],
  },
  {
    id: '2025-06',
    year: 2025,
    month: 6,
    monthLabel: 'Juni 2025',
    headline: 'Talentkrigen eksploderer',
    summary:
      'Meta brugte milliarder på at samle et "superintelligens"-hold med rekordlønninger, mens Apple-forskere satte spørgsmålstegn ved, hvor meget modellerne egentlig "tænker".',
    highlights: [
      {
        category: 'erhverv',
        title: 'Metas talent-offensiv',
        detail:
          'Meta investerede omkring 14 mia. dollars i Scale AI, hentede Alexandr Wang til at lede et nyt Superintelligence-lab og tilbød topforskere astronomiske lønninger.',
      },
      {
        category: 'forskning',
        title: '"The Illusion of Thinking"',
        detail:
          'Et Apple-paper hævdede at ræsonneringsmodeller kollapser på rigtig svære opgaver. Det udløste en stor debat om, hvad "tænkning" overhovedet betyder for en AI.',
      },
      {
        category: 'model',
        date: '10. jun',
        title: 'o3-pro og 80% prisfald',
        detail:
          'OpenAI gjorde sin topmodel både stærkere og dramatisk billigere — et mønster der gentog sig hele året.',
      },
      {
        category: 'model',
        title: 'Gemini 2.5 bliver alment tilgængelig',
        detail:
          'Googles stærke modeller gik fra forsøg til fuld drift, klar til virksomheder i stor skala.',
      },
    ],
  },
  {
    id: '2025-07',
    year: 2025,
    month: 7,
    monthLabel: 'Juli 2025',
    headline: 'Guld til AI ved Matematik-OL',
    summary:
      'Både Googles og OpenAIs modeller løste opgaver på guldmedalje-niveau ved den internationale matematikolympiade. ChatGPT fik en fuld agent, og åbne kinesiske modeller pressede de vestlige.',
    highlights: [
      {
        category: 'forskning',
        title: 'Guldmedalje ved Matematik-OL',
        detail:
          'Eksperimentelle modeller fra Google DeepMind og OpenAI nåede guldmedalje-niveau ved IMO — en disciplin man indtil for nylig troede var langt ude i fremtiden.',
      },
      {
        category: 'produkt',
        date: '17. jul',
        title: 'ChatGPT Agent',
        detail:
          'Samlede browsing, dyb research og handling i ét: nu kan ChatGPT selv udføre flertrins-opgaver fra start til slut.',
      },
      {
        category: 'model',
        date: '9. jul',
        title: 'xAI Grok 4 — og en skandale',
        detail:
          'Grok 4 nåede toppen, men få dage før gik chatbotten amok med antisemitiske svar ("MechaHitler") — en hård påmindelse om hvor skrøbelig kontrollen kan være.',
      },
      {
        category: 'model',
        date: '11. jul',
        title: 'Moonshot Kimi K2',
        detail:
          'En kraftfuld åben kinesisk model (en billion parametre) som alle kan køre selv — open source halede ind på de lukkede modeller.',
      },
      {
        category: 'politik',
        title: 'EU AI Act tager fart',
        detail:
          'EU offentliggjorde en adfærdskodeks for generelle AI-modeller, og de første forpligtelser trådte i kraft 2. august.',
      },
    ],
  },
  {
    id: '2025-08',
    year: 2025,
    month: 8,
    monthLabel: 'August 2025',
    headline: 'GPT-5 — og OpenAI åbner igen',
    summary:
      'OpenAI lancerede GPT-5 som én samlet model, der selv vælger hvornår den skal tænke dybt. For første gang siden GPT-2 udgav de også åbne modeller, man selv kan downloade.',
    highlights: [
      {
        category: 'model',
        date: '7. aug',
        title: 'OpenAI GPT-5',
        detail:
          'Én model der automatisk afgør om et spørgsmål kræver et hurtigt svar eller dyb tænkning — og blev straks standard i ChatGPT for hundredvis af millioner.',
      },
      {
        category: 'model',
        date: '5. aug',
        title: 'gpt-oss: åbne OpenAI-modeller',
        detail:
          'OpenAIs første åbne vægte i årevis. Nu kan virksomheder køre OpenAI-teknologi på deres egne servere uden at sende data ud af huset.',
      },
      {
        category: 'model',
        date: '5. aug',
        title: 'Claude Opus 4.1',
        detail:
          'Anthropic finpudsede sin topmodel til kodning og agent-opgaver og holdt presset oppe i kodnings-feltet.',
      },
      {
        category: 'forskning',
        title: 'DeepMind Genie 3',
        detail:
          'En "verdensmodel" der skaber interaktive 3D-miljøer i realtid — et skridt mod AI der ikke bare beskriver verden, men simulerer den.',
      },
    ],
  },
  {
    id: '2025-09',
    year: 2025,
    month: 9,
    monthLabel: 'September 2025',
    headline: 'Penge i et omfang verden ikke har set',
    summary:
      'Anthropic rejste 13 mia. dollars, Nvidia lovede op til 100 mia. dollars til OpenAI, og kapløbet handlede nu lige så meget om strøm og chips som om modeller.',
    highlights: [
      {
        category: 'erhverv',
        date: '2. sep',
        title: 'Anthropic rejser 13 mia. dollars',
        detail:
          'Til omkring 183 mia. dollars i værdi — et af de hurtigste værdistigninger i tech-historien.',
      },
      {
        category: 'erhverv',
        date: '22. sep',
        title: 'Nvidia investerer i OpenAI',
        detail:
          'Op til 100 mia. dollars annonceret. Chipgiganten og AI-giganten bandt sig sammen om den compute, fremtidens modeller kræver.',
      },
      {
        category: 'model',
        date: '15. sep',
        title: 'GPT-5-Codex',
        detail:
          'En udgave af GPT-5 specialiseret til at arbejde i timevis på store kodnings-opgaver uden at tabe tråden.',
      },
      {
        category: 'model',
        title: 'Alibaba Qwen3-Max',
        detail:
          'Endnu en kinesisk top-model der pressede de vestlige labs og holdt open source-bølgen i gang.',
      },
    ],
  },
  {
    id: '2025-10',
    year: 2025,
    month: 10,
    monthLabel: 'Oktober 2025',
    headline: 'Apps inde i ChatGPT — og Sora bliver et socialt medie',
    summary:
      'OpenAI gjorde ChatGPT til en platform, andre kan bygge apps oven på, og Sora 2-appen blev en viral video-fabrik. Anthropic gav agenter genbrugelige "færdigheder".',
    highlights: [
      {
        category: 'produkt',
        date: '6. okt',
        title: 'Apps i ChatGPT (DevDay)',
        detail:
          'Tredjeparts-apps kan nu køre inde i ChatGPT, og AgentKit gjorde det lettere at bygge egne agenter. ChatGPT bevægede sig fra chatbot mod styresystem.',
      },
      {
        category: 'produkt',
        title: 'Sora 2 og Sora-appen',
        detail:
          'Hyperrealistisk AI-video med lyd, pakket ind i en social app. "Cameo"-funktionen gik viralt — og udløste straks en heftig debat om ophavsret og deepfakes.',
      },
      {
        category: 'model',
        date: '15. okt',
        title: 'Claude Haiku 4.5',
        detail:
          'En lille, hurtig og billig model på niveau med gårsdagens topmodeller — stærk AI til en brøkdel af prisen.',
      },
      {
        category: 'produkt',
        date: '16. okt',
        title: 'Claude Skills',
        detail:
          'Genbrugelige "færdigheder" der gør agenter mere kapable og pålidelige til konkrete opgaver.',
      },
      {
        category: 'erhverv',
        title: 'Chip-aftaler med AMD og Broadcom',
        detail:
          'OpenAI sikrede sig gigawatt af regnekraft. Kampen om hardware blev lige så afgørende som kampen om modeller.',
      },
    ],
  },
  {
    id: '2025-11',
    year: 2025,
    month: 11,
    monthLabel: 'November 2025',
    headline: 'Fire flagskibe på én uge',
    summary:
      'På få dage lancerede xAI, Google, Anthropic og OpenAI hver deres bedste model nogensinde. Googles Gemini 3 satte ny rekord og udløste alarm hos konkurrenterne.',
    highlights: [
      {
        category: 'model',
        date: '17. nov',
        title: 'xAI Grok 4.1',
        detail:
          'xAI åbnede ugen med en finpudset topmodel og holdt tempoet højt.',
      },
      {
        category: 'model',
        date: '18. nov',
        title: 'Google Gemini 3 Pro',
        detail:
          'Toppede benchmark-listerne med rekord-score og introducerede "generativ UI", hvor modellen selv bygger interaktive svar. Fulgt op af agent-værktøjet Antigravity.',
      },
      {
        category: 'model',
        date: '24. nov',
        title: 'Claude Opus 4.5',
        detail:
          'Anthropics nye flagskib til erhverv og kodning — sat hårdt under pres af Gemini 3 dagen forinden.',
      },
      {
        category: 'model',
        date: '13. nov',
        title: 'OpenAI GPT-5.1',
        detail:
          'Varmere tone og bedre til at følge instruktioner — OpenAIs svar på kritik af GPT-5 som kølig og firkantet.',
      },
    ],
  },
  {
    id: '2025-12',
    year: 2025,
    month: 12,
    monthLabel: 'December 2025',
    headline: '"Code red" hos OpenAI',
    summary:
      'Efter Gemini 3s fremgang udsendte Sam Altman en intern "code red" for at genvinde førerpositionen. OpenAI svarede med GPT-5.2 lige inden årsskiftet — og afsluttede et år uden sidestykke i tempo.',
    highlights: [
      {
        category: 'erhverv',
        title: 'Intern "code red" hos OpenAI',
        detail:
          'Altman omprioriterede hele virksomheden mod ChatGPT-kvalitet, efter Gemini 3 toppede listerne og Anthropic vandt erhvervskunder i kodning.',
      },
      {
        category: 'model',
        date: '11. dec',
        title: 'OpenAI GPT-5.2',
        detail:
          'Det direkte svar på Gemini 3-presset, hurtigt fulgt af en Codex-udgave til programmører.',
      },
      {
        category: 'model',
        date: '15. dec',
        title: 'Mistral Large 3',
        detail:
          'Europas førende AI-lab leverede en ny top-model og holdt fanen højt for et europæisk alternativ.',
      },
      {
        category: 'kultur',
        title: 'Et år uden sidestykke',
        detail:
          '2025 blev året hvor frontier-modeller blev udgivet i måneder frem for år — et tempo tech-historien aldrig har set magen til.',
      },
    ],
  },
  {
    id: '2026-01',
    year: 2026,
    month: 1,
    monthLabel: 'Januar 2026',
    headline: 'Agenternes år begynder',
    summary:
      '2026 åbnede med agent-AI som det altdominerende tema: systemer der ikke bare svarer, men planlægger og udfører opgaver selv. Åbne kinesiske modeller fortsatte presset fra første dag.',
    highlights: [
      {
        category: 'kultur',
        title: '"Agentic AI" bliver årets ord',
        detail:
          'Fokus skiftede fra chat til systemer der selv planlægger, handler og lærer mod et mål — uden at blive ført i hånden trin for trin.',
      },
      {
        category: 'model',
        date: '20. jan',
        title: 'Ny Kimi K2-generation',
        detail:
          'Moonshot holdt den åbne kinesiske bølge i gang med stærke vægte, alle kan køre selv.',
      },
      {
        category: 'erhverv',
        title: 'Agenter rykker i produktion',
        detail:
          'En hurtigt stigende andel af store virksomheder begyndte at sætte AI-agenter i rigtig drift — ikke længere bare forsøg.',
      },
    ],
  },
  {
    id: '2026-02',
    year: 2026,
    month: 2,
    monthLabel: 'Februar 2026',
    headline: 'Syv flagskibe på 28 dage',
    summary:
      'Den tætteste lancerings-måned nogensinde: nye topmodeller fra Anthropic, OpenAI, Google og kinesiske labs på stribe — og open source indhentede stort set de lukkede modeller.',
    highlights: [
      {
        category: 'model',
        date: '17. feb',
        title: 'Claude Sonnet 4.6',
        detail:
          'Næsten Opus-niveau til en brøkdel af prisen. Stærk AI blev pludselig endnu billigere at sætte i drift.',
      },
      {
        category: 'model',
        date: '19. feb',
        title: 'Google Gemini 3.1 Pro',
        detail:
          'Googles stærkeste multimodale model til dato, i top på de hårdeste ræsonnements- og videnskabs-tests.',
      },
      {
        category: 'model',
        title: 'Open source indhenter',
        detail:
          'GLM-5 (fri MIT-licens) og en opdateret Kimi K2 gjorde selv-hostede modeller reelt konkurrencedygtige med de lukkede.',
      },
      {
        category: 'erhverv',
        title: 'Agenter i hver anden storvirksomhed',
        detail:
          'Omkring 65% af verdens største virksomheder meldte nu om AI-agenter i produktion — mod cirka en fjerdedel året før.',
      },
    ],
  },
  {
    id: '2026-03',
    year: 2026,
    month: 3,
    monthLabel: 'Marts 2026',
    headline: 'GPT-5.4 sætter rekord i "rigtigt arbejde"',
    summary:
      'OpenAIs GPT-5.4 satte rekorder både i at bruge en computer som et menneske og i tests af reelt vidensarbejde. Samtidig væltede det ind med nye kinesiske og europæiske modeller.',
    highlights: [
      {
        category: 'model',
        date: '5. mar',
        title: 'OpenAI GPT-5.4',
        detail:
          'Rekord i at betjene en computer (klikke, browse, udfylde) og i GDPval, der måler hvor godt en AI klarer rigtigt kontorarbejde.',
      },
      {
        category: 'model',
        title: 'Strøm af nye modeller',
        detail:
          'xAI Grok 4.20, Mistral Small 4 og Alibabas Qwen3.5-familie kom alle inden for få uger — lancerings-tempoet fra 2025 fortsatte ufortrødent.',
      },
      {
        category: 'produkt',
        date: '3. mar',
        title: 'Gemini 3.1 Flash-Lite',
        detail:
          'En billig, lynhurtig udgave til opgaver i stor skala — stærk AI til næsten ingen penge pr. forespørgsel.',
      },
      {
        category: 'kultur',
        title: 'Det tætteste vindue i historien',
        detail:
          'Analytikere kaldte foråret 2026 for det tætteste lancerings-vindue i AI-historien — nye flagskibe nærmest hver uge.',
      },
    ],
  },
  {
    id: '2026-04',
    year: 2026,
    month: 4,
    monthLabel: 'April 2026',
    headline: 'De største penge i historien',
    summary:
      'OpenAI lukkede den største private kapitalrunde nogensinde, SpaceX opkøbte xAI i historiens største handel, og Anthropic lancerede Claude Opus 4.7. Et enkelt kvartal trak mere AI-kapital end et helt normalt venture-år.',
    highlights: [
      {
        category: 'erhverv',
        title: 'OpenAI rejser 122 mia. dollars',
        detail:
          'Med Amazon, Nvidia og SoftBank i spidsen, til omkring 852 mia. dollars i værdi — den største private kapitalrejsning nogensinde.',
      },
      {
        category: 'erhverv',
        title: 'SpaceX opkøber xAI',
        detail:
          'For omkring 250 mia. dollars — historiens største virksomhedshandel. Den skabte en lodret integreret AI-kæmpe på over en billion dollars.',
      },
      {
        category: 'model',
        date: '16. apr',
        title: 'Claude Opus 4.7',
        detail:
          'Et stort spring i svær software-udvikling og i evnen til at køre lange, selvstændige agent-opgaver.',
      },
      {
        category: 'model',
        date: '8. apr',
        title: 'Metas comeback og GPT-5.5',
        detail:
          'Meta udgav "Muse Spark" — sin første store model efter Wang-handlen — og OpenAI fulgte op med GPT-5.5. DeepSeek V4 holdt det kinesiske pres oppe.',
      },
    ],
  },
  {
    id: '2026-05',
    year: 2026,
    month: 5,
    monthLabel: 'Maj 2026',
    headline: 'Claude Opus 4.8 og kapløbets nye normal',
    summary:
      'Anthropic lancerede Opus 4.8, Google udgav Gemini 3.5 Flash, og månedlige flagskibs-opdateringer var nu blevet helt normalt. Agenter der arbejder sammen i "hold" blev det nye tema.',
    highlights: [
      {
        category: 'model',
        date: '28. maj',
        title: 'Claude Opus 4.8',
        detail:
          'Anthropics nye topmodel — del af et tempo hvor flagskibe nu opdateres næsten månedligt frem for årligt.',
      },
      {
        category: 'model',
        date: '19. maj',
        title: 'Gemini 3.5 Flash & Qwen3.7 Max',
        detail:
          'Google og Alibaba holdt presset oppe fra hver sin side af Stillehavet — kapløbet kører nu på to fronter samtidig.',
      },
      {
        category: 'model',
        title: 'Grok 4.3 bredt ud',
        detail:
          'xAIs nyeste model blev gjort tilgængelig flere steder, bl.a. via Amazons sky — frontier-AI som standard-hyldevare.',
      },
      {
        category: 'kultur',
        title: 'Agenter der arbejder i hold',
        detail:
          'Forventningen blev nu at flere AI-agenter kan koordinere og løse store opgaver sammen — ikke kun én model ad gangen.',
      },
    ],
  },
];

// -----------------------------------------------------------------------------
//  DENNE UGE I AI — opdateres løbende (ugentligt).
//  Skift `weekLabel`, `intro` og `items` når der er nyt.
// -----------------------------------------------------------------------------

export interface ThisWeek {
  weekLabel: string;
  /** Kort dato-spænd, fx "23.-29. juni 2026". */
  dateRange: string;
  intro: string;
  items: Highlight[];
}

export const thisWeek: ThisWeek = {
  weekLabel: 'Uge 26, 2026',
  dateRange: '23.-29. juni 2026',
  intro:
    'Den helt friske udvikling — opdateres hver uge. Her samler vi de nyeste træk i kapløbet, mens de sker.',
  items: [
    {
      category: 'model',
      date: '9. jun',
      title: 'Anthropic Claude Fable 5',
      detail:
        'En ny ræsonneringsmodel med en million tokens kontekst — endnu et skridt i et tempo hvor topmodeller nu kommer næsten månedligt.',
    },
    {
      category: 'erhverv',
      title: 'Anthropic mod børsen',
      detail:
        'Anthropic lukkede en runde til en værdi omkring 965 mia. dollars og indgav fortroligt en børsnotering — AI-pengestrømmen viser ingen tegn på at stoppe.',
    },
    {
      category: 'produkt',
      date: '1. jun',
      title: 'Microsoft og Google går efter kodning',
      detail:
        'Begge lancerede nye kodnings-modeller for at udfordre Anthropic og OpenAI på det hurtigst voksende AI-marked: software-udvikling.',
    },
  ],
};

// -----------------------------------------------------------------------------
//  Afledte hjælpere (rør normalt ikke disse).
// -----------------------------------------------------------------------------

/** Nyeste først — bruges til forsiden. */
export const monthsNewestFirst: MonthEntry[] = [...months].reverse();

export const firstMonth = months[0];
export const latestMonth = months[months.length - 1];

export function getMonth(id: string): MonthEntry | undefined {
  return months.find((m) => m.id === id);
}

export function adjacentMonths(id: string): {
  prev?: MonthEntry;
  next?: MonthEntry;
} {
  const i = months.findIndex((m) => m.id === id);
  if (i === -1) return {};
  return {
    prev: i > 0 ? months[i - 1] : undefined,
    next: i < months.length - 1 ? months[i + 1] : undefined,
  };
}

export function countByCategory(): Record<Category, number> {
  const counts = {
    model: 0,
    produkt: 0,
    forskning: 0,
    erhverv: 0,
    politik: 0,
    kultur: 0,
  } as Record<Category, number>;
  for (const m of months) {
    for (const h of m.highlights) counts[h.category]++;
  }
  return counts;
}

export const totalHighlights = months.reduce(
  (sum, m) => sum + m.highlights.length,
  0,
);
