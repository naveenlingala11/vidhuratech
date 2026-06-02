export interface CourseDetail {
  slug: string;
  codes: string[];
  title: string;
  subtitle: string;
  level: string;
  duration: string;
  // price is fallback only. Runtime price should come from /api/public/courses.
  price: string;
  badge: string;
  heroStats: Array<{ label: string; value: string }>;
  overview: string;
  importance: string[];
  future: string[];
  roles: Array<{ title: string; package: string; skills: string; note: string }>;
  roadmap: Array<{ phase: string; goal: string; items: string[] }>;
  fastLearning: string[];
  projects: Array<{ title: string; description: string }>;
  tools: string[];
  outcomes: string[];
}

export const COURSE_DETAILS: CourseDetail[] = [
  {
    slug: 'java-full-stack',
    codes: ['JAVA_FS_001', 'JAVA_FS'],
    title: 'Java Full Stack',
    subtitle:
      'A complete backend-to-frontend career track covering Core Java, Spring Boot, REST APIs, SQL, Angular, security, deployment, and interview-ready projects.',
    level: 'Beginner to Intermediate',
    duration: '40 to 120 hrs',
    price: 'Starts from ₹3,499',
    badge: 'Enterprise Software Career Track',
    heroStats: [
      { label: 'Backend', value: 'Spring Boot' },
      { label: 'Frontend', value: 'Angular' },
      { label: 'Outcome', value: 'Job Ready' },
    ],
    overview:
      'Java Full Stack development means you can build a complete application from database to backend API to frontend UI. Java and Spring Boot power many large-scale business systems, while Angular helps create clean, structured, enterprise-grade web interfaces.',
    importance: [
      'Java is used by banks, fintech companies, ecommerce platforms, healthcare systems, SaaS products, and enterprise teams.',
      'Spring Boot is practical for REST APIs, authentication, database workflows, and microservices.',
      'Full stack knowledge helps you understand complete product flow instead of only UI or backend tasks.',
      'Java roles reward fundamentals, clean code, debugging ability, SQL knowledge, and project explanation.',
    ],
    future: [
      'Java remains strong in enterprise backend systems, API platforms, microservices, and cloud-native development.',
      'Spring Boot plus Docker, AWS, Kubernetes, Kafka, and CI/CD can move you toward senior backend roles.',
      'Java full stack skills are useful for product companies, service companies, startups, and enterprise projects.',
      'Strong Java fundamentals can lead to system design, distributed systems, cloud engineering, or tech lead paths.',
    ],
    roles: [
      {
        title: 'Java Developer',
        package: '₹3 LPA - ₹6 LPA',
        skills: 'Core Java, OOP, Collections, SQL',
        note: 'Best starting role for freshers with strong fundamentals.',
      },
      {
        title: 'Spring Boot Developer',
        package: '₹5 LPA - ₹12 LPA',
        skills: 'REST APIs, JPA, Security, Testing',
        note: 'Focused backend role for secure APIs and database workflows.',
      },
      {
        title: 'Java Full Stack Developer',
        package: '₹6 LPA - ₹15 LPA',
        skills: 'Java, Spring Boot, Angular, SQL',
        note: 'High-value role when you can deliver complete features.',
      },
      {
        title: 'Microservices Developer',
        package: '₹10 LPA - ₹22 LPA',
        skills: 'Spring Cloud, Docker, Kafka, AWS',
        note: 'Advanced role for scalable service-based systems.',
      },
    ],
    roadmap: [
      {
        phase: 'Core Foundation',
        goal: 'Become confident with Java syntax and problem solving.',
        items: ['Core Java', 'OOP', 'Collections', 'Exceptions', 'Java 8 Streams', 'Git'],
      },
      {
        phase: 'Backend Development',
        goal: 'Build APIs that are clean, secure, and database connected.',
        items: [
          'Spring Boot',
          'REST APIs',
          'Spring Data JPA',
          'Hibernate',
          'Validation',
          'Global exceptions',
        ],
      },
      {
        phase: 'Database Skills',
        goal: 'Design tables and write production-friendly queries.',
        items: ['SQL', 'Joins', 'Indexes', 'Transactions', 'Schema design', 'Query optimization'],
      },
      {
        phase: 'Frontend Integration',
        goal: 'Create Angular screens and connect them to backend APIs.',
        items: ['Components', 'Routing', 'Forms', 'Services', 'HTTP Client', 'Auth guards'],
      },
      {
        phase: 'Production Readiness',
        goal: 'Prepare projects for interviews and real deployment.',
        items: ['JWT', 'Testing', 'Docker', 'CI/CD basics', 'AWS basics', 'Documentation'],
      },
    ],
    fastLearning: [
      'Learn one concept and immediately build a small feature with it.',
      'Spend 90 minutes daily: half for concepts and half for project implementation.',
      'Debug every error properly using stack traces, API responses, SQL checks, and breakpoints.',
      'Keep one strong GitHub project with clean commits and a professional README.',
      'Revise OOP, collections, SQL joins, REST flow, and Spring annotations every week.',
      'Prepare interview answers from your own project instead of memorizing definitions.',
    ],
    projects: [
      {
        title: 'Course Enrollment Platform',
        description:
          'Courses, batches, checkout flow, curriculum preview, student dashboard, and admin controls.',
      },
      {
        title: 'Employee Management System',
        description:
          'Role-based login, CRUD, search, filters, pagination, leave approval, and reporting.',
      },
      {
        title: 'Ecommerce API + Admin UI',
        description:
          'Products, cart, orders, invoices, payment status, admin panel, and secured endpoints.',
      },
      {
        title: 'Microservices Mini System',
        description:
          'API gateway, discovery, config, service communication, logs, and Docker setup.',
      },
    ],
    tools: [
      'Java',
      'Spring Boot',
      'Spring Security',
      'Hibernate/JPA',
      'MySQL',
      'PostgreSQL',
      'Angular',
      'Postman',
      'GitHub',
      'Docker',
      'AWS Basics',
    ],
    outcomes: [
      'Build complete Java full stack applications from scratch.',
      'Create secure REST APIs and connect them with Angular screens.',
      'Design databases and write practical SQL queries.',
      'Deploy and explain projects confidently in interviews.',
      'Prepare for Java developer, backend developer, and full stack developer roles.',
    ],
  },
  {
    slug: 'react-js',
    codes: ['REACT', 'REACT_JS'],
    title: 'React JS Mastery',
    subtitle:
      'Build modern, fast, component-driven web applications using React, hooks, routing, API integration, state management, and production-ready UI patterns.',
    level: 'Intermediate',
    duration: '30 to 80 hrs',
    price: 'Starts from ₹1,999',
    badge: 'Modern Frontend Career Track',
    heroStats: [
      { label: 'UI', value: 'React' },
      { label: 'State', value: 'Hooks' },
      { label: 'Outcome', value: 'Frontend Ready' },
    ],
    overview:
      'React is one of the most widely used frontend libraries for building interactive user interfaces. This course focuses on component thinking, reusable UI, API-driven screens, routing, forms, state management, performance, and real-world frontend project structure.',
    importance: [
      'React is used by startups, product companies, agencies, SaaS platforms, and enterprise teams.',
      'Component-based development helps teams build fast, reusable, and maintainable interfaces.',
      'React pairs well with Node.js, Java, Python, Firebase, and cloud APIs.',
      'Strong React developers can move into frontend, full stack, UI engineering, and product engineering roles.',
    ],
    future: [
      'React skills remain valuable for dashboards, ecommerce, SaaS apps, admin panels, and customer portals.',
      'React plus TypeScript, Next.js, testing, and performance optimization improves senior role readiness.',
      'Frontend engineers with design sense and API integration skills are needed in product teams.',
      'React can lead toward full stack development when combined with Node.js, databases, and deployment.',
    ],
    roles: [
      {
        title: 'React Developer',
        package: '₹3 LPA - ₹7 LPA',
        skills: 'React, Hooks, Routing, APIs',
        note: 'Good role for learners who can build clean screens and connect APIs.',
      },
      {
        title: 'Frontend Developer',
        package: '₹4 LPA - ₹10 LPA',
        skills: 'React, JavaScript, CSS, Git',
        note: 'Requires strong UI implementation and browser debugging.',
      },
      {
        title: 'UI Engineer',
        package: '₹6 LPA - ₹14 LPA',
        skills: 'React, TypeScript, Design Systems',
        note: 'For developers who can build polished reusable components.',
      },
      {
        title: 'Full Stack Developer',
        package: '₹7 LPA - ₹16 LPA',
        skills: 'React, Node/Java, APIs, DB',
        note: 'Best when React is combined with backend and database skills.',
      },
    ],
    roadmap: [
      {
        phase: 'JavaScript Foundation',
        goal: 'Become confident with modern JavaScript.',
        items: ['ES6', 'Arrays', 'Objects', 'Promises', 'Async/Await', 'Modules'],
      },
      {
        phase: 'React Core',
        goal: 'Build reusable components and manage UI state.',
        items: ['Components', 'Props', 'State', 'Hooks', 'Events', 'Conditional rendering'],
      },
      {
        phase: 'App Flow',
        goal: 'Build multi-page API-driven applications.',
        items: [
          'React Router',
          'Forms',
          'API calls',
          'Loading states',
          'Error states',
          'Search filters',
        ],
      },
      {
        phase: 'Advanced Frontend',
        goal: 'Write scalable frontend code.',
        items: [
          'Context API',
          'Custom hooks',
          'Performance',
          'TypeScript basics',
          'Testing basics',
          'Reusable components',
        ],
      },
      {
        phase: 'Deployment',
        goal: 'Ship projects professionally.',
        items: [
          'Build process',
          'Environment files',
          'Netlify/Vercel',
          'GitHub README',
          'Portfolio polish',
        ],
      },
    ],
    fastLearning: [
      'Build every concept as a small UI component before moving forward.',
      'Practice API loading, empty, error, and success states in every project.',
      'Recreate real dashboard screens to improve layout and spacing skills.',
      'Learn browser DevTools early for debugging layout, network, and console issues.',
      'Use GitHub commits to show feature-by-feature progress.',
      'Explain projects using component structure, state flow, and API flow.',
    ],
    projects: [
      {
        title: 'Job Portal Frontend',
        description: 'Jobs list, filters, company pages, saved jobs, and application flow.',
      },
      {
        title: 'Admin Dashboard',
        description: 'Charts, tables, search, forms, modals, and API-driven data.',
      },
      {
        title: 'Course Marketplace UI',
        description: 'Course cards, details page, checkout flow, and student dashboard.',
      },
      {
        title: 'Task Management App',
        description: 'Drag-ready task boards, filters, status updates, and local/API state.',
      },
    ],
    tools: [
      'React',
      'JavaScript',
      'TypeScript Basics',
      'React Router',
      'Axios/Fetch',
      'Context API',
      'CSS',
      'Tailwind Basics',
      'GitHub',
      'Vercel',
    ],
    outcomes: [
      'Build polished React applications with reusable components.',
      'Connect frontend screens with backend APIs.',
      'Handle forms, routing, loading states, and UI interactions.',
      'Create portfolio-ready frontend projects.',
      'Prepare for React developer and frontend developer roles.',
    ],
  },
  {
    slug: 'devops',
    codes: ['DEVOPS'],
    title: 'DevOps',
    subtitle:
      'Learn CI/CD, Linux, Git, Docker, cloud deployments, monitoring basics, and automation workflows used by modern engineering teams.',
    level: 'Advanced',
    duration: '45 hrs',
    price: '₹3,999',
    badge: 'Cloud Automation Career Track',
    heroStats: [
      { label: 'Build', value: 'CI/CD' },
      { label: 'Deploy', value: 'Docker' },
      { label: 'Cloud', value: 'AWS' },
    ],
    overview:
      'DevOps connects development and operations so software can be built, tested, deployed, monitored, and improved faster. This course focuses on practical automation, pipelines, containers, cloud deployments, and production mindset.',
    importance: [
      'Companies need faster and safer release cycles.',
      'DevOps reduces manual deployment errors through automation.',
      'Docker and CI/CD are now common expectations in modern software teams.',
      'DevOps knowledge helps developers understand production systems better.',
    ],
    future: [
      'DevOps continues to grow with cloud, containers, Kubernetes, platform engineering, and SRE practices.',
      'Automation skills are useful across startups, enterprises, SaaS, fintech, and cloud teams.',
      'DevOps can lead toward cloud engineer, platform engineer, SRE, and infrastructure automation roles.',
      'Strong DevOps engineers become valuable by improving reliability, deployment speed, and cost efficiency.',
    ],
    roles: [
      {
        title: 'DevOps Associate',
        package: '₹4 LPA - ₹8 LPA',
        skills: 'Linux, Git, CI/CD, Docker',
        note: 'Entry role for learners with deployment and pipeline basics.',
      },
      {
        title: 'Cloud DevOps Engineer',
        package: '₹7 LPA - ₹16 LPA',
        skills: 'AWS, Docker, CI/CD, Monitoring',
        note: 'Works on cloud infrastructure and automated deployments.',
      },
      {
        title: 'Site Reliability Engineer',
        package: '₹10 LPA - ₹24 LPA',
        skills: 'Reliability, Monitoring, Linux, Automation',
        note: 'Focuses on uptime, incident response, and system health.',
      },
      {
        title: 'Platform Engineer',
        package: '₹14 LPA - ₹30 LPA',
        skills: 'Kubernetes, IaC, Pipelines, Security',
        note: 'Builds internal platforms for developer productivity.',
      },
    ],
    roadmap: [
      {
        phase: 'Linux and Git',
        goal: 'Understand server basics and source control.',
        items: ['Linux commands', 'Shell basics', 'Git', 'Branching', 'SSH', 'Permissions'],
      },
      {
        phase: 'CI/CD',
        goal: 'Automate build and deployment workflows.',
        items: [
          'Pipelines',
          'GitHub Actions',
          'Jenkins basics',
          'Build artifacts',
          'Secrets',
          'Rollback basics',
        ],
      },
      {
        phase: 'Containers',
        goal: 'Package apps consistently.',
        items: ['Dockerfile', 'Images', 'Containers', 'Docker Compose', 'Volumes', 'Networks'],
      },
      {
        phase: 'Cloud Deployments',
        goal: 'Deploy apps to cloud environments.',
        items: [
          'AWS EC2',
          'S3 basics',
          'Load balancer basics',
          'Environment variables',
          'Domains',
          'SSL basics',
        ],
      },
      {
        phase: 'Operations',
        goal: 'Monitor and maintain production systems.',
        items: ['Logs', 'Metrics', 'Alerts', 'Backups', 'Cost basics', 'Security basics'],
      },
    ],
    fastLearning: [
      'Use one sample app and deploy it repeatedly with better automation each week.',
      'Practice Linux commands daily until server navigation feels natural.',
      'Write Dockerfiles manually instead of only copying examples.',
      'Break deployments intentionally in practice and learn rollback steps.',
      'Document every deployment command and architecture diagram.',
      'Learn by connecting Git push to automated deployment.',
    ],
    projects: [
      {
        title: 'CI/CD Pipeline for Web App',
        description: 'GitHub Actions pipeline with build, test, Docker image, and deployment.',
      },
      {
        title: 'Dockerized Full Stack App',
        description: 'Frontend, backend, and database running through Docker Compose.',
      },
      {
        title: 'AWS Deployment Setup',
        description: 'Deploy an app on EC2 with environment variables, domain, and logs.',
      },
      {
        title: 'Monitoring Mini Setup',
        description: 'Basic logs, health checks, alerts, and deployment notes.',
      },
    ],
    tools: [
      'Linux',
      'Git',
      'GitHub Actions',
      'Jenkins Basics',
      'Docker',
      'Docker Compose',
      'AWS EC2',
      'Nginx',
      'Shell Scripting',
      'Monitoring Basics',
    ],
    outcomes: [
      'Create CI/CD pipelines for real projects.',
      'Dockerize applications and manage environments.',
      'Deploy apps on cloud servers.',
      'Understand production logs, monitoring, and rollback basics.',
      'Prepare for DevOps associate and cloud deployment roles.',
    ],
  },
  {
    slug: 'python-data-structures + AI',
    codes: ['PYTHON_DS'],
    title: 'Python + Data Structures + AI',
    subtitle:
      'Learn Python from basics and build strong problem-solving skills with arrays, strings, recursion, linked lists, stacks, queues, trees, and interview practice.',
    level: 'Beginner',
    duration: '120 hrs',
    price: '₹2,999',
    badge: 'Programming Foundation Track',
    heroStats: [
      { label: 'Language', value: 'Python' },
      { label: 'Core', value: 'DSA' },
      { label: 'Goal', value: 'Interviews' },
    ],
    overview:
      'Python is beginner-friendly and powerful for automation, backend, data, AI, and scripting. Data Structures build the problem-solving ability needed for coding interviews and strong software development fundamentals.',
    importance: [
      'Python is easy to start and useful across software, data, automation, testing, and AI workflows.',
      'DSA improves logical thinking and interview performance.',
      'Strong fundamentals make it easier to learn backend, data science, machine learning, and automation.',
      'Problem-solving practice builds confidence for technical rounds.',
    ],
    future: [
      'Python is widely used in automation, web development, data analytics, machine learning, and AI tooling.',
      'DSA knowledge helps with coding interviews for product and service companies.',
      'Python plus SQL and analytics can lead to data roles.',
      'Python plus frameworks can lead to backend and automation roles.',
    ],
    roles: [
      {
        title: 'Python Developer',
        package: '₹3 LPA - ₹7 LPA',
        skills: 'Python, OOP, APIs, SQL',
        note: 'Good entry role when paired with projects.',
      },
      {
        title: 'Automation Engineer',
        package: '₹4 LPA - ₹9 LPA',
        skills: 'Python, Scripts, Testing, APIs',
        note: 'Focuses on automating repeated workflows.',
      },
      {
        title: 'Backend Trainee',
        package: '₹3 LPA - ₹8 LPA',
        skills: 'Python, Flask/FastAPI, DB',
        note: 'Backend path after learning APIs and databases.',
      },
      {
        title: 'Data Analyst Trainee',
        package: '₹3 LPA - ₹7 LPA',
        skills: 'Python, SQL, Pandas, Excel',
        note: 'Data path after adding analytics tools.',
      },
    ],
    roadmap: [
      {
        phase: 'Python Basics',
        goal: 'Write clean beginner-friendly programs.',
        items: ['Variables', 'Loops', 'Functions', 'Lists', 'Dictionaries', 'Files'],
      },
      {
        phase: 'OOP and Modules',
        goal: 'Structure programs properly.',
        items: ['Classes', 'Objects', 'Modules', 'Packages', 'Exceptions', 'Virtual environments'],
      },
      {
        phase: 'Core DSA',
        goal: 'Solve common interview patterns.',
        items: ['Arrays', 'Strings', 'Hash maps', 'Two pointers', 'Sliding window', 'Recursion'],
      },
      {
        phase: 'Advanced DSA',
        goal: 'Handle deeper problem-solving topics.',
        items: ['Linked lists', 'Stacks', 'Queues', 'Trees', 'Graphs basics', 'Sorting'],
      },
      {
        phase: 'Interview Practice',
        goal: 'Explain solutions clearly.',
        items: [
          'Time complexity',
          'Dry runs',
          'Pattern revision',
          'Mock coding',
          'GitHub solutions',
        ],
      },
    ],
    fastLearning: [
      'Solve 2 to 3 small problems daily instead of doing long irregular sessions.',
      'Dry run every DSA problem on paper before coding.',
      'Write your own notes for patterns like two pointers, hashing, and recursion.',
      'Review mistakes weekly and re-solve failed problems.',
      'Build small Python utilities to connect syntax with real usage.',
      'Explain every solution out loud as if in an interview.',
    ],
    projects: [
      {
        title: 'Student Result Analyzer',
        description: 'Read data, calculate grades, find toppers, and export summaries.',
      },
      {
        title: 'Expense Tracker CLI',
        description: 'Add expenses, categorize spending, save files, and generate reports.',
      },
      {
        title: 'DSA Practice Repository',
        description: 'Organized solutions by topic with explanation and complexity.',
      },
      {
        title: 'Automation Scripts Pack',
        description: 'File organizer, CSV cleaner, API checker, and report generator.',
      },
    ],
    tools: [
      'Python',
      'VS Code',
      'GitHub',
      'Jupyter Basics',
      'PyTest Basics',
      'Pandas Basics',
      'Problem Solving',
      'Big-O',
      'CLI',
    ],
    outcomes: [
      'Write Python programs confidently.',
      'Solve beginner to intermediate DSA problems.',
      'Understand time and space complexity.',
      'Build small automation and data projects.',
      'Prepare for coding rounds and Python-based roles.',
    ],
  },
  {
    slug: 'angular-enterprise',
    codes: ['ANGULAR_ENT'],
    title: 'Angular Enterprise',
    subtitle:
      'Master Angular for enterprise-grade applications with modules, standalone components, routing, forms, HTTP, auth guards, RxJS, and scalable architecture.',
    level: 'Intermediate',
    duration: '90 hrs',
    price: '₹2,999',
    badge: 'Enterprise Frontend Track',
    heroStats: [
      { label: 'Framework', value: 'Angular' },
      { label: 'Apps', value: 'Enterprise' },
      { label: 'Skill', value: 'RxJS' },
    ],
    overview:
      'Angular is a complete frontend framework used for structured, large-scale web applications. This course teaches how to build enterprise dashboards, portals, admin panels, secured routes, forms, API integrations, and maintainable frontend architecture.',
    importance: [
      'Angular is popular in enterprise teams because it provides structure, routing, forms, DI, and tooling.',
      'It is widely used with Java, .NET, and Node backend systems.',
      'Angular developers are valuable for dashboards, internal tools, SaaS apps, and business portals.',
      'Learning Angular improves TypeScript, architecture, and frontend discipline.',
    ],
    future: [
      'Angular remains strong in enterprise software, fintech dashboards, admin systems, and internal platforms.',
      'Angular plus Java Spring Boot is a powerful full stack combination.',
      'RxJS, state management, testing, and performance skills improve senior frontend opportunities.',
      'Angular knowledge can lead to frontend engineer, full stack developer, and UI architecture roles.',
    ],
    roles: [
      {
        title: 'Angular Developer',
        package: '₹4 LPA - ₹9 LPA',
        skills: 'Angular, TypeScript, Forms, APIs',
        note: 'Good role for developers who can build structured UI screens.',
      },
      {
        title: 'Frontend Engineer',
        package: '₹6 LPA - ₹14 LPA',
        skills: 'Angular, RxJS, Testing, CSS',
        note: 'Requires scalable components and strong debugging.',
      },
      {
        title: 'Java Angular Full Stack Developer',
        package: '₹7 LPA - ₹16 LPA',
        skills: 'Angular, Spring Boot, SQL',
        note: 'High-demand enterprise combination.',
      },
      {
        title: 'UI Architect',
        package: '₹14 LPA - ₹28 LPA',
        skills: 'Architecture, State, Performance',
        note: 'Advanced role for scalable frontend systems.',
      },
    ],
    roadmap: [
      {
        phase: 'TypeScript Foundation',
        goal: 'Write safe and maintainable frontend code.',
        items: [
          'Types',
          'Interfaces',
          'Classes',
          'Generics basics',
          'ES modules',
          'Decorators basics',
        ],
      },
      {
        phase: 'Angular Core',
        goal: 'Build components and page flows.',
        items: [
          'Components',
          'Templates',
          'Directives',
          'Pipes',
          'Services',
          'Dependency injection',
        ],
      },
      {
        phase: 'App Development',
        goal: 'Create real Angular applications.',
        items: ['Routing', 'Reactive forms', 'HTTP Client', 'Guards', 'Interceptors', 'Validation'],
      },
      {
        phase: 'Advanced Angular',
        goal: 'Handle enterprise frontend complexity.',
        items: [
          'RxJS',
          'Lazy loading',
          'State patterns',
          'Reusable components',
          'Error handling',
          'Performance',
        ],
      },
      {
        phase: 'Production',
        goal: 'Prepare apps for deployment and interviews.',
        items: [
          'Builds',
          'Environment files',
          'Testing basics',
          'Deployment',
          'README',
          'Code structure',
        ],
      },
    ],
    fastLearning: [
      'Understand data flow between component, template, service, and API.',
      'Practice reactive forms with validation in multiple projects.',
      'Learn RxJS through real API loading and search use cases.',
      'Use Angular CLI and folder structure consistently.',
      'Build one dashboard project with auth, tables, forms, and charts.',
      'Explain Angular architecture clearly during interviews.',
    ],
    projects: [
      {
        title: 'Admin Dashboard',
        description: 'Login, role routes, tables, filters, charts, and CRUD forms.',
      },
      {
        title: 'Course Platform Frontend',
        description: 'Course list, detail pages, checkout flow, curriculum, and dashboard.',
      },
      {
        title: 'Employee Portal',
        description: 'Reactive forms, profile pages, leave workflow, and API integration.',
      },
      {
        title: 'Analytics UI',
        description: 'Charts, date filters, summary cards, and export-ready reports.',
      },
    ],
    tools: [
      'Angular',
      'TypeScript',
      'RxJS',
      'Reactive Forms',
      'Angular Router',
      'HTTP Client',
      'Guards',
      'Interceptors',
      'SCSS/CSS',
      'GitHub',
    ],
    outcomes: [
      'Build enterprise-ready Angular applications.',
      'Connect Angular apps with backend APIs.',
      'Handle routing, forms, guards, and interceptors.',
      'Structure frontend code for maintainability.',
      'Prepare for Angular developer and frontend engineer roles.',
    ],
  },
  {
    slug: 'aws-cloud',
    codes: ['AWS_CLOUD'],
    title: 'AWS Cloud',
    subtitle:
      'Learn AWS fundamentals, cloud concepts, EC2, S3, IAM, networking basics, deployment workflows, monitoring, and cost-aware cloud practices.',
    level: 'Beginner',
    duration: '60 hrs',
    price: '₹1,999',
    badge: 'Cloud Foundation Track',
    heroStats: [
      { label: 'Cloud', value: 'AWS' },
      { label: 'Deploy', value: 'EC2' },
      { label: 'Storage', value: 'S3' },
    ],
    overview:
      'AWS Cloud skills help you understand how applications are hosted, secured, stored, monitored, and scaled. This course is designed for beginners who want practical cloud deployment knowledge and a foundation for cloud, DevOps, and backend roles.',
    importance: [
      'Most modern applications run on cloud infrastructure.',
      'AWS is widely used across startups, enterprises, SaaS products, and data platforms.',
      'Cloud knowledge helps developers deploy and troubleshoot real applications.',
      'Understanding IAM, networking, storage, and compute improves production readiness.',
    ],
    future: [
      'AWS skills support careers in cloud engineering, DevOps, backend deployment, and solution architecture.',
      'Cloud plus Docker, CI/CD, and Linux can move you toward DevOps roles.',
      'Cloud plus data services can move you toward data engineering roles.',
      'Cloud fundamentals are useful for almost every modern software team.',
    ],
    roles: [
      {
        title: 'Cloud Support Associate',
        package: '₹3 LPA - ₹7 LPA',
        skills: 'AWS basics, Linux, Networking',
        note: 'Good entry role for cloud learners.',
      },
      {
        title: 'Junior Cloud Engineer',
        package: '₹5 LPA - ₹11 LPA',
        skills: 'EC2, S3, IAM, Deployments',
        note: 'Works on cloud setup and application hosting.',
      },
      {
        title: 'DevOps Cloud Engineer',
        package: '₹7 LPA - ₹16 LPA',
        skills: 'AWS, Docker, CI/CD, Monitoring',
        note: 'Combines cloud with automation and deployments.',
      },
      {
        title: 'Solutions Architect Associate',
        package: '₹10 LPA - ₹24 LPA',
        skills: 'Architecture, Security, Scaling',
        note: 'Advanced path after strong cloud design practice.',
      },
    ],
    roadmap: [
      {
        phase: 'Cloud Basics',
        goal: 'Understand cloud concepts and AWS account setup.',
        items: [
          'Cloud models',
          'Regions',
          'Availability zones',
          'Billing basics',
          'Console',
          'Free tier safety',
        ],
      },
      {
        phase: 'Core Services',
        goal: 'Use common AWS services practically.',
        items: ['EC2', 'S3', 'IAM', 'Security groups', 'VPC basics', 'RDS basics'],
      },
      {
        phase: 'Deployment',
        goal: 'Host real applications on AWS.',
        items: [
          'Linux server',
          'SSH',
          'Nginx basics',
          'Environment variables',
          'Domain basics',
          'SSL basics',
        ],
      },
      {
        phase: 'Operations',
        goal: 'Monitor and maintain cloud apps.',
        items: ['CloudWatch basics', 'Logs', 'Backups', 'Snapshots', 'Alarms', 'Cost checks'],
      },
      {
        phase: 'Career Prep',
        goal: 'Prepare for cloud interviews and certification path.',
        items: [
          'Architecture diagrams',
          'IAM scenarios',
          'Networking basics',
          'Practice questions',
          'Project README',
        ],
      },
    ],
    fastLearning: [
      'Create a practice AWS account with billing alerts from day one.',
      'Deploy one real web app instead of only reading service theory.',
      'Draw architecture diagrams for every deployment.',
      'Practice IAM permissions carefully because cloud security matters.',
      'Learn Linux server basics along with AWS.',
      'Track monthly cost and learn cleanup steps after each practice.',
    ],
    projects: [
      {
        title: 'Static Website on S3',
        description: 'Host a static website with bucket policy and optional domain setup.',
      },
      {
        title: 'App Deployment on EC2',
        description: 'Deploy frontend/backend app on Linux EC2 with Nginx.',
      },
      {
        title: 'Database Deployment Practice',
        description: 'Connect app server with RDS and secure access.',
      },
      {
        title: 'Monitoring Setup',
        description: 'CloudWatch logs, alarms, health checks, and cost alert notes.',
      },
    ],
    tools: [
      'AWS EC2',
      'S3',
      'IAM',
      'VPC Basics',
      'RDS Basics',
      'CloudWatch',
      'Linux',
      'Nginx',
      'SSH',
      'Route 53 Basics',
    ],
    outcomes: [
      'Understand AWS fundamentals clearly.',
      'Deploy applications to cloud servers.',
      'Use EC2, S3, IAM, and monitoring basics.',
      'Follow cloud safety and cost-aware practices.',
      'Prepare for cloud support, junior cloud, and DevOps paths.',
    ],
  },
  {
    slug: 'sql-database',
    codes: ['SQL_DB'],
    title: 'SQL + Database',
    subtitle:
      'Learn SQL, database design, joins, indexes, transactions, normalization, reporting queries, and practical database thinking for software and analytics roles.',
    level: 'Beginner',
    duration: '40 hrs',
    price: '₹1,499',
    badge: 'Database Foundation Track',
    heroStats: [
      { label: 'Core', value: 'SQL' },
      { label: 'Design', value: 'Schema' },
      { label: 'Skill', value: 'Queries' },
    ],
    overview:
      'SQL is the language used to work with relational databases. Whether you become a developer, analyst, tester, backend engineer, or data engineer, SQL helps you store, retrieve, filter, join, and analyze data correctly.',
    importance: [
      'SQL is required in backend, analytics, QA, data engineering, and business reporting roles.',
      'Good database design prevents data duplication and performance problems.',
      'Joins, indexes, and transactions are core skills for real applications.',
      'Strong SQL makes debugging backend and data issues much easier.',
    ],
    future: [
      'SQL remains essential because most business systems depend on structured data.',
      'SQL plus backend skills helps Java, Node, Python, and .NET developers.',
      'SQL plus Excel/Power BI helps data analyst careers.',
      'SQL plus pipelines and cloud databases helps data engineering careers.',
    ],
    roles: [
      {
        title: 'SQL Developer Trainee',
        package: '₹3 LPA - ₹6 LPA',
        skills: 'SQL, Joins, Procedures',
        note: 'Entry role for query writing and database support.',
      },
      {
        title: 'Backend Developer',
        package: '₹4 LPA - ₹10 LPA',
        skills: 'SQL, APIs, Transactions',
        note: 'SQL is critical for database-backed applications.',
      },
      {
        title: 'Data Analyst',
        package: '₹4 LPA - ₹9 LPA',
        skills: 'SQL, Excel, BI Tools',
        note: 'Uses SQL to prepare data for reports and dashboards.',
      },
      {
        title: 'Database Engineer',
        package: '₹7 LPA - ₹16 LPA',
        skills: 'Indexes, Tuning, Design',
        note: 'Advanced path focused on performance and reliability.',
      },
    ],
    roadmap: [
      {
        phase: 'SQL Basics',
        goal: 'Retrieve and filter data confidently.',
        items: ['SELECT', 'WHERE', 'ORDER BY', 'LIMIT', 'Aliases', 'Functions'],
      },
      {
        phase: 'Joins and Grouping',
        goal: 'Work with multi-table data.',
        items: ['INNER JOIN', 'LEFT JOIN', 'GROUP BY', 'HAVING', 'Aggregations', 'Subqueries'],
      },
      {
        phase: 'Database Design',
        goal: 'Design clean schemas.',
        items: ['Tables', 'Keys', 'Relationships', 'Normalization', 'Constraints', 'ER diagrams'],
      },
      {
        phase: 'Advanced SQL',
        goal: 'Write practical production queries.',
        items: [
          'Indexes',
          'Transactions',
          'Views',
          'Stored procedures basics',
          'Window functions',
          'Query plans',
        ],
      },
      {
        phase: 'Projects',
        goal: 'Apply SQL in real scenarios.',
        items: [
          'Reporting queries',
          'Backend DB',
          'Analytics datasets',
          'Optimization practice',
          'Interview queries',
        ],
      },
    ],
    fastLearning: [
      'Practice queries daily on real-looking datasets.',
      'Draw table relationships before writing joins.',
      'Learn why a query works, not just the final syntax.',
      'Practice GROUP BY and JOIN combinations often.',
      'Use EXPLAIN plans once basics are clear.',
      'Build mini databases for school, ecommerce, HR, and courses.',
    ],
    projects: [
      {
        title: 'Course Database Design',
        description: 'Courses, batches, students, enrollments, payments, and curriculum tables.',
      },
      {
        title: 'Sales Reporting SQL',
        description: 'Revenue, top products, customer segments, monthly trends, and summaries.',
      },
      {
        title: 'HR Database',
        description: 'Employees, departments, attendance, leaves, payroll, and reporting queries.',
      },
      {
        title: 'Library Management DB',
        description: 'Books, members, issues, returns, fines, and availability queries.',
      },
    ],
    tools: [
      'SQL',
      'MySQL',
      'PostgreSQL',
      'ER Diagrams',
      'Indexes',
      'Transactions',
      'Views',
      'Stored Procedures Basics',
      'Query Optimization',
    ],
    outcomes: [
      'Write practical SQL queries confidently.',
      'Design relational database schemas.',
      'Use joins, grouping, indexes, and transactions.',
      'Support backend and analytics workflows.',
      'Prepare for SQL interview rounds.',
    ],
  },
  {
    slug: 'power-bi-analytics',
    codes: ['POWER_BI'],
    title: 'Power BI Analytics',
    subtitle:
      'Learn data analytics, dashboards, Power Query, DAX basics, data modeling, KPIs, storytelling, and business-ready reporting with Power BI.',
    level: 'Beginner',
    duration: '50 hrs',
    price: '₹1,999',
    badge: 'Business Analytics Track',
    heroStats: [
      { label: 'Dashboards', value: 'Power BI' },
      { label: 'Modeling', value: 'DAX' },
      { label: 'Output', value: 'Insights' },
    ],
    overview:
      'Power BI helps convert raw data into interactive dashboards and business insights. This course teaches data cleaning, modeling, DAX basics, visualization choices, KPI design, and presentation of insights for decision-making.',
    importance: [
      'Companies need dashboards to track sales, finance, operations, marketing, and performance.',
      'Power BI is widely used because it connects to many data sources and creates interactive reports.',
      'Analytics skills help non-coders enter data careers.',
      'Good dashboards improve business decisions by making trends and problems visible.',
    ],
    future: [
      'Data analytics continues to grow as companies become more data-driven.',
      'Power BI plus SQL and Excel is a strong entry path into analytics.',
      'Power BI plus Python can move you toward advanced analytics.',
      'Dashboard storytelling skills are useful across business, finance, HR, sales, and operations teams.',
    ],
    roles: [
      {
        title: 'Power BI Developer',
        package: '₹4 LPA - ₹9 LPA',
        skills: 'Power BI, DAX, Modeling',
        note: 'Builds dashboards and data models.',
      },
      {
        title: 'Data Analyst',
        package: '₹4 LPA - ₹10 LPA',
        skills: 'SQL, Excel, Power BI',
        note: 'Analyzes data and communicates insights.',
      },
      {
        title: 'BI Analyst',
        package: '₹5 LPA - ₹12 LPA',
        skills: 'KPIs, DAX, Reporting',
        note: 'Focuses on business reporting and decision support.',
      },
      {
        title: 'Analytics Consultant',
        package: '₹8 LPA - ₹18 LPA',
        skills: 'Dashboards, Stakeholders, Strategy',
        note: 'Works with teams to build reporting solutions.',
      },
    ],
    roadmap: [
      {
        phase: 'Data Basics',
        goal: 'Understand data formats and reporting goals.',
        items: ['Excel basics', 'CSV', 'Tables', 'Data types', 'KPIs', 'Business questions'],
      },
      {
        phase: 'Power Query',
        goal: 'Clean and transform raw data.',
        items: ['Import data', 'Remove errors', 'Merge', 'Append', 'Transform columns', 'Refresh'],
      },
      {
        phase: 'Data Modeling',
        goal: 'Create reliable dashboard models.',
        items: [
          'Relationships',
          'Star schema',
          'Date table',
          'Measures',
          'Calculated columns',
          'Filters',
        ],
      },
      {
        phase: 'DAX and Visuals',
        goal: 'Build meaningful metrics and visuals.',
        items: [
          'SUMX basics',
          'CALCULATE',
          'Time intelligence basics',
          'Charts',
          'Cards',
          'Slicers',
        ],
      },
      {
        phase: 'Dashboard Delivery',
        goal: 'Present insights professionally.',
        items: [
          'Layout',
          'Storytelling',
          'Drillthrough',
          'Publishing basics',
          'Performance basics',
        ],
      },
    ],
    fastLearning: [
      'Start every dashboard with business questions, not charts.',
      'Practice cleaning messy data in Power Query.',
      'Learn DAX slowly with small examples.',
      'Use fewer visuals with clearer KPIs.',
      'Rebuild dashboards from real business screenshots for practice.',
      'Explain insights in simple business language.',
    ],
    projects: [
      {
        title: 'Sales Performance Dashboard',
        description: 'Revenue, profit, region, category, monthly trends, and sales KPIs.',
      },
      {
        title: 'HR Analytics Dashboard',
        description:
          'Headcount, attrition, department analysis, hiring trends, and employee metrics.',
      },
      {
        title: 'Finance Dashboard',
        description: 'Income, expenses, variance, monthly performance, and cashflow overview.',
      },
      {
        title: 'Course Business Dashboard',
        description: 'Enrollments, payments, batches, leads, conversion, and student progress.',
      },
    ],
    tools: [
      'Power BI',
      'Power Query',
      'DAX Basics',
      'Excel',
      'SQL Basics',
      'Data Modeling',
      'KPIs',
      'Dashboard Design',
      'Power BI Service Basics',
    ],
    outcomes: [
      'Clean and model data for reporting.',
      'Build interactive Power BI dashboards.',
      'Create useful DAX measures.',
      'Communicate insights clearly.',
      'Prepare for Power BI developer and data analyst roles.',
    ],
  },
  {
    slug: 'nodejs-backend',
    codes: ['NODE_BACKEND'],
    title: 'Node.js Backend',
    subtitle:
      'Build scalable backend APIs using Node.js, Express, authentication, databases, validation, file handling, deployment, and production-ready backend patterns.',
    level: 'Intermediate',
    duration: '70 hrs',
    price: '₹2,499',
    badge: 'JavaScript Backend Track',
    heroStats: [
      { label: 'Runtime', value: 'Node.js' },
      { label: 'APIs', value: 'Express' },
      { label: 'Data', value: 'Mongo/SQL' },
    ],
    overview:
      'Node.js allows JavaScript to run on the backend. This course teaches API development, authentication, database integration, validation, error handling, file uploads, deployment, and backend architecture for modern web and mobile applications.',
    importance: [
      'Node.js is popular for fast API development and JavaScript full stack teams.',
      'It is widely used in startups, SaaS products, real-time apps, dashboards, and mobile app backends.',
      'Backend skills help frontend developers become full stack developers.',
      'API, database, authentication, and deployment knowledge are core software skills.',
    ],
    future: [
      'Node.js continues to be strong for APIs, microservices, serverless functions, and real-time systems.',
      'Node plus React or Angular creates a strong full stack JavaScript path.',
      'Node plus cloud and DevOps skills improves production readiness.',
      'Strong backend developers can grow into system design and architecture roles.',
    ],
    roles: [
      {
        title: 'Node.js Developer',
        package: '₹4 LPA - ₹9 LPA',
        skills: 'Node, Express, APIs, DB',
        note: 'Builds backend services and API integrations.',
      },
      {
        title: 'Backend Developer',
        package: '₹5 LPA - ₹12 LPA',
        skills: 'Auth, DB, Validation, Testing',
        note: 'Focuses on secure and reliable backend logic.',
      },
      {
        title: 'MERN/MEAN Developer',
        package: '₹6 LPA - ₹15 LPA',
        skills: 'Node, React/Angular, MongoDB',
        note: 'Full stack JavaScript development role.',
      },
      {
        title: 'API Engineer',
        package: '₹8 LPA - ₹18 LPA',
        skills: 'REST, Security, Performance',
        note: 'Advanced API design and production systems.',
      },
    ],
    roadmap: [
      {
        phase: 'JavaScript Backend Basics',
        goal: 'Understand Node runtime and async programming.',
        items: [
          'Node runtime',
          'Modules',
          'NPM',
          'Async/Await',
          'Callbacks',
          'Environment variables',
        ],
      },
      {
        phase: 'Express APIs',
        goal: 'Build clean REST APIs.',
        items: ['Express', 'Routing', 'Controllers', 'Middleware', 'Validation', 'Error handling'],
      },
      {
        phase: 'Database Integration',
        goal: 'Persist data reliably.',
        items: [
          'MongoDB basics',
          'SQL basics',
          'Mongoose/ORM basics',
          'Relationships',
          'Pagination',
          'Search',
        ],
      },
      {
        phase: 'Security and Auth',
        goal: 'Secure backend applications.',
        items: [
          'JWT',
          'Password hashing',
          'Roles',
          'CORS',
          'Rate limiting basics',
          'Input validation',
        ],
      },
      {
        phase: 'Production',
        goal: 'Deploy and monitor backend services.',
        items: [
          'Logging',
          'Testing basics',
          'Docker basics',
          'Deployment',
          'API docs',
          'Postman collections',
        ],
      },
    ],
    fastLearning: [
      'Build CRUD APIs before jumping to complex architecture.',
      'Use Postman for every endpoint and save collections.',
      'Practice validation and error handling in every API.',
      'Learn authentication flow deeply with JWT and roles.',
      'Read API logs when debugging instead of guessing.',
      'Deploy one backend project and document environment setup.',
    ],
    projects: [
      {
        title: 'Task API Backend',
        description: 'Auth, users, projects, tasks, filters, status updates, and role permissions.',
      },
      {
        title: 'Ecommerce Backend',
        description: 'Products, cart, orders, payments status, admin APIs, and reports.',
      },
      {
        title: 'Course LMS API',
        description: 'Courses, batches, students, enrollments, curriculum, and trainer APIs.',
      },
      {
        title: 'File Upload Service',
        description: 'Image upload, validation, storage, metadata, and secure access.',
      },
    ],
    tools: [
      'Node.js',
      'Express',
      'JavaScript',
      'MongoDB',
      'SQL Basics',
      'JWT',
      'Postman',
      'Multer',
      'GitHub',
      'Docker Basics',
    ],
    outcomes: [
      'Build REST APIs using Node.js and Express.',
      'Connect APIs with databases.',
      'Implement authentication, roles, and validation.',
      'Deploy backend projects.',
      'Prepare for Node.js backend and full stack roles.',
    ],
  },
  {
    slug: 'spring-boot-microservices',
    codes: ['SPRING_MICRO'],
    title: 'Spring Boot Microservices',
    subtitle:
      'Learn advanced Spring Boot microservices with service discovery, API gateway, config server, inter-service communication, Kafka basics, Docker, observability, and cloud-ready architecture.',
    level: 'Advanced',
    duration: '150 hrs',
    price: '₹5,999',
    badge: 'Advanced Java Architecture Track',
    heroStats: [
      { label: 'Pattern', value: 'Microservices' },
      { label: 'Stack', value: 'Spring Cloud' },
      { label: 'Scale', value: 'Cloud Ready' },
    ],
    overview:
      'Microservices architecture splits large applications into smaller independently deployable services. This course is for learners who already know Java and Spring Boot basics and want to build scalable, cloud-ready enterprise systems.',
    importance: [
      'Large enterprise systems use microservices to improve scalability and team independence.',
      'Spring Cloud provides practical tools for discovery, gateway, config, and resilience patterns.',
      'Microservices knowledge is important for senior backend and architecture roles.',
      'Understanding service communication, observability, and deployment improves production readiness.',
    ],
    future: [
      'Microservices remain important in cloud-native enterprise architecture.',
      'Spring Boot microservices are widely used in fintech, banking, ecommerce, telecom, and SaaS platforms.',
      'Skills in Kafka, Docker, Kubernetes, and observability increase senior-level opportunities.',
      'This path can lead toward senior backend developer, solution architect, and technical lead roles.',
    ],
    roles: [
      {
        title: 'Senior Java Developer',
        package: '₹10 LPA - ₹20 LPA',
        skills: 'Spring Boot, APIs, DB, Security',
        note: 'Builds complex backend services.',
      },
      {
        title: 'Microservices Developer',
        package: '₹12 LPA - ₹24 LPA',
        skills: 'Spring Cloud, Gateway, Kafka',
        note: 'Works on distributed service-based systems.',
      },
      {
        title: 'Backend Architect',
        package: '₹18 LPA - ₹35 LPA',
        skills: 'System Design, Cloud, Reliability',
        note: 'Designs scalable backend architecture.',
      },
      {
        title: 'Technical Lead',
        package: '₹20 LPA - ₹40 LPA',
        skills: 'Architecture, Reviews, Delivery',
        note: 'Leads backend teams and engineering decisions.',
      },
    ],
    roadmap: [
      {
        phase: 'Spring Boot Depth',
        goal: 'Strengthen backend fundamentals.',
        items: ['REST APIs', 'JPA', 'Security', 'Validation', 'Testing', 'Profiles'],
      },
      {
        phase: 'Microservices Core',
        goal: 'Split systems into services.',
        items: [
          'Service boundaries',
          'Discovery',
          'API Gateway',
          'Config server',
          'Feign',
          'Load balancing',
        ],
      },
      {
        phase: 'Resilience and Messaging',
        goal: 'Handle distributed system failures.',
        items: [
          'Circuit breaker',
          'Retries',
          'Timeouts',
          'Kafka basics',
          'Async events',
          'Idempotency',
        ],
      },
      {
        phase: 'Observability',
        goal: 'Understand system behavior in production.',
        items: [
          'Logs',
          'Tracing basics',
          'Metrics',
          'Health checks',
          'Correlation IDs',
          'Dashboards',
        ],
      },
      {
        phase: 'Deployment',
        goal: 'Run services in production-style environments.',
        items: ['Docker', 'Docker Compose', 'CI/CD basics', 'Cloud basics', 'Kubernetes overview'],
      },
    ],
    fastLearning: [
      'Start with a monolith and split it into services to understand boundaries.',
      'Practice failure scenarios like service down, timeout, duplicate event, and bad config.',
      'Draw architecture diagrams before coding services.',
      'Use Docker Compose to run multiple services locally.',
      'Log correlation IDs across services for debugging.',
      'Explain tradeoffs, not just tools, in interviews.',
    ],
    projects: [
      {
        title: 'Microservices Ecommerce',
        description:
          'User, product, order, payment, notification services with gateway and discovery.',
      },
      {
        title: 'Banking Microservices',
        description:
          'Accounts, transactions, audit logs, notifications, and secure service communication.',
      },
      {
        title: 'Course Platform Services',
        description:
          'Course, batch, enrollment, payment, curriculum, and student progress services.',
      },
      {
        title: 'Event-Driven Order System',
        description: 'Kafka-based events for order placed, payment success, and notification flow.',
      },
    ],
    tools: [
      'Java',
      'Spring Boot',
      'Spring Cloud',
      'Eureka',
      'API Gateway',
      'Config Server',
      'Feign',
      'Kafka Basics',
      'Docker',
      'Observability Basics',
    ],
    outcomes: [
      'Design and build Spring Boot microservices.',
      'Use gateway, discovery, config, and service communication.',
      'Understand resilience, messaging, and observability.',
      'Run multi-service systems using Docker.',
      'Prepare for senior Java and microservices roles.',
    ],
  },
  {
    slug: 'ui-ux-design',
    codes: ['UI_UX'],
    title: 'UI/UX Design',
    subtitle:
      'Learn user research, wireframing, visual design, design systems, prototyping, usability, portfolio projects, and product-thinking for modern digital experiences.',
    level: 'Beginner',
    duration: '40 hrs',
    price: '₹1,499',
    badge: 'Product Design Foundation Track',
    heroStats: [
      { label: 'Design', value: 'UI/UX' },
      { label: 'Tool', value: 'Figma' },
      { label: 'Output', value: 'Portfolio' },
    ],
    overview:
      'UI/UX Design is about creating digital products that are useful, easy to use, and visually clear. This course teaches research, user flows, wireframes, layouts, typography, color, components, prototypes, and portfolio presentation.',
    importance: [
      'Good design improves user trust, conversion, retention, and product usability.',
      'Companies need designers who can understand users and communicate product solutions.',
      'Figma and design systems are standard tools in product teams.',
      'UI/UX skills are useful for designers, frontend developers, founders, and product teams.',
    ],
    future: [
      'Digital products continue to need better user experiences across mobile, web, SaaS, and internal tools.',
      'Design systems, accessibility, product thinking, and UX research improve career growth.',
      'UI/UX can lead to product designer, UX researcher, visual designer, and design system roles.',
      'Design plus frontend knowledge creates strong UI engineering opportunities.',
    ],
    roles: [
      {
        title: 'UI Designer',
        package: '₹3 LPA - ₹7 LPA',
        skills: 'Figma, Layout, Visual Design',
        note: 'Focuses on polished screens and brand-aligned visuals.',
      },
      {
        title: 'UX Designer',
        package: '₹4 LPA - ₹9 LPA',
        skills: 'Research, Flows, Wireframes',
        note: 'Focuses on usability and user journeys.',
      },
      {
        title: 'Product Designer',
        package: '₹6 LPA - ₹15 LPA',
        skills: 'UX, UI, Product Thinking',
        note: 'Combines research, interaction, and visual design.',
      },
      {
        title: 'Design System Designer',
        package: '₹8 LPA - ₹18 LPA',
        skills: 'Components, Tokens, Systems',
        note: 'Builds scalable reusable design systems.',
      },
    ],
    roadmap: [
      {
        phase: 'Design Basics',
        goal: 'Understand visual and UX fundamentals.',
        items: ['Typography', 'Color', 'Spacing', 'Hierarchy', 'Alignment', 'Accessibility basics'],
      },
      {
        phase: 'UX Process',
        goal: 'Solve user problems with structure.',
        items: [
          'User research',
          'Personas',
          'User flows',
          'Information architecture',
          'Wireframes',
          'Usability',
        ],
      },
      {
        phase: 'Figma Skills',
        goal: 'Create professional designs efficiently.',
        items: ['Frames', 'Auto layout', 'Components', 'Variants', 'Styles', 'Prototypes'],
      },
      {
        phase: 'Product Screens',
        goal: 'Design complete app experiences.',
        items: [
          'Landing pages',
          'Dashboards',
          'Forms',
          'Mobile screens',
          'Empty states',
          'Error states',
        ],
      },
      {
        phase: 'Portfolio',
        goal: 'Present work professionally.',
        items: [
          'Case studies',
          'Problem statements',
          'Process',
          'Before/after',
          'Prototype links',
          'Design rationale',
        ],
      },
    ],
    fastLearning: [
      'Copy high-quality interfaces first to train spacing and hierarchy.',
      'Do not start with colors; start with layout and user flow.',
      'Use auto layout for every serious Figma design.',
      'Explain design decisions using user goals, not personal taste.',
      'Create case studies with problem, process, solution, and result.',
      'Review real apps daily and identify why each screen works.',
    ],
    projects: [
      {
        title: 'Learning App Design',
        description: 'Course listing, detail page, checkout, curriculum, and student dashboard.',
      },
      {
        title: 'Finance Dashboard',
        description: 'KPI cards, charts, filters, tables, and responsive dashboard states.',
      },
      {
        title: 'Mobile Food App',
        description: 'Onboarding, menu, cart, checkout, tracking, and order history.',
      },
      {
        title: 'Design System Kit',
        description: 'Buttons, forms, cards, navigation, typography, colors, and component rules.',
      },
    ],
    tools: [
      'Figma',
      'Auto Layout',
      'Components',
      'Prototyping',
      'Wireframes',
      'Design Systems',
      'User Flows',
      'Typography',
      'Color Theory',
    ],
    outcomes: [
      'Design clean and usable web/mobile screens.',
      'Create wireframes, prototypes, and user flows.',
      'Use Figma professionally.',
      'Build portfolio-ready case studies.',
      'Prepare for UI designer, UX designer, and product designer roles.',
    ],
  },
  {
    slug: 'cyber-security',
    codes: ['CYBER_SEC'],
    title: 'Cyber Security',
    subtitle:
      'Learn security fundamentals, networking basics, Linux, web security, OWASP, vulnerability assessment, secure practices, and beginner-friendly security projects.',
    level: 'Intermediate',
    duration: '90 hrs',
    price: '₹3,499',
    badge: 'Security Foundation Track',
    heroStats: [
      { label: 'Core', value: 'Security' },
      { label: 'Web', value: 'OWASP' },
      { label: 'Skill', value: 'Defense' },
    ],
    overview:
      'Cyber Security protects systems, networks, applications, and data from attacks. This course focuses on fundamentals, ethical security practices, web vulnerabilities, secure configuration, monitoring basics, and hands-on labs.',
    importance: [
      'Every company needs to protect user data, infrastructure, applications, and internal systems.',
      'Security knowledge helps developers write safer code.',
      'OWASP vulnerabilities are common in real web applications.',
      'Cybersecurity creates long-term career paths in defense, testing, compliance, and operations.',
    ],
    future: [
      'Cybersecurity demand grows as cloud, digital payments, SaaS, and online services expand.',
      'Security fundamentals can lead to SOC, VAPT, cloud security, application security, and GRC roles.',
      'Developers with security knowledge are valuable for secure engineering teams.',
      'Cloud security and application security are especially strong growth areas.',
    ],
    roles: [
      {
        title: 'SOC Analyst',
        package: '₹3.5 LPA - ₹8 LPA',
        skills: 'Logs, Alerts, SIEM Basics',
        note: 'Monitors and investigates security alerts.',
      },
      {
        title: 'Security Analyst',
        package: '₹5 LPA - ₹12 LPA',
        skills: 'Networking, Linux, Vulnerabilities',
        note: 'Works on risk, investigation, and remediation.',
      },
      {
        title: 'VAPT Associate',
        package: '₹5 LPA - ₹14 LPA',
        skills: 'OWASP, Testing, Reports',
        note: 'Tests applications and documents vulnerabilities ethically.',
      },
      {
        title: 'Application Security Engineer',
        package: '₹10 LPA - ₹24 LPA',
        skills: 'Secure Code, OWASP, DevSecOps',
        note: 'Advanced role focused on secure software development.',
      },
    ],
    roadmap: [
      {
        phase: 'Foundations',
        goal: 'Understand basic security and networking.',
        items: ['CIA triad', 'TCP/IP', 'Ports', 'DNS', 'HTTP/HTTPS', 'Authentication basics'],
      },
      {
        phase: 'Linux and Tools',
        goal: 'Use security-friendly environments.',
        items: [
          'Linux commands',
          'Permissions',
          'Logs',
          'Nmap basics',
          'Burp basics',
          'Wireshark basics',
        ],
      },
      {
        phase: 'Web Security',
        goal: 'Understand common application risks.',
        items: ['OWASP Top 10', 'SQL Injection', 'XSS', 'CSRF', 'Broken auth', 'Access control'],
      },
      {
        phase: 'Defense',
        goal: 'Apply secure practices.',
        items: [
          'Password hashing',
          'JWT safety',
          'Input validation',
          'HTTPS',
          'Secure headers',
          'Logging',
        ],
      },
      {
        phase: 'Career Prep',
        goal: 'Build ethical security portfolio.',
        items: ['Lab notes', 'Reports', 'CTF basics', 'Remediation steps', 'Interview scenarios'],
      },
    ],
    fastLearning: [
      'Learn networking basics before jumping into tools.',
      'Practice only in legal labs and your own test applications.',
      'Write vulnerability reports with impact and fix, not only screenshots.',
      'Understand why a vulnerability happens in code.',
      'Maintain a security notes repository.',
      'Pair security learning with backend basics for stronger app security.',
    ],
    projects: [
      {
        title: 'OWASP Demo Lab',
        description:
          'Practice SQL injection, XSS, auth issues, and remediation in a safe test app.',
      },
      {
        title: 'Secure Login System',
        description: 'Password hashing, JWT, role checks, validation, and secure headers.',
      },
      {
        title: 'Network Scan Report',
        description: 'Scan a legal lab environment and document ports, risks, and fixes.',
      },
      {
        title: 'Security Checklist for Web App',
        description:
          'Authentication, authorization, input validation, logging, and deployment checks.',
      },
    ],
    tools: [
      'Linux',
      'Networking Basics',
      'OWASP Top 10',
      'Burp Suite Basics',
      'Nmap Basics',
      'Wireshark Basics',
      'JWT Security',
      'Secure Coding',
    ],
    outcomes: [
      'Understand cybersecurity fundamentals.',
      'Identify common web application vulnerabilities.',
      'Follow ethical and legal security practices.',
      'Write basic security reports and remediation notes.',
      'Prepare for SOC, security analyst, and VAPT beginner roles.',
    ],
  },
  {
    slug: 'machine-learning',
    codes: ['ML_AI'],
    title: 'Machine Learning',
    subtitle:
      'Learn machine learning algorithms, Python data stack, model training, evaluation, feature engineering, real projects, and practical AI workflows.',
    level: 'Advanced',
    duration: '140 hrs',
    price: '₹6,999',
    badge: 'AI and ML Project Track',
    heroStats: [
      { label: 'Language', value: 'Python' },
      { label: 'Core', value: 'ML Models' },
      { label: 'Output', value: 'AI Projects' },
    ],
    overview:
      'Machine Learning teaches computers to find patterns in data and make predictions. This course covers Python, data preparation, supervised and unsupervised learning, model evaluation, feature engineering, and project-based ML implementation.',
    importance: [
      'AI and ML are being used in recommendations, fraud detection, forecasting, automation, and analytics.',
      'ML skills help learners understand data-driven product features.',
      'Python, statistics, and model evaluation are valuable in modern data teams.',
      'Project-based ML portfolios help show practical ability beyond theory.',
    ],
    future: [
      'ML continues to grow across analytics, automation, AI products, personalization, and decision systems.',
      'ML plus data engineering helps with production ML pipelines.',
      'ML plus cloud and APIs helps deploy models into real applications.',
      'Strong fundamentals can lead toward data scientist, ML engineer, and AI application developer paths.',
    ],
    roles: [
      {
        title: 'ML Intern/Trainee',
        package: '₹3 LPA - ₹7 LPA',
        skills: 'Python, Pandas, ML Basics',
        note: 'Entry path with strong projects and fundamentals.',
      },
      {
        title: 'Data Scientist',
        package: '₹6 LPA - ₹16 LPA',
        skills: 'ML, Statistics, SQL, Python',
        note: 'Builds models and extracts insights from data.',
      },
      {
        title: 'ML Engineer',
        package: '₹8 LPA - ₹22 LPA',
        skills: 'Models, APIs, MLOps Basics',
        note: 'Focuses on deploying and maintaining ML systems.',
      },
      {
        title: 'AI Application Developer',
        package: '₹7 LPA - ₹18 LPA',
        skills: 'ML, APIs, AI Tools, Python',
        note: 'Builds AI-powered product features.',
      },
    ],
    roadmap: [
      {
        phase: 'Python Data Stack',
        goal: 'Prepare and explore datasets.',
        items: ['Python', 'NumPy', 'Pandas', 'Matplotlib', 'Seaborn', 'Jupyter'],
      },
      {
        phase: 'Math and Stats Basics',
        goal: 'Understand model behavior.',
        items: [
          'Mean/median',
          'Variance',
          'Probability basics',
          'Correlation',
          'Linear algebra basics',
          'Metrics',
        ],
      },
      {
        phase: 'Supervised Learning',
        goal: 'Train prediction models.',
        items: [
          'Regression',
          'Classification',
          'Decision trees',
          'Random forest',
          'SVM basics',
          'Model evaluation',
        ],
      },
      {
        phase: 'Unsupervised and Features',
        goal: 'Find patterns and improve models.',
        items: [
          'Clustering',
          'PCA basics',
          'Feature engineering',
          'Encoding',
          'Scaling',
          'Pipelines',
        ],
      },
      {
        phase: 'Deployment Basics',
        goal: 'Turn models into usable projects.',
        items: [
          'Model saving',
          'FastAPI basics',
          'Streamlit basics',
          'Model API',
          'Project documentation',
        ],
      },
    ],
    fastLearning: [
      'Start with clean datasets before moving to messy real-world data.',
      'Learn evaluation metrics carefully because accuracy alone is not enough.',
      'Build one notebook and one deployable app for each major project.',
      'Write conclusions in business language, not only charts.',
      'Compare multiple models and explain why one performs better.',
      'Keep datasets, notebooks, model files, and README organized.',
    ],
    projects: [
      {
        title: 'House Price Prediction',
        description: 'Regression, feature engineering, evaluation, and prediction UI.',
      },
      {
        title: 'Customer Churn Prediction',
        description: 'Classification model to identify users likely to leave.',
      },
      {
        title: 'Loan Approval Model',
        description: 'Data cleaning, encoding, model comparison, and fairness discussion.',
      },
      {
        title: 'Recommendation Mini System',
        description: 'Content-based recommendations with similarity scoring.',
      },
    ],
    tools: [
      'Python',
      'NumPy',
      'Pandas',
      'Scikit-learn',
      'Matplotlib',
      'Seaborn',
      'Jupyter',
      'FastAPI Basics',
      'Streamlit Basics',
      'GitHub',
    ],
    outcomes: [
      'Prepare and analyze datasets using Python.',
      'Train and evaluate machine learning models.',
      'Build ML projects with clear explanations.',
      'Deploy basic ML demos.',
      'Prepare for ML trainee, data scientist, and AI project roles.',
    ],
  },
  {
    slug: 'flutter-mobile-apps',
    codes: ['FLUTTER'],
    title: 'Flutter Mobile Apps',
    subtitle:
      'Build cross-platform mobile apps using Flutter, Dart, widgets, navigation, forms, APIs, state management, Firebase basics, and app deployment workflow.',
    level: 'Intermediate',
    duration: '100 hrs',
    price: '₹3,499',
    badge: 'Cross-Platform Mobile Track',
    heroStats: [
      { label: 'Mobile', value: 'Flutter' },
      { label: 'Language', value: 'Dart' },
      { label: 'Output', value: 'Apps' },
    ],
    overview:
      'Flutter lets you build Android and iOS apps from one codebase. This course focuses on UI widgets, layouts, navigation, API integration, state management, Firebase basics, app architecture, and portfolio-ready mobile applications.',
    importance: [
      'Flutter reduces development effort by using one codebase for multiple platforms.',
      'It is popular for startups, MVPs, product apps, internal tools, and mobile-first businesses.',
      'Strong Flutter developers can build polished UI and connect apps with real APIs.',
      'Mobile app skills are useful for freelance, startup, and product development paths.',
    ],
    future: [
      'Cross-platform mobile development continues to grow for fast product delivery.',
      'Flutter plus Firebase is strong for MVPs and startup apps.',
      'Flutter plus backend/API skills can lead to full stack mobile development.',
      'Advanced Flutter developers can move into mobile architecture and lead roles.',
    ],
    roles: [
      {
        title: 'Flutter Developer',
        package: '₹3.5 LPA - ₹8 LPA',
        skills: 'Flutter, Dart, APIs',
        note: 'Builds cross-platform mobile apps.',
      },
      {
        title: 'Mobile App Developer',
        package: '₹5 LPA - ₹12 LPA',
        skills: 'State, Firebase, REST APIs',
        note: 'Works on production app features.',
      },
      {
        title: 'Full Stack Mobile Developer',
        package: '₹7 LPA - ₹16 LPA',
        skills: 'Flutter, Backend, DB',
        note: 'Builds mobile app plus backend integration.',
      },
      {
        title: 'Mobile Lead',
        package: '₹12 LPA - ₹25 LPA',
        skills: 'Architecture, Performance, Releases',
        note: 'Advanced role for app architecture and delivery.',
      },
    ],
    roadmap: [
      {
        phase: 'Dart Basics',
        goal: 'Write Flutter-friendly Dart code.',
        items: ['Variables', 'Functions', 'Classes', 'Null safety', 'Async/Await', 'Collections'],
      },
      {
        phase: 'Flutter UI',
        goal: 'Build beautiful responsive screens.',
        items: ['Widgets', 'Layouts', 'Material UI', 'Forms', 'Lists', 'Responsive design'],
      },
      {
        phase: 'Navigation and State',
        goal: 'Create app flows and manage data.',
        items: [
          'Navigation',
          'Routes',
          'Provider basics',
          'Stateful widgets',
          'Validation',
          'Local storage',
        ],
      },
      {
        phase: 'API and Firebase',
        goal: 'Connect apps with real services.',
        items: [
          'HTTP APIs',
          'JSON parsing',
          'Auth basics',
          'Firestore basics',
          'File upload',
          'Error states',
        ],
      },
      {
        phase: 'Release Prep',
        goal: 'Make apps portfolio-ready.',
        items: [
          'App icons',
          'Build APK',
          'Testing basics',
          'Performance basics',
          'README',
          'Demo video',
        ],
      },
    ],
    fastLearning: [
      'Build layouts from real app screenshots to improve UI speed.',
      'Learn widget composition instead of creating huge widget files.',
      'Practice API loading, empty, and error states in every app.',
      'Use reusable components for buttons, cards, inputs, and list items.',
      'Test on different screen sizes early.',
      'Record demo videos for your portfolio apps.',
    ],
    projects: [
      {
        title: 'Learning App',
        description: 'Course list, details, video screen, progress, and profile.',
      },
      {
        title: 'Expense Tracker App',
        description: 'Add expenses, categories, charts, filters, and local storage.',
      },
      {
        title: 'Food Delivery App',
        description: 'Menu, cart, checkout, order tracking, and Firebase auth.',
      },
      {
        title: 'Task Manager App',
        description: 'Projects, tasks, due dates, status, reminders, and API sync.',
      },
    ],
    tools: [
      'Flutter',
      'Dart',
      'Material UI',
      'Provider Basics',
      'REST APIs',
      'Firebase Basics',
      'Local Storage',
      'Android Studio',
      'GitHub',
    ],
    outcomes: [
      'Build cross-platform mobile apps with Flutter.',
      'Create clean mobile UI using widgets and layouts.',
      'Connect apps with APIs and Firebase basics.',
      'Prepare app builds and portfolio demos.',
      'Prepare for Flutter and mobile app developer roles.',
    ],
  },
  {
    slug: 'data-engineering',
    codes: ['DATA_ENG'],
    title: 'Data Engineering',
    subtitle:
      'Learn big data pipelines, SQL, Python, ETL, data warehouses, orchestration, Spark basics, cloud storage, and production data workflow concepts.',
    level: 'Advanced',
    duration: '160 hrs',
    price: '₹7,999',
    badge: 'Big Data Pipeline Track',
    heroStats: [
      { label: 'Pipelines', value: 'ETL' },
      { label: 'Scale', value: 'Big Data' },
      { label: 'Cloud', value: 'Data Lake' },
    ],
    overview:
      'Data Engineering is about collecting, transforming, storing, and delivering data so analysts, dashboards, ML models, and business teams can use it reliably. This course focuses on SQL, Python, ETL pipelines, data modeling, Spark basics, orchestration, and cloud-ready data workflows.',
    importance: [
      'Every data-driven company needs reliable pipelines and clean data.',
      'Data engineers make analytics, reporting, and machine learning possible.',
      'SQL, Python, ETL, and cloud storage are core skills for modern data platforms.',
      'Data engineering roles are valuable because they combine software, databases, and cloud systems.',
    ],
    future: [
      'Data engineering demand grows with analytics, AI, personalization, and real-time decision systems.',
      'Cloud data platforms and lakehouse architectures are becoming common.',
      'Data engineering plus ML knowledge can lead to MLOps and AI platform roles.',
      'Strong pipeline and data modeling skills are useful across finance, ecommerce, healthcare, SaaS, and logistics.',
    ],
    roles: [
      {
        title: 'Junior Data Engineer',
        package: '₹5 LPA - ₹10 LPA',
        skills: 'SQL, Python, ETL',
        note: 'Builds and maintains basic data pipelines.',
      },
      {
        title: 'Data Engineer',
        package: '₹8 LPA - ₹18 LPA',
        skills: 'Pipelines, Warehousing, Spark',
        note: 'Works on scalable data movement and transformation.',
      },
      {
        title: 'Big Data Engineer',
        package: '₹12 LPA - ₹26 LPA',
        skills: 'Spark, Cloud, Distributed Data',
        note: 'Handles large-scale data processing.',
      },
      {
        title: 'Analytics Engineer',
        package: '₹8 LPA - ₹20 LPA',
        skills: 'SQL, Modeling, BI, dbt Basics',
        note: 'Connects data engineering with business analytics.',
      },
    ],
    roadmap: [
      {
        phase: 'Data Foundations',
        goal: 'Understand data systems and query logic.',
        items: ['SQL', 'Joins', 'Indexes', 'Data types', 'Normalization', 'Data quality'],
      },
      {
        phase: 'Python for Data',
        goal: 'Automate data processing tasks.',
        items: ['Python files', 'CSV/JSON', 'Pandas', 'APIs', 'Error handling', 'Logging'],
      },
      {
        phase: 'ETL Pipelines',
        goal: 'Move and transform data reliably.',
        items: ['Extract', 'Transform', 'Load', 'Batch jobs', 'Scheduling', 'Incremental loads'],
      },
      {
        phase: 'Warehousing and Big Data',
        goal: 'Model and process large datasets.',
        items: [
          'Data warehouse',
          'Star schema',
          'Partitioning',
          'Spark basics',
          'Parquet',
          'Data lake basics',
        ],
      },
      {
        phase: 'Production Workflow',
        goal: 'Operate pipelines like real teams.',
        items: [
          'Airflow basics',
          'Monitoring',
          'Retries',
          'Data validation',
          'Cloud storage',
          'Documentation',
        ],
      },
    ],
    fastLearning: [
      'Practice SQL deeply because it is the daily language of data engineering.',
      'Build small ETL pipelines before learning big data tools.',
      'Log every pipeline step and handle failures clearly.',
      'Learn file formats like CSV, JSON, and Parquet with real examples.',
      'Model data for analytics, not just storage.',
      'Document pipeline inputs, transformations, outputs, and refresh logic.',
    ],
    projects: [
      {
        title: 'Sales ETL Pipeline',
        description:
          'Extract CSV/API data, clean it with Python, load into SQL, and create reporting tables.',
      },
      {
        title: 'Data Warehouse Model',
        description: 'Build fact and dimension tables for sales, customers, products, and dates.',
      },
      {
        title: 'Log Processing Pipeline',
        description: 'Parse application logs, create metrics, and store analytics-ready output.',
      },
      {
        title: 'Cloud Data Lake Mini Project',
        description:
          'Organize raw, cleaned, and curated datasets with partitioning and documentation.',
      },
    ],
    tools: [
      'SQL',
      'Python',
      'Pandas',
      'ETL',
      'Airflow Basics',
      'Spark Basics',
      'Data Warehouse',
      'Parquet',
      'Cloud Storage Basics',
      'GitHub',
    ],
    outcomes: [
      'Build practical ETL data pipelines.',
      'Write strong SQL for analytics and transformation.',
      'Understand data warehouse and big data basics.',
      'Use Python for data automation.',
      'Prepare for data engineer and analytics engineer roles.',
    ],
  },
];

type CourseRoadmap = CourseDetail['roadmap'];

interface CourseDetailExpansion {
  roadmap: CourseRoadmap;
  importance: string[];
  future: string[];
  fastLearning: string[];
  projects: CourseDetail['projects'];
  tools: string[];
  outcomes: string[];
}

const PREMIUM_COURSE_DETAIL_EXPANSIONS: Record<string, CourseDetailExpansion> = {
  'java-full-stack': {
    roadmap: [
      {
        phase: 'Phase 1: Java Programming Foundation',
        goal: 'Build a strong base in Java syntax, problem solving, memory thinking, and clean coding habits.',
        items: [
          'JDK, JRE, JVM, Java setup, IDE setup, project structure',
          'Variables, data types, operators, type casting, input and output',
          'Control flow: if, switch, loops, nested loops, pattern problems',
          'Methods, parameters, return values, method overloading',
          'Arrays, strings, string methods, StringBuilder, immutability',
          'OOP basics: class, object, constructor, this keyword',
          'OOP pillars: inheritance, polymorphism, abstraction, encapsulation',
          'Interfaces, abstract classes, access modifiers, packages',
          'Exception handling, checked vs unchecked exceptions, custom exceptions',
          'Collections: List, Set, Map, Queue, sorting, comparators',
          'Java 8: lambda, streams, filter, map, reduce, optional',
          'Debugging Java programs using breakpoints and stack traces',
        ],
      },
      {
        phase: 'Phase 2: SQL and Database Engineering',
        goal: 'Design relational data models and write queries required for real backend applications.',
        items: [
          'Database basics, tables, rows, columns, primary keys, foreign keys',
          'SELECT, WHERE, ORDER BY, LIMIT, DISTINCT, aliases',
          'Aggregate functions, GROUP BY, HAVING, report-style queries',
          'INNER JOIN, LEFT JOIN, RIGHT JOIN, multi-table joins',
          'Subqueries, nested queries, EXISTS, IN, NOT IN',
          'Normalization, one-to-one, one-to-many, many-to-many relationships',
          'Indexes, query performance basics, EXPLAIN plan understanding',
          'Transactions, ACID, commit, rollback, isolation basics',
          'Schema design for users, roles, orders, payments, courses, enrollments',
          'Practical SQL debugging for backend API issues',
        ],
      },
      {
        phase: 'Phase 3: Spring Boot Backend Development',
        goal: 'Create production-style REST APIs with clean layers, validation, database integration, and exception handling.',
        items: [
          'Spring Boot project setup, Maven, dependencies, application properties',
          'REST API basics: GET, POST, PUT, PATCH, DELETE',
          'Controller, service, repository, DTO, entity layer separation',
          'Request body, path variable, query params, response entity',
          'Spring Data JPA repositories, derived queries, custom queries',
          'Hibernate mapping: OneToOne, OneToMany, ManyToOne, ManyToMany',
          'Validation annotations, DTO validation, custom validation messages',
          'Global exception handling using ControllerAdvice',
          'Pagination, sorting, search filters, status filters',
          'File upload basics, image URL handling, metadata fields',
          'API response wrapper, success and error response structure',
          'Postman collections and API testing workflow',
        ],
      },
      {
        phase: 'Phase 4: Authentication, Authorization, and Security',
        goal: 'Secure backend APIs using login flow, JWT, roles, permissions, and safe request handling.',
        items: [
          'Authentication vs authorization concepts',
          'Password hashing, BCrypt, secure password storage',
          'JWT token generation, token validation, expiry handling',
          'Spring Security filter chain and protected routes',
          'Role-based access: STUDENT, ADMIN, TRAINER, SUPER_ADMIN',
          'CORS setup for Angular frontend integration',
          'Login, register, set password, forgot password flow basics',
          'Secure API design for checkout, enrollment, dashboard, admin actions',
          'Common security mistakes and how to avoid them',
          'Testing secured APIs using Postman bearer token',
        ],
      },
      {
        phase: 'Phase 5: Angular Frontend Integration',
        goal: 'Build structured Angular screens and connect them with Spring Boot APIs.',
        items: [
          'Angular project structure, components, services, modules or standalone components',
          'Templates, interpolation, property binding, event binding, ngIf, ngFor',
          'Reactive forms, form validation, error messages',
          'Routing, route params, query params, child routes',
          'HttpClient, API services, loading states, error states',
          'Authentication storage, route guards, role-based navigation',
          'Course list page, course details page, checkout page, dashboard page',
          'Reusable cards, badges, buttons, tables, filters, modals',
          'Responsive UI with CSS grid, flexbox, media queries',
          'Frontend debugging using console, network tab, and API response inspection',
        ],
      },
      {
        phase: 'Phase 6: Full Stack Project Architecture',
        goal: 'Combine frontend, backend, database, auth, and real business workflows into a complete application.',
        items: [
          'Course enrollment platform architecture',
          'Entity design for users, courses, batches, enrollments, payments, curriculum',
          'Admin course manager, publish/archive flow, bulk upload flow',
          'Student dashboard, active batch, curriculum preview, learning flow',
          'Trainer batch management and content flow',
          'Checkout flow and enrollment validation',
          'API contract planning between Angular and Spring Boot',
          'Reusable response models and frontend mapping functions',
          'End-to-end debugging from UI click to database record',
          'GitHub README with setup, screenshots, API list, and architecture diagram',
        ],
      },
      {
        phase: 'Phase 7: Testing, Deployment, and Interview Readiness',
        goal: 'Make projects explainable, deployable, and ready for job interviews.',
        items: [
          'Unit testing basics for service methods',
          'API testing for success, validation, unauthorized, and not-found cases',
          'Build Angular app for production',
          'Build Spring Boot JAR and run with environment variables',
          'Docker basics: Dockerfile, image, container, docker-compose',
          'Deploy frontend and backend basics on cloud/server',
          'Database backup, migration notes, and seed data',
          'Prepare project explanation: problem, users, modules, architecture, challenges',
          'Java interview topics: OOP, collections, exceptions, streams, SQL, Spring annotations',
          'Mock interview practice using your own project',
        ],
      },
    ],
    importance: [
      'Java Full Stack helps learners understand complete product development from database to API to frontend.',
      'Enterprise teams prefer developers who can debug across layers instead of only one small part.',
      'Spring Boot and Angular together are widely used for dashboards, portals, ERP systems, LMS systems, banking tools, and admin platforms.',
      'Full stack project experience improves confidence in interviews because you can explain real user flows.',
    ],
    future: [
      'Java Full Stack can grow into backend engineering, microservices, cloud engineering, tech lead, and solution architecture roles.',
      'Adding Kafka, Redis, Docker, Kubernetes, AWS, and system design creates a senior-level path.',
      'Angular and Spring Boot remain valuable for enterprise applications that need structure, security, and maintainability.',
    ],
    fastLearning: [
      'Build one feature end to end: table, API, service, UI, validation, and test.',
      'Maintain a bug journal with error message, root cause, and final fix.',
      'Revise Java, SQL, REST, Spring annotations, and Angular data flow every week.',
      'Explain every project module using user, input, process, database, response, and UI output.',
    ],
    projects: [
      {
        title: 'Complete LMS Platform',
        description:
          'Course manager, batch management, enrollment, checkout, student dashboard, trainer content, curriculum, and role-based access.',
      },
      {
        title: 'Enterprise HR Portal',
        description:
          'Employees, attendance, leave approval, payroll summary, admin reports, role permissions, and Angular dashboard.',
      },
    ],
    tools: [
      'Maven',
      'IntelliJ IDEA',
      'VS Code',
      'Swagger/OpenAPI',
      'JWT',
      'Nginx',
      'Docker Compose',
    ],
    outcomes: [
      'Explain and build complete Java full stack workflows confidently.',
      'Create secure APIs and polished Angular screens from the same business requirement.',
      'Prepare a professional Java full stack portfolio with real interview stories.',
    ],
  },

  'react-js': {
    roadmap: [
      {
        phase: 'Phase 1: Modern JavaScript Foundation',
        goal: 'Become confident with the JavaScript concepts required before serious React development.',
        items: [
          'let, const, scope, hoisting, closures, template literals',
          'Arrays, objects, destructuring, spread, rest operator',
          'Array methods: map, filter, reduce, find, some, every',
          'Functions, callbacks, higher-order functions',
          'Promises, async/await, try/catch, API error handling',
          'ES modules, imports, exports, default and named exports',
          'DOM basics and why React improves UI state handling',
          'Browser DevTools: console, network, elements, application tab',
          'JSON, localStorage, sessionStorage, URL params',
          'Clean code naming, component-friendly data structure thinking',
        ],
      },
      {
        phase: 'Phase 2: React Core Concepts',
        goal: 'Build reusable components and understand state-driven UI development.',
        items: [
          'React project setup with Vite or CRA',
          'JSX rules, expressions, conditional rendering',
          'Components, props, children, composition',
          'useState for local UI state',
          'Events, controlled inputs, form state',
          'List rendering with keys and reusable card components',
          'useEffect basics, dependency array, cleanup',
          'Derived state, lifting state up, prop drilling basics',
          'Component folder structure and naming conventions',
          'Avoiding unnecessary re-renders and state mistakes',
        ],
      },
      {
        phase: 'Phase 3: Routing, Forms, and API Screens',
        goal: 'Create complete multi-page applications connected to real or mock APIs.',
        items: [
          'React Router setup, routes, nested routes, route params',
          'Navigation layout, active links, protected routes',
          'Fetch and Axios API integration',
          'Loading, empty, success, and error states',
          'Search, filters, sorting, pagination',
          'Forms with validation, touched state, error messages',
          'Login, register, profile, dashboard UI flows',
          'Reusable table, modal, drawer, tabs, and toast patterns',
          'Environment variables for API base URL',
          'API response mapping and frontend-safe data handling',
        ],
      },
      {
        phase: 'Phase 4: State Management and Advanced Patterns',
        goal: 'Handle application-level state and reusable frontend logic.',
        items: [
          'Context API for auth, theme, cart, user session',
          'Custom hooks for API calls, forms, filters, localStorage',
          'useMemo and useCallback basics',
          'Reducer pattern and useReducer for complex state',
          'React Query or TanStack Query concepts',
          'Optimistic UI basics and refetching strategy',
          'Error boundaries and fallback UI thinking',
          'Reusable design system components',
          'Accessibility basics: labels, focus, keyboard-friendly UI',
          'Performance checklist for dashboard-style apps',
        ],
      },
      {
        phase: 'Phase 5: UI Engineering and Production Polish',
        goal: 'Make React projects look premium, responsive, maintainable, and portfolio-ready.',
        items: [
          'CSS architecture, modules, Tailwind basics, responsive grids',
          'Professional spacing, typography, card systems, button states',
          'Skeleton loaders, hover effects, transitions, micro-interactions',
          'Mobile-first responsive layouts',
          'Charts, dashboards, admin panels, data-heavy screens',
          'Code splitting and lazy loading basics',
          'Build optimization and production build',
          'Vercel/Netlify deployment',
          'Portfolio README with screenshots and feature list',
          'Interview explanation: component tree, state flow, API flow',
        ],
      },
    ],
    importance: [
      'React is a top frontend skill for product interfaces, dashboards, SaaS apps, marketplaces, and admin tools.',
      'React teaches component thinking, reusable UI design, state flow, and API-driven application structure.',
      'Strong React developers can collaborate better with backend teams because they understand API contracts and user workflows.',
    ],
    future: [
      'React plus TypeScript, Next.js, testing, design systems, and performance skills can lead to senior frontend roles.',
      'React can grow into full stack development when combined with Node.js, Java, databases, and cloud deployment.',
      'UI engineering roles reward React developers who can build polished reusable components and scalable screens.',
    ],
    fastLearning: [
      'Build every concept as a visible UI feature.',
      'Recreate real dashboards and product screens to improve spacing and layout skills.',
      'Practice API states on every screen: loading, empty, error, success, refresh.',
      'Explain projects using component tree, state ownership, and API flow.',
    ],
    projects: [
      {
        title: 'SaaS Admin Dashboard',
        description:
          'Auth layout, analytics cards, charts, filters, tables, modals, API states, settings, and responsive UI.',
      },
      {
        title: 'Course Marketplace Frontend',
        description:
          'Course listing, detail page, search, filters, checkout UI, student dashboard, and reusable design system.',
      },
    ],
    tools: [
      'Vite',
      'React Query',
      'Zustand Basics',
      'Framer Motion Basics',
      'Chart.js/Recharts',
      'ESLint',
    ],
    outcomes: [
      'Build premium React applications with reusable components and clean state flow.',
      'Create API-driven dashboards, forms, filters, and responsive product screens.',
      'Prepare for React, frontend, UI engineer, and full stack frontend roles.',
    ],
  },

  devops: {
    roadmap: [
      {
        phase: 'Phase 1: Linux, Networking, and Server Basics',
        goal: 'Understand the operating system and network foundation used in real deployments.',
        items: [
          'Linux filesystem, navigation, users, groups, permissions',
          'Shell commands, pipes, grep, find, tail, less, chmod, chown',
          'Process management, services, systemctl basics',
          'SSH keys, remote login, SCP, server access safety',
          'Ports, DNS, HTTP, HTTPS, TCP/IP basics',
          'Environment variables and configuration files',
          'Logs location, reading live logs, troubleshooting service failures',
          'Package managers, installing runtime dependencies',
          'Nginx basics, reverse proxy, static file serving',
          'Server security basics and firewall awareness',
        ],
      },
      {
        phase: 'Phase 2: Git and Collaboration Workflow',
        goal: 'Use source control and team workflow confidently.',
        items: [
          'Git init, clone, add, commit, status, log',
          'Branches, merge, rebase basics, conflict resolution',
          'Pull requests, code review flow, commit messages',
          'GitHub repository setup and branch protection concepts',
          'Release tags and version naming',
          'Secrets safety and files that should not be committed',
          'README, changelog, deployment notes',
          'Rollback using Git history and release tags',
        ],
      },
      {
        phase: 'Phase 3: CI/CD Pipelines',
        goal: 'Automate build, test, package, and deployment workflows.',
        items: [
          'CI vs CD concepts',
          'GitHub Actions workflow syntax',
          'Build jobs, test jobs, artifact upload',
          'Environment variables and secrets in pipelines',
          'Branch-based deployment rules',
          'Jenkins basics: jobs, stages, agents, credentials',
          'Pipeline failure debugging',
          'Rollback and redeployment strategy',
          'Notifications and deployment status visibility',
          'Pipeline documentation for teams',
        ],
      },
      {
        phase: 'Phase 4: Docker and Containerization',
        goal: 'Package applications consistently for local and production environments.',
        items: [
          'Images, containers, Dockerfile, layers',
          'Build, run, stop, logs, exec commands',
          'Port mapping, volumes, networks',
          'Docker Compose for frontend, backend, database',
          'Multi-stage builds basics',
          'Environment variables inside containers',
          'Container logs and debugging',
          'Image tagging and registry push',
          'Common Docker mistakes and cleanup',
          'Production-style compose setup',
        ],
      },
      {
        phase: 'Phase 5: Cloud Deployment and Operations',
        goal: 'Deploy and maintain applications on cloud infrastructure.',
        items: [
          'AWS EC2 setup, security groups, SSH access',
          'Deploy backend service with environment variables',
          'Deploy frontend build with Nginx',
          'Domain, DNS, SSL basics',
          'CloudWatch/log monitoring basics',
          'Health checks and uptime monitoring',
          'Backups, snapshots, restore planning',
          'Cost awareness and cleanup strategy',
          'Incident checklist and rollback runbook',
          'Architecture diagram for deployed application',
        ],
      },
    ],
    importance: [
      'DevOps reduces manual deployment errors and improves release speed.',
      'Companies need people who understand build pipelines, containers, servers, cloud, monitoring, and rollback.',
      'DevOps knowledge makes developers more production-aware and helps teams release safer software.',
    ],
    future: [
      'DevOps can grow into SRE, platform engineering, cloud engineering, DevSecOps, and infrastructure automation.',
      'Kubernetes, Terraform, observability, cloud security, and cost optimization are strong advanced paths.',
    ],
    fastLearning: [
      'Deploy the same app manually first, then automate it with CI/CD.',
      'Break deployments in practice and learn how to recover.',
      'Document commands, architecture, rollback, and troubleshooting notes.',
    ],
    projects: [
      {
        title: 'Production Deployment Pipeline',
        description:
          'GitHub Actions pipeline that builds, tests, dockerizes, pushes image, deploys, verifies health, and supports rollback.',
      },
    ],
    tools: [
      'GitHub Actions Advanced',
      'Jenkins',
      'Docker Hub',
      'Nginx',
      'CloudWatch',
      'Terraform Basics',
    ],
    outcomes: [
      'Build CI/CD pipelines and deploy applications with confidence.',
      'Dockerize full stack apps and troubleshoot production issues.',
      'Prepare for DevOps, cloud deployment, SRE beginner, and platform roles.',
    ],
  },

  'python-data-structures': {
    roadmap: [
      {
        phase: 'Phase 1: Python Programming Basics',
        goal: 'Write clean Python programs and understand programming logic from scratch.',
        items: [
          'Python setup, VS Code, interpreter, virtual environments',
          'Variables, data types, type conversion, input and output',
          'Operators, conditions, loops, nested loops',
          'Functions, parameters, return values, default arguments',
          'Lists, tuples, sets, dictionaries',
          'String methods, slicing, formatting, common string problems',
          'File handling, CSV basics, JSON basics',
          'Exception handling with try/except/finally',
          'Modules, packages, pip, requirements file',
          'Debugging Python programs and reading errors',
        ],
      },
      {
        phase: 'Phase 2: Object-Oriented Python',
        goal: 'Structure programs using reusable classes and objects.',
        items: [
          'Classes, objects, constructor, instance variables',
          'Methods, self, class variables, static methods',
          'Inheritance, method overriding, super',
          'Encapsulation, properties, basic design thinking',
          'Dunder methods, string representation',
          'Organizing code into modules and packages',
          'Mini project using classes and file storage',
        ],
      },
      {
        phase: 'Phase 3: Core DSA Patterns',
        goal: 'Solve common coding interview patterns with confidence.',
        items: [
          'Time complexity and space complexity',
          'Arrays/lists: traversal, prefix sums, frequency counting',
          'Strings: palindrome, anagram, substring, pattern matching basics',
          'Hash maps and hash sets for fast lookup',
          'Two pointers pattern',
          'Sliding window pattern',
          'Sorting and searching basics',
          'Binary search and boundary conditions',
          'Recursion basics and call stack understanding',
          'Backtracking introduction',
        ],
      },
      {
        phase: 'Phase 4: Advanced Data Structures',
        goal: 'Understand and implement data structures used in coding rounds.',
        items: [
          'Linked list basics, insert, delete, reverse',
          'Stack problems: valid parentheses, next greater element',
          'Queue and deque problems',
          'Trees: traversal, height, search, recursion',
          'Binary search tree basics',
          'Heap and priority queue basics',
          'Graphs: representation, BFS, DFS',
          'Dynamic programming introduction',
          'Greedy thinking basics',
          'Problem explanation and dry-run practice',
        ],
      },
      {
        phase: 'Phase 5: Interview and Project Practice',
        goal: 'Turn Python and DSA into interview-ready proof.',
        items: [
          'Daily problem solving routine',
          'Writing clean solution explanations',
          'Dry-run tables and edge cases',
          'GitHub DSA repository structure',
          'Automation script project',
          'CLI app project',
          'Data processing mini project',
          'Mock coding interview practice',
          'Common Python interview questions',
          'Resume explanation using projects and solved patterns',
        ],
      },
    ],
    importance: [
      'Python builds programming confidence quickly and is useful in backend, automation, testing, data, AI, and scripting.',
      'DSA improves problem solving and helps learners perform better in coding interviews.',
    ],
    future: [
      'Python can grow into backend development, data analytics, automation, machine learning, testing, and AI application development.',
      'DSA knowledge supports technical interview preparation across many software roles.',
    ],
    fastLearning: [
      'Solve small problems daily instead of irregular long sessions.',
      'Dry run every solution before coding.',
      'Write mistake notes and re-solve failed problems weekly.',
    ],
    projects: [
      {
        title: 'Python DSA Interview Repository',
        description:
          'Topic-wise solutions with explanation, complexity, dry-run examples, and revision notes.',
      },
    ],
    tools: ['LeetCode Basics', 'HackerRank', 'PyCharm', 'pytest', 'CSV/JSON', 'GitHub Projects'],
    outcomes: [
      'Write Python programs confidently.',
      'Solve common DSA interview patterns.',
      'Explain time complexity, edge cases, and solution approach clearly.',
    ],
  },

  'angular-enterprise': {
    roadmap: [
      {
        phase: 'Phase 1: TypeScript and Angular Setup',
        goal: 'Build the TypeScript foundation required for scalable Angular applications.',
        items: [
          'TypeScript types, interfaces, type aliases, union types',
          'Classes, access modifiers, constructors, generics basics',
          'ES modules, imports, exports, decorators concept',
          'Angular CLI, project structure, standalone components',
          'Component files: TS, HTML, CSS, spec files',
          'Data binding, event binding, property binding',
          'ngIf, ngFor, ngClass, ngStyle',
          'Angular debugging and browser DevTools',
        ],
      },
      {
        phase: 'Phase 2: Components, Services, and Routing',
        goal: 'Create structured page flows and reusable frontend logic.',
        items: [
          'Component communication using @Input and @Output',
          'Services and dependency injection',
          'Routing, route params, child routes, wildcard routes',
          'Layout components, dashboard navigation, breadcrumbs',
          'Reusable buttons, cards, tables, badges, loaders',
          'Feature folders and scalable project organization',
          'Environment files and API base URLs',
          'Route guards for auth and roles',
        ],
      },
      {
        phase: 'Phase 3: Forms and API Integration',
        goal: 'Build enterprise forms and connect Angular with backend APIs.',
        items: [
          'Reactive forms, FormGroup, FormControl, FormArray',
          'Validators, custom validators, error messages',
          'HttpClient GET, POST, PUT, PATCH, DELETE',
          'API services, request params, response mapping',
          'Loading states, empty states, error handling',
          'Search, filters, sorting, pagination',
          'File upload UI and preview basics',
          'Toast messages and user feedback',
        ],
      },
      {
        phase: 'Phase 4: RxJS, Auth, and Enterprise Patterns',
        goal: 'Handle async flows, session state, interceptors, and production frontend complexity.',
        items: [
          'Observable basics, subscribe, pipe, map, tap, catchError',
          'Subject and BehaviorSubject for app state',
          'Debounced search using RxJS',
          'HTTP interceptors for token and errors',
          'Auth service, login state, role checks',
          'Lazy loading and feature route structure',
          'Reusable dialog/modal pattern',
          'Performance basics and change detection awareness',
        ],
      },
      {
        phase: 'Phase 5: Enterprise Project and Deployment',
        goal: 'Build and ship a polished Angular application ready for portfolio and interviews.',
        items: [
          'Admin dashboard with tables, filters, forms, charts',
          'Course platform frontend with details and checkout flow',
          'Role-based navigation and protected screens',
          'Professional responsive CSS',
          'Build command and production configuration',
          'Deploy on Netlify/Vercel/static hosting',
          'README, screenshots, architecture, API contract notes',
          'Interview explanation: components, services, routes, RxJS, guards',
        ],
      },
    ],
    importance: [
      'Angular is valuable for enterprise applications because it provides structure, routing, forms, DI, and long-term maintainability.',
      'Angular pairs strongly with Java, .NET, and Node backend systems.',
    ],
    future: [
      'Angular can grow into frontend engineering, full stack Java-Angular roles, UI architecture, and enterprise product engineering.',
      'RxJS, testing, performance, and design systems increase senior-level readiness.',
    ],
    fastLearning: [
      'Practice one complete flow: route, component, form, service, API, validation, and toast.',
      'Build a dashboard with tables, filters, forms, and auth.',
      'Explain Angular architecture using data flow from template to API.',
    ],
    projects: [
      {
        title: 'Enterprise Admin Console',
        description:
          'Role-based dashboard with CRUD, reactive forms, API services, interceptors, guards, tables, filters, and charts.',
      },
    ],
    tools: [
      'Angular CLI Advanced',
      'RxJS Operators',
      'Angular Material Basics',
      'Chart.js',
      'Interceptors',
      'Guards',
    ],
    outcomes: [
      'Build scalable Angular applications with professional structure.',
      'Connect APIs, handle auth, forms, routing, and enterprise UI flows.',
      'Prepare for Angular developer and enterprise frontend roles.',
    ],
  },

  'aws-cloud': {
    roadmap: [
      {
        phase: 'Phase 1: Cloud Foundation and AWS Account Safety',
        goal: 'Understand cloud basics and set up AWS safely for practice.',
        items: [
          'Cloud computing, IaaS, PaaS, SaaS',
          'AWS regions, availability zones, edge locations',
          'AWS console navigation',
          'Billing dashboard, budgets, alerts, free tier safety',
          'IAM users, groups, roles, policies',
          'MFA setup and root account safety',
          'Shared responsibility model',
          'Basic architecture diagram reading',
        ],
      },
      {
        phase: 'Phase 2: Compute, Storage, and Networking',
        goal: 'Use core AWS services required for hosting applications.',
        items: [
          'EC2 instance creation, AMI, instance types',
          'Security groups, inbound/outbound rules',
          'SSH into Linux EC2',
          'S3 buckets, objects, permissions, static hosting',
          'VPC basics, subnets, route tables, internet gateway',
          'Elastic IP basics',
          'RDS overview and database connectivity',
          'Load balancer basics',
        ],
      },
      {
        phase: 'Phase 3: Application Deployment',
        goal: 'Deploy real frontend/backend applications on AWS infrastructure.',
        items: [
          'Linux server package setup',
          'Deploy static frontend on S3 or Nginx',
          'Deploy backend on EC2',
          'Environment variables and process manager basics',
          'Nginx reverse proxy',
          'Domain mapping and DNS basics',
          'SSL certificate basics',
          'Application logs and restart workflow',
        ],
      },
      {
        phase: 'Phase 4: Monitoring, Backup, and Cost Control',
        goal: 'Operate cloud applications responsibly.',
        items: [
          'CloudWatch logs and metrics',
          'Health checks and alarms',
          'Snapshots and backup planning',
          'S3 lifecycle basics',
          'Cost explorer and cleanup checklist',
          'IAM least privilege practice',
          'Incident notes and troubleshooting checklist',
          'Architecture documentation',
        ],
      },
      {
        phase: 'Phase 5: Career and Certification Preparation',
        goal: 'Prepare for cloud interviews and AWS certification paths.',
        items: [
          'Cloud interview scenarios',
          'IAM permission examples',
          'Networking interview basics',
          'EC2 vs Lambda vs containers overview',
          'Well-Architected Framework introduction',
          'Project README with architecture diagram',
          'AWS Cloud Practitioner or Solutions Architect Associate path',
          'Mock interview questions and scenario practice',
        ],
      },
    ],
    importance: [
      'AWS is widely used to host, secure, scale, and monitor modern applications.',
      'Cloud knowledge helps developers understand production deployment and troubleshooting.',
    ],
    future: [
      'AWS skills can grow into cloud support, cloud engineer, DevOps, solution architect, and data/cloud security roles.',
      'Adding Linux, Docker, CI/CD, Terraform, and Kubernetes creates stronger career opportunities.',
    ],
    fastLearning: [
      'Deploy one real app and document every step.',
      'Create billing alerts before practicing.',
      'Draw architecture diagrams for every project.',
    ],
    projects: [
      {
        title: 'AWS Full Stack Deployment',
        description:
          'Frontend, backend, database, Nginx, domain, SSL, monitoring, and cost checklist on AWS.',
      },
    ],
    tools: [
      'AWS Budgets',
      'IAM Policy Simulator',
      'CloudWatch Alarms',
      'Route 53',
      'ACM Basics',
      'EC2 User Data',
    ],
    outcomes: [
      'Deploy and monitor applications on AWS.',
      'Understand IAM, EC2, S3, VPC, RDS, and CloudWatch basics.',
      'Prepare for junior cloud and DevOps-cloud roles.',
    ],
  },

  'sql-database': {
    roadmap: [
      {
        phase: 'Phase 1: SQL Query Foundation',
        goal: 'Retrieve, filter, sort, and understand relational data confidently.',
        items: [
          'Database, table, row, column concepts',
          'SELECT, WHERE, ORDER BY, LIMIT',
          'Comparison operators, logical operators, BETWEEN, IN, LIKE',
          'Aliases, calculated columns, NULL handling',
          'String, number, and date functions',
          'DISTINCT and duplicate understanding',
          'Basic reporting queries',
          'Query formatting and readability',
        ],
      },
      {
        phase: 'Phase 2: Joins, Aggregations, and Subqueries',
        goal: 'Work with multi-table business data.',
        items: [
          'Primary key and foreign key relationships',
          'INNER JOIN, LEFT JOIN, RIGHT JOIN',
          'Multiple joins and join conditions',
          'COUNT, SUM, AVG, MIN, MAX',
          'GROUP BY and HAVING',
          'Subqueries in SELECT, FROM, WHERE',
          'EXISTS and NOT EXISTS basics',
          'Report queries for sales, HR, courses, payments',
        ],
      },
      {
        phase: 'Phase 3: Database Design',
        goal: 'Design clean schemas for real applications.',
        items: [
          'Entity identification and table planning',
          'One-to-one, one-to-many, many-to-many relationships',
          'Normalization: 1NF, 2NF, 3NF basics',
          'Constraints: NOT NULL, UNIQUE, CHECK, DEFAULT',
          'ER diagrams and schema documentation',
          'Design for ecommerce, LMS, HR, finance systems',
          'Avoiding duplication and inconsistent data',
          'Seed data and test data planning',
        ],
      },
      {
        phase: 'Phase 4: Advanced SQL and Performance',
        goal: 'Write production-friendly queries and understand performance.',
        items: [
          'Indexes and when to use them',
          'Composite indexes basics',
          'Transactions and ACID',
          'Views and stored procedure basics',
          'Window functions: ROW_NUMBER, RANK, SUM OVER',
          'Query plans and EXPLAIN basics',
          'Slow query debugging',
          'Backup and restore basics',
        ],
      },
    ],
    importance: [
      'SQL is required in backend, analytics, QA, data engineering, reporting, and database support roles.',
      'Good SQL helps debug business and application issues quickly.',
    ],
    future: [
      'SQL grows into backend development, data analytics, database engineering, BI, and data engineering paths.',
      'Advanced SQL with optimization and modeling is valuable in every data-driven company.',
    ],
    fastLearning: [
      'Practice on real-looking datasets.',
      'Draw relationships before writing joins.',
      'Explain each query in business language.',
    ],
    projects: [
      {
        title: 'Business Reporting Database',
        description:
          'Schema design, joins, aggregations, indexes, views, and reports for sales, users, payments, and monthly trends.',
      },
    ],
    tools: [
      'MySQL Workbench',
      'pgAdmin',
      'DB Diagram Tools',
      'EXPLAIN Plans',
      'Stored Procedures',
      'Window Functions',
    ],
    outcomes: [
      'Write strong SQL queries and design clean relational schemas.',
      'Prepare for backend, analyst, QA, and database interview rounds.',
    ],
  },

  'power-bi-analytics': {
    roadmap: [
      {
        phase: 'Phase 1: Analytics and Data Basics',
        goal: 'Understand business questions, KPIs, datasets, and reporting goals.',
        items: [
          'Data types, tables, rows, columns, dimensions, measures',
          'Business questions and KPI identification',
          'Excel/CSV data understanding',
          'Data quality issues and missing values',
          'Sales, HR, finance, operations datasets',
          'Dashboard audience and decision-making goals',
          'Choosing useful metrics over decorative charts',
        ],
      },
      {
        phase: 'Phase 2: Power Query Data Cleaning',
        goal: 'Clean, transform, merge, and prepare data for dashboards.',
        items: [
          'Importing Excel, CSV, folders, web data',
          'Removing errors, duplicates, blanks',
          'Changing data types and column names',
          'Split, merge, append, pivot, unpivot',
          'Conditional columns and custom columns',
          'Date cleanup and text cleanup',
          'Refresh workflow and transformation documentation',
        ],
      },
      {
        phase: 'Phase 3: Data Modeling and DAX',
        goal: 'Create reliable models and meaningful measures.',
        items: [
          'Relationships and cardinality',
          'Star schema basics',
          'Date table and time intelligence basics',
          'Calculated columns vs measures',
          'SUM, COUNT, DISTINCTCOUNT, AVERAGE',
          'CALCULATE, FILTER, ALL basics',
          'YTD, MTD, growth percentage, variance metrics',
          'Debugging DAX using small examples',
        ],
      },
      {
        phase: 'Phase 4: Dashboard Design and Storytelling',
        goal: 'Build dashboards that communicate insights clearly.',
        items: [
          'Cards, bar charts, line charts, matrix, slicers',
          'KPI layout and visual hierarchy',
          'Filters, drillthrough, tooltips',
          'Color choices and accessibility',
          'Executive summary page',
          'Detailed analysis page',
          'Insights writing and recommendation notes',
          'Publishing basics and report sharing concepts',
        ],
      },
    ],
    importance: [
      'Power BI helps companies track performance, revenue, operations, HR, finance, and marketing.',
      'It creates an entry path into analytics for learners with or without coding background.',
    ],
    future: [
      'Power BI plus SQL, Excel, DAX, and business storytelling can lead to analyst and BI roles.',
      'Adding Python and data modeling improves advanced analytics opportunities.',
    ],
    fastLearning: [
      'Start with business questions before charts.',
      'Clean messy data repeatedly.',
      'Use fewer visuals with stronger insights.',
    ],
    projects: [
      {
        title: 'Executive Business Dashboard',
        description:
          'Sales, profit, customers, geography, product categories, monthly trends, KPIs, drillthrough, and insight summary.',
      },
    ],
    tools: [
      'Power BI Service',
      'Dataflows Basics',
      'DAX Studio Basics',
      'Excel Power Query',
      'SQL Connector',
      'Dashboard Themes',
    ],
    outcomes: [
      'Build business-ready dashboards with Power Query, DAX, and storytelling.',
      'Prepare for Power BI developer, data analyst, and BI analyst roles.',
    ],
  },

  'nodejs-backend': {
    roadmap: [
      {
        phase: 'Phase 1: JavaScript Backend Foundation',
        goal: 'Understand Node runtime, asynchronous programming, and backend project structure.',
        items: [
          'Node.js runtime, npm, package.json, scripts',
          'CommonJS and ES modules',
          'Async programming, callbacks, promises, async/await',
          'Environment variables and config management',
          'File system basics and path handling',
          'Backend folder structure: routes, controllers, services, models',
          'Logging and debugging Node applications',
        ],
      },
      {
        phase: 'Phase 2: Express REST API Development',
        goal: 'Build clean and maintainable REST APIs.',
        items: [
          'Express setup, routing, middleware',
          'Controllers and service layer separation',
          'GET, POST, PUT, PATCH, DELETE APIs',
          'Request params, query params, body parsing',
          'Validation using middleware or libraries',
          'Global error handling',
          'API response format and status codes',
          'Postman collections and API docs',
        ],
      },
      {
        phase: 'Phase 3: Database and Data Modeling',
        goal: 'Persist and query data with MongoDB or SQL.',
        items: [
          'MongoDB collections and documents',
          'Mongoose schemas, models, validation',
          'SQL basics and relational modeling overview',
          'CRUD operations, filters, search, pagination',
          'Relationships and references',
          'Indexes and query performance basics',
          'Transactions overview',
          'Seed data and test data setup',
        ],
      },
      {
        phase: 'Phase 4: Authentication, Security, and Production APIs',
        goal: 'Secure APIs and prepare backend services for production.',
        items: [
          'JWT authentication and refresh concept',
          'Password hashing with bcrypt',
          'Role-based authorization',
          'CORS, rate limiting, helmet, input sanitization',
          'File upload using Multer',
          'Email/notification integration basics',
          'Testing APIs and edge cases',
          'Deployment, process manager, logs, Docker basics',
        ],
      },
    ],
    importance: [
      'Node.js is widely used for APIs, dashboards, mobile backends, real-time apps, and JavaScript full stack products.',
      'Backend skills help frontend developers become full stack developers.',
    ],
    future: [
      'Node.js can grow into full stack JavaScript, API engineering, microservices, serverless, and backend architecture roles.',
      'Adding TypeScript, testing, Docker, cloud, and system design improves senior readiness.',
    ],
    fastLearning: [
      'Build CRUD APIs first, then add auth and validation.',
      'Use Postman for every endpoint.',
      'Read logs and API responses instead of guessing.',
    ],
    projects: [
      {
        title: 'Production REST API Platform',
        description:
          'Auth, roles, CRUD, file upload, validation, pagination, filters, reports, logging, Docker, and API docs.',
      },
    ],
    tools: ['Nodemon', 'Mongoose', 'Prisma Basics', 'Helmet', 'Rate Limit', 'Swagger', 'PM2'],
    outcomes: [
      'Build secure backend APIs with Node.js and Express.',
      'Connect APIs with MongoDB or SQL and deploy production-ready services.',
    ],
  },

  'spring-boot-microservices': {
    roadmap: [
      {
        phase: 'Phase 1: Spring Boot Advanced Backend Foundation',
        goal: 'Strengthen backend skills before distributed systems.',
        items: [
          'REST API design and DTO mapping',
          'Spring Data JPA advanced queries',
          'Validation and global exception handling',
          'Spring Security and JWT review',
          'Profiles and configuration management',
          'Unit testing and integration testing basics',
          'API documentation and versioning',
        ],
      },
      {
        phase: 'Phase 2: Microservices Architecture Design',
        goal: 'Understand how to split systems into independent services.',
        items: [
          'Monolith vs microservices tradeoffs',
          'Service boundaries and domain-driven thinking',
          'Database per service concept',
          'API gateway pattern',
          'Service discovery using Eureka',
          'Config server and centralized configuration',
          'Inter-service communication with Feign/WebClient',
          'Load balancing and timeout planning',
        ],
      },
      {
        phase: 'Phase 3: Resilience, Messaging, and Data Consistency',
        goal: 'Handle distributed system failures and async workflows.',
        items: [
          'Circuit breaker pattern',
          'Retries, timeouts, fallback response',
          'Kafka basics and event-driven communication',
          'Producer, consumer, topic, partition basics',
          'Idempotency and duplicate event handling',
          'Saga pattern introduction',
          'Event logs and audit trails',
          'Failure scenario practice',
        ],
      },
      {
        phase: 'Phase 4: Observability and Deployment',
        goal: 'Run and debug multi-service systems like real teams.',
        items: [
          'Centralized logging basics',
          'Correlation IDs across services',
          'Tracing and metrics overview',
          'Health checks and actuator endpoints',
          'Dockerfile for each service',
          'Docker Compose for multi-service local setup',
          'CI/CD basics for microservices',
          'Kubernetes overview and cloud-ready architecture',
        ],
      },
    ],
    importance: [
      'Microservices are used in large systems where scalability, team independence, and reliability matter.',
      'Spring Cloud tools make Java microservices practical for enterprise teams.',
    ],
    future: [
      'This path leads to senior backend, microservices developer, technical lead, and backend architect roles.',
      'Kafka, Kubernetes, observability, and system design improve advanced career growth.',
    ],
    fastLearning: [
      'Start from a monolith and split into services.',
      'Practice failure cases, not only happy paths.',
      'Draw architecture before coding.',
    ],
    projects: [
      {
        title: 'Cloud-Ready Microservices Platform',
        description:
          'Gateway, discovery, config, user service, order service, payment service, Kafka events, Docker Compose, logs, and tracing notes.',
      },
    ],
    tools: [
      'Resilience4j',
      'Spring Cloud Config',
      'Eureka',
      'Gateway',
      'Kafka',
      'Actuator',
      'Zipkin Basics',
    ],
    outcomes: [
      'Design and build Spring Boot microservices with discovery, gateway, config, messaging, and observability.',
      'Prepare for senior Java and microservices interviews.',
    ],
  },

  'ui-ux-design': {
    roadmap: [
      {
        phase: 'Phase 1: Visual Design Foundation',
        goal: 'Understand the visual rules behind clean and professional interfaces.',
        items: [
          'Typography hierarchy, font pairing, readable sizes',
          'Color theory, contrast, accessible color usage',
          'Spacing, alignment, layout grids',
          'Visual hierarchy and scan patterns',
          'Buttons, inputs, cards, navigation, states',
          'Responsive web and mobile layout thinking',
          'Common UI mistakes and how to fix them',
        ],
      },
      {
        phase: 'Phase 2: UX Research and Product Thinking',
        goal: 'Design solutions based on user goals and business context.',
        items: [
          'User personas and problem statements',
          'User journeys and pain points',
          'Information architecture',
          'User flows and task flows',
          'Wireframes: low fidelity and high fidelity',
          'Usability principles',
          'Accessibility basics and inclusive design',
        ],
      },
      {
        phase: 'Phase 3: Figma Professional Workflow',
        goal: 'Use Figma efficiently for real design work.',
        items: [
          'Frames, grids, constraints',
          'Auto layout deep practice',
          'Components and variants',
          'Styles and design tokens',
          'Interactive prototypes',
          'Design handoff basics',
          'Reusable design system kit',
        ],
      },
      {
        phase: 'Phase 4: Portfolio Case Studies',
        goal: 'Prepare work that can be shown to recruiters and clients.',
        items: [
          'Problem, research, wireframes, solution, results',
          'Before/after design improvements',
          'Dashboard case study',
          'Mobile app case study',
          'Landing page or product flow case study',
          'Design rationale writing',
          'Portfolio presentation and interview storytelling',
        ],
      },
    ],
    importance: [
      'UI/UX improves usability, trust, conversion, and product clarity.',
      'Companies need designers who can solve user problems, not only create attractive screens.',
    ],
    future: [
      'UI/UX can grow into product design, UX research, visual design, design systems, and UI engineering.',
      'Design plus frontend knowledge creates a strong career advantage.',
    ],
    fastLearning: [
      'Copy good interfaces first to train spacing and hierarchy.',
      'Start with flow and wireframe before colors.',
      'Explain every design decision using user goals.',
    ],
    projects: [
      {
        title: 'Premium Product Design Portfolio',
        description:
          'Three case studies covering research, flows, wireframes, UI design, prototype, usability notes, and design rationale.',
      },
    ],
    tools: [
      'FigJam',
      'Figma Variables',
      'Design Tokens',
      'Prototype Links',
      'Accessibility Checkers',
      'UI Inspiration Boards',
    ],
    outcomes: [
      'Design polished web/mobile screens and explain UX decisions professionally.',
      'Build portfolio-ready UI/UX case studies.',
    ],
  },

  'cyber-security': {
    roadmap: [
      {
        phase: 'Phase 1: Security and Networking Foundation',
        goal: 'Understand how systems communicate and where security risks appear.',
        items: [
          'CIA triad, threats, vulnerabilities, risk',
          'TCP/IP, ports, DNS, HTTP, HTTPS',
          'Authentication, authorization, sessions, tokens',
          'Linux basics for security work',
          'Logs and event understanding',
          'Legal and ethical security practice',
        ],
      },
      {
        phase: 'Phase 2: Tools and Lab Practice',
        goal: 'Use security tools in legal practice environments.',
        items: [
          'Nmap basics and port scan interpretation',
          'Wireshark packet capture basics',
          'Burp Suite proxy and request inspection',
          'Browser DevTools for security testing',
          'Safe lab setup and vulnerable apps',
          'Writing clear lab notes',
        ],
      },
      {
        phase: 'Phase 3: Web Application Security',
        goal: 'Understand and fix common OWASP risks.',
        items: [
          'OWASP Top 10 overview',
          'SQL injection and prevention',
          'XSS and output encoding',
          'CSRF basics',
          'Broken authentication',
          'Broken access control',
          'Security misconfiguration',
          'Input validation and secure headers',
        ],
      },
      {
        phase: 'Phase 4: Defensive Security and Career Prep',
        goal: 'Build beginner security portfolio and interview readiness.',
        items: [
          'Secure login implementation checklist',
          'Password hashing and JWT safety',
          'Logging and alert basics',
          'Vulnerability report writing',
          'Impact, evidence, remediation format',
          'SOC basics and alert investigation',
          'Security interview scenarios',
        ],
      },
    ],
    importance: [
      'Every digital company needs application, data, infrastructure, and user protection.',
      'Security knowledge helps developers write safer code and helps analysts identify risks.',
    ],
    future: [
      'Cybersecurity grows into SOC, VAPT, application security, cloud security, DevSecOps, and GRC roles.',
      'Cloud and application security are especially strong growth areas.',
    ],
    fastLearning: [
      'Practice only in legal labs.',
      'Write reports with impact and fix.',
      'Understand why vulnerability happens in code.',
    ],
    projects: [
      {
        title: 'Web Security Lab Portfolio',
        description:
          'OWASP testing notes, secure login app, vulnerability reports, remediation checklist, and safe lab documentation.',
      },
    ],
    tools: [
      'OWASP ZAP Basics',
      'DVWA/Juice Shop',
      'Kali Basics',
      'SIEM Basics',
      'Security Headers',
      'JWT Debugger',
    ],
    outcomes: [
      'Understand web security fundamentals and ethical testing workflow.',
      'Prepare for SOC, VAPT beginner, and application security entry paths.',
    ],
  },

  'machine-learning': {
    roadmap: [
      {
        phase: 'Phase 1: Python Data Stack',
        goal: 'Prepare datasets and explore data confidently.',
        items: [
          'Python review for data workflows',
          'NumPy arrays and vector operations',
          'Pandas Series and DataFrame',
          'Data cleaning: missing values, duplicates, outliers',
          'Groupby, merge, pivot, filtering',
          'Matplotlib and Seaborn visualizations',
          'Jupyter notebook workflow',
        ],
      },
      {
        phase: 'Phase 2: Statistics and ML Foundation',
        goal: 'Understand the math and evaluation behind models.',
        items: [
          'Mean, median, mode, variance, standard deviation',
          'Probability basics',
          'Correlation and covariance',
          'Train-test split',
          'Bias, variance, overfitting, underfitting',
          'Regression metrics and classification metrics',
          'Confusion matrix, precision, recall, F1',
        ],
      },
      {
        phase: 'Phase 3: Supervised and Unsupervised Learning',
        goal: 'Train and compare practical ML models.',
        items: [
          'Linear regression and logistic regression',
          'Decision tree and random forest',
          'SVM and KNN basics',
          'Naive Bayes basics',
          'Clustering with KMeans',
          'PCA basics',
          'Model comparison and cross validation',
          'Feature engineering and scaling',
        ],
      },
      {
        phase: 'Phase 4: ML Project and Deployment',
        goal: 'Build usable ML projects with clear explanation.',
        items: [
          'End-to-end notebook structure',
          'Problem statement and dataset explanation',
          'EDA, feature engineering, model training',
          'Model saving with pickle/joblib',
          'FastAPI or Streamlit demo',
          'Prediction UI and model API',
          'README with business conclusion',
          'Ethics, fairness, and limitations discussion',
        ],
      },
    ],
    importance: [
      'ML powers prediction, recommendation, forecasting, fraud detection, personalization, and AI product features.',
      'Python, statistics, data cleaning, and model evaluation are core skills for modern data teams.',
    ],
    future: [
      'ML can grow into data science, ML engineering, AI application development, and MLOps.',
      'Adding cloud, APIs, data engineering, and deep learning improves advanced opportunities.',
    ],
    fastLearning: [
      'Compare multiple models and explain why one works better.',
      'Write business conclusions, not only code.',
      'Create one notebook and one deployable demo per project.',
    ],
    projects: [
      {
        title: 'End-to-End ML Prediction App',
        description:
          'EDA, feature engineering, model comparison, saved model, FastAPI/Streamlit demo, and business explanation.',
      },
    ],
    tools: ['Joblib', 'XGBoost Basics', 'MLflow Basics', 'FastAPI', 'Streamlit', 'Kaggle Datasets'],
    outcomes: [
      'Prepare datasets, train models, evaluate results, and deploy basic ML demos.',
      'Prepare for ML trainee, data scientist, and AI application roles.',
    ],
  },

  'flutter-mobile-apps': {
    roadmap: [
      {
        phase: 'Phase 1: Dart Foundation',
        goal: 'Write clean Dart code required for Flutter apps.',
        items: [
          'Variables, data types, null safety',
          'Functions, classes, constructors',
          'Lists, maps, sets',
          'Async/await and futures',
          'JSON parsing basics',
          'OOP and reusable models',
        ],
      },
      {
        phase: 'Phase 2: Flutter UI and Navigation',
        goal: 'Build responsive mobile screens with Flutter widgets.',
        items: [
          'StatelessWidget and StatefulWidget',
          'MaterialApp, Scaffold, AppBar',
          'Rows, columns, stacks, containers',
          'Lists, grids, cards, images',
          'Forms, validation, input fields',
          'Navigation, routes, bottom navigation',
          'Responsive layout and screen sizes',
        ],
      },
      {
        phase: 'Phase 3: State, APIs, and Storage',
        goal: 'Connect apps with real data and manage app state.',
        items: [
          'Provider basics',
          'Local state and shared state',
          'HTTP API calls',
          'JSON models and error handling',
          'Loading, empty, error states',
          'Local storage basics',
          'Firebase auth and Firestore basics',
        ],
      },
      {
        phase: 'Phase 4: App Architecture and Release',
        goal: 'Prepare mobile apps for portfolio and release workflow.',
        items: [
          'Folder structure and reusable widgets',
          'Service layer and repository pattern basics',
          'App icons and splash screen',
          'Testing basics',
          'Performance basics',
          'Build APK',
          'Demo video and README',
        ],
      },
    ],
    importance: [
      'Flutter helps build Android and iOS apps from one codebase.',
      'It is useful for startups, MVPs, mobile-first businesses, and freelance projects.',
    ],
    future: [
      'Flutter can grow into mobile app developer, full stack mobile developer, and mobile lead roles.',
      'Adding backend, Firebase, APIs, and app architecture improves career value.',
    ],
    fastLearning: [
      'Build screens from real app screenshots.',
      'Practice API states in every app.',
      'Record demo videos for portfolio.',
    ],
    projects: [
      {
        title: 'Production Mobile App Portfolio',
        description:
          'Auth, API data, profile, list/detail screens, forms, Firebase/local storage, responsive UI, and APK demo.',
      },
    ],
    tools: [
      'Flutter DevTools',
      'Firebase Auth',
      'Firestore',
      'Provider',
      'SharedPreferences',
      'Android Studio Emulator',
    ],
    outcomes: [
      'Build cross-platform mobile apps with clean UI and API integration.',
      'Prepare for Flutter and mobile app developer roles.',
    ],
  },

  'data-engineering': {
    roadmap: [
      {
        phase: 'Phase 1: SQL and Data Foundations',
        goal: 'Understand structured data, query logic, and data quality.',
        items: [
          'SQL SELECT, joins, aggregations',
          'Data types and constraints',
          'Normalization and star schema basics',
          'Data quality checks',
          'Indexes and query performance',
          'Business reporting tables',
        ],
      },
      {
        phase: 'Phase 2: Python for Data Pipelines',
        goal: 'Automate extraction, cleaning, transformation, and loading.',
        items: [
          'Python file handling, CSV, JSON',
          'Pandas cleaning and transformation',
          'API data extraction',
          'Error handling and logging',
          'Config files and reusable scripts',
          'Incremental load logic basics',
        ],
      },
      {
        phase: 'Phase 3: ETL, Warehousing, and Big Data',
        goal: 'Build analytics-ready datasets and scalable processing concepts.',
        items: [
          'ETL vs ELT',
          'Batch pipelines and scheduling',
          'Fact and dimension modeling',
          'Data warehouse concepts',
          'Parquet and partitioning',
          'Spark DataFrame basics',
          'Data lake zones: raw, cleaned, curated',
        ],
      },
      {
        phase: 'Phase 4: Orchestration and Production Workflow',
        goal: 'Operate data pipelines like real engineering teams.',
        items: [
          'Airflow DAG basics',
          'Retries, dependencies, scheduling',
          'Monitoring and pipeline alerts',
          'Data validation checks',
          'Cloud storage basics',
          'Documentation and lineage notes',
          'Backfill and failure recovery',
        ],
      },
    ],
    importance: [
      'Data engineers make dashboards, analytics, ML, and business reporting possible.',
      'Reliable pipelines and clean data are critical for every data-driven company.',
    ],
    future: [
      'Data engineering grows into big data, analytics engineering, cloud data engineering, AI platform, and MLOps paths.',
      'Spark, Airflow, cloud warehouses, dbt, and data quality tools improve senior opportunities.',
    ],
    fastLearning: [
      'Build small ETL pipelines before big data tools.',
      'Log every pipeline step.',
      'Document inputs, transformations, outputs, and refresh logic.',
    ],
    projects: [
      {
        title: 'Production Data Pipeline Portfolio',
        description:
          'API/CSV extraction, cleaning, SQL warehouse loading, fact/dim modeling, Airflow schedule, validation, logs, and documentation.',
      },
    ],
    tools: [
      'dbt Basics',
      'Airflow DAGs',
      'Spark DataFrames',
      'Parquet',
      'Great Expectations Basics',
      'Cloud Storage',
    ],
    outcomes: [
      'Build ETL pipelines and analytics-ready data models.',
      'Prepare for data engineer and analytics engineer roles.',
    ],
  },
};

function appendUnique<T>(
  base: T[],
  extra: T[],
  keyFn: (item: T) => string = (item) => String(item),
): T[] {
  const seen = new Set(base.map(keyFn));
  const merged = [...base];

  extra.forEach((item) => {
    const key = keyFn(item);
    if (!seen.has(key)) {
      seen.add(key);
      merged.push(item);
    }
  });

  return merged;
}

COURSE_DETAILS.forEach((course) => {
  const expansion = PREMIUM_COURSE_DETAIL_EXPANSIONS[course.slug];

  if (!expansion) {
    return;
  }

  course.roadmap = expansion.roadmap;
  course.importance = appendUnique(course.importance, expansion.importance);
  course.future = appendUnique(course.future, expansion.future);
  course.fastLearning = appendUnique(course.fastLearning, expansion.fastLearning);
  course.projects = appendUnique(course.projects, expansion.projects, (project) => project.title);
  course.tools = appendUnique(course.tools, expansion.tools);
  course.outcomes = appendUnique(course.outcomes, expansion.outcomes);
});

export function findCourseDetail(value: string | null | undefined): CourseDetail | undefined {
  if (!value) {
    return undefined;
  }

  const key = value.toLowerCase();
  return COURSE_DETAILS.find(
    (course) => course.slug === key || course.codes.some((code) => code.toLowerCase() === key),
  );
}
