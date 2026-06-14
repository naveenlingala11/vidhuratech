// projects.data.ts
// Programmatically generated detailed projects database (52 projects)

export interface VivaQuestion {
  question: string;
  answer: string;
}

export interface ApiEndpoint {
  method: string;
  path: string;
  desc: string;
}

export interface Project {
  id: string;
  title: string;
  difficulty: 'Basic' | 'Intermediate' | 'Advanced';
  difficultyClass: string;
  complexityStars: number;
  domain: 'angular' | 'java' | 'python' | 'sql';
  domainLabel: string;
  techStack: string[];
  icon: string;
  shortDesc: string;
  duration: string;
  features: string[];
  additionalFeatures?: string[];
  prerequisites: string[];
  learningOutcomes: string[];
  architecture: string;
  showArch: boolean;
  synopsis: string;
  directoryStructure: string;
  databaseOutline?: string;
  apiEndpoints?: ApiEndpoint[];
  implementationSteps: string[];
  skeletonCode: string;
  skeletonLanguage: string;
  vivaQuestions: VivaQuestion[];
}

export const PROJECTS: Project[] = [
  {
    "id": "todo-app",
    "title": "Todo Task Planner",
    "difficulty": "Basic",
    "complexityStars": 1,
    "techStack": [
      "Angular 21",
      "HTML5",
      "CSS3",
      "Local Storage"
    ],
    "icon": "fa-solid fa-square-check",
    "shortDesc": "A task management application featuring category filtering, progress boards, and persistence via local storage.",
    "duration": "1 Week",
    "prerequisites": [
      "Basic HTML/CSS layouts",
      "Basic JS variables and arrays"
    ],
    "learningOutcomes": [
      "Standalone component design",
      "One-way & two-way bindings",
      "Angular services injection",
      "LocalStorage key syncing"
    ],
    "features": [
      "Complete CRUD operations for managing tasks.",
      "Category tagging (Work, Personal, Urgent) with dynamic colors.",
      "Data persistence using browser LocalStorage API.",
      "Progress bar indicator and completion status filtering."
    ],
    "additionalFeatures": [
      "Drag-and-drop column boards",
      "Deadline alert alerts",
      "Query text matches highlighting"
    ],
    "architecture": "Angular Components (Parent-Child layout) -> State Management Service -> LocalStorage Storage Engine API.",
    "synopsis": "Perfect for beginners starting with Angular. This project teaches state tracking, data binding, and service-based dependency injection to separate core business logic from UI templates.",
    "directoryStructure": "todo-app/\n├── src/\n│   ├── app/\n│   │   ├── components/\n│   │   │   ├── task-input/\n│   │   │   ├── task-list/\n│   │   │   └── task-item/\n│   │   ├── services/\n│   │   │   └── task.service.ts\n│   │   └── app.component.ts\n└── package.json",
    "implementationSteps": [
      "Phase 1: Set up components (TaskInput, TaskItem, TaskList) and styles.",
      "Phase 2: Create TaskService to handle array list updates and localStorage sync.",
      "Phase 3: Connect inputs, list loop templates, and complete categories.",
      "Phase 4: Test filter states (All, Completed, Active)."
    ],
    "skeletonCode": "// task.service.ts\nimport { Injectable } from '@angular/core';\n\n@Injectable({ providedIn: 'root' })\nexport class TaskService {\n  private KEY = 'todo_tasks';\n  getTasks() {\n    return JSON.parse(localStorage.getItem(this.KEY) || '[]');\n  }\n  save(tasks: any[]) {\n    localStorage.setItem(this.KEY, JSON.stringify(tasks));\n  }\n}",
    "vivaQuestions": [
      {
        "question": "What is LocalStorage?",
        "answer": "A browser storage API storing key-value pairs permanently until cleared."
      },
      {
        "question": "What is Angular Service?",
        "answer": "A class containing data shared across components via Dependency Injection."
      },
      {
        "question": "What is standalone component?",
        "answer": "A component that imports its own dependencies directly without NgModules."
      },
      {
        "question": "Explain dynamic style binding.",
        "answer": "Using [ngStyle] or [ngClass] to update layout classes based on variable flags."
      }
    ],
    "domain": "angular",
    "domainLabel": "Frontend / Angular",
    "skeletonLanguage": "typescript",
    "difficultyClass": "difficulty-basic",
    "showArch": false
  },
  {
    "id": "calculator-app",
    "title": "Simple Calculator UI",
    "difficulty": "Basic",
    "complexityStars": 1,
    "techStack": [
      "Angular 21",
      "CSS Flexbox",
      "Eval Parser"
    ],
    "icon": "fa-solid fa-calculator",
    "shortDesc": "Web-based arithmetic calculator supporting additions, subtractions, multiplications, divisions, and percentage calculations.",
    "duration": "1 Week",
    "prerequisites": [
      "CSS Grid styling",
      "JS string evaluations"
    ],
    "learningOutcomes": [
      "Keyboard events handling",
      "Responsive grids alignments",
      "Input state tracking"
    ],
    "features": [
      "Vibrant dark-theme keyboard button grid.",
      "Real-time expressions display bar.",
      "Backspace, decimal, clear, and calculations triggers.",
      "Input validation preventing duplicate operator presses."
    ],
    "additionalFeatures": [
      "Historical calculation logs panel",
      "Standard and Scientific layout toggles",
      "Keyboard layout binding"
    ],
    "architecture": "Visual Button Matrix -> Click Event Listener -> Expression Parsing Handler -> View Renderer.",
    "synopsis": "Develop an interactive arithmetic keyboard. Master grid alignments, key click binds, and expression strings building and parser operations.",
    "directoryStructure": "calculator-app/\n├── src/app/\n│   ├── calc.component.ts\n│   ├── calc.component.html\n│   └── calc.component.css\n└── package.json",
    "implementationSteps": [
      "Phase 1: Build the grid keyboard layout using CSS Grid.",
      "Phase 2: Write calculation states and click functions inside TypeScript component.",
      "Phase 3: Set up keyboard listener events.",
      "Phase 4: Run error checks preventing invalid calculations (e.g. division by zero)."
    ],
    "skeletonCode": "export class CalculatorComponent {\n  displayValue: string = '';\n  pressKey(char: string) {\n    this.displayValue += char;\n  }\n  calculate() {\n    try { this.displayValue = eval(this.displayValue).toString(); } \n    catch { this.displayValue = 'Error'; }\n  }\n}",
    "vivaQuestions": [
      {
        "question": "How do you handle keyboard inputs globally in Angular?",
        "answer": "By using the @HostListener('document:keydown', ['$event']) annotation in components."
      },
      {
        "question": "Why is using eval() generally risky in production?",
        "answer": "It executes strings as arbitrary JavaScript code, which can pose security risks if user input is unverified."
      },
      {
        "question": "Explain CSS Grid layout.",
        "answer": "A two-dimensional grid-based layout system that organizes items in rows and columns."
      },
      {
        "question": "How do you clear variables in Angular?",
        "answer": "By resetting state variables to empty strings or defaults within event handlers."
      }
    ],
    "domain": "angular",
    "domainLabel": "Frontend / Angular",
    "skeletonLanguage": "typescript",
    "difficultyClass": "difficulty-basic",
    "showArch": false
  },
  {
    "id": "random-quote",
    "title": "Random Quote Engine",
    "difficulty": "Basic",
    "complexityStars": 1,
    "techStack": [
      "Angular 21",
      "REST API",
      "Fading Animations"
    ],
    "icon": "fa-solid fa-quote-left",
    "shortDesc": "A card application generating motivational quotes via remote APIs with clean animated transitions.",
    "duration": "1 Week",
    "prerequisites": [
      "Basic API connections concepts",
      "CSS keyframe animations"
    ],
    "learningOutcomes": [
      "Asynchronous HTTP requests",
      "Fading layout transitions",
      "Twitter share links integration"
    ],
    "features": [
      "Random quotes generation from remote API.",
      "One-click Twitter share link builder.",
      "Text fading keyframe animation transition on quote change.",
      "Fallback quote offline lists."
    ],
    "additionalFeatures": [
      "Daily quote scheduler notifications",
      "Category selection (Life, Wisdom, Business)",
      "Image quote card exports"
    ],
    "architecture": "Angular HttpClient Service -> Quotes JSON Endpoint -> Component view array -> Twitter Share API.",
    "synopsis": "Construct an API data fetcher card. Focuses on fetching remote quotes, handling network loading alerts, and adding smooth transition animations.",
    "directoryStructure": "quote-generator/\n├── src/app/\n│   ├── services/quote.service.ts\n│   ├── quote.component.ts\n│   └── quote.component.html\n└── package.json",
    "implementationSteps": [
      "Phase 1: Create QuoteService injecting HttpClient.",
      "Phase 2: Bind card button trigger to request API quote.",
      "Phase 3: Integrate standard CSS keyframe transitions.",
      "Phase 4: Generate twitter share link query parameters."
    ],
    "skeletonCode": "import { HttpClient } from '@angular/common/http';\nexport class QuoteService {\n  constructor(private http: HttpClient) {}\n  getRandomQuote() {\n    return this.http.get('https://api.quotable.io/random');\n  }\n}",
    "vivaQuestions": [
      {
        "question": "What module is required for API requests in Angular?",
        "answer": "The HttpClientModule, which must be imported to register HttpClient."
      },
      {
        "question": "Explain the difference between subscribe and promise.",
        "answer": "Subscribe listens for multiple values over time, while Promises trigger once and complete."
      },
      {
        "question": "How do you style absolute overlays?",
        "answer": "By positioning the container to relative and the child overlay to absolute."
      },
      {
        "question": "What is API rate-limiting?",
        "answer": "A server constraint restricting the number of requests a client can make in a given timeframe."
      }
    ],
    "domain": "angular",
    "domainLabel": "Frontend / Angular",
    "skeletonLanguage": "typescript",
    "difficultyClass": "difficulty-basic",
    "showArch": false
  },
  {
    "id": "digital-clock",
    "title": "Digital Countdown Timer",
    "difficulty": "Basic",
    "complexityStars": 2,
    "techStack": [
      "Angular 21",
      "JS Intervals",
      "HTML Audio API"
    ],
    "icon": "fa-solid fa-clock",
    "shortDesc": "A dashboard timer allowing users to set minutes/seconds, featuring progress trackers and alarm rings.",
    "duration": "1 Week",
    "prerequisites": [
      "setInterval and clearInterval mechanics",
      "Basic audio player bindings"
    ],
    "learningOutcomes": [
      "Handle timer intervals safely",
      "State variable resets",
      "Trigger audio files programmatically"
    ],
    "features": [
      "Interactive time setting inputs (Minutes, Seconds).",
      "Start, Pause, Resume, and Reset buttons.",
      "Ringing alarm sound upon completion.",
      "Visual progress circle updating in real-time."
    ],
    "additionalFeatures": [
      "Pomodoro Timer layouts preset",
      "Tab notifications showing remaining seconds",
      "Volume control slide slider"
    ],
    "architecture": "UI Settings -> JavaScript setInterval Controller -> HTML Audio Playback Engine -> Canvas progress ring.",
    "synopsis": "Design a countdown clock. Teaches JavaScript scheduling, avoiding interval drift, and loading assets like alarm audios.",
    "directoryStructure": "countdown-timer/\n├── src/assets/alarm.mp3\n├── src/app/\n│   ├── timer.component.ts\n│   └── timer.component.html\n└── package.json",
    "implementationSteps": [
      "Phase 1: Build layout panel with digital display counters.",
      "Phase 2: Implement startTimer using setInterval subtracting seconds.",
      "Phase 3: Integrate playAudio alerting completed states.",
      "Phase 4: Fix interval memory leak on component destroy."
    ],
    "skeletonCode": "export class TimerComponent {\n  secondsLeft = 60; intervalId: any;\n  start() {\n    this.intervalId = setInterval(() => {\n      if(this.secondsLeft > 0) this.secondsLeft--;\n      else this.ring();\n    }, 1000);\n  }\n  ring() { new Audio('assets/alarm.mp3').play(); clearInterval(this.intervalId); }\n}",
    "vivaQuestions": [
      {
        "question": "Why must you clear intervals on component destruction?",
        "answer": "To prevent intervals from running in the background and causing memory leaks."
      },
      {
        "question": "Which life cycle hook checks for component destroy?",
        "answer": "ngOnDestroy, where you unsubscribe from observables and clear timers."
      },
      {
        "question": "Explain the JS Event Loop.",
        "answer": "A mechanism that manages execution of multiple chunks of code, executing tasks, microtasks, and rendering cycles."
      },
      {
        "question": "What is interval drift?",
        "answer": "Small cumulative delays caused by other CPU operations executing during interval triggers."
      }
    ],
    "domain": "angular",
    "domainLabel": "Frontend / Angular",
    "skeletonLanguage": "typescript",
    "difficultyClass": "difficulty-basic",
    "showArch": false
  },
  {
    "id": "weather-dashboard",
    "title": "Weather Insights Dashboard",
    "difficulty": "Intermediate",
    "complexityStars": 3,
    "techStack": [
      "Angular 21",
      "RxJS Streams",
      "Third Party REST API",
      "Chart.js"
    ],
    "icon": "fa-solid fa-cloud-sun",
    "shortDesc": "A rich frontend application showing dynamic forecasts, live atmospheric metrics, and historical charts.",
    "duration": "2 Weeks",
    "prerequisites": [
      "Angular CLI operations",
      "HTTP requests and JSON parsing"
    ],
    "learningOutcomes": [
      "HttpClient API connections",
      "RxJS operator streams (switchMap)",
      "Chart.js rendering canvas",
      "Dark theme triggers"
    ],
    "features": [
      "Live weather search by location or GPS coordinate queries.",
      "5-Day dynamic weather forecast representation.",
      "Interactive line charts mapping daily temperatures.",
      "Search history caching with auto-complete tags."
    ],
    "additionalFeatures": [
      "Weather alerts notification drawer",
      "Dynamic theme layouts sync with weather conditions",
      "City comparisons panel"
    ],
    "architecture": "User Interface (Dashboard cards) -> RxJS HttpClient -> Weather REST API -> Chart.js Engine.",
    "synopsis": "Build an API-driven frontend. Practice dealing with asynchronous network requests, handling HTTP errors, managing RxJS operators, and rendering charts dynamically in Angular views.",
    "directoryStructure": "weather-dashboard/\n├── src/app/\n│   ├── components/search/\n│   │   ├── forecast-chart/\n│   │   └── history-list/\n│   ├── services/weather.service.ts\n│   └── app.component.ts\n└── package.json",
    "implementationSteps": [
      "Phase 1: Register API keys on OpenWeatherMap and build HttpService.",
      "Phase 2: Integrate input fields with RxJS debounce timers.",
      "Phase 3: Connect forecast arrays to Chart.js canvases.",
      "Phase 4: Add loading bars and error handlers."
    ],
    "skeletonCode": "import { HttpClient } from '@angular/common/http';\nexport class WeatherService {\n  getForecast(city: string) {\n    return this.http.get(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=KEY`);\n  }\n}",
    "vivaQuestions": [
      {
        "question": "Why use switchMap for search fields?",
        "answer": "To cancel previous outstanding API requests if the user types a new key."
      },
      {
        "question": "What is debounceTime in RxJS?",
        "answer": "It delays processing events until a specific quiet time has passed, reducing duplicate triggers."
      },
      {
        "question": "What is ViewChild in Angular?",
        "answer": "A decorator that allows a component to access a child component or template element directly."
      },
      {
        "question": "How to handle API authentication keys securely?",
        "answer": "Store keys in environment configurations or route calls through an intermediate backend server."
      }
    ],
    "domain": "angular",
    "domainLabel": "Frontend / Angular",
    "skeletonLanguage": "typescript",
    "difficultyClass": "difficulty-intermediate",
    "showArch": false
  },
  {
    "id": "markdown-preview",
    "title": "Markdown Live Previewer",
    "difficulty": "Intermediate",
    "complexityStars": 3,
    "techStack": [
      "Angular 21",
      "Marked JS Parser",
      "CSS Split Panels"
    ],
    "icon": "fa-solid fa-file-code",
    "shortDesc": "Double panel web app parsing markdown codes into formatted HTML on the fly.",
    "duration": "2 Weeks",
    "prerequisites": [
      "Angular textarea binding",
      "HTML sanitizer controls"
    ],
    "learningOutcomes": [
      "Third-party library integration",
      "HTML sanitization pipelines",
      "Dual panel scroll synchronization"
    ],
    "features": [
      "Live previewer updates on textarea inputs.",
      "Syntax highlighting within preview blocks.",
      "Sanitized output preventing XSS script injects.",
      "One-click markdown file downloads."
    ],
    "additionalFeatures": [
      "PDF summary document generator",
      "Default markdown templates selector",
      "Word/Char summary status bars"
    ],
    "architecture": "Input Panel -> Marked JS Parsing Engine -> DomSanitizer Service -> HTML Preview Panel.",
    "synopsis": "Build a markdown editor. Master DOM sanitization, binding third-party parsing libraries, and synchronizing scrolling across dual views.",
    "directoryStructure": "markdown-editor/\n├── src/app/\n│   ├── editor.component.ts\n│   ├── editor.component.html\n│   └── editor.component.css\n└── package.json",
    "implementationSteps": [
      "Phase 1: Install marked JS library and configure ts declaration typing.",
      "Phase 2: Build dual split-panel layouts.",
      "Phase 3: Implement DomSanitizer bypassSecurityTrustHtml rendering computed markup.",
      "Phase 4: Sync scroll offsets using mouse position bindings."
    ],
    "skeletonCode": "import { DomSanitizer } from '@angular/platform-browser';\nimport { marked } from 'marked';\nexport class EditorComponent {\n  markdownText = '# Hello';\n  get parsedHtml() {\n    return this.sanitizer.bypassSecurityTrustHtml(marked.parse(this.markdownText));\n  }\n  constructor(private sanitizer: DomSanitizer) {}\n}",
    "vivaQuestions": [
      {
        "question": "What is DomSanitizer?",
        "answer": "An Angular service that sanitizes HTML strings to prevent Cross-Site Scripting (XSS) attacks."
      },
      {
        "question": "Why sync scrolls using event listeners?",
        "answer": "To ensure that scrolling in the editor panel scrolls the preview panel to the corresponding position."
      },
      {
        "question": "What is the purpose of bypassSecurityTrustHtml?",
        "answer": "It bypasses Angular's built-in HTML sanitization for trusted content."
      },
      {
        "question": "How do you bundle third-party libraries in Angular?",
        "answer": "By installing them via npm and declaring imports in components or angular.json configurations."
      }
    ],
    "domain": "angular",
    "domainLabel": "Frontend / Angular",
    "skeletonLanguage": "typescript",
    "difficultyClass": "difficulty-intermediate",
    "showArch": false
  },
  {
    "id": "recipe-book",
    "title": "Recipe Search & Recipe Book",
    "difficulty": "Intermediate",
    "complexityStars": 3,
    "techStack": [
      "Angular 21",
      "API Fetch",
      "IndexedDB Storage"
    ],
    "icon": "fa-solid fa-utensils",
    "shortDesc": "Browse external food databases, bookmark favorites, and edit custom ingredient lists.",
    "duration": "2 Weeks",
    "prerequisites": [
      "Basic database storage patterns",
      "Router transitions"
    ],
    "learningOutcomes": [
      "IndexedDB operations in browser",
      "Nested router configurations",
      "Multi-filtering listings"
    ],
    "features": [
      "Edamam database integration.",
      "Offline bookmarking via IndexedDB API.",
      "Dynamic ingredient calculators scaling with portion size settings.",
      "Detailed instructions pages with nested routing."
    ],
    "additionalFeatures": [
      "Daily meal planner grids",
      "Automatic shopping list generator",
      "Nutritional charts analysis"
    ],
    "architecture": "Recipe inputs -> Recipe API -> IndexedDB bookmark cache -> scale multiplier.",
    "synopsis": "Build a recipe planner. Master browser-side databases, ingredient calculations, and details routing.",
    "directoryStructure": "recipe-book/\n├── src/app/\n│   ├── services/db.service.ts\n│   ├── recipe-detail/\n│   └── recipe-list/\n└── package.json",
    "implementationSteps": [
      "Phase 1: Integrate Edamam query endpoints.",
      "Phase 2: Establish IndexedDB schemas storing bookmarked recipes.",
      "Phase 3: Code detail routes passing recipe slugs.",
      "Phase 4: Implement multiplier scale functions for ingredients."
    ],
    "skeletonCode": "export class DbService {\n  async saveFavorite(recipe: any) {\n    // IndexedDB storage logic here...\n  }\n}",
    "vivaQuestions": [
      {
        "question": "What is IndexedDB?",
        "answer": "A low-level API for client-side storage of large amounts of structured data."
      },
      {
        "question": "What are query parameters?",
        "answer": "Optional key-value pairs added to URLs to filter list page results."
      },
      {
        "question": "Explain dynamic path variables in routing.",
        "answer": "Route paths with placeholders (e.g. recipe/:id) that receive parameters dynamically."
      },
      {
        "question": "What is the difference between LocalStorage and IndexedDB?",
        "answer": "LocalStorage is synchronous and limited to string data (approx 5MB). IndexedDB is asynchronous, supports objects, and allows much larger storage limits."
      }
    ],
    "domain": "angular",
    "domainLabel": "Frontend / Angular",
    "skeletonLanguage": "typescript",
    "difficultyClass": "difficulty-intermediate",
    "showArch": false
  },
  {
    "id": "crypto-tracker",
    "title": "Crypto Tracker Widget",
    "difficulty": "Intermediate",
    "complexityStars": 3,
    "techStack": [
      "Angular 21",
      "WebSocket Streams",
      "Glow Charts"
    ],
    "icon": "fa-solid fa-chart-line",
    "shortDesc": "Real-time coin prices dashboard with interactive charts, sparklines, and custom threshold alerts.",
    "duration": "2 Weeks",
    "prerequisites": [
      "WebSocket connection basics",
      "Chart datasets updates"
    ],
    "learningOutcomes": [
      "WebSocket event handling",
      "Sparkline charts data mapping",
      "Background sound notifications"
    ],
    "features": [
      "Live pricing updates via CoinGecko WebSockets.",
      "Interactive sparkline graphs mapping price changes.",
      "Custom price threshold alerts.",
      "Sortable dashboard columns (market cap, volume, daily changes)."
    ],
    "additionalFeatures": [
      "Profit/Loss investment calculators",
      "Alert notification logs",
      "Export currency rates to CSV"
    ],
    "architecture": "WebSocket Channel -> Prices processing engine -> Sparkline views updater -> Alert notifier.",
    "synopsis": "Master real-time data handling. Connect to WebSockets, manage continuous UI updates efficiently, and configure desktop notifications.",
    "directoryStructure": "crypto-tracker/\n├── src/app/\n│   ├── services/socket.service.ts\n│   ├── coin-sparkline/\n│   └── coin-list/\n└── package.json",
    "implementationSteps": [
      "Phase 1: Open WebSocket channel to exchange price changes.",
      "Phase 2: Pipe message buffers to reactive array streams.",
      "Phase 3: Code price checking logic triggering alerts.",
      "Phase 4: Draw real-time sparkline canvas elements."
    ],
    "skeletonCode": "export class SocketService {\n  connect() {\n    const ws = new WebSocket('wss://stream.binance.com:9443/ws');\n    ws.onmessage = (event) => { console.log(JSON.parse(event.data)); };\n  }\n}",
    "vivaQuestions": [
      {
        "question": "What is WebSocket?",
        "answer": "A protocol providing full-duplex communication channels over a single TCP connection."
      },
      {
        "question": "Why is WebSocket preferred over HTTP polling for live rates?",
        "answer": "WebSockets maintain a persistent connection, eliminating header overhead and reducing server load."
      },
      {
        "question": "How do WebSockets prevent memory leaks?",
        "answer": "By closing connections explicitly on component destruction."
      },
      {
        "question": "Explain sparklines.",
        "answer": "Small, simple line graphs without axes, showing variations in a measurement over time."
      }
    ],
    "domain": "angular",
    "domainLabel": "Frontend / Angular",
    "skeletonLanguage": "typescript",
    "difficultyClass": "difficulty-intermediate",
    "showArch": false
  },
  {
    "id": "typing-test",
    "title": "Interactive Typing Speed Tester",
    "difficulty": "Intermediate",
    "complexityStars": 3,
    "techStack": [
      "Angular 21",
      "String Comp",
      "Chart.js UI"
    ],
    "icon": "fa-solid fa-keyboard",
    "shortDesc": "Test your typing speed (WPM) and accuracy against sample text prompts with real-time feedback.",
    "duration": "2 Weeks",
    "prerequisites": [
      "String character-by-character comparisons",
      "Timers state handling"
    ],
    "learningOutcomes": [
      "Calculate WPM and accuracy metrics",
      "Real-time string comparisons",
      "Dynamic CSS class application"
    ],
    "features": [
      "Random sentence prompt database generator.",
      "Real-time accuracy highlighting (green for correct, red for typos).",
      "Dynamic Words Per Minute (WPM) and accuracy score calculators.",
      "Completion analysis charts."
    ],
    "additionalFeatures": [
      "Custom paragraph file uploads",
      "Practice mode with backspaces disabled",
      "Global leaderboard profiles"
    ],
    "architecture": "Text Prompts Database -> Character Comparer -> Timer Engine -> Accuracy Calculator -> Scoreboard views.",
    "synopsis": "Build a typing speed tester. Master string comparisons, dynamic CSS styling, and calculating typing metrics like WPM.",
    "directoryStructure": "typing-test/\n├── src/app/\n│   ├── dashboard.component.ts\n│   └── dashboard.component.html\n└── package.json",
    "implementationSteps": [
      "Phase 1: Set up sentence text databases.",
      "Phase 2: Add keyboard listeners and compare input characters with prompts.",
      "Phase 3: Calculate WPM based on elapsed time and correct characters.",
      "Phase 4: Render accuracy metrics on completion."
    ],
    "skeletonCode": "export class TypingComponent {\n  prompt = 'Vidhura Tech code'; inputVal = '';\n  get wpm() {\n    return (this.inputVal.length / 5) / (this.elapsedTime / 60);\n  }\n}",
    "vivaQuestions": [
      {
        "question": "How do you calculate WPM?",
        "answer": "By dividing the number of typed characters by 5 (standard word length), then dividing by the elapsed time in minutes."
      },
      {
        "question": "How to compare strings character-by-character in template loops?",
        "answer": "By splitting the prompt into character arrays and checking index values against the typed text."
      },
      {
        "question": "What event triggers character validation?",
        "answer": "The input or keypress event in input fields."
      },
      {
        "question": "Explain the difference between input and change events.",
        "answer": "Input fires immediately when the value changes. Change fires when the input loses focus."
      }
    ],
    "domain": "angular",
    "domainLabel": "Frontend / Angular",
    "skeletonLanguage": "typescript",
    "difficultyClass": "difficulty-intermediate",
    "showArch": false
  },
  {
    "id": "chat-board",
    "title": "Real-time Chat UI Board",
    "difficulty": "Advanced",
    "complexityStars": 4,
    "techStack": [
      "Angular 21",
      "RxJS Websockets",
      "CSS Chat Bubbles"
    ],
    "icon": "fa-solid fa-comments",
    "shortDesc": "A real-time messaging interface featuring custom channels, active members lists, typing alerts, and read receipts.",
    "duration": "4 Weeks",
    "prerequisites": [
      "RxJS Subject streams",
      "HTML5 Audio notifications"
    ],
    "learningOutcomes": [
      "Real-time WebSocket message routing",
      "Dynamic scroll behavior management",
      "Client state synchronization"
    ],
    "features": [
      "Real-time message sending and receiving.",
      "Separate channels/rooms list panel.",
      "Read receipts and typing indicators.",
      "Auto-scroll container to the latest message."
    ],
    "additionalFeatures": [
      "Direct file and image attachments",
      "Search utility within chat threads",
      "Voice recording note messages"
    ],
    "architecture": "Angular UI -> RxJS WebSocketSubject -> WebSocket server -> Local database log caching.",
    "synopsis": "Build an advanced web chat client. Master handling bi-directional WebSocket messages, managing scrolling behavior, and updating client states dynamically.",
    "directoryStructure": "chat-board/\n├── src/app/\n│   ├── services/chat.service.ts\n│   ├── chat-window/\n│   └── channel-list/\n└── package.json",
    "implementationSteps": [
      "Phase 1: Connect WebSocketSubject to chat server endpoints.",
      "Phase 2: Pipe messages to local state arrays.",
      "Phase 3: Implement auto-scroll to the bottom of the message container.",
      "Phase 4: Design responsive typing indicator states."
    ],
    "skeletonCode": "import { webSocket } from 'rxjs/webSocket';\nexport class ChatService {\n  private subject = webSocket('ws://localhost:8080/chat');\n  sendMessage(msg: any) { this.subject.next(msg); }\n  getMessages() { return this.subject.asObservable(); }\n}",
    "vivaQuestions": [
      {
        "question": "What is RxJS webSocket?",
        "answer": "A wrapper around browser WebSockets that exposes messages as observable streams."
      },
      {
        "question": "How do you keep scrollbars pinned to the bottom?",
        "answer": "By updating the element's scrollTop property to equal its scrollHeight after new messages render."
      },
      {
        "question": "Explain the difference between a Subject and a BehaviorSubject.",
        "answer": "Subject broadcasts events to active listeners but does not cache state. BehaviorSubject stores the current value and emits it to new subscribers immediately."
      },
      {
        "question": "What is event-driven architecture?",
        "answer": "A design pattern where system changes are triggered by events, which are processed asynchronously."
      }
    ],
    "domain": "angular",
    "domainLabel": "Frontend / Angular",
    "skeletonLanguage": "typescript",
    "difficultyClass": "difficulty-advanced",
    "showArch": false
  },
  {
    "id": "retro-board",
    "title": "Collaborative Retro Board",
    "difficulty": "Advanced",
    "complexityStars": 4,
    "techStack": [
      "Angular 21",
      "Cdk DragDrop",
      "State Sync Service"
    ],
    "icon": "fa-solid fa-clipboard-question",
    "shortDesc": "A collaborative board with drag-and-drop sticky notes, column classifications, upvoting, and category filters.",
    "duration": "4 Weeks",
    "prerequisites": [
      "Angular CDK integrations",
      "Dynamic layout grids positioning"
    ],
    "learningOutcomes": [
      "Implement drag-and-drop interfaces using Angular CDK",
      "Manage real-time state synchronization",
      "Perform complex array transformations"
    ],
    "features": [
      "Drag-and-drop columns (Went Well, To Improve, Action Items).",
      "Sticky notes creation with custom colors.",
      "One-click upvoting on retro cards.",
      "Active member avatar indicators."
    ],
    "additionalFeatures": [
      "Anonymous submission modes",
      "Export board layout data to PDF",
      "Timer controls for ideation phases"
    ],
    "architecture": "Angular CDK DragDrop Engine -> State Sync Manager -> Local Storage/WebSockets Cache.",
    "synopsis": "Build an interactive dashboard. Learn to use the Angular CDK for drag-and-drop interfaces, coordinate real-time board updates, and implement voting filters.",
    "directoryStructure": "retro-board/\n├── src/app/\n│   ├── board.component.ts\n│   ├── board.component.html\n│   └── board.component.css\n└── package.json",
    "implementationSteps": [
      "Phase 1: Install Angular CDK and configure DragDrop imports.",
      "Phase 2: Build board layouts and card lists.",
      "Phase 3: Write drag handlers to update column states.",
      "Phase 4: Implement upvoting and item sorting."
    ],
    "skeletonCode": "import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';\nexport class BoardComponent {\n  todo = ['Note 1']; done = [];\n  drop(event: CdkDragDrop<string[]>) {\n    if (event.previousContainer === event.container) {\n      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);\n    } else {\n      transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);\n    }\n  }\n}",
    "vivaQuestions": [
      {
        "question": "What is Angular CDK?",
        "answer": "The Component Dev Kit, which provides common UI behaviors and accessibility utilities without predefined styling."
      },
      {
        "question": "How does transferArrayItem work?",
        "answer": "It moves an item from a source array to a target array at a specified index."
      },
      {
        "question": "How do you handle real-time synchronization between active clients?",
        "answer": "By broadcasting card updates over WebSockets and refreshing the UI data models accordingly."
      },
      {
        "question": "Why is separating business logic from components key?",
        "answer": "It enables modular testing, code reusability, and cleaner codebase maintenance."
      }
    ],
    "domain": "angular",
    "domainLabel": "Frontend / Angular",
    "skeletonLanguage": "typescript",
    "difficultyClass": "difficulty-advanced",
    "showArch": false
  },
  {
    "id": "micro-frontend",
    "title": "Micro-Frontend Modular Dashboard",
    "difficulty": "Advanced",
    "complexityStars": 5,
    "techStack": [
      "Angular 21",
      "Module Federation",
      "Webpack Configs"
    ],
    "icon": "fa-solid fa-sitemap",
    "shortDesc": "An enterprise dashboard that dynamically loads independent Angular applications at runtime using Module Federation.",
    "duration": "4 Weeks",
    "prerequisites": [
      "Web configuration scripts",
      "Custom routing setups"
    ],
    "learningOutcomes": [
      "Configure Webpack Module Federation",
      "Load micro-apps dynamically at runtime",
      "Manage cross-application routing"
    ],
    "features": [
      "Main shell application dynamically loading sub-modules.",
      "Separate deployment configurations for child micro-apps.",
      "Shared core state services.",
      "Unified theme layouts."
    ],
    "additionalFeatures": [
      "Single-Sign-On token sharing",
      "Feature toggling controls",
      "Automated CI/CD build scripts"
    ],
    "architecture": "Main App Shell Workspace -> Dynamic remote modules -> Webpack Module Federation -> Shared Services.",
    "synopsis": "Build a micro-frontend architecture. Master Module Federation, dynamic module loading, routing across apps, and shared state management.",
    "directoryStructure": "micro-frontend/\n├── shell-app/\n├── analytics-app/\n├── settings-app/\n└── webpack.config.js",
    "implementationSteps": [
      "Phase 1: Configure Webpack Module Federation inside shell and remote projects.",
      "Phase 2: Define remote entry URLs.",
      "Phase 3: Write routes using loadRemoteModule syntax.",
      "Phase 4: Set up shared state management."
    ],
    "skeletonCode": "// routing config inside shell\nimport { loadRemoteModule } from '@angular-architects/module-federation';\nexport const routes = [\n  {\n    path: 'analytics',\n    loadChildren: () => loadRemoteModule({\n      type: 'module',\n      remoteEntry: 'http://localhost:4201/remoteEntry.js',\n      exposedModule: './Module'\n    }).then(m => m.AnalyticsModule)\n  }\n];",
    "vivaQuestions": [
      {
        "question": "What is Micro-Frontend?",
        "answer": "An architectural style where a web application is built as a collection of independent, deployable features."
      },
      {
        "question": "What is Webpack Module Federation?",
        "answer": "A Webpack feature that allows a JavaScript application to dynamically run code from another build at runtime."
      },
      {
        "question": "How do micro-frontends share state?",
        "answer": "By using shared libraries, custom event dispatches, or window namespace variables."
      },
      {
        "question": "Explain the loadRemoteModule helper.",
        "answer": "An utility that fetches and parses the remote entry bundle from a specified URL at runtime."
      }
    ],
    "domain": "angular",
    "domainLabel": "Frontend / Angular",
    "skeletonLanguage": "typescript",
    "difficultyClass": "difficulty-advanced",
    "showArch": false
  },
  {
    "id": "audio-editor",
    "title": "Audio Waveform Editor Console",
    "difficulty": "Advanced",
    "complexityStars": 5,
    "techStack": [
      "Angular 21",
      "HTML5 Audio API",
      "WaveSurfer JS",
      "Canvas Render"
    ],
    "icon": "fa-solid fa-volume-high",
    "shortDesc": "In-browser audio console that visualizes waveforms, cuts/trims tracks, and exports audio files.",
    "duration": "4 Weeks",
    "prerequisites": [
      "Web Audio API basics",
      "Binary buffer operations"
    ],
    "learningOutcomes": [
      "Parse audio buffers and visualize waveforms",
      "Perform non-destructive audio edits",
      "Manage binary file exports"
    ],
    "features": [
      "Interactive audio waveform rendering (via WaveSurfer).",
      "Timeline navigation with zoom and playhead controls.",
      "Audio editing tools (Cut, Copy, Paste, Trim).",
      "Exporting modified audio files to WAV format."
    ],
    "additionalFeatures": [
      "Adjust playback speed and pitch",
      "Multi-track timeline layouts",
      "Audio filters (Highpass/Lowpass)"
    ],
    "architecture": "Audio File Upload -> Web Audio API Decoders -> WaveSurfer Canvas -> Audio Buffer Editor -> WAV Exporter.",
    "synopsis": "Build a browser-based audio editor. Master decoding audio buffers, rendering waveforms on canvas, editing binary data, and exporting audio files.",
    "directoryStructure": "audio-editor/\n├── src/app/\n│   ├── services/audio-buffer.service.ts\n│   ├── waveform-view/\n│   └── editor-controls/\n└── package.json",
    "implementationSteps": [
      "Phase 1: Configure WaveSurfer JS to render audio files on canvas.",
      "Phase 2: Read file arrays into Web Audio API buffers.",
      "Phase 3: Write buffer splicing methods (cut/paste).",
      "Phase 4: Code WAV file encoding and download scripts."
    ],
    "skeletonCode": "export class AudioService {\n  private audioCtx = new AudioContext();\n  async decode(file: File): Promise<AudioBuffer> {\n    const arrayBuf = await file.arrayBuffer();\n    return this.audioCtx.decodeAudioData(arrayBuf);\n  }\n}",
    "vivaQuestions": [
      {
        "question": "What is the Web Audio API?",
        "answer": "A high-level JavaScript API for processing and synthesizing audio in web applications."
      },
      {
        "question": "How do you decode audio data in JavaScript?",
        "answer": "By passing the file's ArrayBuffer to the decodeAudioData method of an AudioContext instance."
      },
      {
        "question": "Explain audio buffer slicing.",
        "answer": "Extracting subsets of channel data float arrays and merging them into new buffers."
      },
      {
        "question": "What is Wav file encoding?",
        "answer": "Writing a binary file header containing format specs, followed by interleaved PCM audio data."
      }
    ],
    "domain": "angular",
    "domainLabel": "Frontend / Angular",
    "skeletonLanguage": "typescript",
    "difficultyClass": "difficulty-advanced",
    "showArch": false
  },
  {
    "id": "student-info-cli",
    "title": "Student Info System CLI",
    "difficulty": "Basic",
    "complexityStars": 1,
    "techStack": [
      "Core Java",
      "Collections",
      "File Input/Output"
    ],
    "icon": "fa-solid fa-graduation-cap",
    "shortDesc": "CLI command utility written in Java to manage, search, and store student records in local files.",
    "duration": "1 Week",
    "prerequisites": [
      "Java JDK 17+ installed",
      "OOP classes, inheritance, encapsulation"
    ],
    "learningOutcomes": [
      "Java Collections framework",
      "Comparators sorting data",
      "BufferedReader CSV parser",
      "CLI Menu loops"
    ],
    "features": [
      "Console-based CRUD management menu.",
      "Sorting by Rank, GPA, or Student Roll Number.",
      "Search engine using dynamic criteria matching.",
      "File persistence (saving and reading data to/from CSV)."
    ],
    "additionalFeatures": [
      "GPA stats summaries",
      "Automatic email check checks",
      "Graceful shutdown hooks"
    ],
    "architecture": "CLI Console -> Student Manager -> File system CSV.",
    "synopsis": "OOP fundamental logic builder project. Focuses on collection interfaces, encapsulation, file streams, and exception handling.",
    "directoryStructure": "student-cli/\n├── src/com/vidhuratech/sys/\n│   ├── model/Student.java\n│   ├── util/FileHandler.java\n│   └── App.java\n└── README.md",
    "implementationSteps": [
      "Phase 1: Create Student object model.",
      "Phase 2: Write array CRUD managers.",
      "Phase 3: Code BufferedReader CSV parsing streams.",
      "Phase 4: Connect interactive CLI switches."
    ],
    "skeletonCode": "public class Student {\n  private String id; private String name; private double gpa;\n  public Student(String id, String name, double gpa) {\n    this.id = id; this.name = name; this.gpa = gpa;\n  }\n  // getters/setters...\n}",
    "vivaQuestions": [
      {
        "question": "Explain encapsulation.",
        "answer": "Bundling data variables and methods together, restricting direct outside access."
      },
      {
        "question": "What is BufferedReader?",
        "answer": "A class that reads text from character input streams, buffering characters to speed up reading."
      },
      {
        "question": "Difference between Comparable and Comparator.",
        "answer": "Comparable defines the natural sorting order for a class. Comparator defines custom sorting logic external to the class."
      },
      {
        "question": "Why is a clean shutdown hook key?",
        "answer": "To save in-memory data to local files if the CLI crashes or is closed."
      }
    ],
    "domain": "java",
    "domainLabel": "Java Full Stack",
    "skeletonLanguage": "java",
    "difficultyClass": "difficulty-basic",
    "showArch": false
  },
  {
    "id": "bank-sim",
    "title": "Bank Account Simulator",
    "difficulty": "Basic",
    "complexityStars": 1,
    "techStack": [
      "Core Java",
      "Exceptions",
      "Encapsulation"
    ],
    "icon": "fa-solid fa-vault",
    "shortDesc": "Console tool simulating accounts transactions, checking limits, and logging statements.",
    "duration": "1 Week",
    "prerequisites": [
      "Java variables types",
      "Encapsulation models"
    ],
    "learningOutcomes": [
      "Handle custom Java exceptions",
      "Implement transaction histories logging",
      "Master decimal precision numbers"
    ],
    "features": [
      "Dynamic account creation with base deposits.",
      "Withdrawal, deposit, and balance query commands.",
      "Custom balance exceptions preventing overdrawing.",
      "Logged statements arrays."
    ],
    "additionalFeatures": [
      "Fixed Deposit interest calculators",
      "Multi-account transfers",
      "Secure PIN lockouts"
    ],
    "architecture": "Console Inputs -> Bank Service Handler -> Account Classes -> Exceptions Logger.",
    "synopsis": "Build a core banking simulator. Focuses on OOP encapsulation, transaction logging, and custom exception handling.",
    "directoryStructure": "bank-sim/\n└── src/com/bank/\n    ├── exception/InsufficientFundsException.java\n    ├── model/Account.java\n    └── BankApplication.java",
    "implementationSteps": [
      "Phase 1: Code Account model with balance fields.",
      "Phase 2: Create InsufficientFundsException.",
      "Phase 3: Write withdraw/deposit checks.",
      "Phase 4: Build transactions logs array."
    ],
    "skeletonCode": "public class Account {\n  private double balance;\n  public void withdraw(double amt) throws InsufficientFundsException {\n    if (amt > balance) throw new InsufficientFundsException(\"Insufficient funds!\");\n    balance -= amt;\n  }\n}",
    "vivaQuestions": [
      {
        "question": "What are checked exceptions in Java?",
        "answer": "Exceptions checked at compile-time that must be declared in method signatures or caught."
      },
      {
        "question": "Why is double risky for currency math?",
        "answer": "Binary floating-point arithmetic can introduce rounding errors; BigDecimal is preferred for precise financial calculations."
      },
      {
        "question": "What is this keyword?",
        "answer": "A reference variable pointing to the current object instance."
      },
      {
        "question": "Explain method overloading.",
        "answer": "Defining multiple methods with the same name but different signatures within the same class."
      }
    ],
    "domain": "java",
    "domainLabel": "Java Full Stack",
    "skeletonLanguage": "java",
    "difficultyClass": "difficulty-basic",
    "showArch": false
  },
  {
    "id": "cli-calculator",
    "title": "Basic Calculator CLI",
    "difficulty": "Basic",
    "complexityStars": 1,
    "techStack": [
      "Core Java",
      "CLI Parser",
      "Math API"
    ],
    "icon": "fa-solid fa-divide",
    "shortDesc": "Command-line tool parsed arguments to run arithmetic and power calculations.",
    "duration": "1 Week",
    "prerequisites": [
      "Java main function args array",
      "Basic string parse parse"
    ],
    "learningOutcomes": [
      "Read arguments arrays",
      "Evaluate inputs dynamically",
      "Use Math API classes"
    ],
    "features": [
      "Parse inline expressions (e.g. java Calc 4 + 5).",
      "Handle basic operators and square roots.",
      "Input checks preventing division by zero.",
      "Help manual printed on invalid parameters."
    ],
    "additionalFeatures": [
      "Dynamic parenthesis evaluations",
      "Constant values (PI, E) macros",
      "Binary/Hex conversions"
    ],
    "architecture": "Main CLI Arguments -> Arg Parser -> Arithmetic Service -> Console Output.",
    "synopsis": "Command-line parsing practice. Learn to read launch argument arrays, convert strings to numbers safely, and perform math operations.",
    "directoryStructure": "cli-calc/\n└── src/com/calc/\n    └── CalculatorApp.java",
    "implementationSteps": [
      "Phase 1: Parse the main args array index positions.",
      "Phase 2: Match operators and execute calculations.",
      "Phase 3: Add error checks for empty inputs.",
      "Phase 4: Compile and test via command prompt."
    ],
    "skeletonCode": "public class CalculatorApp {\n  public static void main(String[] args) {\n    double a = Double.parseDouble(args[0]);\n    String op = args[1];\n    double b = Double.parseDouble(args[2]);\n    // Switch op case...\n  }\n}",
    "vivaQuestions": [
      {
        "question": "What is the args array in main method?",
        "answer": "An array of strings passed to the program when launched from the command line."
      },
      {
        "question": "How do you convert String to double?",
        "answer": "By using the static method Double.parseDouble(str)."
      },
      {
        "question": "What is JVM?",
        "answer": "The Java Virtual Machine, which runs compiled Java bytecode."
      },
      {
        "question": "Explain the default constructor.",
        "answer": "A constructor automatically created by the compiler if no constructor is defined in the class."
      }
    ],
    "domain": "java",
    "domainLabel": "Java Full Stack",
    "skeletonLanguage": "java",
    "difficultyClass": "difficulty-basic",
    "showArch": false
  },
  {
    "id": "file-copier",
    "title": "File Backup & Copier CLI",
    "difficulty": "Basic",
    "complexityStars": 2,
    "techStack": [
      "Core Java",
      "File Channels",
      "OS Paths"
    ],
    "icon": "fa-solid fa-copy",
    "shortDesc": "Utility walking folder trees, copying matching documents, and writing transfer stats logs.",
    "duration": "1 Week",
    "prerequisites": [
      "Java File API",
      "InputStream and OutputStream streams"
    ],
    "learningOutcomes": [
      "Walk directory trees",
      "Transfer byte streams efficiently",
      "Measure system process times"
    ],
    "features": [
      "Recursively copies directories and files.",
      "Filters files by extensions (e.g. copy .txt).",
      "Visual progress bar in console.",
      "Generates summary log reports on completion."
    ],
    "additionalFeatures": [
      "Zip archive compiler utilities",
      "MD5 checksum validators",
      "Multi-thread speed boosters"
    ],
    "architecture": "Path CLI Argument -> Directory Walker -> Byte Stream Buffer -> Audit Log Logger.",
    "synopsis": "Core operating system interaction project. Learn to read folders, create files, transfer raw byte streams, and handle permissions exceptions.",
    "directoryStructure": "file-copier/\n└── src/com/backup/\n    ├── FileCopyEngine.java\n    └── App.java",
    "implementationSteps": [
      "Phase 1: Set up folder checking paths.",
      "Phase 2: Write the recursive directory traversal logic.",
      "Phase 3: Implement stream buffering (e.g. 4KB chunks).",
      "Phase 4: Add execution time logs."
    ],
    "skeletonCode": "import java.io.*;\npublic class FileCopyEngine {\n  public void copy(File src, File dest) throws IOException {\n    try (InputStream in = new FileInputStream(src);\n         OutputStream out = new FileOutputStream(dest)) {\n      byte[] buffer = new byte[4096]; int length;\n      while ((length = in.read(buffer)) > 0) out.write(buffer, 0, length);\n    }\n  }\n}",
    "vivaQuestions": [
      {
        "question": "Explain the difference between InputStream and Reader.",
        "answer": "InputStream reads binary data (bytes). Reader reads text data (characters)."
      },
      {
        "question": "Why use buffer arrays when reading files?",
        "answer": "To reduce the number of direct disk access operations, which improves file transfer speeds."
      },
      {
        "question": "What is recursive method?",
        "answer": "A method that calls itself with updated parameters until a base exit condition is met."
      },
      {
        "question": "How does try-with-resources prevent resource leaks?",
        "answer": "It automatically closes any AutoCloseable objects defined in the try block when the execution exits."
      }
    ],
    "domain": "java",
    "domainLabel": "Java Full Stack",
    "skeletonLanguage": "java",
    "difficultyClass": "difficulty-basic",
    "showArch": false
  },
  {
    "id": "ecommerce-api",
    "title": "E-Commerce REST API Backend",
    "difficulty": "Intermediate",
    "complexityStars": 3,
    "techStack": [
      "Spring Boot",
      "Spring Data JPA",
      "H2 Database",
      "JWT Security"
    ],
    "icon": "fa-solid fa-gears",
    "shortDesc": "A backend server hosting API endpoints for user validation, product catalogs, shopping carts, and order checkouts.",
    "duration": "2 Weeks",
    "prerequisites": [
      "Java OOP logic",
      "REST API standards"
    ],
    "learningOutcomes": [
      "Layered app structures",
      "JPA entities mappings",
      "JWT authentication filters",
      "Database transactions config"
    ],
    "features": [
      "Role-based security configuration (Admin, Customer).",
      "Dynamic pagination and filters on catalog endpoint.",
      "Database relationship management (OneToMany / ManyToOne).",
      "Automated database seeding on startup."
    ],
    "additionalFeatures": [
      "PDF invoice download streams",
      "Promo coupons checks",
      "Automatic out-of-stock notification triggers"
    ],
    "architecture": "Client HTTP -> JWT filter -> Controller Layer -> Service Layer -> Repository Layer -> Database Engine.",
    "synopsis": "REST API backend practice. Teaches JWT authentication, Spring Boot, Spring Security, and database integrations.",
    "directoryStructure": "ecommerce-api/\n├── src/main/java/com/shop/\n│   ├── config/SecurityConfig.java\n│   ├── controller/ProductController.java\n│   ├── model/Product.java\n│   ├── repository/ProductRepository.java\n│   └── service/OrderService.java\n├── pom.xml\n└── README.md",
    "apiEndpoints": [
      {
        "method": "POST",
        "path": "/api/auth/login",
        "desc": "Validates user accounts and returns JWT tokens."
      },
      {
        "method": "GET",
        "path": "/api/products",
        "desc": "Returns paginated lists of products."
      },
      {
        "method": "POST",
        "path": "/api/orders",
        "desc": "Processes cart checkouts and creates order records."
      }
    ],
    "databaseOutline": "Tables:\n- Users (id, email, password, roles)\n- Products (id, name, price, stock)\n- Orders (id, user_id, total, status)",
    "implementationSteps": [
      "Phase 1: Build models and configure JPA entities.",
      "Phase 2: Configure Spring Security and write JWT validation filters.",
      "Phase 3: Write Controllers and Service classes for cart operations.",
      "Phase 4: Test API endpoints using Swagger or Postman."
    ],
    "skeletonCode": "@RestController\n@RequestMapping(\"/api/products\")\npublic class ProductController {\n  @Autowired private ProductRepository repo;\n  @GetMapping public List<Product> getAll() { return repo.findAll(); }\n}",
    "vivaQuestions": [
      {
        "question": "What is Spring Boot?",
        "answer": "A framework that simplifies Java application development using auto-configuration and starter templates."
      },
      {
        "question": "What is JWT?",
        "answer": "JSON Web Token, a secure standard for exchanging information between clients and servers as a JSON object."
      },
      {
        "question": "How does Spring Data JPA simplify database operations?",
        "answer": "By generating common database queries automatically from method names in repository interfaces."
      },
      {
        "question": "What is @Autowired?",
        "answer": "An annotation used to automatically inject dependencies into Spring-managed beans."
      }
    ],
    "domain": "java",
    "domainLabel": "Java Full Stack",
    "skeletonLanguage": "java",
    "difficultyClass": "difficulty-intermediate",
    "showArch": false
  },
  {
    "id": "emp-directory",
    "title": "Employee Directory Dashboard",
    "difficulty": "Intermediate",
    "complexityStars": 3,
    "techStack": [
      "Angular 21",
      "Spring Boot",
      "MySQL",
      "REST APIs"
    ],
    "icon": "fa-solid fa-users",
    "shortDesc": "A Full Stack application featuring paginated lists, employee search filters, and profile photo uploads.",
    "duration": "2 Weeks",
    "prerequisites": [
      "Connecting frontend to backend",
      "MySQL setup"
    ],
    "learningOutcomes": [
      "Connect Angular to Spring Boot APIs",
      "CORS policy configurations",
      "Handle multi-part file uploads",
      "Write JPA repository queries"
    ],
    "features": [
      "Dynamic data tables featuring custom pagination UI.",
      "Profile picture file uploads.",
      "Real-time queries matching by Department or Role.",
      "Export capabilities saving directory tables to Excel."
    ],
    "additionalFeatures": [
      "Org chart component views",
      "Dynamic pdf employee cards",
      "Teams channel triggers"
    ],
    "architecture": "Angular views -> REST APIs -> Spring JPA -> MySQL Database.",
    "synopsis": "Interactive fullstack practice. Connects an Angular UI to a Java API, handles image uploads, and configures database transactions.",
    "directoryStructure": "employee-portal/\n├── frontend/ (Angular UI)\n└── backend/ (Spring Boot Java)\n    ├── src/main/java/com/emp/\n    └── pom.xml",
    "apiEndpoints": [
      {
        "method": "GET",
        "path": "/api/employees",
        "desc": "Fetches all employee records."
      },
      {
        "method": "POST",
        "path": "/api/employees/upload",
        "desc": "Handles avatar image uploads."
      }
    ],
    "databaseOutline": "Tables:\n- Employees (id, name, email, department, avatar_url)",
    "implementationSteps": [
      "Phase 1: Set up MySQL database schemas.",
      "Phase 2: Code Spring Boot controllers with CORS policies enabled.",
      "Phase 3: Write Angular services to query the backend endpoints.",
      "Phase 4: Design responsive layout views with paginated tables."
    ],
    "skeletonCode": "@CrossOrigin\n@RestController\n@RequestMapping(\"/api/employees\")\npublic class EmployeeController {\n  @GetMapping public Page<Employee> list(Pageable page) { return service.find(page); }\n}",
    "vivaQuestions": [
      {
        "question": "What is CORS?",
        "answer": "Cross-Origin Resource Sharing, a browser mechanism restricting resources requests from outside origins."
      },
      {
        "question": "How do you enable CORS in Spring Boot?",
        "answer": "By adding the @CrossOrigin annotation to controllers or defining global web configs."
      },
      {
        "question": "Explain Pageable interface.",
        "answer": "A Spring interface used to query small subsets of rows at a time, preventing memory exhaustion."
      },
      {
        "question": "How to handle file uploads in Spring Boot?",
        "answer": "By injecting MultipartFile parameters inside POST request endpoints."
      }
    ],
    "domain": "java",
    "domainLabel": "Java Full Stack",
    "skeletonLanguage": "java",
    "difficultyClass": "difficulty-intermediate",
    "showArch": false
  },
  {
    "id": "task-manager-api",
    "title": "Task Manager REST Services",
    "difficulty": "Intermediate",
    "complexityStars": 3,
    "techStack": [
      "Spring Boot",
      "Spring JPA",
      "PostgreSQL"
    ],
    "icon": "fa-solid fa-tasks",
    "shortDesc": "Web services managing task priorities, category folders, deadlines, and notifications.",
    "duration": "2 Weeks",
    "prerequisites": [
      "JPA relational mappings",
      "PostgreSQL database setup"
    ],
    "learningOutcomes": [
      "Implement One-to-Many entity relations",
      "Validate request payloads",
      "Handle entity not found errors"
    ],
    "features": [
      "Endpoints managing category folders and tasks.",
      "Task filtering based on priority and status.",
      "Validations checking task deadlines.",
      "Global exception handler returning clean JSON error responses."
    ],
    "additionalFeatures": [
      "Automatic deadline email triggers",
      "Task histories logs views",
      "Excel report export downloads"
    ],
    "architecture": "REST Controllers -> Task Service -> PostgreSQL database.",
    "synopsis": "Build database relationships. Manage category folders and tasks relation, validate user inputs, and build clean error handling responses.",
    "directoryStructure": "task-api/\n├── src/main/java/com/tasks/\n│   ├── exception/GlobalExceptionHandler.java\n│   ├── model/TaskCategory.java\n│   └── repository/TaskRepository.java\n└── pom.xml",
    "apiEndpoints": [
      {
        "method": "GET",
        "path": "/api/categories",
        "desc": "Lists all active task categories."
      },
      {
        "method": "POST",
        "path": "/api/tasks",
        "desc": "Creates a task linked to a category ID."
      }
    ],
    "databaseOutline": "Tables:\n- Categories (id, title)\n- Tasks (id, category_id, title, status, due_date)",
    "implementationSteps": [
      "Phase 1: Build entities with One-to-Many mappings.",
      "Phase 2: Add validation constraints (e.g. @NotNull).",
      "Phase 3: Write custom repository queries.",
      "Phase 4: Run endpoint validation tests."
    ],
    "skeletonCode": "@Entity\npublic class TaskCategory {\n  @Id @GeneratedValue private Long id;\n  @OneToMany(mappedBy=\"category\") private List<Task> tasks;\n}",
    "vivaQuestions": [
      {
        "question": "Explain @OneToMany relationship.",
        "answer": "A database mapping indicating that one parent entity row can relate to multiple child entity rows."
      },
      {
        "question": "What is the role of @ExceptionHandler?",
        "answer": "It intercept specific exceptions thrown by controllers, returning structured responses."
      },
      {
        "question": "Why validate inputs using @Valid?",
        "answer": "To catch invalid input parameters before they hit service classes or database layers."
      },
      {
        "question": "What is mappedBy attribute used for?",
        "answer": "It defines the owning side of a bidirectional relationship inside entity mappings."
      }
    ],
    "domain": "java",
    "domainLabel": "Java Full Stack",
    "skeletonLanguage": "java",
    "difficultyClass": "difficulty-intermediate",
    "showArch": false
  },
  {
    "id": "library-service",
    "title": "Library Catalog Service",
    "difficulty": "Intermediate",
    "complexityStars": 3,
    "techStack": [
      "Spring Boot",
      "Spring Data",
      "H2 In-Memory"
    ],
    "icon": "fa-solid fa-book",
    "shortDesc": "In-memory library database managing books inventory, checkout reservations, and return logs.",
    "duration": "2 Weeks",
    "prerequisites": [
      "H2 database configurations",
      "Basic SQL queries"
    ],
    "learningOutcomes": [
      "Manage entity lifecycles",
      "Query data using JPA methods",
      "Write transaction-safe logic"
    ],
    "features": [
      "Add, list, and edit book details in catalog.",
      "Borrow book endpoint reducing available stock.",
      "H2 web console access enabled.",
      "Dynamic book search matching by title or author."
    ],
    "additionalFeatures": [
      "User booking waitlist lines",
      "Automatic late return fine calculators",
      "Audit log registries"
    ],
    "architecture": "Web endpoints -> Library Service -> H2 Memory database.",
    "synopsis": "Build in-memory databases. Teaches relational updates, transactional changes, and dynamic search queries.",
    "directoryStructure": "library-service/\n├── src/main/resources/application.properties\n├── src/main/java/com/library/\n│   ├── controller/BookController.java\n│   └── repository/BookRepository.java\n└── pom.xml",
    "apiEndpoints": [
      {
        "method": "GET",
        "path": "/api/books/search",
        "desc": "Finds books by title or author query."
      },
      {
        "method": "POST",
        "path": "/api/books/borrow",
        "desc": "Borrows a book, reducing stock count."
      }
    ],
    "databaseOutline": "Tables:\n- Books (id, title, author, copies_available)",
    "implementationSteps": [
      "Phase 1: Configure H2 database and schema updates.",
      "Phase 2: Code Book entity and repositories.",
      "Phase 3: Write service logic to update book stocks safely.",
      "Phase 4: Run tests using the H2 web console."
    ],
    "skeletonCode": "public interface BookRepository extends JpaRepository<Book, Long> {\n  List<Book> findByTitleContainingOrAuthorContaining(String t, String a);\n}",
    "vivaQuestions": [
      {
        "question": "What is H2 Database?",
        "answer": "A lightweight, in-memory Java relational database frequently used for development and unit testing."
      },
      {
        "question": "What is JpaRepository?",
        "answer": "A Spring interface providing complete CRUD and paging methods out of the box."
      },
      {
        "question": "Explain the difference between save and saveAndFlush.",
        "answer": "Save queues changes to write on transaction commit. SaveAndFlush writes changes to the database immediately."
      },
      {
        "question": "How does H2 persist data?",
        "answer": "By default, it is in-memory and resets when the app stops, but can be configured to write to local files."
      }
    ],
    "domain": "java",
    "domainLabel": "Java Full Stack",
    "skeletonLanguage": "java",
    "difficultyClass": "difficulty-intermediate",
    "showArch": false
  },
  {
    "id": "quiz-api",
    "title": "Quiz Assessment API",
    "difficulty": "Intermediate",
    "complexityStars": 3,
    "techStack": [
      "Spring Boot",
      "Spring JPA",
      "Lombok"
    ],
    "icon": "fa-solid fa-circle-question",
    "shortDesc": "Engine hosting quizzes, validating user answers, and returning score reports.",
    "duration": "2 Weeks",
    "prerequisites": [
      "Lombok annotations usage",
      "HTTP POST parameters mapping"
    ],
    "learningOutcomes": [
      "Utilize Lombok to clean up code",
      "Validate complex JSON structures",
      "Compute percentage scores"
    ],
    "features": [
      "CRUD endpoints for questions and options.",
      "Submit quiz endpoint comparing user answers to keys.",
      "Detailed scorecard report generation.",
      "Randomizes quiz questions dynamically."
    ],
    "additionalFeatures": [
      "Quiz timer limits checkers",
      "Category-wise performance breakdowns",
      "Certificate generators integration"
    ],
    "architecture": "Web controllers -> Quiz Service -> PostgreSQL database.",
    "synopsis": "Build dynamic questionnaires. Learn to use Lombok to reduce boilerplate code, validate complex JSON objects, and calculate results.",
    "directoryStructure": "quiz-api/\n├── src/main/java/com/quiz/\n│   ├── model/Question.java\n│   ├── dto/SubmissionDTO.java\n│   └── App.java\n└── pom.xml",
    "apiEndpoints": [
      {
        "method": "GET",
        "path": "/api/quizzes/{id}/start",
        "desc": "Fetches quiz questions (without answers)."
      },
      {
        "method": "POST",
        "path": "/api/quizzes/{id}/submit",
        "desc": "Validates answers and returns a scorecard."
      }
    ],
    "databaseOutline": "Tables:\n- Questions (id, question_text, correct_option)\n- Options (id, question_id, option_text)",
    "implementationSteps": [
      "Phase 1: Create Question models using Lombok annotations.",
      "Phase 2: Code Submission Data Transfer Objects (DTO).",
      "Phase 3: Write answer comparisons logic.",
      "Phase 4: Test scorecard output formatting."
    ],
    "skeletonCode": "@Data\n@Entity\npublic class Question {\n  @Id @GeneratedValue private Long id;\n  private String text;\n  private String correctOption;\n}",
    "vivaQuestions": [
      {
        "question": "What is Lombok?",
        "answer": "A Java library that plugs into your editor and build tools to automatically generate getters, setters, and constructors."
      },
      {
        "question": "What is a DTO?",
        "answer": "A Data Transfer Object, used to bundle and transfer data between application layers."
      },
      {
        "question": "Explain @Data annotation.",
        "answer": "A shortcut annotation that bundles @ToString, @EqualsAndHashCode, @Getter, @Setter, and @RequiredArgsConstructor."
      },
      {
        "question": "How to hide correct answers from quiz clients?",
        "answer": "By using custom DTOs that exclude correct answer fields when returning questions."
      }
    ],
    "domain": "java",
    "domainLabel": "Java Full Stack",
    "skeletonLanguage": "java",
    "difficultyClass": "difficulty-intermediate",
    "showArch": false
  },
  {
    "id": "ats-scanner",
    "title": "Real-time ATS Resume Scanner",
    "difficulty": "Advanced",
    "complexityStars": 4,
    "techStack": [
      "Spring Boot",
      "Angular 21",
      "Apache PDFBox",
      "TF-IDF Similarity",
      "MySQL"
    ],
    "icon": "fa-solid fa-magnifying-glass-chart",
    "shortDesc": "AI-driven application that parses resume PDFs, scores keyword matches, and suggests resume updates.",
    "duration": "4 Weeks",
    "prerequisites": [
      "Java file streams",
      "PDF parsing libraries",
      "Text indexing and matching algorithms"
    ],
    "learningOutcomes": [
      "Extract text from PDF streams",
      "Implement cosine similarity comparisons",
      "Build dynamic dashboards showing keyword density",
      "Manage database records for parsed resumes"
    ],
    "features": [
      "PDF parser extracting text content using Apache PDFBox.",
      "TF-IDF matching algorithm comparing resumes with job descriptions.",
      "Visual keyword density analysis.",
      "Custom tips generator highlighting missing technical terms."
    ],
    "additionalFeatures": [
      "Automated email address scraper",
      "Comparative resume dashboards",
      "One-click resume optimizer suggestions"
    ],
    "architecture": "Angular PDF upload -> Java REST Endpoint -> PDFBox Text Extractor -> TF-IDF calculator -> MySQL.",
    "synopsis": "Advanced college capstone project. Practice text extraction, process unstructured data, run statistical similarity math, and render dashboards.",
    "directoryStructure": "ats-scanner/\n├── frontend/ (Angular Standalone component)\n└── backend/ (Spring Boot Java)\n    ├── src/main/java/com/ats/\n    │   ├── service/PdfParserService.java\n    │   └── service/SimilarityService.java\n    └── pom.xml",
    "apiEndpoints": [
      {
        "method": "POST",
        "path": "/api/ats/parse",
        "desc": "Extracts raw text from uploaded PDF files."
      },
      {
        "method": "POST",
        "path": "/api/ats/compare",
        "desc": "Calculates similarity score against a job description."
      }
    ],
    "databaseOutline": "Tables:\n- Resumes (id, file_name, text_content, upload_date)\n- Analyses (id, resume_id, score, suggestions)",
    "implementationSteps": [
      "Phase 1: Build file upload endpoints with Apache PDFBox parser.",
      "Phase 2: Code the TF-IDF vectorizer and cosine calculation.",
      "Phase 3: Write database logging and history services.",
      "Phase 4: Design the Angular dashboard."
    ],
    "skeletonCode": "import org.apache.pdfbox.pdmodel.PDDocument;\nimport org.apache.pdfbox.text.PDFTextStripper;\npublic class PdfParserService {\n  public String extract(InputStream is) throws Exception {\n    try (PDDocument doc = PDDocument.load(is)) {\n      return new PDFTextStripper().getText(doc);\n    }\n  }\n}",
    "vivaQuestions": [
      {
        "question": "What is Apache PDFBox?",
        "answer": "An open-source Java library used to parse, generate, and edit PDF files."
      },
      {
        "question": "Explain the TF-IDF algorithm.",
        "answer": "Term Frequency-Inverse Document Frequency, which calculates the importance of words in a document relative to a collection of documents."
      },
      {
        "question": "How does Cosine Similarity compare documents?",
        "answer": "It measures the cosine of the angle between two word-frequency vectors, returning a similarity score between 0 and 1."
      },
      {
        "question": "How to prevent file stream memory leaks?",
        "answer": "By using try-with-resources statements to automatically close streams when operations complete."
      }
    ],
    "domain": "java",
    "domainLabel": "Java Full Stack",
    "skeletonLanguage": "java",
    "difficultyClass": "difficulty-advanced",
    "showArch": false
  },
  {
    "id": "grading-recruitment",
    "title": "Smart Recruitment & Grading System",
    "difficulty": "Advanced",
    "complexityStars": 4,
    "techStack": [
      "Spring Boot",
      "Angular 21",
      "MySQL",
      "PDF Generation",
      "Chart.js"
    ],
    "icon": "fa-solid fa-award",
    "shortDesc": "A platform that handles candidate registrations, automated coding assessments, and dynamic scorecard generation.",
    "duration": "4 Weeks",
    "prerequisites": [
      "Spring Boot Security configs",
      "PDF generation library (iText)"
    ],
    "learningOutcomes": [
      "Auto-grading submissions engine",
      "Programmatic PDF generation",
      "Interactive analytics dashboard views",
      "Secure API keys filters"
    ],
    "features": [
      "Automated scoring of coding assessments.",
      "Analytics panels tracking candidate pass rates.",
      "Automated PDF certificate delivery using iText.",
      "Secure dashboard view for HR coordinators."
    ],
    "additionalFeatures": [
      "Tab-switch cheat proctoring tracker",
      "Code playback replay",
      "One-click LinkedIn certificate shares"
    ],
    "architecture": "UI Console -> Rest Controller Server -> Automated Assessment Service -> PDF Engine -> Database.",
    "synopsis": "Enterprise system development. Master candidate authentication, automated assessment grading, dynamic PDF generation, and recruiter dashboards.",
    "directoryStructure": "recruitment-sys/\n├── src/main/java/com/recruit/\n│   ├── controller/AssessmentController.java\n│   ├── service/PdfGeneratorService.java\n│   └── repository/ResultRepository.java\n└── pom.xml",
    "apiEndpoints": [
      {
        "method": "POST",
        "path": "/api/assessment/grade",
        "desc": "Grades candidate code submissions against test cases."
      },
      {
        "method": "GET",
        "path": "/api/certificates/{id}/download",
        "desc": "Generates and downloads certificate PDFs."
      }
    ],
    "databaseOutline": "Tables:\n- Candidates (id, name, email)\n- Submissions (id, candidate_id, score, code_content, passed)\n- Certificates (id, hash, issue_date)",
    "implementationSteps": [
      "Phase 1: Code candidate models and schemas.",
      "Phase 2: Write logic to run submissions against test cases.",
      "Phase 3: Integrate iText PDF writer for certificate generation.",
      "Phase 4: Design the HR analytics dashboard."
    ],
    "skeletonCode": "import com.itextpdf.text.*;\nimport com.itextpdf.text.pdf.*;\npublic class CertGenerator {\n  public void build(String name, OutputStream os) throws Exception {\n    Document doc = new Document(PageSize.A4.rotate());\n    PdfWriter.getInstance(doc, os); doc.open();\n    doc.add(new Paragraph(\"Completion Certificate: \" + name)); doc.close();\n  }\n}",
    "vivaQuestions": [
      {
        "question": "How do you programmatically write PDFs in Java?",
        "answer": "By using libraries like iText or OpenPDF, opening a Document context, and adding paragraph, table, or image elements."
      },
      {
        "question": "What is database normalization?",
        "answer": "The process of organizing data tables to reduce redundancy and protect against insertion/deletion anomalies."
      },
      {
        "question": "How does automated code grading work?",
        "answer": "By running the submitted code against predefined test cases (inputs) and comparing the outputs."
      },
      {
        "question": "Explain proctoring session tracking.",
        "answer": "Using browser visibility APIs to detect when a candidate switches tabs during a test and logging alerts to the database."
      }
    ],
    "domain": "java",
    "domainLabel": "Java Full Stack",
    "skeletonLanguage": "java",
    "difficultyClass": "difficulty-advanced",
    "showArch": false
  },
  {
    "id": "dist-ecommerce",
    "title": "Distributed Microservices E-Commerce",
    "difficulty": "Advanced",
    "complexityStars": 5,
    "techStack": [
      "Spring Cloud",
      "Netflix Eureka",
      "RabbitMQ",
      "Redis Cache",
      "Docker"
    ],
    "icon": "fa-solid fa-network-wired",
    "shortDesc": "E-commerce platform designed using a distributed microservices architecture, Eureka discovery, API gateways, and Redis.",
    "duration": "4 Weeks",
    "prerequisites": [
      "Spring Boot config setups",
      "Docker container mechanics",
      "Message brokers configurations"
    ],
    "learningOutcomes": [
      "Netflix Eureka discovery registries",
      "Spring Cloud Gateway routes configs",
      "RabbitMQ message listeners",
      "Redis query caches"
    ],
    "features": [
      "Centralized service registration using Netflix Eureka.",
      "Configurable routing via Spring Cloud API Gateway.",
      "Asynchronous notifications routed through RabbitMQ.",
      "Redis caching layers accelerating database retrievals."
    ],
    "additionalFeatures": [
      "Resilience4j circuit breakers",
      "Zipkin tracing pipelines",
      "Spring Config Server central config"
    ],
    "architecture": "Angular Client -> API Gateway -> Service Registry (Eureka) -> Products Service / Order Service -> Database Clusters.",
    "synopsis": "Deploy enterprise-level architectures. Master Netflix Eureka registry servers, Spring Cloud Routing, RabbitMQ queues, Redis caching, and Docker deployments.",
    "directoryStructure": "microservices-shop/\n├── gateway-service/\n├── registry-service/\n├── inventory-service/\n├── order-service/\n└── docker-compose.yml",
    "apiEndpoints": [
      {
        "method": "GET",
        "path": "/gateway/products",
        "desc": "Routes request to the inventory service."
      },
      {
        "method": "POST",
        "path": "/gateway/orders",
        "desc": "Routes request to the order service, publishing a checkout event."
      }
    ],
    "databaseOutline": "Databases:\n- Inventory Database (MySQL)\n- Orders Database (PostgreSQL)\n- Redis Cache cluster",
    "implementationSteps": [
      "Phase 1: Code the Eureka service registry and start Eureka server.",
      "Phase 2: Setup Spring Cloud API Gateway routes.",
      "Phase 3: Integrate RabbitMQ to exchange async checkout events.",
      "Phase 4: Run caching tests using Redis."
    ],
    "skeletonCode": "@SpringBootApplication\n@EnableDiscoveryClient\npublic class GatewayApplication {\n  public static void main(String[] args) {\n    SpringApplication.run(GatewayApplication.class, args);\n  }\n}",
    "vivaQuestions": [
      {
        "question": "What is Netflix Eureka?",
        "answer": "A service registry that tracks the network locations of dynamically scaled microservice instances."
      },
      {
        "question": "What is an API Gateway?",
        "answer": "A single entry point for all client requests, handling routing, rate limiting, and security policies."
      },
      {
        "question": "What is a Circuit Breaker?",
        "answer": "A design pattern that prevents cascading failures by returning a fallback response when a microservice fails."
      },
      {
        "question": "How does RabbitMQ enable asynchronous communication?",
        "answer": "By queuing messages from producer services and delivering them to consumer services asynchronously without blocking."
      }
    ],
    "domain": "java",
    "domainLabel": "Java Full Stack",
    "skeletonLanguage": "java",
    "difficultyClass": "difficulty-advanced",
    "showArch": false
  },
  {
    "id": "log-aggregator",
    "title": "Centralized Log Aggregator",
    "difficulty": "Advanced",
    "complexityStars": 5,
    "techStack": [
      "Spring Boot",
      "ELK Stack",
      "Logback",
      "ActiveMQ"
    ],
    "icon": "fa-solid fa-server",
    "shortDesc": "System aggregation logs from multiple microservices into a central elasticsearch dashboard.",
    "duration": "4 Weeks",
    "prerequisites": [
      "ELK stack local installation",
      "Logback configurations"
    ],
    "learningOutcomes": [
      "Configure elasticsearch indices",
      "Write log shippers filters",
      "Set up ActiveMQ buffers"
    ],
    "features": [
      "Asynchronous log shipment to message brokers.",
      "Logstash parsers transforming text lines to JSON.",
      "Elasticsearch database indexes.",
      "Kibana visual analytical metrics."
    ],
    "additionalFeatures": [
      "System failure SMS alerts",
      "Log data compression utilities",
      "Audit tracker user events log"
    ],
    "architecture": "Microservices -> Logback Appender -> ActiveMQ Queue -> Logstash -> Elasticsearch -> Kibana.",
    "synopsis": "Build telemetry networks. Manage ActiveMQ log buffers, configure Elasticsearch indices, parse metrics using Logstash, and build Kibana views.",
    "directoryStructure": "log-aggregator/\n├── logstash-config/logstash.conf\n├── microservice-a/src/main/resources/logback-spring.xml\n└── docker-compose.yml",
    "apiEndpoints": [
      {
        "method": "POST",
        "path": "/api/logs/search",
        "desc": "Queries Elasticsearch index records."
      }
    ],
    "databaseOutline": "Databases:\n- Elasticsearch Log Indices (Daily partitions)",
    "implementationSteps": [
      "Phase 1: Spin up ELK stack using Docker Compose.",
      "Phase 2: Configure Logback appenders in Spring Boot.",
      "Phase 3: Set up Logstash to consume ActiveMQ log topics.",
      "Phase 4: Build dashboards in Kibana."
    ],
    "skeletonCode": "<!-- logback-spring.xml -->\n<configuration>\n  <appender name=\"AMQ\" class=\"org.apache.activemq.logback.ActiveMQAppender\">\n    <remoteUri>tcp://localhost:61616</remoteUri>\n    <queue>system-logs</queue>\n  </appender>\n</configuration>",
    "vivaQuestions": [
      {
        "question": "What is the ELK Stack?",
        "answer": "Elasticsearch (database), Logstash (log aggregator), and Kibana (visualization interface)."
      },
      {
        "question": "Why ship logs asynchronously using a message broker?",
        "answer": "To prevent logging operations from slowing down or blocking the main application threads."
      },
      {
        "question": "What is Logstash?",
        "answer": "A tool that ingests, parses, and filters log data before sending it to Elasticsearch."
      },
      {
        "question": "What are Elasticsearch indices?",
        "answer": "Logical namespaces that group related documents, optimized for fast full-text searches."
      }
    ],
    "domain": "java",
    "domainLabel": "Java Full Stack",
    "skeletonLanguage": "java",
    "difficultyClass": "difficulty-advanced",
    "showArch": false
  },
  {
    "id": "expense-tracker-py",
    "title": "Personal Expense Tracker",
    "difficulty": "Basic",
    "complexityStars": 1,
    "techStack": [
      "Python 3",
      "CSV Module",
      "JSON Configs",
      "OS API"
    ],
    "icon": "fa-solid fa-wallet",
    "shortDesc": "Command-line tool to track earnings and expenses with budget limits, writing directly to CSV logs.",
    "duration": "1 Week",
    "prerequisites": [
      "Python interpreter installed",
      "Loops and terminal inputs"
    ],
    "learningOutcomes": [
      "Python File I/O operations",
      "CSV parsing & logs updating",
      "Handling value conversions error checks",
      "Dictionary lists data matching"
    ],
    "features": [
      "Interactive add expense and earnings terminal script.",
      "Budget limit threshold alerts (visual console warnings).",
      "Categorized monthly summarization calculations.",
      "Automatic data migration to CSV datasets."
    ],
    "additionalFeatures": [
      "ASCII bar chart generator",
      "Weekly budget rollover tools",
      "Currency exchange calculators"
    ],
    "architecture": "Terminal CLI input -> Python program logic -> Local CSV database.",
    "synopsis": "Python automation script practice. Teaches CSV logging, console calculations, and handling exceptions.",
    "directoryStructure": "expense_tracker/\n├── data/expenses.csv\n├── config.json\n└── tracker.py",
    "implementationSteps": [
      "Phase 1: Create expenses file with header rows.",
      "Phase 2: Code CLI option selectors.",
      "Phase 3: Write calculations totaling categories.",
      "Phase 4: Run error validations on input amounts."
    ],
    "skeletonCode": "import csv\nwith open(\"expenses.csv\", \"a\", newline=\"\") as f:\n  writer = csv.writer(f)\n  writer.writerow([\"Date\", \"Amount\", \"Category\"])",
    "vivaQuestions": [
      {
        "question": "What is csv.writer in Python?",
        "answer": "A class that converts data tuples into formatted comma-separated rows in a file."
      },
      {
        "question": "How do you check if a file exists in Python?",
        "answer": "Using the os.path.exists(path) function."
      },
      {
        "question": "Explain try-except syntax.",
        "answer": "A block used to catch exceptions, preventing the application from crashing on errors."
      },
      {
        "question": "What is dictionary object?",
        "answer": "An unordered, mutable collection of key-value mapping pairs in Python."
      }
    ],
    "domain": "python",
    "domainLabel": "Python Scripting",
    "skeletonLanguage": "python",
    "difficultyClass": "difficulty-basic",
    "showArch": false
  },
  {
    "id": "word-counter",
    "title": "Word Counter CLI",
    "difficulty": "Basic",
    "complexityStars": 1,
    "techStack": [
      "Python 3",
      "String Parser",
      "File I/O"
    ],
    "icon": "fa-solid fa-font",
    "shortDesc": "Script analyzing text files, counting characters, words, sentences, and listing word frequencies.",
    "duration": "1 Week",
    "prerequisites": [
      "Python basic string operations",
      "Local file read scripts"
    ],
    "learningOutcomes": [
      "Read raw text documents",
      "Parse strings using regex patterns",
      "Track counts using collections.Counter"
    ],
    "features": [
      "Accepts file path parameters.",
      "Outputs character, word, and sentence counts.",
      "Displays the top 10 most common words, excluding common stop words.",
      "Outputs analysis reports to text files."
    ],
    "additionalFeatures": [
      "Calculates readability score index",
      "Identifies spelling errors",
      "Exports reports to JSON"
    ],
    "architecture": "Input File -> Text Read Engine -> String Clean filters -> Words Frequency Counter -> Console Summary.",
    "synopsis": "Build text processing tools. Master file reading, string split operations, dictionary counting, and text reports formatting.",
    "directoryStructure": "word-counter/\n├── input.txt\n├── counter.py\n└── README.md",
    "implementationSteps": [
      "Phase 1: Build input reading functions.",
      "Phase 2: Clean punctuation marks and split text into words.",
      "Phase 3: Run frequency counts using Counter.",
      "Phase 4: Format output summaries."
    ],
    "skeletonCode": "from collections import Counter\ndef count_words(filepath):\n  with open(filepath, \"r\") as f:\n    words = f.read().lower().split()\n    return Counter(words).most_common(10)",
    "vivaQuestions": [
      {
        "question": "What is collections.Counter?",
        "answer": "A dictionary subclass that simplifies counting hashable items."
      },
      {
        "question": "How to strip punctuation from strings in Python?",
        "answer": "By using the string.punctuation list alongside str.translate() or regex."
      },
      {
        "question": "Explain split() method.",
        "answer": "A string method that splits a string into a list of words based on whitespace delimiters."
      },
      {
        "question": "Explain difference between read() and readlines().",
        "answer": "Read() returns the entire file as a single string. Readlines() returns a list of lines."
      }
    ],
    "domain": "python",
    "domainLabel": "Python Scripting",
    "skeletonLanguage": "python",
    "difficultyClass": "difficulty-basic",
    "showArch": false
  },
  {
    "id": "number-guess",
    "title": "Number Guessing CLI",
    "difficulty": "Basic",
    "complexityStars": 1,
    "techStack": [
      "Python 3",
      "Random Module",
      "CLI Loops"
    ],
    "icon": "fa-solid fa-circle-question",
    "shortDesc": "CLI game generating numbers, verifying input guesses, and tracking user attempts.",
    "duration": "1 Week",
    "prerequisites": [
      "Python while loops",
      "Conditional branch operations"
    ],
    "learningOutcomes": [
      "Import and use standard random library",
      "Track score variables",
      "Implement game loops with exit codes"
    ],
    "features": [
      "Generates random numbers within ranges (e.g. 1 to 100).",
      "Hints users (Higher/Lower) for incorrect guesses.",
      "Limits the maximum number of attempts.",
      "Displays scoreboard summaries."
    ],
    "additionalFeatures": [
      "Difficulty level selectors",
      "Play again loop logic",
      "Best score persistence"
    ],
    "architecture": "Random Engine -> User Terminal Input -> Guess Comparator -> Score Updater -> Play Loop.",
    "synopsis": "A beginner-friendly game project. Learn to create loops, run conditional checks, and collect user inputs.",
    "directoryStructure": "number-guessing/\n└── guess.py",
    "implementationSteps": [
      "Phase 1: Initialize random numbers using the random library.",
      "Phase 2: Build the game loop structure.",
      "Phase 3: Add input validations.",
      "Phase 4: Log user scores."
    ],
    "skeletonCode": "import random\ndef play():\n  target = random.randint(1, 100)\n  while True:\n    guess = int(input(\"Guess: \"))\n    if guess == target: print(\"Win!\"); break\n    elif guess < target: print(\"Higher\")\n    else: print(\"Lower\")",
    "vivaQuestions": [
      {
        "question": "What is random.randint?",
        "answer": "A function that returns a random integer within a specified range, inclusive."
      },
      {
        "question": "How do you exit an infinite while loop in Python?",
        "answer": "By using the break statement."
      },
      {
        "question": "What is the purpose of casting input() to int()?",
        "answer": "Input() returns values as strings; casting converts them to integers for comparisons."
      },
      {
        "question": "Explain global variables vs local variables.",
        "answer": "Global variables are defined outside functions and are accessible globally. Local variables are defined inside functions and exist only during function execution."
      }
    ],
    "domain": "python",
    "domainLabel": "Python Scripting",
    "skeletonLanguage": "python",
    "difficultyClass": "difficulty-basic",
    "showArch": false
  },
  {
    "id": "file-backup",
    "title": "Simple File Backup Script",
    "difficulty": "Basic",
    "complexityStars": 1,
    "techStack": [
      "Python 3",
      "Shutil Library",
      "Time Logs"
    ],
    "icon": "fa-solid fa-floppy-disk",
    "shortDesc": "Script copying target directories to backup folders with timestamp filenames.",
    "duration": "1 Week",
    "prerequisites": [
      "Basic OS files paths operations",
      "Imports handling"
    ],
    "learningOutcomes": [
      "Manage files and folders using shutil",
      "Format timestamps using datetime",
      "Write text log reports"
    ],
    "features": [
      "One-click folder backups.",
      "Generates backup files named with current timestamps.",
      "Writes operation logs to audit files.",
      "Auto-clears backups older than 7 days."
    ],
    "additionalFeatures": [
      "Compresses backup directories to ZIP archives",
      "Integrate schedule triggers",
      "Email reports triggers"
    ],
    "architecture": "Target Path config -> Shutil Directory Archiver -> Datetime Formatter -> File System Saver.",
    "synopsis": "Automate directory backups. Master directory tree traversals, file copying using shutil, and creating automated system tasks.",
    "directoryStructure": "backup-service/\n├── logs/backup_log.txt\n├── backup_runner.py\n└── config.json",
    "implementationSteps": [
      "Phase 1: Write directory path verification functions.",
      "Phase 2: Code backup compression using shutil.make_archive.",
      "Phase 3: Write timestamped log reports.",
      "Phase 4: Implement old backup cleanup logic."
    ],
    "skeletonCode": "import shutil\nfrom datetime import datetime\ndef backup(src, dest):\n  time_str = datetime.now().strftime(\"%Y%m%d_%H%M%S\")\n  archive_path = f\"{dest}/backup_{time_str}\"\n  shutil.make_archive(archive_path, 'zip', src)\n  print(f\"Backup saved to {archive_path}.zip\")",
    "vivaQuestions": [
      {
        "question": "What does shutil.make_archive do?",
        "answer": "A function that compresses folders into archives (like zip or tar) at target destinations."
      },
      {
        "question": "How do you format dates in Python?",
        "answer": "By using the strftime() method with format codes (like %Y for year, %m for month)."
      },
      {
        "question": "What is import statement?",
        "answer": "A keyword used to import external code modules or libraries into a script."
      },
      {
        "question": "How do you delete directories recursively in Python?",
        "answer": "By using the shutil.rmtree() function."
      }
    ],
    "domain": "python",
    "domainLabel": "Python Scripting",
    "skeletonLanguage": "python",
    "difficultyClass": "difficulty-basic",
    "showArch": false
  },
  {
    "id": "secure-encryption",
    "title": "Secure File Encryption Tool",
    "difficulty": "Intermediate",
    "complexityStars": 3,
    "techStack": [
      "Python 3",
      "Cryptography (Fernet)",
      "Tkinter GUI",
      "Byte streams"
    ],
    "icon": "fa-solid fa-lock",
    "shortDesc": "Desktop application designed to securely encrypt and decrypt local files using AES-128/256 standard encryption keys.",
    "duration": "2 Weeks",
    "prerequisites": [
      "Python GUI libraries",
      "Binary file streams"
    ],
    "learningOutcomes": [
      "Symmetric encryption & key security",
      "Buffered file parsing preventing RAM crashes",
      "Tkinter desktop widgets usage",
      "Checksum validations"
    ],
    "features": [
      "Symmetric key generation and secure local key file storage.",
      "Binary file parser enabling document/image locking.",
      "Desktop UI dashboard featuring Tkinter widgets.",
      "Checksum verification verifying document integrity."
    ],
    "additionalFeatures": [
      "Password-derived keys using PBKDF2",
      "Multi-file batch locking utilities",
      "Key image steganography hide tool"
    ],
    "architecture": "GUI Dashboard -> Cryptography controller -> Binary I/O streams.",
    "synopsis": "File security tool. Learn to build desktop GUIs using Tkinter, generate keys, run AES symmetric operations, and handle binary files in blocks.",
    "directoryStructure": "file_encryptor/\n├── gui.py\n├── crypt_engine.py\n└── README.md",
    "implementationSteps": [
      "Phase 1: Code the core cryptography helper classes.",
      "Phase 2: Create file dialog file selectors.",
      "Phase 3: Write buffered file readers.",
      "Phase 4: Design error warning alerts."
    ],
    "skeletonCode": "from cryptography.fernet import Fernet\ndef encrypt(filename, key):\n  f = Fernet(key)\n  with open(filename, \"rb\") as file:\n    data = file.read()\n  with open(filename + \".locked\", \"wb\") as file:\n    file.write(f.encrypt(data))",
    "vivaQuestions": [
      {
        "question": "What is symmetric encryption?",
        "answer": "An encryption algorithm that uses the same key for both encryption and decryption."
      },
      {
        "question": "Explain Fernet class.",
        "answer": "A Python class that implements symmetric encryption using AES-128 in CBC mode with HMAC signatures."
      },
      {
        "question": "What is the role of key derivation?",
        "answer": "Converting a user password into a secure cryptographic key using functions like PBKDF2."
      },
      {
        "question": "Why process binary files using rb and wb modes?",
        "answer": "To read and write raw bytes exactly without character encoding conversions."
      }
    ],
    "domain": "python",
    "domainLabel": "Python Scripting",
    "skeletonLanguage": "python",
    "difficultyClass": "difficulty-intermediate",
    "showArch": false
  },
  {
    "id": "weather-cli",
    "title": "Weather CLI Alerts Agent",
    "difficulty": "Intermediate",
    "complexityStars": 3,
    "techStack": [
      "Python 3",
      "Requests API",
      "JSON Parser"
    ],
    "icon": "fa-solid fa-cloud-showers-water",
    "shortDesc": "Terminal program fetching live weather alerts, formatting reports, and sending notifications.",
    "duration": "2 Weeks",
    "prerequisites": [
      "HTTP requests protocols",
      "Third-party package installers (pip)"
    ],
    "learningOutcomes": [
      "Run network requests using requests",
      "Parse API JSON payloads",
      "Configure command line parameters using argparse"
    ],
    "features": [
      "Queries OpenWeatherMap APIs.",
      "Displays forecast reports in CLI tables.",
      "Triggers notifications on harsh conditions (e.g. storms).",
      "Caches reports locally to reduce API usage."
    ],
    "additionalFeatures": [
      "SMS alerts integration",
      "Visual wind map charts",
      "Configurable metric/imperial formats"
    ],
    "architecture": "Argparse CLI Parameters -> Requests Web Client -> JSON Parser -> Report Formatter.",
    "synopsis": "Develop terminal utilities. Learn to parse JSON APIs, process HTTP errors, use arguments parsers, and trigger notifications.",
    "directoryStructure": "weather_cli/\n├── config.json\n├── weather_agent.py\n└── requirements.txt",
    "implementationSteps": [
      "Phase 1: Configure OpenWeatherMap keys.",
      "Phase 2: Code network requests using requests.get.",
      "Phase 3: Write argparse parameter configurations.",
      "Phase 4: Formats terminal layouts."
    ],
    "skeletonCode": "import requests\ndef get_weather(city, key):\n  url = f\"http://api.openweathermap.org/data/2.5/weather?q={city}&appid={key}\"\n  return requests.get(url).json()",
    "vivaQuestions": [
      {
        "question": "What is requests library?",
        "answer": "A simple, third-party Python library used to send HTTP/1.1 requests."
      },
      {
        "question": "Explain argparse module?",
        "answer": "A standard Python module used to parse command line arguments."
      },
      {
        "question": "How do you check HTTP status codes in Python?",
        "answer": "By checking the status_code attribute of the response object."
      },
      {
        "question": "What is JSON format?",
        "answer": "JavaScript Object Notation, a lightweight data-interchange format."
      }
    ],
    "domain": "python",
    "domainLabel": "Python Scripting",
    "skeletonLanguage": "python",
    "difficultyClass": "difficulty-intermediate",
    "showArch": false
  },
  {
    "id": "web-scraper",
    "title": "Web Scraper & Excel Exporter",
    "difficulty": "Intermediate",
    "complexityStars": 3,
    "techStack": [
      "Python 3",
      "BeautifulSoup",
      "Pandas Engine"
    ],
    "icon": "fa-solid fa-spider",
    "shortDesc": "Parser script downloading target HTML pages, extracting tables, and exporting datasets to Excel.",
    "duration": "2 Weeks",
    "prerequisites": [
      "Basic HTML DOM structures",
      "Web requests basics"
    ],
    "learningOutcomes": [
      "Parse HTML trees using BeautifulSoup",
      "Navigate DOM trees",
      "Export datasets using Pandas"
    ],
    "features": [
      "Scrapes target HTML website tables.",
      "Cleans scraped dataset columns.",
      "Exports data tables to Excel/CSV.",
      "Respects rate limits using sleep delays."
    ],
    "additionalFeatures": [
      "Visual charts generator inside Excel sheets",
      "Recursive link scraping",
      "Image downloads downloader"
    ],
    "architecture": "Web Client -> HTML Response -> BeautifulSoup DOM Finder -> Pandas DataFrame -> Excel Workbook.",
    "synopsis": "Ingest web data. Learn to parse DOM elements, navigate page trees, clean datasets, and export spreadsheet files.",
    "directoryStructure": "web_scraper/\n├── data/output.xlsx\n├── scraper.py\n└── requirements.txt",
    "implementationSteps": [
      "Phase 1: Code HTML retrievals using requests.",
      "Phase 2: Parse DOM tables using BeautifulSoup find_all.",
      "Phase 3: Clean row data in Pandas DataFrames.",
      "Phase 4: Export to Excel using openpyxl."
    ],
    "skeletonCode": "from bs4 import BeautifulSoup\nimport requests\nimport pandas as pd\ndef scrape(url):\n  res = requests.get(url)\n  soup = BeautifulSoup(res.text, \"html.parser\")\n  # Parse tr/td tags and build pandas DataFrame...",
    "vivaQuestions": [
      {
        "question": "What is BeautifulSoup?",
        "answer": "A Python library used for parsing HTML and XML documents and navigating the DOM."
      },
      {
        "question": "Why use pandas for data exports?",
        "answer": "It simplifies data cleaning, handling tables, and exporting to CSV/Excel."
      },
      {
        "question": "What is DOM?",
        "answer": "The Document Object Model, which represents HTML pages as a structured tree of nodes."
      },
      {
        "question": "Why add sleep delays when scraping?",
        "answer": "To prevent overwhelming target servers and avoid getting your IP banned."
      }
    ],
    "domain": "python",
    "domainLabel": "Python Scripting",
    "skeletonLanguage": "python",
    "difficultyClass": "difficulty-intermediate",
    "showArch": false
  },
  {
    "id": "url-shortener",
    "title": "URL Shortener API",
    "difficulty": "Intermediate",
    "complexityStars": 3,
    "techStack": [
      "Flask",
      "SQLite",
      "Base62 Hash"
    ],
    "icon": "fa-solid fa-link",
    "shortDesc": "Flask web app mapping long URLs to short hashes, redirecting users dynamically.",
    "duration": "2 Weeks",
    "prerequisites": [
      "Flask routing",
      "Basic SQL queries"
    ],
    "learningOutcomes": [
      "Build routing engines in Flask",
      "Integrate SQLite databases",
      "Calculate Base62 hash strings"
    ],
    "features": [
      "Submits long URLs and outputs shortened hashes.",
      "Redirects short hashes to target long URLs.",
      "Tracks basic link click analytics.",
      "Ensures URL format validation."
    ],
    "additionalFeatures": [
      "Custom URL suffix overrides",
      "QRCode generation links",
      "Expiring links timer"
    ],
    "architecture": "Browser Endpoint -> Flask Redirect Controller -> SQLite lookup -> HTTP Redirect.",
    "synopsis": "Build Flask web backends. Master database setups, hashing algorithms, and HTTP redirects.",
    "directoryStructure": "url_shortener/\n├── instance/urls.db\n├── app.py\n└── requirements.txt",
    "apiEndpoints": [
      {
        "method": "POST",
        "path": "/api/shorten",
        "desc": "Accepts long URLs, returning shortened base62 hashes."
      },
      {
        "method": "GET",
        "path": "/{hash}",
        "desc": "Redirects short hashes to their target long URLs."
      }
    ],
    "databaseOutline": "Tables:\n- Urls (id, long_url, short_hash, clicks, created_at)",
    "implementationSteps": [
      "Phase 1: Build the Flask application outline.",
      "Phase 2: Code base62 hashing algorithms.",
      "Phase 3: Connect SQLite databases.",
      "Phase 4: Implement endpoint redirects."
    ],
    "skeletonCode": "from flask import Flask, redirect\napp = Flask(__name__)\n@app.route(\"/<short_hash>\")\ndef go(short_hash):\n  # Lookup long_url in database and redirect...\n  return redirect(long_url)",
    "vivaQuestions": [
      {
        "question": "What is Flask?",
        "answer": "A lightweight WSGI web application framework in Python."
      },
      {
        "question": "Explain base62 hashing.",
        "answer": "An encoding scheme that uses 62 alphanumeric characters (a-z, A-Z, 0-9) to compress database IDs into short strings."
      },
      {
        "question": "How does redirect() work in HTTP?",
        "answer": "It returns an HTTP 302 redirect status code, prompting the browser to load the target URL."
      },
      {
        "question": "Why use SQLite for lightweight apps?",
        "answer": "It is a self-contained, serverless database engine that requires no external setup."
      }
    ],
    "domain": "python",
    "domainLabel": "Python Scripting",
    "skeletonLanguage": "python",
    "difficultyClass": "difficulty-intermediate",
    "showArch": false
  },
  {
    "id": "pdf-metadata",
    "title": "PDF Metadata Extractor",
    "difficulty": "Intermediate",
    "complexityStars": 3,
    "techStack": [
      "Python 3",
      "PyPDF2 Module",
      "JSON Exporter"
    ],
    "icon": "fa-solid fa-file-pdf",
    "shortDesc": "Extract metadata (author, keywords, creator) from PDF files and export them to JSON reports.",
    "duration": "2 Weeks",
    "prerequisites": [
      "Binary file parsers",
      "JSON library"
    ],
    "learningOutcomes": [
      "Read binary PDF headers",
      "Extract PDF metadata dictionaries",
      "Export records to JSON files"
    ],
    "features": [
      "Reads target PDF files.",
      "Extracts creation date, author, creator, and keyword metadata.",
      "Recursively scans directories to build metadata databases.",
      "Exports analysis reports to JSON."
    ],
    "additionalFeatures": [
      "Finds text matches within PDFs",
      "Decrypts password-protected PDFs",
      "Scrapes image files from PDFs"
    ],
    "architecture": "Input PDF -> PyPDF2 Reader -> Metadata Parser -> JSON Exporter.",
    "synopsis": "Process PDF files. Learn to parse document properties, scan directory trees, and export structured JSON data.",
    "directoryStructure": "pdf_extractor/\n├── input_docs/\n├── extract.py\n└── requirements.txt",
    "implementationSteps": [
      "Phase 1: Configure PyPDF2 imports.",
      "Phase 2: Write metadata extraction functions.",
      "Phase 3: Code folder scanners.",
      "Phase 4: Save metadata to JSON files."
    ],
    "skeletonCode": "from PyPDF2 import PdfReader\ndef extract_meta(path):\n  reader = PdfReader(path)\n  meta = reader.metadata\n  return {k: v for k, v in meta.items()}",
    "vivaQuestions": [
      {
        "question": "What is PyPDF2?",
        "answer": "A pure-python PDF library used to split, merge, crop, and transform PDF files."
      },
      {
        "question": "Why is PDF metadata useful?",
        "answer": "It provides document details (like author or creation date) without requiring full text parsing."
      },
      {
        "question": "What is JSON?",
        "answer": "JavaScript Object Notation, a text-based format for storing and exchanging structured data."
      },
      {
        "question": "How do you recursively walk directories in Python?",
        "answer": "By using the os.walk() function."
      }
    ],
    "domain": "python",
    "domainLabel": "Python Scripting",
    "skeletonLanguage": "python",
    "difficultyClass": "difficulty-intermediate",
    "showArch": false
  },
  {
    "id": "compiler-sandbox",
    "title": "Online Code Sandbox Compiler",
    "difficulty": "Advanced",
    "complexityStars": 5,
    "techStack": [
      "Python",
      "Docker API",
      "Monaco Editor",
      "Django / Flask",
      "Shell Exec"
    ],
    "icon": "fa-solid fa-terminal",
    "shortDesc": "Web code execution environment running submissions in isolated Docker containers with resource limits.",
    "duration": "4 Weeks",
    "prerequisites": [
      "Systems engineering concepts",
      "Docker CLI operations",
      "Multi-processing loops"
    ],
    "learningOutcomes": [
      "Control Docker containers using Python SDK",
      "Secure host servers against malicious code executions",
      "Apply memory and CPU resource limits to containers",
      "Capture output streams (stdout, stderr) and display them in Monaco views"
    ],
    "features": [
      "Interactive Monaco Code Editor UI.",
      "Docker SDK integration running scripts in isolated sandboxes.",
      "Resource constraints restricting CPU, memory, and runtime duration.",
      "Real-time output stream tracking."
    ],
    "additionalFeatures": [
      "Multi-language support (Java, C++, Python, Node.js)",
      "Predefined code challenges templates",
      "Rate limiting request API"
    ],
    "architecture": "Monaco editor -> Flask REST endpoint -> Docker container sandbox -> stdout parser.",
    "synopsis": "Advanced systems project. Build secure sandboxes to compile user-submitted code inside Docker containers, limiting resource usage to prevent server lockups.",
    "directoryStructure": "sandbox-compiler/\n├── app/app.py\n├── runner/Dockerfile\n├── docker-compose.yml\n└── requirements.txt",
    "apiEndpoints": [
      {
        "method": "POST",
        "path": "/api/run",
        "desc": "Spins up a sandbox container to execute code, returning output streams."
      }
    ],
    "implementationSteps": [
      "Phase 1: Build Docker execution image.",
      "Phase 2: Code the container runtime engine in Python.",
      "Phase 3: Write Flask endpoints to handle code submissions.",
      "Phase 4: Design the frontend code editor interface."
    ],
    "skeletonCode": "import docker\ndef execute(code, lang):\n  client = docker.from_env()\n  # Run code in sandbox container...\n  container = client.containers.run(\"runner:latest\", command=f\"python -c '{code}'\", mem_limit=\"50m\", detach=False)",
    "vivaQuestions": [
      {
        "question": "Why must user code run in isolated Docker containers?",
        "answer": "To prevent malicious code from accessing host files, networks, or consuming all system resources."
      },
      {
        "question": "How do you handle infinite loops in sandbox execution?",
        "answer": "By setting a strict timeout limit (e.g. 5 seconds) on the container execution process."
      },
      {
        "question": "What is the Docker SDK for Python?",
        "answer": "A library that allows you to manage Docker containers and images programmatically using Python."
      },
      {
        "question": "How to disable container network access?",
        "answer": "By setting network_disabled=True in the container configuration parameters."
      }
    ],
    "domain": "python",
    "domainLabel": "Python Scripting",
    "skeletonLanguage": "python",
    "difficultyClass": "difficulty-advanced",
    "showArch": false
  },
  {
    "id": "sentiment-api",
    "title": "AI Sentiment Analysis API",
    "difficulty": "Advanced",
    "complexityStars": 4,
    "techStack": [
      "Python 3",
      "Flask",
      "NLTK",
      "Regex"
    ],
    "icon": "fa-solid fa-brain",
    "shortDesc": "REST API engine parsing sentence reviews, analyzing sentiment, and returning analytics.",
    "duration": "4 Weeks",
    "prerequisites": [
      "NLP concepts",
      "Text tokenization algorithms"
    ],
    "learningOutcomes": [
      "Clean text using tokenization and lemmatization",
      "Perform sentiment analysis using NLTK VADER",
      "Expose machine learning models as Flask REST APIs"
    ],
    "features": [
      "REST API checking text reviews.",
      "Classifies reviews as Positive, Negative, or Neutral.",
      "Outputs confidence scores (e.g. 95% Positive).",
      "Cleans text by removing stop-words and web links."
    ],
    "additionalFeatures": [
      "Batch review processing endpoints",
      "Visual wordcloud generator charts",
      "Multi-language translation pipelines"
    ],
    "architecture": "Web Request -> Tokenizer -> NLTK VADER Engine -> Score Classifier -> JSON Response.",
    "synopsis": "Machine Learning API project. Build natural language processors, run sentiment analysis, clean up input strings, and wrap models in Flask REST APIs.",
    "directoryStructure": "sentiment_api/\n├── model/vader_lexicon.txt\n├── app.py\n└── requirements.txt",
    "apiEndpoints": [
      {
        "method": "POST",
        "path": "/api/sentiment/analyze",
        "desc": "Analyzes input text and returns sentiment scores."
      }
    ],
    "implementationSteps": [
      "Phase 1: Download NLTK VADER datasets.",
      "Phase 2: Code text cleaning and preprocessing pipelines.",
      "Phase 3: Write Flask endpoints.",
      "Phase 4: Run API stress tests."
    ],
    "skeletonCode": "from nltk.sentiment.vader import SentimentIntensityAnalyzer\ndef get_sentiment(text):\n  sia = SentimentIntensityAnalyzer()\n  return sia.polarity_scores(text)",
    "vivaQuestions": [
      {
        "question": "What is NLTK?",
        "answer": "Natural Language Toolkit, a popular Python library for processing natural language text."
      },
      {
        "question": "How does the VADER algorithm work?",
        "answer": "It uses a lexicon of words mapped to sentiment intensity scores, combining them with grammatical rules to analyze text."
      },
      {
        "question": "What is text lemmatization?",
        "answer": "The process of grouping inflected words to their base form (lemma) for cleaner analysis."
      },
      {
        "question": "Why is text cleaning necessary in NLP?",
        "answer": "To remove noise (like HTML tags or punctuation) and improve analysis accuracy."
      }
    ],
    "domain": "python",
    "domainLabel": "Python Scripting",
    "skeletonLanguage": "python",
    "difficultyClass": "difficulty-advanced",
    "showArch": false
  },
  {
    "id": "invoice-parser",
    "title": "Invoice OCR Parser",
    "difficulty": "Advanced",
    "complexityStars": 5,
    "techStack": [
      "Python 3",
      "Tesseract OCR",
      "Regex",
      "OpenCV"
    ],
    "icon": "fa-solid fa-file-invoice-dollar",
    "shortDesc": "Data pipeline running OCR scans on invoice images, extracting total amounts, and returning JSON logs.",
    "duration": "4 Weeks",
    "prerequisites": [
      "OpenCV image processing",
      "Regex pattern matching"
    ],
    "learningOutcomes": [
      "Preprocess images to improve OCR accuracy",
      "Extract text from images using Tesseract",
      "Parse structured data using regular expressions"
    ],
    "features": [
      "Upload invoice images (PNG/JPG).",
      "Extracts dates, invoice numbers, tax fields, and total amounts.",
      "Regex text parsing algorithms.",
      "Exports parsed logs to JSON."
    ],
    "additionalFeatures": [
      "Line-item table extractor utilities",
      "Direct database export pipelines",
      "Automated email parser listeners"
    ],
    "architecture": "Invoice Image -> OpenCV Preprocess -> Tesseract OCR -> Regex Extractor -> JSON Output.",
    "synopsis": "Build automated invoice processing pipelines. pre-process images using OpenCV, run Tesseract OCR text extractions, and parse values using regex.",
    "directoryStructure": "invoice_parser/\n├── instance/invoices.db\n├── app.py\n└── requirements.txt",
    "apiEndpoints": [
      {
        "method": "POST",
        "path": "/api/parser/invoice",
        "desc": "Receives invoice image uploads, returning extracted invoice JSON fields."
      }
    ],
    "implementationSteps": [
      "Phase 1: Set up Tesseract binary engines.",
      "Phase 2: Implement OpenCV thresholding and resizing filters.",
      "Phase 3: Write regex rules matching total currency layouts.",
      "Phase 4: Code Flask upload endpoints."
    ],
    "skeletonCode": "import pytesseract\nimport cv2\ndef ocr(img_path):\n  img = cv2.imread(img_path)\n  gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)\n  return pytesseract.image_to_string(gray)",
    "vivaQuestions": [
      {
        "question": "What is Tesseract OCR?",
        "answer": "An open-source Optical Character Recognition engine used to extract text from images."
      },
      {
        "question": "Why convert images to grayscale before OCR?",
        "answer": "To reduce image noise and improve character detection accuracy."
      },
      {
        "question": "How does regular expression help in document parsing?",
        "answer": "It matches text patterns (like dates or currency symbols) to extract structured fields from raw text."
      },
      {
        "question": "What is thresholding in OpenCV?",
        "answer": "A image preprocessing operation that converts color images into binary black-and-white formats."
      }
    ],
    "domain": "python",
    "domainLabel": "Python Scripting",
    "skeletonLanguage": "python",
    "difficultyClass": "difficulty-advanced",
    "showArch": false
  },
  {
    "id": "algo-trader",
    "title": "Algorithmic Trading Backtester",
    "difficulty": "Advanced",
    "complexityStars": 5,
    "techStack": [
      "Python 3",
      "Pandas",
      "YFinance",
      "Matplotlib"
    ],
    "icon": "fa-solid fa-money-bill-trend-up",
    "shortDesc": "Download historical stock price data, run moving average trading strategies, and plot return charts.",
    "duration": "4 Weeks",
    "prerequisites": [
      "Pandas DataFrame transformations",
      "Financial market logic"
    ],
    "learningOutcomes": [
      "Fetch historical financial records using yfinance",
      "Implement trading logic using Pandas",
      "Calculate performance metrics (Sharpe ratio, drawdowns)"
    ],
    "features": [
      "Downloads stock price histories from Yahoo Finance.",
      "Calculates Simple Moving Averages (SMA).",
      "Simulates buy/sell trades based on crossover strategy rules.",
      "Generates performance charts showing strategy vs benchmark returns."
    ],
    "additionalFeatures": [
      "Backtests multiple strategies concurrently",
      "Calculates trade transaction fees",
      "Live paper trading simulations"
    ],
    "architecture": "YFinance API -> Pandas historical DataFrames -> Crossover crossover calculator -> Matplotlib plots.",
    "synopsis": "Build a financial backtesting engine. Fetch historical stock prices, simulate trades using technical indicators, and calculate performance metrics like the Sharpe ratio.",
    "directoryStructure": "backtester/\n├── strategies/crossover.py\n├── engine.py\n└── requirements.txt",
    "apiEndpoints": [
      {
        "method": "GET",
        "path": "/api/backtest",
        "desc": "Backtests a strategy on a target stock ticker."
      }
    ],
    "implementationSteps": [
      "Phase 1: Fetch price datasets using yfinance.",
      "Phase 2: Add SMA indicators to dataframes.",
      "Phase 3: Code trade simulation buy/sell crossover triggers.",
      "Phase 4: Calculate final strategy returns."
    ],
    "skeletonCode": "import yfinance as yf\ndef get_prices(ticker):\n  df = yf.download(ticker, start=\"2020-01-01\")\n  df['SMA_50'] = df['Close'].rolling(50).mean()\n  return df",
    "vivaQuestions": [
      {
        "question": "What is yfinance?",
        "answer": "A Python library that downloads historical market data from Yahoo Finance."
      },
      {
        "question": "What is a Moving Average Crossover strategy?",
        "answer": "A trading strategy that triggers buy/sell signals when a short-term moving average crosses a long-term moving average."
      },
      {
        "question": "Explain rolling() method in pandas.",
        "answer": "A pandas method used to calculate sliding window calculations, like moving averages."
      },
      {
        "question": "What does the Sharpe Ratio measure?",
        "answer": "The risk-adjusted return of an investment portfolio, indicating excess return per unit of volatility."
      }
    ],
    "domain": "python",
    "domainLabel": "Python Scripting",
    "skeletonLanguage": "python",
    "difficultyClass": "difficulty-advanced",
    "showArch": false
  },
  {
    "id": "library-sql-db",
    "title": "Library Management Database",
    "difficulty": "Basic",
    "complexityStars": 1,
    "techStack": [
      "MySQL",
      "Relational Design",
      "Index Optimization"
    ],
    "icon": "fa-solid fa-database",
    "shortDesc": "A robust database structure designed to manage books, authors, borrowing records, and late penalty calculations.",
    "duration": "1 Week",
    "prerequisites": [
      "SQL database concepts",
      "Primary/Foreign keys logic"
    ],
    "learningOutcomes": [
      "Database schemas normalization",
      "Enforce referential constraints",
      "Write complex query JOINs",
      "Create indices"
    ],
    "features": [
      "Clean normalized tables structure (1NF, 2NF, 3NF).",
      "Foreign key constraint validations.",
      "Complex JOIN queries for borrowing analytics.",
      "Index optimizations for barcode and title queries."
    ],
    "additionalFeatures": [
      "Automatic penalty calculation triggers",
      "Audit log view listings",
      "Stored procedures return logs"
    ],
    "architecture": "Relational DB schema -> Table relationships -> Indexes & Constraints.",
    "synopsis": "Relational database practice. Design normalized tables, configure constraints, write JOINs, and optimize queries.",
    "directoryStructure": "library-db/\n├── schema.sql\n├── seeds.sql\n└── queries.sql",
    "databaseOutline": "Tables:\n- Books (book_id, title, ISBN)\n- Authors (author_id, name)\n- Loans (loan_id, book_id, return_date)",
    "implementationSteps": [
      "Phase 1: Draw ERD maps.",
      "Phase 2: Generate DDL scripts with keys.",
      "Phase 3: Seed dummy data rows.",
      "Phase 4: Run test queries."
    ],
    "skeletonCode": "CREATE TABLE Books (\n  book_id INT PRIMARY KEY,\n  title VARCHAR(100),\n  isbn VARCHAR(20) UNIQUE\n);",
    "vivaQuestions": [
      {
        "question": "What is primary key?",
        "answer": "A column that uniquely identifies each row in a database table."
      },
      {
        "question": "What is foreign key?",
        "answer": "A column that establishes a link between two tables, ensuring referential integrity."
      },
      {
        "question": "Explain referential integrity.",
        "answer": "A database state where all foreign keys match valid primary key values, avoiding orphaned records."
      },
      {
        "question": "Explain the difference between CHAR and VARCHAR.",
        "answer": "CHAR is fixed-length, padding values with spaces. VARCHAR is variable-length, storing only the input characters."
      }
    ],
    "domain": "sql",
    "domainLabel": "SQL Databases",
    "skeletonLanguage": "sql",
    "difficultyClass": "difficulty-basic",
    "showArch": false
  },
  {
    "id": "bookstore-db",
    "title": "Online Bookstore Schema",
    "difficulty": "Basic",
    "complexityStars": 1,
    "techStack": [
      "PostgreSQL",
      "Normal Form",
      "Views"
    ],
    "icon": "fa-solid fa-book-open",
    "shortDesc": "Relational schema tracking books, order placements, shopping carts, and customer reviews.",
    "duration": "1 Week",
    "prerequisites": [
      "Basic database table structures",
      "DML statements"
    ],
    "learningOutcomes": [
      "Apply 3NF normalization rules",
      "Write checkout queries",
      "Configure SQL views summaries"
    ],
    "features": [
      "Normalized books, orders, and customer tables.",
      "Total calculation query triggers.",
      "Creates views summarizing daily sales performance.",
      "Check constraints preventing negative inventory."
    ],
    "additionalFeatures": [
      "User cart cache tables",
      "Coupon discount validations",
      "Customer reviews log view"
    ],
    "architecture": "Store Database -> Normalization (3NF) -> Order validation constraints -> SQL Sales View.",
    "synopsis": "E-commerce database design. Design normalized order tables, write checkout queries, and aggregate sales reports.",
    "directoryStructure": "bookstore-db/\n├── DDL_create.sql\n└── reporting_queries.sql",
    "databaseOutline": "Tables:\n- Customers (id, email)\n- Orders (id, customer_id, total_price)\n- OrderDetails (id, order_id, book_id, qty)",
    "implementationSteps": [
      "Phase 1: Map entity relations (One-to-Many).",
      "Phase 2: Write DDL creation queries.",
      "Phase 3: Seed orders dummy datasets.",
      "Phase 4: Query best-selling books list."
    ],
    "skeletonCode": "CREATE TABLE Orders (\n  order_id SERIAL PRIMARY KEY,\n  customer_id INT REFERENCES Customers(id),\n  order_date TIMESTAMP DEFAULT NOW()\n);",
    "vivaQuestions": [
      {
        "question": "What is Third Normal Form (3NF)?",
        "answer": "A normalization level where all fields depend only on the primary key, removing transitive dependencies."
      },
      {
        "question": "What is serialized type SERIAL in PostgreSQL?",
        "answer": "An auto-incrementing integer type used for primary keys."
      },
      {
        "question": "How does subquery work?",
        "answer": "A query nested inside another query, used to filter results dynamically."
      },
      {
        "question": "What is CHECK constraint?",
        "answer": "A constraint that validates column values against a logical expression before saving."
      }
    ],
    "domain": "sql",
    "domainLabel": "SQL Databases",
    "skeletonLanguage": "sql",
    "difficultyClass": "difficulty-basic",
    "showArch": false
  },
  {
    "id": "inventory-db",
    "title": "Inventory Stock Ledger DB",
    "difficulty": "Basic",
    "complexityStars": 1,
    "techStack": [
      "MySQL",
      "Triggers",
      "Audit Logs"
    ],
    "icon": "fa-solid fa-boxes-stacked",
    "shortDesc": "Stock tracking database implementing auto-reorder triggers and item audits.",
    "duration": "1 Week",
    "prerequisites": [
      "Database triggers syntax",
      "Join queries"
    ],
    "learningOutcomes": [
      "Write automated update triggers",
      "Log inventory changes",
      "Create search indexes"
    ],
    "features": [
      "Automated inventory subtraction on sales.",
      "Triggers low stock warnings.",
      "Audit log table tracking inventory adjustments.",
      "Indexed barcode queries."
    ],
    "additionalFeatures": [
      "Supplier order generators",
      "Supplier performance views",
      "Inventory valuation trackers"
    ],
    "architecture": "Ledger Database -> Audit triggers -> Stock status triggers -> Excel exporters.",
    "synopsis": "Manage warehouse databases. Write automated triggers, track inventory adjustments, and generate low-stock reports.",
    "directoryStructure": "inventory-db/\n├── ddl.sql\n├── triggers.sql\n└── test_cases.sql",
    "databaseOutline": "Tables:\n- Stock (id, item_name, qty, threshold)\n- StockAudits (id, item_id, old_qty, new_qty)",
    "implementationSteps": [
      "Phase 1: Code table DDL structures.",
      "Phase 2: Implement triggers to check stock levels.",
      "Phase 3: Seed dummy stock datasets.",
      "Phase 4: Run test operations."
    ],
    "skeletonCode": "CREATE TRIGGER after_sale_update\nAFTER INSERT ON Sales\nFOR EACH ROW\nBEGIN\n  UPDATE Stock SET qty = qty - NEW.qty WHERE item_id = NEW.item_id;\nEND;",
    "vivaQuestions": [
      {
        "question": "What is database trigger?",
        "answer": "An automated procedural block executed in response to database events (INSERT, UPDATE, DELETE)."
      },
      {
        "question": "Difference between BEFORE and AFTER triggers.",
        "answer": "BEFORE triggers modify data before writing it to the database. AFTER triggers execute post-write operations."
      },
      {
        "question": "How to prevent out-of-stock checkouts using SQL?",
        "answer": "By applying CHECK constraints or using triggers to block updates when stock falls below zero."
      },
      {
        "question": "What is transaction rollback?",
        "answer": "An operation that reverts database changes to the last commit point if a transaction fails."
      }
    ],
    "domain": "sql",
    "domainLabel": "SQL Databases",
    "skeletonLanguage": "sql",
    "difficultyClass": "difficulty-basic",
    "showArch": false
  },
  {
    "id": "attendance-db",
    "title": "Student Attendance Register DB",
    "difficulty": "Basic",
    "complexityStars": 2,
    "techStack": [
      "MySQL",
      "Group By",
      "Date Functions"
    ],
    "icon": "fa-solid fa-clipboard-user",
    "shortDesc": "Database schema recording student attendance by class, calculating monthly attendance percentages.",
    "duration": "1 Week",
    "prerequisites": [
      "Date calculations",
      "Aggregation queries"
    ],
    "learningOutcomes": [
      "Calculate averages using GROUP BY queries",
      "Process calendar intervals",
      "Generate compliance views"
    ],
    "features": [
      "Tracks daily attendance (Present/Absent/Late).",
      "Calculates monthly attendance percentages.",
      "Generates compliance lists highlighting low attendance.",
      "Enforces composite keys preventing duplicate entries."
    ],
    "additionalFeatures": [
      "Holiday calendar exceptions table",
      "Parent notifications registry",
      "Class-wise comparison views"
    ],
    "architecture": "Students -> Classes -> Attendance Logs -> Compliance Views.",
    "synopsis": "Build attendance registers. Master composite primary keys, GROUP BY aggregation queries, and date range filters.",
    "directoryStructure": "attendance-db/\n├── schema.sql\n└── reports.sql",
    "databaseOutline": "Tables:\n- Students (id, name)\n- Classes (id, name)\n- Attendance (student_id, class_id, date, status)",
    "implementationSteps": [
      "Phase 1: Create student, class, and attendance tables.",
      "Phase 2: Add composite keys to prevent duplicate attendance logs.",
      "Phase 3: Write GROUP BY queries to calculate attendance percentages.",
      "Phase 4: Build views to track attendance issues."
    ],
    "skeletonCode": "CREATE TABLE Attendance (\n  student_id INT,\n  class_id INT,\n  att_date DATE,\n  status VARCHAR(10),\n  PRIMARY KEY (student_id, class_id, att_date)\n);",
    "vivaQuestions": [
      {
        "question": "What is composite key?",
        "answer": "A primary key composed of two or more columns used to ensure row uniqueness."
      },
      {
        "question": "Explain the GROUP BY clause.",
        "answer": "An SQL clause that groups rows sharing values in specified columns to perform aggregate calculations (e.g. COUNT, SUM)."
      },
      {
        "question": "How do you calculate percentages in SQL?",
        "answer": "By using aggregate math, converting values to floats, and multiplying ratios by 100."
      },
      {
        "question": "What is the purpose of the HAVING clause?",
        "answer": "An SQL clause used to filter grouped rows returned by GROUP BY queries."
      }
    ],
    "domain": "sql",
    "domainLabel": "SQL Databases",
    "skeletonLanguage": "sql",
    "difficultyClass": "difficulty-basic",
    "showArch": false
  },
  {
    "id": "hospital-db",
    "title": "Hospital Patients Registry DB",
    "difficulty": "Intermediate",
    "complexityStars": 3,
    "techStack": [
      "PostgreSQL",
      "Indexes",
      "JOINS"
    ],
    "icon": "fa-solid fa-hospital",
    "shortDesc": "Database managing doctor profiles, patient health cards, and appointment schedules.",
    "duration": "2 Weeks",
    "prerequisites": [
      "Table indexing rules",
      "Relational database designs"
    ],
    "learningOutcomes": [
      "Design relational medical schemas",
      "Optimize appointment queries",
      "Handle patient data security constraints"
    ],
    "features": [
      "Doctors, Patients, Appointments, and Prescriptions tables.",
      "Conflict check query checking double-booked slots.",
      "Medical histories view registries.",
      "Indexed patient searches."
    ],
    "additionalFeatures": [
      "Prescription refills tracker",
      "Billing invoice generator view",
      "Room occupancy ledger"
    ],
    "architecture": "Hospital DB -> Normalized schemas -> Appointment slots validations -> Patient views.",
    "synopsis": "Healthcare database design. Design normalized patient schemas, write queries to prevent double-booking, and optimize search queries.",
    "directoryStructure": "hospital-db/\n├── create_schema.sql\n└── index_optimizations.sql",
    "databaseOutline": "Tables:\n- Doctors (id, name, specialization)\n- Patients (id, name, dob)\n- Appointments (id, doctor_id, patient_id, time)",
    "implementationSteps": [
      "Phase 1: Map entity relations (Many-to-Many).",
      "Phase 2: Generate DDL scripts.",
      "Phase 3: Add index keys on appointment slots.",
      "Phase 4: Run tests checking slot availability."
    ],
    "skeletonCode": "CREATE TABLE Appointments (\n  app_id SERIAL PRIMARY KEY,\n  doctor_id INT REFERENCES Doctors(id),\n  patient_id INT REFERENCES Patients(id),\n  slot_time TIMESTAMP NOT NULL,\n  UNIQUE(doctor_id, slot_time)\n);",
    "vivaQuestions": [
      {
        "question": "How do you prevent double-booked appointments?",
        "answer": "By applying UNIQUE constraints to the doctor_id and slot_time columns."
      },
      {
        "question": "What is a database index?",
        "answer": "A data structure that speeds up query retrieval operations at the cost of slower writes."
      },
      {
        "question": "Explain the difference between UNIQUE and PRIMARY KEY.",
        "answer": "PRIMARY KEY uniquely identifies rows and cannot contain NULL values. UNIQUE allows NULL values but ensures all non-NULL values are distinct."
      },
      {
        "question": "What is referential integrity cascade?",
        "answer": "An SQL constraint rule that automatically updates or deletes child rows when parent rows are updated or deleted."
      }
    ],
    "domain": "sql",
    "domainLabel": "SQL Databases",
    "skeletonLanguage": "sql",
    "difficultyClass": "difficulty-intermediate",
    "showArch": false
  },
  {
    "id": "payroll-db",
    "title": "HR Payroll Database System",
    "difficulty": "Intermediate",
    "complexityStars": 3,
    "techStack": [
      "SQL Server",
      "Stored Procedures",
      "Math"
    ],
    "icon": "fa-solid fa-money-check-dollar",
    "shortDesc": "Payroll database calculating gross salaries, tax deductions, and net payouts.",
    "duration": "2 Weeks",
    "prerequisites": [
      "Stored procedures syntax",
      "Variable declarations"
    ],
    "learningOutcomes": [
      "Write payroll stored procedures",
      "Calculate tax deductions",
      "Audit salary updates"
    ],
    "features": [
      "Employees, Salaries, Deductions, and Payouts tables.",
      "Stored procedure calculating net payouts.",
      "Tax deductions calculators.",
      "Salary change audit logs."
    ],
    "additionalFeatures": [
      "Sick leave deduction logic",
      "Bonus calculation functions",
      "Direct bank deposit exporter"
    ],
    "architecture": "Employees -> Salary rates -> Deductions -> Payout logs -> Stored procedures.",
    "synopsis": "Design payroll databases. Write stored procedures to calculate salaries, manage tax deductions, and track salary updates.",
    "directoryStructure": "payroll-db/\n├── schema.sql\n└── payroll_procedures.sql",
    "databaseOutline": "Tables:\n- Salaries (id, emp_id, basic, allowance)\n- Payouts (id, emp_id, month, net_pay)",
    "implementationSteps": [
      "Phase 1: Create employee salary and payout tables.",
      "Phase 2: Code stored procedures calculating net payouts.",
      "Phase 3: Seed sample salary and deduction datasets.",
      "Phase 4: Test payroll generation procedures."
    ],
    "skeletonCode": "CREATE PROCEDURE CalculateNetPay\n  @EmpId INT, @Month VARCHAR(10)\nAS\nBEGIN\n  -- Calculate basic salary + allowances - deductions...\nEND;",
    "vivaQuestions": [
      {
        "question": "What is a stored procedure?",
        "answer": "A precompiled set of SQL statements stored and executed on the database server."
      },
      {
        "question": "Why use stored procedures for salary calculations?",
        "answer": "They centralize calculations on the server, improve security, and reduce network traffic."
      },
      {
        "question": "Explain the difference between a Stored Procedure and a Function.",
        "answer": "Functions must return a value and cannot modify database state. Stored Procedures do not require return values and can run DML operations."
      },
      {
        "question": "What is a transaction audit log?",
        "answer": "A table that logs database updates to track history and maintain accountability."
      }
    ],
    "domain": "sql",
    "domainLabel": "SQL Databases",
    "skeletonLanguage": "sql",
    "difficultyClass": "difficulty-intermediate",
    "showArch": false
  },
  {
    "id": "restaurant-db",
    "title": "Restaurant Reservation DB",
    "difficulty": "Intermediate",
    "complexityStars": 3,
    "techStack": [
      "MySQL",
      "Joins",
      "Aggregation"
    ],
    "icon": "fa-solid fa-utensils",
    "shortDesc": "Database managing table availability, guest bookings, orders, and billing.",
    "duration": "2 Weeks",
    "prerequisites": [
      "Table indexing rules",
      "Relational database designs"
    ],
    "learningOutcomes": [
      "Design relational schemas",
      "Optimize search queries",
      "Handle transactional checkouts"
    ],
    "features": [
      "Tables, Bookings, Orders, and Invoices tables.",
      "Table availability checks.",
      "Billing calculations.",
      "Popular dishes analysis views."
    ],
    "additionalFeatures": [
      "Loyalty points calculators",
      "Seat assignment maps",
      "Online menu views"
    ],
    "architecture": "Reservations -> Table assignments -> Orders -> Invoices.",
    "synopsis": "Design restaurant databases. Track reservations, calculate invoices, and write views to analyze popular dishes.",
    "directoryStructure": "restaurant-db/\n├── create_tables.sql\n└── billing_queries.sql",
    "databaseOutline": "Tables:\n- Tables (id, capacity, status)\n- Bookings (id, table_id, date, status)\n- Invoices (id, booking_id, total)",
    "implementationSteps": [
      "Phase 1: Create restaurant reservation and billing tables.",
      "Phase 2: Code triggers checking table capacity.",
      "Phase 3: Seed sample booking and menu datasets.",
      "Phase 4: Run test order invoice checkouts."
    ],
    "skeletonCode": "CREATE TABLE Bookings (\n  booking_id INT AUTO_INCREMENT PRIMARY KEY,\n  table_id INT REFERENCES Tables(id),\n  booking_time TIMESTAMP,\n  status VARCHAR(20)\n);",
    "vivaQuestions": [
      {
        "question": "How do you check table availability in SQL?",
        "answer": "By querying booking tables to verify no overlap exists for a target table at a specified time."
      },
      {
        "question": "What is referential integrity?",
        "answer": "A database state where all foreign keys match valid primary key values, avoiding orphaned records."
      },
      {
        "question": "Explain the difference between WHERE and HAVING.",
        "answer": "WHERE filters rows before aggregation. HAVING filters grouped rows returned by GROUP BY queries."
      },
      {
        "question": "What is the purpose of database transactions?",
        "answer": "They group multiple operations into a single execution unit that succeeds or fails as a whole (Atomicity)."
      }
    ],
    "domain": "sql",
    "domainLabel": "SQL Databases",
    "skeletonLanguage": "sql",
    "difficultyClass": "difficulty-intermediate",
    "showArch": false
  },
  {
    "id": "hotel-db",
    "title": "Hotel Booking Database",
    "difficulty": "Intermediate",
    "complexityStars": 3,
    "techStack": [
      "PostgreSQL",
      "Dates",
      "Integrity Constraints"
    ],
    "icon": "fa-solid fa-hotel",
    "shortDesc": "Database mapping room classes, guest reservations, and checkout invoices.",
    "duration": "2 Weeks",
    "prerequisites": [
      "Composite key configurations",
      "Date check constraints"
    ],
    "learningOutcomes": [
      "Design normalized booking schemas",
      "Prevent booking overlaps",
      "Calculate invoice totals based on date differences"
    ],
    "features": [
      "Rooms, Guests, Bookings, and Invoices tables.",
      "Dynamic room rate calculators.",
      "Validations checking checkout dates are after check-in dates.",
      "Views tracking room occupancy status."
    ],
    "additionalFeatures": [
      "Additional guest charges ledger",
      "Room service order list",
      "Seasonal pricing adjustment scripts"
    ],
    "architecture": "Rooms -> Bookings -> Billing -> Invoices.",
    "synopsis": "Hotel booking database practice. Design normalized tables, write checkout calculations, and prevent room booking overlaps.",
    "directoryStructure": "hotel-db/\n├── create_schema.sql\n└── checkout_billing.sql",
    "databaseOutline": "Tables:\n- Rooms (id, number, rate)\n- Bookings (id, room_id, guest_id, checkin, checkout)",
    "implementationSteps": [
      "Phase 1: Create hotel rooms and bookings tables.",
      "Phase 2: Code checks to prevent double-booking rooms.",
      "Phase 3: Seed sample rooms and bookings datasets.",
      "Phase 4: Run test queries checking room occupancy."
    ],
    "skeletonCode": "CREATE TABLE Bookings (\n  booking_id SERIAL PRIMARY KEY,\n  room_id INT REFERENCES Rooms(id),\n  check_in DATE NOT NULL,\n  check_out DATE NOT NULL,\n  CONSTRAINT check_dates CHECK (check_out > check_in)\n);",
    "vivaQuestions": [
      {
        "question": "How do you calculate date differences in SQL?",
        "answer": "Using date functions like DATEDIFF in MySQL or by direct subtraction (date1 - date2) in PostgreSQL."
      },
      {
        "question": "Explain room double-booking prevention.",
        "answer": "By checking that a room has no overlapping check-in/check-out dates before confirming a booking."
      },
      {
        "question": "What is constraints in SQL?",
        "answer": "Rules applied to columns to restrict the type of data saved in tables."
      },
      {
        "question": "Explain difference between primary key and foreign key.",
        "answer": "Primary key uniquely identifies rows. Foreign key links tables to ensure referential integrity."
      }
    ],
    "domain": "sql",
    "domainLabel": "SQL Databases",
    "skeletonLanguage": "sql",
    "difficultyClass": "difficulty-intermediate",
    "showArch": false
  },
  {
    "id": "movie-db",
    "title": "Movie Reservation DB",
    "difficulty": "Intermediate",
    "complexityStars": 3,
    "techStack": [
      "MySQL",
      "Relational Design",
      "Constraints"
    ],
    "icon": "fa-solid fa-film",
    "shortDesc": "Database mapping theater screens, showtimes, seat selections, and ticket purchases.",
    "duration": "2 Weeks",
    "prerequisites": [
      "Many-to-Many relational setups",
      "Dynamic query JOINs"
    ],
    "learningOutcomes": [
      "Design normalized ticketing databases",
      "Manage seats reservations",
      "Prevent duplicate ticket sales"
    ],
    "features": [
      "Movies, Screens, Shows, Seats, and Tickets tables.",
      "Seat availability checks.",
      "Ticket sales report views.",
      "Enforces composite keys preventing duplicate seat bookings."
    ],
    "additionalFeatures": [
      "Interactive seat layout generator view",
      "Loyalty card discount validators",
      "Sales report charts views"
    ],
    "architecture": "Movies -> Shows -> Seats -> Bookings -> Tickets.",
    "synopsis": "Design ticketing databases. Normalise many-to-many relationships, write queries checking seat availability, and prevent duplicate bookings.",
    "directoryStructure": "movie-db/\n├── ddl.sql\n└── query_tests.sql",
    "databaseOutline": "Tables:\n- Seats (id, row, number)\n- Tickets (id, show_id, seat_id, price)",
    "implementationSteps": [
      "Phase 1: Create movie screens and seating tables.",
      "Phase 2: Code constraints preventing duplicate seat reservations.",
      "Phase 3: Seed sample showtimes and tickets datasets.",
      "Phase 4: Run seat booking queries."
    ],
    "skeletonCode": "CREATE TABLE Tickets (\n  ticket_id INT AUTO_INCREMENT PRIMARY KEY,\n  show_id INT REFERENCES Shows(id),\n  seat_id INT REFERENCES Seats(id),\n  UNIQUE (show_id, seat_id)\n);",
    "vivaQuestions": [
      {
        "question": "How do you prevent duplicate seat reservations?",
        "answer": "By applying a UNIQUE constraint on the combination of show_id and seat_id."
      },
      {
        "question": "What is many-to-many relationship?",
        "answer": "A database relationship where multiple rows in one table relate to multiple rows in another, implemented using a join table."
      },
      {
        "question": "What is join table?",
        "answer": "A table that contains foreign keys linking two related tables in a many-to-many relationship."
      },
      {
        "question": "Explain the difference between primary key and foreign key.",
        "answer": "Primary key uniquely identifies rows. Foreign key links tables to ensure referential integrity."
      }
    ],
    "domain": "sql",
    "domainLabel": "SQL Databases",
    "skeletonLanguage": "sql",
    "difficultyClass": "difficulty-intermediate",
    "showArch": false
  },
  {
    "id": "enterprise-erp",
    "title": "Enterprise ERP Data Warehouse",
    "difficulty": "Advanced",
    "complexityStars": 5,
    "techStack": [
      "PostgreSQL",
      "Partitioning",
      "Data Warehouse"
    ],
    "icon": "fa-solid fa-network-wired",
    "shortDesc": "Enterprise-grade data warehouse system using partitioning, materialized views, and index optimization.",
    "duration": "4 Weeks",
    "prerequisites": [
      "Database schema migrations",
      "Query performance analysis"
    ],
    "learningOutcomes": [
      "Implement partition tables",
      "Create materialized views",
      "Optimize query performance using indexes"
    ],
    "features": [
      "Table partitioning by date range.",
      "Materialized views summarizing monthly metrics.",
      "Optimizes query speeds using indexes.",
      "Transaction audit logging."
    ],
    "additionalFeatures": [
      "Multi-tenant schema isolations",
      "Data warehouse ETL pipeline logs",
      "Distributed transaction recovery scripts"
    ],
    "architecture": "ERP Database -> Partitioning engine -> Materialized views -> Query indexes.",
    "synopsis": "Develop enterprise data warehouses. Master table partitioning, materialized views, query performance indexing, and transaction logging.",
    "directoryStructure": "erp-warehouse/\n├── partitions.sql\n├── materialized_views.sql\n└── index_tuning.sql",
    "databaseOutline": "Tables:\n- SalesPartitions (date range partitions)\n- MonthlySummaries (Materialized View)",
    "implementationSteps": [
      "Phase 1: Create main table and partition tables.",
      "Phase 2: Code materialized views for reports.",
      "Phase 3: Add index keys on partition columns.",
      "Phase 4: Run query performance tests."
    ],
    "skeletonCode": "CREATE TABLE Sales (\n  sale_id INT,\n  sale_date DATE NOT NULL,\n  total DECIMAL(10,2)\n) PARTITION BY RANGE (sale_date);",
    "vivaQuestions": [
      {
        "question": "What is table partitioning?",
        "answer": "Dividing a large table into smaller, more manageable child tables based on criteria like date ranges."
      },
      {
        "question": "What is a materialized view?",
        "answer": "A view that physically stores the query result, speeding up reporting queries by avoiding real-time execution."
      },
      {
        "question": "Explain query performance tuning.",
        "answer": "Using EXPLAIN to analyze query execution plans and applying indexes to reduce scan times."
      },
      {
        "question": "Explain the difference between a Clustered and Non-Clustered index.",
        "answer": "A clustered index determines the physical order of data rows in a table. A non-clustered index is stored in a separate structure containing pointers to data rows."
      }
    ],
    "domain": "sql",
    "domainLabel": "SQL Databases",
    "skeletonLanguage": "sql",
    "difficultyClass": "difficulty-advanced",
    "showArch": false
  },
  {
    "id": "bank-ledger",
    "title": "Bank Transaction Audit Ledger",
    "difficulty": "Advanced",
    "complexityStars": 5,
    "techStack": [
      "PostgreSQL",
      "Triggers",
      "Auditing"
    ],
    "icon": "fa-solid fa-shield-halved",
    "shortDesc": "A transaction ledger implementing double-entry journals, triggers, and lock blocks.",
    "duration": "4 Weeks",
    "prerequisites": [
      "Triggers syntax",
      "Row-locking constraints"
    ],
    "learningOutcomes": [
      "Design double-entry relational ledgers",
      "Prevent transaction race conditions using row locks",
      "Write audit log triggers"
    ],
    "features": [
      "Double-entry ledger tables (debits vs credits).",
      "Triggers maintaining consistent balances.",
      "Audits table recording all updates.",
      "Row-locking locks preventing transaction race conditions."
    ],
    "additionalFeatures": [
      "Interest calculation automation",
      "Fraud check alert triggers",
      "Monthly statement generator"
    ],
    "architecture": "Accounts -> Transactions -> Ledger -> Audit logs.",
    "synopsis": "Design banking transaction ledgers. Implement double-entry ledger structures, write database audit triggers, and use row locks to prevent race conditions.",
    "directoryStructure": "bank-ledger/\n├── tables.sql\n├── triggers.sql\n└── transactions.sql",
    "databaseOutline": "Tables:\n- Accounts (id, balance)\n- Ledger (id, account_id, type, amount)",
    "implementationSteps": [
      "Phase 1: Create bank account and transaction ledger tables.",
      "Phase 2: Code triggers updating account balances.",
      "Phase 3: Seed sample accounts and ledger datasets.",
      "Phase 4: Run transaction test cases."
    ],
    "skeletonCode": "CREATE TRIGGER update_balance\nAFTER INSERT ON Ledger\nFOR EACH ROW\nBEGIN\n  UPDATE Accounts SET balance = balance + NEW.amount WHERE id = NEW.account_id;\nEND;",
    "vivaQuestions": [
      {
        "question": "How do you double-entry ledger book-keeping prevent errors?",
        "answer": "By ensuring equal debit and credit journal inserts balance out total sums."
      },
      {
        "question": "What is select for update locking?",
        "answer": "A row-locking query mechanism keeping records locked from concurrent threads until transactions commit."
      },
      {
        "question": "What is transaction isolation?",
        "answer": "The database Isolation degree matching ACID rules (Read Committed, Serializable) preventing dirty reads."
      },
      {
        "question": "Why avoid transactions locks on indexes columns?",
        "answer": "It can lock entire pages or tables rather than specific targeted records."
      }
    ],
    "domain": "sql",
    "domainLabel": "SQL Databases",
    "skeletonLanguage": "sql",
    "difficultyClass": "difficulty-advanced",
    "showArch": false
  },
  {
    "id": "rideshare-db",
    "title": "Ride Sharing Metrics DB",
    "difficulty": "Advanced",
    "complexityStars": 4,
    "techStack": [
      "PostgreSQL",
      "PostGIS",
      "Geospatial Index"
    ],
    "icon": "fa-solid fa-car",
    "shortDesc": "Database tracking driver coordinates, trip routes, and pricing using geospatial indices.",
    "duration": "4 Weeks",
    "prerequisites": [
      "PostGIS extension setup",
      "Geospatial queries"
    ],
    "learningOutcomes": [
      "Coordinate geospatial databases",
      "Query nearest coordinates",
      "Structure logs of active coordinates"
    ],
    "features": [
      "Drivers, Passengers, Trips, and Coordinates tables.",
      "Geospatial indexes matching nearest drivers.",
      "Price calculator queries.",
      "Saves trip route coordinates."
    ],
    "additionalFeatures": [
      "Trip performance views",
      "Visual map dashboards",
      "Driver payout calculations"
    ],
    "architecture": "Drivers coords -> PostGIS point mapper -> Trip logs -> Price matrix.",
    "synopsis": "Rideshare metrics database. Master PostGIS coordinates, geospatial indexing, and routing price calculation engines.",
    "directoryStructure": "rideshare-db/\n├── postgis_setup.sql\n├── schema.sql\n└── matching_queries.sql",
    "databaseOutline": "Tables:\n- Coords (id, trip_id, lat, lon)\n- Trips (id, driver_id, passenger_id)",
    "implementationSteps": [
      "Phase 1: Install PostGIS extensions.",
      "Phase 2: Create geo coordinate tables.",
      "Phase 3: Add geospatial indexes.",
      "Phase 4: Test driver-matching queries."
    ],
    "skeletonCode": "CREATE TABLE Drivers (\n  id SERIAL PRIMARY KEY,\n  location GEOMETRY(Point, 4326)\n);\nCREATE INDEX idx_driver_location ON Drivers USING GIST(location);",
    "vivaQuestions": [
      {
        "question": "What is PostGIS?",
        "answer": "An extension that adds support for geographic and spatial objects to PostgreSQL databases."
      },
      {
        "question": "What is a GIST index?",
        "answer": "Generalized Search Tree index, used to optimize geospatial queries (like finding the nearest point)."
      },
      {
        "question": "Explain coordinate SRID 4326.",
        "answer": "Spatial Reference System Identifier for the WGS 84 coordinate reference system used in global GPS."
      },
      {
        "question": "How do you calculate distance between coordinates in PostGIS?",
        "answer": "Using functions like ST_Distance or ST_DistanceSphere."
      }
    ],
    "domain": "sql",
    "domainLabel": "SQL Databases",
    "skeletonLanguage": "sql",
    "difficultyClass": "difficulty-advanced",
    "showArch": false
  },
  {
    "id": "social-graph-db",
    "title": "Social Media Graph DB",
    "difficulty": "Advanced",
    "complexityStars": 5,
    "techStack": [
      "PostgreSQL",
      "Recursive Queries",
      "Recursive CTE"
    ],
    "icon": "fa-solid fa-share-nodes",
    "shortDesc": "Database mapping user connections, followers, and activity timelines using recursive queries.",
    "duration": "4 Weeks",
    "prerequisites": [
      "Recursive CTE syntax",
      "Relational database designs"
    ],
    "learningOutcomes": [
      "Design relational social networks",
      "Write recursive SQL queries (CTE)",
      "Build feed generation engines"
    ],
    "features": [
      "Users, Followers, Posts, and Likes tables.",
      "Recursive CTE queries finding mutual friends.",
      "Feed generation queries compiling friend posts.",
      "Indexed follower lists."
    ],
    "additionalFeatures": [
      "Mutual friends suggestion views",
      "Post engagement rating calculator",
      "Reports generator"
    ],
    "architecture": "Users -> Connections -> Posts -> CTE Feed generator.",
    "synopsis": "Social graph database design. Master relational social networks, write recursive queries to find mutual friends, and build feed engines.",
    "directoryStructure": "social-graph-db/\n├── DDL.sql\n└── query_feed.sql",
    "databaseOutline": "Tables:\n- Followers (user_id, follower_id)\n- Posts (id, user_id, content)",
    "implementationSteps": [
      "Phase 1: Create user, follower, and post tables.",
      "Phase 2: Code CTE queries resolving friend levels.",
      "Phase 3: Seed sample user and post datasets.",
      "Phase 4: Run feed compilation queries."
    ],
    "skeletonCode": "WITH RECURSIVE FriendPath AS (\n  SELECT user_id, follower_id, 1 AS depth FROM Followers WHERE user_id = 1\n  UNION\n  SELECT f.user_id, f.follower_id, fp.depth + 1 FROM Followers f INNER JOIN FriendPath fp ON f.user_id = fp.follower_id WHERE fp.depth < 3\n) SELECT * FROM FriendPath;",
    "vivaQuestions": [
      {
        "question": "What is recursive CTE?",
        "answer": "A Common Table Expression that references itself to query hierarchical or network graph data structures."
      },
      {
        "question": "How to compile user news feeds in SQL?",
        "answer": "By joining follower tables with posts tables, sorting by creation date descending, and paginating results."
      },
      {
        "question": "What is depth-first search (DFS)?",
        "answer": "An algorithm for traversing tree or graph data structures by exploring along each branch before backtracking."
      },
      {
        "question": "Explain the difference between UNION and UNION ALL.",
        "answer": "UNION removes duplicate rows from combined queries. UNION ALL preserves all rows, making it faster."
      }
    ],
    "domain": "sql",
    "domainLabel": "SQL Databases",
    "skeletonLanguage": "sql",
    "difficultyClass": "difficulty-advanced",
    "showArch": false
  }
];
