# Enderklas Builder

Werkbladengenerator voor het Vlaamse basisonderwijs. Leerkrachten stellen wiskundige oefeningenblokken samen, configureren de moeilijkheidsgraad per blok, bekijken het resultaat live op een virtueel A4-blad, en drukken af of slaan op als PDF.

Live (alpha): [app.enderklas.be](https://app.enderklas.be)

## Wat kan je ermee?

- **Visueel samenstellen** — drie panelen: domeinboom links, A4-voorbeeld in het midden, instellingen rechts.
- **Oefeningen genereren per blok** of in één klik voor het hele werkblad (`Genereer alles`). Vergrendelde blokken (🔒) worden overgeslagen.
- **Werkbundels opslaan en openen** als JSON-bestand — bewaar je layout en deel met collega's.
- **Differentiatie** — instructieprefixen (MAG / MOET / ★ / aangepast), drie scaffoldingniveaus per oefeningtype, schaalbare scoring.
- **Afdrukken** met optionele oplossingen (rood overlay), automatische paginabreuken, vaste voettekst (school / klas / leerkracht / paginanummer).
- **Toegankelijkheid** — drie thema's (licht / donker / hoog contrast voor kleurenblinden).

## Oefeningtypes

| Domein | Onderdeel | Type |
|---|---|---|
| Getallenkennis | Getalbegrip | Splitsen, MAB (Multibase Arithmetic Blocks) |
| Getallenkennis | Breuken | Kleuren, herkennen, breuk van hoeveelheid, lijnstuk, veelhoek |
| Bewerkingen | Hoofdrekenen (standaardprocedure) | Optellen, aftrekken, vermenigvuldigen, delen — natuurlijk / decimaal / rationaal |
| Bewerkingen | Cijferen | Kolomrekenen optellen / aftrekken / vermenigvuldigen / delen — met ruitjesgrid |
| Meten en metend rekenen | Kloklezen | Analoge en digitale klok |
| Meten en metend rekenen | Geld | Herkennen, bedrag tekenen, wissel, teruggeven |

Meer oefeningtypes worden gefaseerd toegevoegd. Niet-ingevulde plekken in de zijbalk zijn placeholders.

## Tech

React 19 + TypeScript + Vite + Zustand. Alles client-side; geen backend, geen account, geen tracking. Werkbundels leven in het geheugen (en optioneel als JSON-bestand op je eigen schijf).

## Lokaal draaien

```bash
npm install
npm run dev       # dev server (Vite)
npm run build     # tsc -b && vite build
npm run lint
npm run preview   # productiebuild bekijken
```

## Project structuur

Zie [CLAUDE.md](CLAUDE.md) voor een volledig overzicht van de architectuur, het uitbreiden met nieuwe oefeningtypes, en de codeconventies.

## Bijdragen

Bug of suggestie? DM via [X (@ruben_vah)](https://x.com/ruben_vah).

## Licentie

De code valt onder [AGPL-3.0](https://www.gnu.org/licenses/agpl-3.0.txt).

---

Gemaakt door Ruben V.H. — gratis beschikbaar voor leerkrachten.
