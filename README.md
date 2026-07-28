# Flag to Flag

A generated alternate history of Grand Prix racing. It starts in 1950 with the
real founding grid and runs forward season by season, simulating every race,
writing up what happened, keeping the championship tables, and following each
driver's career until it ends.

Nothing is scripted. Fangio might win six titles or none. The 1950 season might
be settled at the final round or over by August.

## How it works

**Drivers arrive when they really arrived.** Every driver enters the timeline in
the year of their actual championship debut — Moss in 1951, Clark in 1960,
Stewart in 1965, Senna in 1984, Verstappen in 2015. What happens after that is
the simulation's business. Real debut data runs through 2025; past that the sim
generates its own drivers and keeps going indefinitely.

**Nobody dies.** The worst outcome of an accident is a career-ending injury. This
is a deliberate departure from history, and it is the single biggest reason the
timeline diverges: Ascari, Collins, Castellotti, von Trips, Clark, Rindt, Cevert,
Villeneuve and Senna all survive the accidents that killed them, keep racing, and
retire on the simulation's terms instead.

**Careers end in every way except that one.** A driver can be hurt badly enough to
miss a race, a run of races, or a whole season. They can fall ill on a race
morning. They can lose their drive, fail to find another, and drift out of the
sport. They can leave for sports cars or Indianapolis. They can grow old, or
simply stop being quick enough and walk away.

**Every winter gets its own report.** From 1951 on, each season opens with the
off-season news: who retired and why, who arrives and at which team, and who has
moved. It sits at the top of the season before the first race and stays reachable
from the calendar afterwards.

**Machinery follows history, roughly.** Constructor competitiveness is anchored to
real form curves — Alfa untouchable in 1950, Mercedes arriving in 1954, Williams
peaking in the mid-nineties — then perturbed by drift that accumulates year on
year and is pulled back toward the baseline. A couple of decades in, the pecking
order has diverged on its own.

**Drivers are under contract.** The fastest driver cannot simply walk into the
fastest car every winter. Deals run one to three seasons, which is what keeps any
one driver from monopolising the championship, and what gives careers their bad
luck as well as their good.

**The calendars are real.** Every season from 1950 to 2025 runs its actual
schedule: the same events, at the same venues, in the same order, with the real
number of rounds. 1950 opens at Silverstone in May and ends at Monza in
September. 1955 is cut to seven rounds after Le Mans. The 1980 Italian Grand Prix
is at Imola, the 1982 Swiss Grand Prix is in France, and 2020 is the improvised
seventeen-round scramble it really was, second visits and all. Past 2025 the sim
generates its own calendars from era-appropriate venues.

**The rules change with the eras.** Points systems follow the real ones (8-6-4-3-2
with a point for fastest lap in the fifties, through to 25-18-15 today), including
the decades when only a driver's best results counted. The constructors'
championship does not exist before 1958. Cars broke constantly in 1955 and rarely
break now.

## Playing it

You are a spectator with a free camera. Run the next race, or the rest of the
season, and read what came out. Click any driver or team name — anywhere,
including inside a race report — to pull up their full career: season-by-season
results, statistics, and a timeline of everything that has happened to them.

Progress saves to the browser automatically after every race.

Space or the right arrow key runs the next race.

## Running it

It is a static site with no build step and no dependencies. Open `index.html`, or
serve the directory:

```
python3 -m http.server 8000
```

## Layout

```
index.html            page shell
style.css             all styling
js/data-drivers.js    the driver roster, by real debut year
js/data-teams.js      constructors, form curves, era constants, points systems
js/data-circuits.js   the circuit rotation and weather tendencies
js/engine.js          seeded randomness, age curves, the race model
js/narrative.js       race report generation
js/career.js          debuts, injuries, contracts, seat allocation, retirement
js/season.js          calendars, rounds, standings, rolling the years over
js/save.js            localStorage persistence
js/ui.js              rendering
js/main.js            wiring
```

## A note on the data

Driver ratings are judgement calls — informed ones, but judgement calls. They
describe a driver at career peak across pace, racecraft, consistency, wet-weather
ability, appetite for risk, and how slowly they decline. The engine applies an age
curve on top, so a debutant races well below their ceiling and climbs toward it,
and a driver with high longevity is still winning at forty-six.

Debut years are accurate. Later decades are thinner on the supporting cast than
the fifties and sixties are, but everyone of consequence is in there.
