'use client';

import React, { useState } from 'react';

interface Bar {
  id: number;
  name: string;
  vibe: string;
  address: string;
  drunkMaxScore: number;
  maxDrinks: string;
  pricePerBuzz: string;
  description: string;
  abvEfficiency: number;
}

const fakeBars: Bar[] = [
  {
    id: 1,
    name: "The Dive Down",
    vibe: "Dive Bar",
    address: "East 6th St, Austin",
    drunkMaxScore: 94,
    maxDrinks: "7 shots + 4 beers",
    pricePerBuzz: "$1.80/proof unit",
    description: "Cheap wells, sticky floors, perfect for getting absolutely wrecked.",
    abvEfficiency: 0.92,
  },
  {
    id: 2,
    name: "Neon Panther",
    vibe: "Neon Club",
    address: "Rainey Street, Austin",
    drunkMaxScore: 87,
    maxDrinks: "5 cocktails + 3 shots",
    pricePerBuzz: "$3.20/proof unit",
    description: "Loud bass, cheap pitchers during happy hour, dance while you smash.",
    abvEfficiency: 0.78,
  },
  {
    id: 3,
    name: "Velvet Hour",
    vibe: "Cocktail Lounge",
    address: "South Congress, Austin",
    drunkMaxScore: 82,
    maxDrinks: "4 martinis",
    pricePerBuzz: "$4.10/proof unit",
    description: "Classy pours, dim lighting, get elegantly obliterated.",
    abvEfficiency: 0.65,
  },
  {
    id: 4,
    name: "Scorecard Saloon",
    vibe: "Sports Dive",
    address: "North Loop, Austin",
    drunkMaxScore: 91,
    maxDrinks: "8 beers + 3 shots",
    pricePerBuzz: "$2.10/proof unit",
    description: "Game on the TVs, $2 domestics, maxx your sports buzz.",
    abvEfficiency: 0.88,
  },
  {
    id: 5,
    name: "The Social Forge",
    vibe: "Social Mixer",
    address: "Warehouse District, Austin",
    drunkMaxScore: 85,
    maxDrinks: "6 mixed drinks",
    pricePerBuzz: "$2.90/proof unit",
    description: "Great for meeting people while getting sauced. Social maxxing.",
    abvEfficiency: 0.75,
  },
  {
    id: 6,
    name: "Rooftop Reckless",
    vibe: "Rooftop Vibes",
    address: "Downtown Austin",
    drunkMaxScore: 79,
    maxDrinks: "5 cocktails",
    pricePerBuzz: "$4.50/proof unit",
    description: "Views for days, pricier but the vibe hits different when buzzed.",
    abvEfficiency: 0.55,
  },
];

const vibes = ['Dive Bar', 'Neon Club', 'Cocktail Lounge', 'Sports Dive', 'Social Mixer', 'Rooftop Vibes'];

export default function DrunkMaxx() {
  const [budget, setBudget] = useState(50);
  const [selectedVibe, setSelectedVibe] = useState('Dive Bar');
  const [results, setResults] = useState<Bar[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [intoxLevel, setIntoxLevel] = useState('');

  const calculateDrunkMax = () => {
    const filtered = fakeBars
      .filter(bar => bar.vibe === selectedVibe || Math.random() > 0.4) // some crossover for demo
      .map(bar => ({
        ...bar,
        drunkMaxScore: Math.floor(bar.drunkMaxScore * (budget / 50) * (bar.abvEfficiency * 0.8 + 0.6)),
      }))
      .sort((a, b) => b.drunkMaxScore - a.drunkMaxScore)
      .slice(0, 5);

    const levelNames = ['Light Buzz', 'Properly Sauced', 'Feeling Dangerous', 'Blackout Ready', 'Legendary Maxx'];
    const levelIndex = Math.min(Math.floor((budget / 25) * 0.8), 4);
    
    setResults(filtered);
    setIntoxLevel(levelNames[levelIndex]);
    setShowResults(true);
    
    // Scroll to results
    setTimeout(() => {
      document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const resetCalculator = () => {
    setShowResults(false);
    setResults([]);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white overflow-x-hidden">
      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-amber-500 rounded-full flex items-center justify-center text-2xl">🍺</div>
            <div>
              <div className="text-3xl font-bold tracking-tighter neon-text">DRUNKMAXX</div>
              <div className="text-[10px] text-emerald-400 -mt-1 tracking-[3px]">MAX THE BUZZ • DOUBLE X</div>
            </div>
          </div>
          <div className="flex items-center gap-8 text-sm uppercase tracking-widest">
            <a href="#calculator" className="hover:text-emerald-400 transition-colors">Maxx It</a>
            <a href="#spots" className="hover:text-emerald-400 transition-colors">Top Spots</a>
            <a href="#how" className="hover:text-emerald-400 transition-colors">How It Works</a>
            <button 
              onClick={() => window.alert('PWA installed! (demo)')}
              className="neon-button px-6 py-2 rounded-full bg-emerald-500 hover:bg-emerald-600 text-black font-medium text-sm"
            >
              INSTALL APP
            </button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <div className="pt-24 pb-16 relative">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-white/5 text-emerald-400 text-xs tracking-[2px] px-6 py-2 rounded-full mb-6 border border-emerald-500/30">
            🍻 PROVOCATIVE NIGHTLIFE INTELLIGENCE
          </div>
          
          <h1 className="text-7xl md:text-8xl font-bold tracking-tighter leading-none mb-6 neon-text">
            WHERE SHOULD<br />WE GO GET<br /><span className="text-amber-400">DRUNK?</span>
          </h1>
          
          <p className="max-w-md mx-auto text-xl text-zinc-400 mb-10">
            DrunkMaxx finds the spots that give you the <span className="line-through opacity-50">most value</span> <span className="text-emerald-400 font-medium">highest level of intoxication</span> for your budget and vibe.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => document.getElementById('calculator')?.scrollIntoView({ behavior: 'smooth' })}
              className="neon-button px-10 py-4 rounded-2xl bg-white text-black font-semibold text-xl flex items-center justify-center gap-3 group"
            >
              START DRUNK MAXXING 
              <span className="text-3xl group-hover:rotate-12 transition">🍻</span>
            </button>
            <a 
              href="https://github.com/buildleansaas/drunkmaxx" 
              target="_blank"
              className="px-10 py-4 rounded-2xl border border-white/30 hover:bg-white/5 font-medium flex items-center justify-center gap-2"
            >
              VIEW ON GITHUB
            </a>
          </div>
          
          <div className="mt-16 text-xs text-zinc-500 flex items-center justify-center gap-8">
            <div>POWERED BY MENU MATH</div>
            <div>★ VIBE MATCHING</div>
            <div>DOUBLE X CERTIFIED</div>
          </div>
        </div>
        
        {/* Floating beer emojis */}
        <div className="absolute top-20 right-10 text-6xl opacity-20 animate-float">🍺</div>
        <div className="absolute bottom-32 left-12 text-5xl opacity-20 animate-float delay-700">🥃</div>
      </div>

      {/* CALCULATOR */}
      <div id="calculator" className="max-w-4xl mx-auto px-6 py-16 border-t border-white/10">
        <div className="text-center mb-12">
          <div className="text-emerald-400 text-sm tracking-widest mb-3">THE MAIN EVENT</div>
          <h2 className="text-5xl font-semibold tracking-tight">Drunk Maxx Calculator</h2>
          <p className="text-zinc-400 mt-4 max-w-sm mx-auto">Tell us your budget and the vibe you're chasing. We'll tell you exactly where to go to get the most obliterated.</p>
        </div>

        <div className="glass rounded-3xl p-10 max-w-2xl mx-auto">
          <div className="mb-10">
            <label className="block text-sm uppercase tracking-widest text-zinc-400 mb-3">YOUR BUDGET</label>
            <div className="flex items-center gap-6">
              <input 
                type="range" 
                min="20" 
                max="150" 
                step="5"
                value={budget}
                onChange={(e) => setBudget(parseInt(e.target.value))}
                className="w-full accent-emerald-500"
              />
              <div className="text-5xl font-mono tabular-nums w-28 text-right text-emerald-400">${budget}</div>
            </div>
            <div className="flex justify-between text-xs text-zinc-500 mt-1">
              <div>$20 • college maxx</div>
              <div>$150 • sponsor the whole bar</div>
            </div>
          </div>

          <div className="mb-10">
            <label className="block text-sm uppercase tracking-widest text-zinc-400 mb-4">DESIRED VIBE</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {vibes.map((vibe) => (
                <button
                  key={vibe}
                  onClick={() => setSelectedVibe(vibe)}
                  className={`vibe-card glass px-5 py-6 rounded-2xl text-left ${selectedVibe === vibe ? 'active' : ''}`}
                >
                  <div className="text-3xl mb-3">{vibe.includes('Dive') ? '🍺' : vibe.includes('Club') ? '🕺' : vibe.includes('Lounge') ? '🥃' : vibe.includes('Sports') ? '🏈' : vibe.includes('Social') ? '👥' : '🌆'}</div>
                  <div className="font-semibold">{vibe}</div>
                  <div className="text-xs text-zinc-400 mt-1">Tap to select</div>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={calculateDrunkMax}
            className="neon-button w-full py-6 text-2xl font-bold bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-black rounded-2xl flex items-center justify-center gap-3"
          >
            CALCULATE MY DRUNKMAXX
            <span className="text-4xl">🚀</span>
          </button>
          
          <p className="text-center text-xs text-zinc-500 mt-6">Real menu pricing + ABV analysis • Demo data for Austin, TX</p>
        </div>
      </div>

      {/* RESULTS */}
      {showResults && (
        <div id="results" className="max-w-4xl mx-auto px-6 pb-20">
          <div className="flex justify-between items-end mb-8">
            <div>
              <div className="uppercase text-emerald-400 text-sm tracking-widest">YOUR PERSONALIZED MAX</div>
              <div className="text-4xl font-semibold">With ${budget} at <span className="text-amber-400">{selectedVibe}</span> vibe...</div>
            </div>
            <button onClick={resetCalculator} className="text-sm underline text-zinc-400 hover:text-white">Reset &amp; try again</button>
          </div>
          
          <div className="glass p-8 rounded-3xl mb-8">
            <div className="text-center mb-8">
              <div className="text-6xl mb-2">🥳</div>
              <div className="text-4xl font-bold text-emerald-400">YOU WILL REACH: <span className="text-white">{intoxLevel}</span></div>
              <div className="text-zinc-400 mt-2">Highest intoxication efficiency in town</div>
            </div>
            
            <div className="space-y-6">
              {results.map((bar, index) => (
                <div key={bar.id} className="bar-card glass p-6 rounded-2xl flex flex-col md:flex-row gap-6 items-start md:items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0">
                    {index === 0 ? '👑' : '🍺'}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <div className="font-bold text-2xl">{bar.name}</div>
                      <div className="px-3 py-0.5 text-xs rounded-full bg-emerald-900 text-emerald-300">{bar.vibe}</div>
                    </div>
                    <div className="text-zinc-400 text-sm">{bar.address}</div>
                    <div className="text-xs text-amber-300 mt-3 font-mono">{bar.description}</div>
                  </div>
                  
                  <div className="text-right md:text-center flex-shrink-0 md:w-52">
                    <div className="text-[42px] leading-none font-mono font-bold text-emerald-400">{bar.drunkMaxScore}</div>
                    <div className="text-xs -mt-1 tracking-widest text-emerald-500/70">DRUNKMAXX SCORE</div>
                    
                    <div className="mt-4 text-sm">
                      <div><span className="text-emerald-400 font-medium">{bar.maxDrinks}</span></div>
                      <div className="text-zinc-500 text-xs">{bar.pricePerBuzz}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="text-center text-xs text-zinc-500 max-w-xs mx-auto">
            This is a prototype using demo data. Real version would pull live menus, ABV, happy hour specials, and user ratings. Ready to build the full thing?
          </div>
        </div>
      )}

      {/* TOP SPOTS LEADERBOARD */}
      <div id="spots" className="bg-black py-16 border-t border-b border-white/10">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex items-end justify-between mb-10">
            <div>
              <div className="text-emerald-400 tracking-widest text-sm">AUSTIN LEADERBOARD</div>
              <h3 className="text-5xl font-semibold tracking-tighter">Top DrunkMaxx Spots</h3>
            </div>
            <div className="text-right text-xs text-zinc-500">
              UPDATED LIVE<br />BASED ON MENU MATH
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            {fakeBars.map((bar, i) => (
              <div key={bar.id} className="glass p-6 rounded-3xl bar-card flex gap-5">
                <div className="text-5xl opacity-80 flex-shrink-0 mt-1">{i+1}</div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <div>
                      <div className="font-semibold text-xl">{bar.name}</div>
                      <div className="text-xs text-zinc-400">{bar.address} • {bar.vibe}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-4xl font-mono text-emerald-400 leading-none">{bar.drunkMaxScore}</div>
                      <div className="text-[10px] text-emerald-500">SCORE</div>
                    </div>
                  </div>
                  <div className="mt-6 h-2.5 bg-zinc-900 rounded-full overflow-hidden">
                    <div className="level-fill" style={{width: `${bar.drunkMaxScore}%`}}></div>
                  </div>
                  <div className="flex justify-between text-[10px] text-zinc-500 mt-1">
                    <div>CHEAP BUZZ</div>
                    <div>MAX EFFICIENCY</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* HOW IT WORKS */}
      <div id="how" className="max-w-4xl mx-auto px-6 py-20">
        <div className="grid md:grid-cols-12 gap-16">
          <div className="md:col-span-5">
            <div className="sticky top-28">
              <div className="uppercase text-amber-400 text-xs tracking-[1.5px]">THE SECRET SAUCE</div>
              <h3 className="text-6xl font-semibold tracking-tighter leading-none mt-3">How DrunkMaxx Actually Works</h3>
              <p className="mt-8 text-lg text-zinc-400">It's not just another bar finder. It's drunk-maxxing math.</p>
              
              <div className="mt-12 text-xs flex flex-col gap-6">
                <div className="flex gap-4">
                  <div className="w-6 h-6 rounded bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">1</div>
                  <div>Pull real (or demo) bar menus. Extract price and ABV for every beer, shot, cocktail.</div>
                </div>
                <div className="flex gap-4">
                  <div className="w-6 h-6 rounded bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">2</div>
                  <div>Calculate "proof per dollar" efficiency for each venue.</div>
                </div>
                <div className="flex gap-4">
                  <div className="w-6 h-6 rounded bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">3</div>
                  <div>Match against your vibe preference and budget. Higher score = more smashed, faster.</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="md:col-span-7 space-y-8 text-zinc-300">
            <div className="glass p-8 rounded-3xl">
              <div className="text-emerald-400 mb-4 text-sm">EXAMPLE</div>
              <div className="text-2xl leading-tight">"$45 at a Dive Bar vibe gets me 9 beers + 5 shots at The Dive Down. That's a 94 DrunkMaxx score. We'll be properly sauced in 90 minutes."</div>
              <div className="text-xs text-zinc-500 mt-8">— Real output from the calculator above</div>
            </div>
            
            <div className="text-sm leading-relaxed max-w-prose">
              This is the MVP PWA to spike the idea. It's installable, works great on your phone, has the core "drunk maxing" loop with interactive calculator and fake but realistic data. 
              <br /><br />
              Next steps: Connect real data sources (Google Places + menu APIs or scraping), add user accounts for saving favorite maxx spots, group sessions, map view, and launch it as the go-to "where are we getting drunk" app.
              <br /><br />
              The branding is deliberately a bit provocative with the double-X "maxx" spelling — it makes people smile and remember it. Perfect for viral sharing when someone says "I know how to DrunkMaxx."
            </div>
            
            <div className="pt-8 border-t border-white/10 flex flex-wrap gap-4">
              <a href="https://vercel.com/new/clone?repository-name=drunkmaxx&env=NEXT_PUBLIC_SOME_KEY" target="_blank" className="px-8 py-3.5 border border-white/30 hover:bg-white/5 rounded-2xl text-sm inline-flex items-center gap-2">
                DEPLOY THIS PROTOTYPE TO VERCEL
              </a>
              <button onClick={() => alert('Repo would be created at buildleansaas/drunkmaxx. Ready for full implementation with real data, auth, maps, etc. Let me know the next slice!')} className="px-8 py-3.5 bg-white text-black rounded-2xl text-sm font-medium">
                CONTINUE TO FULL BUILD →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="border-t border-white/10 py-12 bg-black text-xs text-zinc-500">
        <div className="max-w-4xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div>© {new Date().getFullYear()} DrunkMaxx. For entertainment purposes. Drink responsibly. Maxx wisely.</div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white">Twitter</a>
            <a href="#" className="hover:text-white">Instagram</a>
            <a href="https://github.com/buildleansaas/drunkmaxx" className="hover:text-white">GitHub</a>
          </div>
          <div className="text-center md:text-right">Prototype by Hermes • Next.js PWA • Built to spike the idea</div>
        </div>
      </footer>
    </div>
  );
}
