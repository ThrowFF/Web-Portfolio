# Game Dev Portfolio (HTML + CSS + JS)

No frameworks, no build step, free to host on Netlify.

## Folder map
```
index.html      Home: hero, engine tabs, genres, experience, skills, contact
genre.html      One genre's games        → genre.html?g=fps
game.html       One game's detail page   → game.html?id=project-alpha
play.html       Play a Unity WebGL build → play.html?id=maze-runner-web
404.html        "Game Over" page
js/data.js      ← EDIT THIS: your name, games, genres, experience, skills
js/main.js      All page logic + animations
js/bg.js        Animated particle-network background
css/style.css   All styles (colors are at the top in :root)
assets/images/  Put your screenshots, covers, photo here
games/          Put Unity WebGL builds here (one folder per game)
```

## Add a game
Open `js/data.js`, copy one object inside `GAMES`, change the fields:
- `youtube`: just the ID. `https://www.youtube.com/watch?v=AbC123xyz` → `"AbC123xyz"`.
  The YouTube thumbnail is used automatically as the card cover.
- `screenshots`: `["assets/images/alpha-1.jpg", "assets/images/alpha-2.jpg"]`
- `links`: `[{ label: "View on Steam", url: "https://store.steampowered.com/app/..." }]`
- `platforms`: any of `steam`, `webgl`, `playstore`, `appstore`, `roblox`
- `genres`: ids from the `GENRES` list (add new genres there too)

Tip: export screenshots as `.webp` or `.jpg` around 1280px wide to keep the site fast.

## Host a Unity WebGL build
1. In Unity: Player Settings → Publishing Settings → Compression Format **Gzip**
   and tick **Decompression Fallback** (this makes it work on Netlify without any server config).
2. Build, then copy the whole build folder to `games/your-game/` (it must contain `index.html`).
3. In `data.js` set `webgl: "games/your-game/index.html"`. A **Play in browser** button appears.

Netlify's free plan allows files up to a few hundred MB, but keep builds small (under ~50 MB) so they load quickly.

## Deploy to Netlify (free)
**Fastest:** go to app.netlify.com/drop and drag this whole folder onto the page. Done.

**Better (auto-deploy on every change):**
1. Push this folder to a GitHub repo.
2. Netlify → Add new site → Import from Git → pick the repo.
3. Build command: *(leave empty)*. Publish directory: `.`
4. Site settings → Change site name → `yourname.netlify.app`.
   A custom domain (~$10/year) is the only thing that costs money, and it's optional.

## Built-in features
- Custom cursor (`cursor` in `PROFILE`: `"pointer"` arrow or `"crosshair"`) that reacts to anything
  clickable, with a click kick, hit sparks and click shockwaves in the background
- Text spotlight: letters near the pointer glow in a soft circle that follows it
  (works on any plain-text element with class `readable`)
- Particle-network background that fades out behind text so it never competes with reading
- Thin scroll-progress bar along the top
- Game cards fade in with a stagger and play the trailer on hover-click
- Achievement toasts (Explorer, Cinephile, Completionist, and a Konami code secret: ↑↑↓↓←→←→BA)
- "Level loading" page transitions: shutters drop from where you click, and a loading card names the destination
- Respects "reduce motion" settings and works on phones
