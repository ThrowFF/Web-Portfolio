/* =====================================================================
   PORTFOLIO DATA: this is the ONLY file you need to edit day to day.
   Add a game = copy one object in GAMES, change the fields, save, deploy.
   ===================================================================== */

const PROFILE = {
  name: "Zain Ul Abaidin",
  brand: "Twani.dev", // logo text in the top-left of every page
  role: "Game Designer",
  taglines: [
    "Game Designer · Unity Developer",
    "Systems, economy & level design",
    "5+ years making games",
    "Mobile · WebGL · PC",
  ],
  about:
    "Game designer with 5+ years of experience building game systems, economies and interfaces that make games feel good to play. I prototype fast, iterate on playtest feedback, and work closely with art, code and narrative to get ideas into players' hands. Most of my free time still goes into games: playing them, watching them and pulling them apart to see how they work.",
  contactNote: "Open to full-time roles, contracts and freelance work in game design and Unity development.",
  email: "zainulabaidin16@gmail.com",
  location: "Lahore, Pakistan",
  resume: "assets/Zain-Ul-Abaidin-Resume.pdf", // leave "" to hide the button
  avatar: "", // e.g. "assets/images/me.jpg" (leave "" for initials)
  socials: [
    { label: "LinkedIn", url: "https://www.linkedin.com/in/zain-ul-abaidin-5819111b0/" },
    { label: "GitHub", url: "https://github.com/ThrowFF" },
    { label: "itch.io", url: "https://twanijay.itch.io/" },
    { label: "YouTube", url: "https://www.youtube.com/@Twani" },
  ],
  stats: [
    { value: "5+", label: "Years experience" },
    { value: "20+", label: "Games shipped" },
    { value: "2", label: "Engines mastered" },
  ],
};

/* Engines shown as tabs on the home page. Add more (e.g. Godot) any time. */
const ENGINES = [
  { id: "unity", name: "Unity" },
  { id: "Unreal", name: "Unreal" },
  { id: "roblox", name: "Roblox" },
];

/* Platforms: used for badges + filter chips. */
const PLATFORMS = {
  steam: { name: "Steam", short: "STEAM" },
  webgl: { name: "WebGL", short: "WEB" },
  playstore: { name: "Play Store", short: "ANDROID" },
  appstore: { name: "App Store", short: "iOS" },
  roblox: { name: "Roblox", short: "ROBLOX" },
};

/* Genres: each one gets its own page (genre.html?g=<id>). */
const GENRES = [
  { id: "hyper-casual", name: "Hyper Casual", blurb: "One-tap, instantly fun mobile games." },
  { id: "casual", name: "Casual", blurb: "Relaxed, accessible games for everyone." },
  { id: "adventure", name: "Adventure", blurb: "Exploration-driven games with a world to uncover." },
  { id: "horror", name: "Horror", blurb: "Psychological and survival horror built on tension." },
  { id: "fps", name: "FPS", blurb: "First-person shooters and combat." },
  { id: "third-person", name: "Third Person", blurb: "Over-the-shoulder action and adventure." },
  { id: "top-down", name: "Top Down", blurb: "Bird's-eye shooters, RPGs and arcade." },
  { id: "simulator", name: "Simulator", blurb: "Tycoons, simulators and idle loops." },
  { id: "obby", name: "Obby / Platformer", blurb: "Obstacle courses and precision platforming." },
  { id: "puzzle", name: "Puzzle", blurb: "Brain teasers and logic games." },
  { id: "multiplayer", name: "Multiplayer", blurb: "Online games built to be played together." },
];

/* ---------------------------------------------------------------------
   GAMES
   id          unique, lowercase, no spaces (used in the URL)
   engine      must match an ENGINES id ("unity", "Unreal" or "roblox")
   genres      list of GENRES ids
   platforms   list of PLATFORMS keys
   youtube     just the video ID, e.g. for https://youtu.be/dQw4w9WgXcQ → "dQw4w9WgXcQ"
   cover       optional image path; if empty, the YouTube thumbnail is used
   screenshots optional list of image paths (put files in assets/images/)
   links       optional buttons: { label, url }
   webgl       optional path to a Unity WebGL build you upload, e.g. "games/my-game/index.html"
   featured    true = shows in the hero "Featured" strip
   --------------------------------------------------------------------- */
const GAMES = [
  {
    id: "frozen-cabin",
    title: "The Frozen Cabin",
    engine: "unity",
    genres: ["horror", "adventure"],
    platforms: ["steam"],
    year: "Coming soon",
    role: "Main Developer, Game Designer, Environment Artist & Technical Lead",
    short: "First-person psychological horror. Snowed into a cabin during a storm, and something is getting closer.",
    description:
      "A short psychological horror experience set deep in a frozen wilderness. Stranded during a storm, you take shelter in an isolated cabin hidden in the forest. But something is wrong: strange noises echo through the night, and objects move when you're not looking.\n\nBuilt around tension rather than cheap scares, with first-person exploration and environmental storytelling that reveals what the cabin is hiding. Coming soon to Steam from Echo Of Fears.",
    youtube: "",
    cover: "assets/images/frozen-cabin-cover.jpg",
    screenshots: ["assets/images/frozen-cabin-1.jpg", "assets/images/frozen-cabin-2.jpg", "assets/images/frozen-cabin-3.jpg", "assets/images/frozen-cabin-4.jpg"],
    links: [{ label: "Wishlist on Steam", url: "https://store.steampowered.com/app/4603610/The_Frozen_Cabin/" }],
    webgl: "",
    featured: true,
  },
  {
    id: "project-h",
    title: "Project-H",
    engine: "unity",
    genres: ["adventure", "puzzle", "top-down"],
    platforms: ["webgl"],
    year: 2026,
    role: "Main Game Developer & Technical Lead",
    short: "Story-driven sci-fi puzzle adventure about a small robot escaping a hostile facility.",
    description:
      "Haven 3 is a story-driven sci-fi adventure that follows a small robot trying to escape a mysterious facility filled with hostile machines, complex puzzles, and hidden secrets.\n\nStep into the role of Haven 3 and explore the facility as you uncover its mysteries and piece together the events that led to your situation. Solve puzzles, overcome obstacles, navigate dangerous environments, and discover clues that gradually reveal the story behind the facility.\n\nAs you progress, each discovery brings you closer to understanding what happened and finding a way out. Currently in development, with a playable build on itch.io.",
    youtube: "",
    cover: "assets/images/project-h-cover.png",
    screenshots: ["assets/images/project-h-1.png", "assets/images/project-h-2.png", "assets/images/project-h-3.png"],
    links: [{ label: "Play on itch.io", url: "https://twanijay.itch.io/project-h" }],
    webgl: "",
    featured: true,
  },
  {
    id: "mindscorn",
    title: "Mindscorn",
    engine: "unity",
    genres: ["horror", "fps"],
    platforms: ["steam"],
    year: 2025,
    role: "Game Designer & QA",
    short: "Psychological survival horror. A disgraced journalist investigates the disappearances at the Royal Veil Hotel.",
    description:
      "A psychological survival horror where you play as Oswald Weeby, a disgraced journalist who lost his job and his wife chasing fame. He believes he can fix his life by solving the disappearances at the Royal Veil Hotel, a conspiracy case even the police couldn't crack.\n\nExplore the hotel, scavenge for limited supplies, manage your inventory and load every bullet by hand while the creatures inside hunt you down. Released on Steam in October 2025 by Mystic Craftz.",
    youtube: "",
    cover: "assets/images/mindscorn-cover.jpg",
    screenshots: ["assets/images/mindscorn-1.jpg", "assets/images/mindscorn-2.jpg", "assets/images/mindscorn-3.jpg", "assets/images/mindscorn-4.jpg"],
    links: [{ label: "View on Steam", url: "https://store.steampowered.com/app/3944010/Mindscorn/" }],
    webgl: "",
    featured: true,
  },
  {
    id: "car-crash",
    title: "Car Crash: Cop Chase Simulator",
    engine: "unity",
    genres: ["hyper-casual", "top-down"],
    platforms: ["playstore"],
    year: "", // add the release year, e.g. 2024
    role: "Game Developer",
    short: "Drift, dodge and smash your way out of a police chase. 100K+ downloads.",
    description:
      "An arcade cop-chase game where you're the getaway driver. Drift through city streets and desert roads, dodge the police on your tail, cause pile-ups, grab pickups and build combos to unlock new cars.\n\nPublished on Google Play by Avazar Games, with over 100K downloads.",
    youtube: "",
    cover: "assets/images/car-crash-cover.jpg",
    screenshots: ["assets/images/car-crash-1.jpg", "assets/images/car-crash-2.jpg", "assets/images/car-crash-3.jpg", "assets/images/car-crash-4.jpg"],
    links: [{ label: "Get it on Google Play", url: "https://play.google.com/store/apps/details?id=com.DefaultCompany.CarCrash" }],
    webgl: "",
    featured: true,
  },
  {
    id: "hungryphant",
    title: "HungryPhant",
    engine: "unity",
    genres: ["adventure"],
    platforms: ["webgl"],
    year: "", // add the release year, e.g. 2025
    role: "Main Developer",
    short: "One elephant, one city, one hunger.",
    description:
      "One elephant, one city, one hunger.\n\nA 3D adventure built in Unity that puts you in control of a hungry elephant loose in the city. Released on itch.io and playable in the browser.",
    youtube: "",
    cover: "assets/images/hungryphant-cover.png",
    screenshots: [],
    links: [{ label: "Play on itch.io", url: "https://twanijay.itch.io/hungryphant" }],
    webgl: "",
    featured: true,
  },
  {
    id: "mart-tycoon",
    title: "Mart Tycoon: Supermarket Game",
    engine: "unity",
    genres: ["simulator", "casual"],
    platforms: ["playstore"],
    year: "", // add the release year
    role: "Game Developer",
    short: "Grow a corner shop into a supermarket empire: stock shelves, serve customers, hire staff.",
    description:
      "A supermarket tycoon game. Start with a mini market and serve customers to earn money, then restock shelves, add new products, hire staff and expand across a big map until your corner shop is a retail empire. Plays fully offline.\n\nPublished on Google Play by Avazar Games, with over 10K downloads.",
    youtube: "",
    cover: "assets/images/mart-tycoon-cover.jpg",
    screenshots: ["assets/images/mart-tycoon-1.jpg", "assets/images/mart-tycoon-2.jpg", "assets/images/mart-tycoon-3.jpg", "assets/images/mart-tycoon-4.jpg"],
    links: [{ label: "Get it on Google Play", url: "https://play.google.com/store/apps/details?id=com.AvazarGames.MiniSuperMarket" }],
    webgl: "",
    featured: false,
  },
  {
    id: "attack-hole",
    title: "Attack Hole: Boss Fight Game",
    engine: "unity",
    genres: ["hyper-casual"],
    platforms: ["playstore"],
    year: "", // add the release year
    role: "Game Developer",
    short: "Swallow the whole arsenal as a black hole, then unload it on the boss.",
    description:
      "A hole game with a twist. You control a black hole racing the clock to swallow every weapon and bullet laid out in the hall, then turn that arsenal on the boss waiting at the end of the level.\n\nUpgrade your size and time, spin for rewards and unlock new hole skins. Published on Google Play by Avazar Games, with over 10K downloads.",
    youtube: "",
    cover: "assets/images/attack-hole-cover.jpg",
    screenshots: ["assets/images/attack-hole-1.jpg", "assets/images/attack-hole-2.jpg", "assets/images/attack-hole-3.jpg", "assets/images/attack-hole-4.jpg"],
    links: [{ label: "Get it on Google Play", url: "https://play.google.com/store/apps/details?id=com.black.attackhole.hoard.game" }],
    webgl: "",
    featured: false,
  },
  {
    id: "orbit-change",
    title: "Orbit Change",
    engine: "unity",
    genres: ["hyper-casual"],
    platforms: ["playstore"],
    year: "", // add the release year
    role: "Main Game Developer",
    short: "One-tap orbit jumping: leap between orbits, hit the white spheres, dodge the red.",
    description:
      "A one-finger reflex game set in an abstract universe. Spheres circle in their orbits; tap at the right moment and your ball breaks free of gravity to leap across. Hit the white targets, avoid the red ones and the outer ring, and clear every target to finish the level.\n\nPublished on Google Play by Mantis Works.",
    youtube: "",
    cover: "assets/images/orbit-change-cover.jpg",
    screenshots: ["assets/images/orbit-change-1.jpg", "assets/images/orbit-change-2.jpg", "assets/images/orbit-change-3.jpg", "assets/images/orbit-change-4.jpg"],
    links: [{ label: "Get it on Google Play", url: "https://play.google.com/store/apps/details?id=com.Client.OrbitChange" }],
    webgl: "",
    featured: false,
  },
  /* Template: copy this block (without the comment marks) to add another game.
  {
    id: "my-new-game",
    title: "My New Game",
    engine: "roblox",
    genres: ["simulator"],
    platforms: ["roblox"],
    year: 2026,
    role: "Game Designer",
    short: "One-line pitch shown on the card.",
    description: "Longer description for the game page.\n\nNew lines become new paragraphs.",
    youtube: "",
    cover: "",
    screenshots: [],
    links: [{ label: "Play on Roblox", url: "https://www.roblox.com/games/..." }],
    webgl: "",
    featured: false,
  },
  */
];

/* Experience timeline (newest first) */
const EXPERIENCE = [
  {
    role: "Game Designer / Developer",
    company: "Freelance",
    period: "Present", // add the start year, e.g. "2021 – Present"
    points: [
      "Shipped work across Android and WebGL, covering both mobile and web platforms.",
      "Created wireframes, user flows and design documentation to communicate ideas clearly.",
      "Improved player experience by refining game systems and balancing mechanics.",
      "Planned and documented levels, challenges and progression systems.",
      "Designed in-game economies, including currencies, upgrades and monetization systems.",
    ],
  },
  {
    role: "Game Designer",
    company: "Xeedev IT Consultants",
    period: "May 2025 – Apr 2026",
    points: [
      "Contributed to rapid prototyping of multiple game concepts, iterating quickly on team feedback and playtest insights.",
      "Collaborated with art, code and narrative to improve early-stage gameplay feel and player experience.",
      "Researched, evaluated and integrated third-party Unity packages to speed up prototyping and streamline development.",
      "Wrote internal documentation and setup guides so the team could onboard quickly onto the chosen tech stack.",
    ],
  },
  {
    role: "Unity Developer",
    company: "Pixel Spark Studio",
    period: "Mar 2023", // add the end date, e.g. "Mar 2023 – Apr 2025"
    points: [
      "Designed and built custom game controllers from scratch for hyper-casual and other genres.",
      "Integrated third-party SDKs such as Firebase for leaderboards, analytics and real-time data collection.",
      "Implemented localization in Unity to support multiple languages and reach global audiences.",
      "Worked with artists, 3D modelers and game designers to align technical implementation with the creative vision.",
      "Created and tested game mechanics to deliver a smooth, enjoyable player experience.",
    ],
  },
];

/* Education & certifications */
const EDUCATION = [
  { title: "BS Computer Science", place: "Lahore Garrison University", period: "" },
  { title: "Intermediate in Computer Science (ICS)", place: "Concordia College", period: "" },
];

/* Skills: grouped chips */
const SKILLS = [
  { group: "Game Design", items: ["Game Systems", "Game Mechanics", "Level Design", "Player Progression", "Game Flow Design", "Economy Design", "Storyboarding & Plot", "Interactive Systems"] },
  { group: "Development", items: ["Unity", "C#", "Firebase", "Localization", "Data Analytics", "Android", "WebGL"] },
  { group: "Tools", items: ["Figma", "Miro", "Notion", "Obsidian", "Asana", "GitHub", "Sourcetree"] },
  { group: "Soft Skills", items: ["Problem Solving", "Collaboration", "Communication", "Time Management"] },
  { group: "Languages", items: ["English (Full Professional)", "Urdu (Native)"] },
  { group: "Interests", items: ["Game Development", "e-Sports", "Game Lore", "History"] },
];
