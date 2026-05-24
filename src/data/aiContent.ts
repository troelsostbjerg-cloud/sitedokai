export const siteBaseUrl = 'https://sitedokai.com';

export const services = [
  {
    id: 'manual-work-audit',
    name: 'Manual Work Audit',
    path: '/manual-work-audit',
    oldPath: '/hjemmeside-tjek',
    eyebrow: 'Manual Work Audit',
    title: 'Find de manuelle workflows, der stjæler mest tid.',
    description:
      'På 5 arbejdsdage kortlægger SiteDokAI manuelle workflows og prioriterer de 3 bedste AI-pilots.',
    shortAnswer:
      'Manual Work Audit er en 5-dages kortlægning af jeres manuelle arbejde. Outputtet er et proceskort, en prioriteret backlog og de 3 bedste AI-workflows at starte med.',
    priceLabel: 'Fra 15.000 kr. ekskl. moms',
    priceValue: '15000',
    duration: '5 arbejdsdage',
    ctaLabel: 'Book audit',
    interest: 'Manual Work Audit',
    fit: [
      'I bruger for meget tid på statusmails, rapportering, copy-paste eller opfølgning.',
      'I har testet AI, men mangler et konkret sted at starte.',
      'I vil have et beslutningsgrundlag før I bygger noget.',
    ],
    outputs: [
      'Kort proceskort over den faktiske arbejdsgang.',
      'Prioriteret backlog med 10 mulige forbedringer.',
      'Top 3 AI-pilots vurderet på effekt, kompleksitet og adoption.',
      'Skitse til den første workflow med input, regler, menneskelig godkendelse og output.',
    ],
    process: [
      'Interview med 3-6 nøglepersoner.',
      'Kortlægning af gentagne opgaver og friktion.',
      'Scoring af muligheder efter tid sparet, fejlrisiko og brugervenlighed.',
      'Nedkogt anbefaling med næste skridt.',
    ],
    faq: [
      {
        question: 'Hvad er en Manual Work Audit?',
        answer:
          'Det er en kort, praktisk analyse af manuelle arbejdsgange, hvor vi finder de steder AI og bedre struktur kan spare tid uden at starte et stort IT-projekt.',
      },
      {
        question: 'Hvad får vi ud af auditten?',
        answer:
          'I får et proceskort, en prioriteret backlog og de 3 mest oplagte AI-workflows at starte med.',
      },
      {
        question: 'Hvornår giver auditten mening?',
        answer:
          'Den giver mest mening, når arbejdet gentages ofte, involverer flere personer eller skaber fejl, ventetid og uklart ejerskab.',
      },
    ],
  },
  {
    id: 'ai-workflow-sprint',
    name: 'AI Workflow Sprint',
    path: '/ai-workflow-sprint',
    oldPath: '/hjemmeside-fix',
    eyebrow: 'AI Workflow Sprint',
    title: 'Byg én konkret AI-workflow, der kan bruges i hverdagen.',
    description:
      'På 10 arbejdsdage bygger SiteDokAI én konkret AI-workflow, der løser et reelt hverdagsproblem.',
    shortAnswer:
      'AI Workflow Sprint er et 10-dages forløb, hvor vi designer, bygger og tester én konkret AI-workflow på et hverdagsproblem, som allerede koster tid.',
    priceLabel: 'Fra 35.000 kr. ekskl. moms',
    priceValue: '35000',
    duration: '10 arbejdsdage',
    ctaLabel: 'Byg første workflow',
    interest: 'AI Workflow Sprint',
    fit: [
      'I har et tydeligt workflow med gentagelser, ventetid eller fejl.',
      'I vil have en praktisk prototype eller workflow, ikke et strategidokument.',
      'I accepterer human approval, hvor kvalitet eller risiko kræver det.',
    ],
    outputs: [
      'Workflow-design fra trigger til output.',
      'AI-logik, promptstruktur eller automationsflow i de relevante værktøjer.',
      'Test med de mennesker, der skal bruge løsningen.',
      'Dokumentation, træning og målepunkter for effekt.',
    ],
    process: [
      'Vælg et konkret workflow og afgræns scope.',
      'Beskriv input, regler, undtagelser, godkendelse og output.',
      'Byg en brugbar prototype eller workflow.',
      'Test, juster og gør flowet klar til drift.',
    ],
    faq: [
      {
        question: 'Hvad er en AI Workflow Sprint?',
        answer:
          'Det er et kort byggeforløb, hvor én konkret manuel proces bliver omsat til en testet AI-assisteret arbejdsgang.',
      },
      {
        question: 'Skal vi have bestemt software på forhånd?',
        answer:
          'Nej. Vi starter med jeres proces og vælger derefter den enkleste tekniske løsning, ofte med værktøjer I allerede bruger.',
      },
      {
        question: 'Er workflowet fuldautomatisk?',
        answer:
          'Ikke altid. De bedste flows har ofte et menneskeligt godkendelsestrin, så AI sparer tid uden at fjerne ansvar.',
      },
    ],
  },
  {
    id: 'ai-operations-partner',
    name: 'AI Operations Partner',
    path: '/ai-operations-partner',
    oldPath: '/visuelt-loeft',
    eyebrow: 'AI Operations Partner',
    title: 'Hold AI-forbedringerne i gang efter den første workflow.',
    description:
      'Løbende hjælp til at holde AI-forbedringer i gang, optimere workflows og sikre at løsningerne faktisk bliver brugt.',
    shortAnswer:
      'AI Operations Partner er løbende praktisk hjælp til backlog, forbedringer, dokumentation, træning og adoption efter de første AI-workflows er i gang.',
    priceLabel: 'Fra 10.000 kr. pr. måned ekskl. moms',
    priceValue: '10000',
    duration: 'Løbende',
    ctaLabel: 'Tal om løbende hjælp',
    interest: 'AI Operations Partner',
    fit: [
      'I har allerede identificeret eller bygget de første AI-workflows.',
      'I vil undgå at forbedringerne stopper efter et enkelt projekt.',
      'I har brug for en praktisk partner mellem drift, mennesker og teknologi.',
    ],
    outputs: [
      'Månedlig AI- og procesbacklog.',
      'Forbedringer af eksisterende workflows.',
      'Nye små automatiseringer, hvor de giver mening.',
      'Dokumentation, træning og status på effekt.',
    ],
    process: [
      'Gennemgå aktuel backlog og brug af eksisterende workflows.',
      'Prioriter de næste forbedringer efter effekt og adoption.',
      'Byg, juster eller dokumenter i korte runder.',
      'Rapporter nøgternt på brug, tid sparet og næste beslutning.',
    ],
    faq: [
      {
        question: 'Hvad laver en AI Operations Partner?',
        answer:
          'Vi holder forbedringsarbejdet i gang med backlog, workflow-optimering, dokumentation, træning og praktisk sparring.',
      },
      {
        question: 'Er det en retainer?',
        answer:
          'Ja. Det er bedst som en fast månedlig ramme, når der allerede er konkrete workflows at forbedre og forankre.',
      },
      {
        question: 'Hvem passer det til?',
        answer:
          'Det passer til virksomheder, der vil have AI ind i driften gradvist og ansvarligt uden at opbygge et stort internt AI-team fra dag ét.',
      },
    ],
  },
] as const;

export const useCases = [
  {
    id: 'ai-statusrapport',
    path: '/use-cases/ai-statusrapport',
    title: 'Fra statusmails til beslutningsklar ugeopsamling',
    eyebrow: 'Use case',
    description:
      'Samler mails, noter og opdateringer til en fast status med handlinger, risici og næste beslutning.',
    problem:
      'Status ligger spredt i mails, Teams, mødenoter og menneskers hukommelse. Det gør møder længere og beslutninger langsommere.',
    workflow:
      'AI samler input fra faste kilder, strukturerer status efter en aftalt skabelon, markerer manglende information og foreslår actions, som et menneske godkender.',
    output:
      'Én samlet statusrapport med fremdrift, afvigelser, ansvarlige, deadlines og beslutninger der kræver opmærksomhed.',
    signals: ['gentages ugentligt', 'mange inputkilder', 'meget jagt på status', 'klar skabelon mulig'],
  },
  {
    id: 'ledelsesrapport',
    path: '/use-cases/ledelsesrapport',
    title: 'Fra Excel til ledelsesrapport',
    eyebrow: 'Use case',
    description:
      'Gør gentagne tal, noter og afvigelser til en fast rapport med forklaring og anbefalede næste skridt.',
    problem:
      'Tal findes, men rapporten bygges manuelt hver gang. Det koster tid og gør forklaringer afhængige af den person, der samler materialet.',
    workflow:
      'AI læser faste inputfelter, finder afvigelser, sammenligner med tidligere perioder og skriver et første udkast til forklaring og anbefaling.',
    output:
      'En rapportkladde med nøgletal, afvigelser, kommentarer og beslutningspunkter klar til faglig gennemgang.',
    signals: ['samme rapport hver uge/måned', 'mange copy-paste trin', 'afvigelser skal forklares', 'ledertid bruges på format'],
  },
  {
    id: 'kundehenvendelse-svarudkast',
    path: '/use-cases/kundehenvendelse-svarudkast',
    title: 'Fra kundehenvendelse til svarudkast',
    eyebrow: 'Use case',
    description:
      'Kategoriserer henvendelser, finder kontekst og laver svarudkast med menneskelig godkendelse.',
    problem:
      'Kunder får forskellige svar, og medarbejdere bruger tid på at finde historik, regler og næste skridt.',
    workflow:
      'AI kategoriserer henvendelsen, finder relevant kontekst, foreslår svar og markerer sager, der skal eskaleres.',
    output:
      'Et svarudkast, en kategori, et foreslået næste skridt og tydelig markering af hvad et menneske skal tjekke.',
    signals: ['mange gentagne spørgsmål', 'klar tone of voice', 'kendte regler', 'behov for godkendelse'],
  },
  {
    id: 'moede-actions-opfoelgning',
    path: '/use-cases/moede-actions-opfoelgning',
    title: 'Fra mødenoter til actions og opfølgning',
    eyebrow: 'Use case',
    description:
      'Gør mødenoter, beslutninger og løse aftaler til en klar actionliste med ansvarlige, deadlines og opfølgningsmail.',
    problem:
      'Møder ender med gode intentioner, men actions ligger i forskellige notesbøger, chatbeskeder og kalendere. Opfølgningen afhænger af, hvem der husker hvad.',
    workflow:
      'AI læser mødenoter eller transskription, skiller beslutninger fra diskussion, foreslår actions, ansvarlige og deadlines og laver et opfølgningsudkast, som mødeejer godkender.',
    output:
      'En kort mødeopsamling, en prioriteret actionliste, åbne spørgsmål og et udkast til opfølgning sendt fra den ansvarlige person.',
    signals: ['mange interne møder', 'samme opfølgning gentages', 'actions bliver væk', 'mødeejer bruger tid på referat'],
  },
  {
    id: 'leverandoerstatus-undtagelser',
    path: '/use-cases/leverandoerstatus-undtagelser',
    title: 'Fra leverandørstatus til undtagelsesoverblik',
    eyebrow: 'Use case',
    description:
      'Samler leverandørmails, forsinkelser og ændringer til et overblik over det, der faktisk kræver handling.',
    problem:
      'Status fra leverandører kommer i forskellige formater og ender som manuel gennemlæsning, copy-paste og jagt på det vigtigste.',
    workflow:
      'AI læser faste statusmails eller uploadede lister, finder afvigelser, grupperer årsager og markerer de leverancer, hvor en person skal beslutte næste skridt.',
    output:
      'Et undtagelsesoverblik med forsinkelser, risiko, foreslået handling og en kort tekst der kan sendes videre internt.',
    signals: ['mange leverandørmails', 'afvigelser skjules i tekst', 'copy-paste til statusark', 'indkøb eller drift jagter overblik'],
  },
  {
    id: 'tilbudsanmodning-afklaring',
    path: '/use-cases/tilbudsanmodning-afklaring',
    title: 'Fra tilbudsanmodning til afklaringsliste',
    eyebrow: 'Use case',
    description:
      'Læser kundeforespørgsler, finder manglende information og laver et første udkast til afklaring eller tilbudsstruktur.',
    problem:
      'Salg eller projektledelse bruger tid på at forstå uklare forespørgsler, finde manglende oplysninger og skrive de samme afklarende spørgsmål igen.',
    workflow:
      'AI gennemgår forespørgslen, matcher den mod faste kriterier, fremhæver mangler og foreslår enten en afklaringsmail eller en struktureret tilbudskladde.',
    output:
      'En afklaringsliste, risikopunkter, anbefalet næste skridt og et udkast til mail eller tilbudsstruktur.',
    signals: ['mange ens forespørgsler', 'tilbud forsinkes af manglende info', 'klar vurderingsmodel findes', 'salg skriver meget manuelt'],
  },
  {
    id: 'ny-kunde-onboarding',
    path: '/use-cases/ny-kunde-onboarding',
    title: 'Fra ny kunde til onboarding-overblik',
    eyebrow: 'Use case',
    description:
      'Omsætter salgsnoter, kontraktpunkter og interne aftaler til en praktisk onboarding-plan.',
    problem:
      'Vigtig kontekst forsvinder mellem salg, levering og support. Den nye kunde starter med spørgsmål, som allerede burde være besvaret.',
    workflow:
      'AI samler salgsnoter, aftaler, scope og kendte risici i en onboarding-skabelon med opgaver, ansvarlige og information der mangler.',
    output:
      'En onboarding-plan med første skridt, interne opgaver, kundespørgsmål, risici og en kort velkomstmail.',
    signals: ['handover mellem salg og drift', 'gentagne kundestarter', 'manglende kontekst giver fejl', 'flere teams skal koordinere'],
  },
  {
    id: 'crm-opfoelgning-naeste-skridt',
    path: '/use-cases/crm-opfoelgning-naeste-skridt',
    title: 'Fra CRM-noter til næste bedste opfølgning',
    eyebrow: 'Use case',
    description:
      'Gør løse CRM-noter og kontaktpunkter til konkrete opfølgningsforslag, så muligheder ikke går kolde.',
    problem:
      'CRM bliver opdateret ujævnt, og næste skridt ligger ofte i en note, en mailtråd eller hos sælgeren selv.',
    workflow:
      'AI læser noter, seneste kontakt, tilbudsstatus og aftaler, vurderer hvad der mangler og foreslår næste handling med et kort udkast.',
    output:
      'En prioriteret opfølgningsliste med forslag til handling, mailudkast og tydelige sager der kræver menneskelig vurdering.',
    signals: ['mange åbne muligheder', 'CRM-noter er uens', 'opfølgning afhænger af hukommelse', 'gentagne salgsbeskeder'],
  },
  {
    id: 'reklamation-sagsoverblik',
    path: '/use-cases/reklamation-sagsoverblik',
    title: 'Fra reklamation til sagsoverblik',
    eyebrow: 'Use case',
    description:
      'Samler kundens besked, intern historik og kendte regler til et sagsoverblik med næste skridt.',
    problem:
      'Reklamationer kræver ofte manuel læsning af historik, billeder, mails, interne noter og betingelser før nogen tør svare.',
    workflow:
      'AI strukturerer sagen, trækker relevante fakta ud, markerer manglende dokumentation og foreslår en intern vurdering før kunden får svar.',
    output:
      'Et sagsoverblik med tidslinje, fakta, mangler, anbefalet handling og et svarudkast til godkendelse.',
    signals: ['mange ens sager', 'behov for ensartet vurdering', 'historik ligger spredt', 'kundesvar kræver godkendelse'],
  },
  {
    id: 'procesdokumentation-interviews',
    path: '/use-cases/procesdokumentation-interviews',
    title: 'Fra interviews til procesdokumentation',
    eyebrow: 'Use case',
    description:
      'Gør medarbejderinterviews og skærmoptagelser til brugbar procesdokumentation, der kan forbedres og trænes på.',
    problem:
      'Processen findes kun i hovedet på erfarne medarbejdere. Nye kolleger lærer via sidemandsoplæring, og små undtagelser bliver aldrig dokumenteret.',
    workflow:
      'AI hjælper med at strukturere interviewnoter, beskrive trin, undtagelser, beslutningsregler og forslag til hvor workflowet kan forenkles.',
    output:
      'En procesbeskrivelse med trin, roller, input, output, undtagelser, friktion og oplagte forbedringspunkter.',
    signals: ['viden ligger hos få personer', 'oplæring tager lang tid', 'processen har mange undtagelser', 'ingen ejer dokumentationen'],
  },
] as const;

export const aiSelfTests = [
  {
    name: 'Kanoniske servicesider',
    status: 'Aktiv',
    detail: '/manual-work-audit, /ai-workflow-sprint og /ai-operations-partner svarer direkte på hvad, hvem, output og pris.',
  },
  {
    name: 'llms.txt',
    status: 'Aktiv',
    detail: "En kort AI-læsbar profil beskriver SiteDokAI, ydelser, use cases og vigtige URL'er.",
  },
  {
    name: 'Schema.org',
    status: 'Aktiv',
    detail: 'Siderne bruger Organization, Service, Offer, WebPage, FAQPage og BreadcrumbList hvor indholdet er synligt.',
  },
  {
    name: 'Sitemap',
    status: 'Aktiv',
    detail: 'Sitemap peger på de kanoniske sider, så crawler og AI-researchværktøjer finder den rigtige struktur.',
  },
  {
    name: 'Menneske før maskine',
    status: 'Aktiv',
    detail: 'AI-optimeringen er ikke skjult teknik. Den samme struktur gør siden lettere at forstå for købere.',
  },
] as const;

export type ServiceOffer = (typeof services)[number];
export type UseCase = (typeof useCases)[number];

export function absoluteUrl(path: string) {
  return new URL(path, siteBaseUrl).href;
}

export function findService(id: string) {
  return services.find((service) => service.id === id);
}

export function findUseCase(id: string) {
  return useCases.find((useCase) => useCase.id === id);
}

export function breadcrumbSchema(items: Array<{ name: string; path: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function faqSchema(path: string, faq: ReadonlyArray<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': `${absoluteUrl(path)}#faq`,
    mainEntity: faq.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}

export function serviceSchema(service: ServiceOffer) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${siteBaseUrl}/#organization`,
        name: 'SiteDokAI',
        url: siteBaseUrl,
        email: 'info@sitedokai.com',
        founder: {
          '@type': 'Person',
          name: 'Troels Østbjerg',
        },
      },
      {
        '@type': 'Service',
        '@id': `${absoluteUrl(service.path)}#service`,
        name: service.name,
        serviceType: service.name,
        url: absoluteUrl(service.path),
        description: service.shortAnswer,
        provider: {
          '@id': `${siteBaseUrl}/#organization`,
        },
        areaServed: {
          '@type': 'Country',
          name: 'Danmark',
        },
        audience: {
          '@type': 'BusinessAudience',
          audienceType: 'Virksomheder med manuelle workflows, gentagne driftsopgaver og praktiske AI-implementeringsbehov',
        },
        offers: {
          '@type': 'Offer',
          url: absoluteUrl(service.path),
          price: service.priceValue,
          priceCurrency: 'DKK',
          availability: 'https://schema.org/InStock',
        },
      },
      {
        '@type': 'WebPage',
        '@id': `${absoluteUrl(service.path)}#webpage`,
        url: absoluteUrl(service.path),
        name: `${service.name} | SiteDokAI`,
        description: service.description,
        inLanguage: 'da-DK',
        about: {
          '@id': `${absoluteUrl(service.path)}#service`,
        },
        isPartOf: {
          '@type': 'WebSite',
          '@id': `${siteBaseUrl}/#website`,
          name: 'SiteDokAI',
          url: `${siteBaseUrl}/`,
        },
      },
    ],
  };
}

export function useCaseSchema(useCase: UseCase) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${absoluteUrl(useCase.path)}#webpage`,
    url: absoluteUrl(useCase.path),
    name: `${useCase.title} | SiteDokAI`,
    description: useCase.description,
    inLanguage: 'da-DK',
    isPartOf: {
      '@type': 'WebSite',
      '@id': `${siteBaseUrl}/#website`,
      name: 'SiteDokAI',
      url: `${siteBaseUrl}/`,
    },
    about: [
      'AI workflow',
      'AI-drevet procesoptimering',
      'manual process automation',
    ],
  };
}
