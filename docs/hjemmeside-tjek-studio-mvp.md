# Hjemmeside-tjek studio MVP

Dato: 2026-04-27

## Formål

Internt audit-studio til SiteDokAI-produktet **Hjemmeside-tjek**.

Det er ikke en offentlig SaaS. Det er et praktisk manuelt værktøj til at oprette, redigere og kvalitetssikre hjemmeside-tjek for små danske servicevirksomheder.

## Route

Lokal/bygget route:

`/studio/hjemmeside-tjek/`

Siden er sat til `noindex` og er ikke linket fra offentlig navigation.

## Stack-valg

Eksisterende stack er brugt:
- Astro 5
- Tailwind
- eksisterende `Layout.astro`
- eksisterende farver/design tokens
- vanilla JavaScript
- localStorage/mock-data

Ingen nye dependencies.

## Oprettede filer

- `src/pages/studio/hjemmeside-tjek.astro`
- `docs/hjemmeside-tjek-studio-mvp.md`

## Implementeret i MVP

### 1. Dashboard
Dashboard viser:
- Kundenavn
- Website
- Branche
- Lokation
- Status
- Dato
- Knap til at åbne tjekket
- Knap til at åbne rapporten

Statusmuligheder:
- Ikke startet
- Under analyse
- Klar til review
- Færdig

### 2. Opret nyt Hjemmeside-tjek
Formular med:
- Kundenavn
- Website-URL
- Branche
- Lokation
- Primære ydelser
- Målgruppe
- Noter fra kunden

Når formularen gemmes, oprettes et nyt tjek og editoren åbnes.

### 3. Rapport-editor
Editoren har sektionerne:

A. Kundeinfo  
B. Førstehåndsindtryk  
C. Scores  
D. Top 5 problemer  
E. Ny hero-tekst  
F. Forslag til servicestruktur  
G. Anbefalet næste skridt

Alle felter gemmes automatisk i browserens localStorage.

### 4. Rapportvisning / print-PDF
Rapportvisningen bruger eksisterende WebsiteCheck-data og viser:
- Forside med kunde, website, branche og dato
- Kort samlet vurdering
- 3 scorekort med progress bars
- Førstehåndsindtryk
- Top 5 problemer
- Ny hero-tekst som konkret forslag
- Forslag til servicestruktur
- Anbefalet næste skridt
- Afsluttende CTA til Hjemmeside-fix / Visuelt løft

Der er to rapporthandlinger:
- `Vis PDF-rapport`
- `Print / Gem som PDF`

Print sker via browserens egen printfunktion og print-CSS, ikke via ekstern PDF-library.

## Data-model i MVP

Data gemmes under localStorage key:

`sitedokai.websiteChecks.v1`

Struktur:
- `client`
- `firstImpression`
- `scores`
- `issues`
- `heroSuggestion`
- `serviceStructure`
- `recommendation`
- `report`

## Begrænsninger

- Ingen backend endnu.
- Ingen login/adgangskontrol endnu.
- Ingen rigtig PDF-generator; PDF laves via browserens printfunktion.
- Ingen video-script-side endnu.
- Ingen crawler eller AI-generering.
- Data er lokal for den browser der bruges.

## Næste tekniske skridt

1. Video-script sektion.
2. Import/export JSON så data kan flyttes mellem browser/maskiner.
3. Enkel adgangskontrol hvis route skal deployes offentligt.
4. Backend/D1 først når workflowet er testet manuelt.
5. Eventuelt finere PDF-cover / print-optimering efter reel brug.

## QA kørt

- `npm run build` passed.
- Route bygger til `/studio/hjemmeside-tjek/index.html`.
- Funktionel browser-test via Chrome/CDP:
  - opret tjek
  - udfyld editor
  - åbn rapport
  - verificér scores, hero, problemdata og CTA i rapporten
  - verificér localStorage
  - generér print-PDF via browserens printfunktion
- Visuel screenshot-QA:
  - dashboard uden data
  - editor med testdata
  - rapportvisning med testdata

## Deploy-note

Denne MVP er ikke deployet særskilt som offentlig feature i denne opgave. Den er klar i repoet og bør kun deployes, hvis Troels accepterer at intern studio-route er offentligt tilgængelig uden login — eller efter der er tilføjet simpel adgangskontrol.
