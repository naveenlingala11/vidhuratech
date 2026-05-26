import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CourseDetail, findCourseDetail } from '../model/course-detail-data';

interface PremiumTopic {
  icon: string;
  title: string;
  text: string;
}

interface PremiumSkill {
  name: string;
  level: number;
  focus: string;
}

interface PremiumMilestone {
  week: string;
  title: string;
  goal: string;
  deliverables: string[];
}

interface PremiumCompanyUse {
  icon: string;
  title: string;
  description: string;
}

interface DeepDiveBlock {
  title: string;
  intro: string;
  points: string[];
}

interface PracticeTrack {
  day: string;
  focus: string;
  activity: string;
}

interface FaqItem {
  question: string;
  answer: string;
}

@Component({
  selector: 'app-course-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './course-details.html',
  styleUrls: ['./course-details.css'],
})
export class CourseDetailsComponent implements OnInit {
  course?: CourseDetail;
  concepts: PremiumTopic[] = [];
  companyUsage: PremiumCompanyUse[] = [];
  skillMatrix: PremiumSkill[] = [];
  detailedRoadmap: PremiumMilestone[] = [];
  interviewTopics: string[] = [];
  proofItems: string[] = [];
  deepDiveBlocks: DeepDiveBlock[] = [];
  practiceTracks: PracticeTrack[] = [];
  companyScenarios: PremiumTopic[] = [];
  mistakes: string[] = [];
  faqItems: FaqItem[] = [];
  capstoneBlueprint: string[] = [];
  masteryChecklist: string[] = [];

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug');
    this.course = findCourseDetail(slug);

    if (this.course) {
      this.preparePremiumContent(this.course);
    }
  }

  private preparePremiumContent(course: CourseDetail): void {
    const tools = course.tools.slice(0, 8);
    const phases = course.roadmap;

    this.concepts = [
      {
        icon: 'fa-solid fa-diagram-project',
        title: 'Architecture Thinking',
        text: `Understand how ${course.title} solutions are structured, connected, tested, and deployed in real product teams.`,
      },
      {
        icon: 'fa-solid fa-code',
        title: 'Core Implementation',
        text: `Practice the main building blocks: ${tools.slice(0, 4).join(', ')} with clean, explainable implementation patterns.`,
      },
      {
        icon: 'fa-solid fa-database',
        title: 'Data and API Flow',
        text: 'Learn how data moves between screens, services, databases, users, dashboards, and production systems.',
      },
      {
        icon: 'fa-solid fa-shield-halved',
        title: 'Security and Quality',
        text: 'Build habits around validation, access control, error handling, debugging, testing, and documentation.',
      },
      {
        icon: 'fa-solid fa-gauge-high',
        title: 'Performance Mindset',
        text: 'Improve speed, reliability, maintainability, and user experience through practical optimization decisions.',
      },
      {
        icon: 'fa-solid fa-briefcase',
        title: 'Career Communication',
        text: 'Convert projects into interview stories with problem, approach, tradeoffs, outcome, and improvement points.',
      },
    ];

    this.deepDiveBlocks = [
      {
        title: `${course.title} Foundation Layer`,
        intro:
          'This layer builds the base required to understand real projects instead of only memorizing syntax or tool names.',
        points: [
          `Understand the purpose of ${course.title} and where it fits in a complete software or business workflow.`,
          `Learn the core vocabulary used by developers, trainers, interviewers, and project teams.`,
          `Practice small examples until the basic concepts become natural and repeatable.`,
          `Connect each concept to one real use case from dashboards, APIs, automation, analytics, apps, or cloud systems.`,
        ],
      },
      {
        title: 'Project Implementation Layer',
        intro:
          'This layer converts theory into working features, screens, APIs, datasets, pipelines, workflows, or deployable modules.',
        points: [
          `Use ${tools.slice(0, 4).join(', ')} in practical tasks instead of isolated examples.`,
          'Build features with proper naming, folder structure, reusable logic, and clean documentation.',
          'Handle loading, validation, errors, empty data, edge cases, access rules, and user-friendly messages.',
          'Review your own work like a real team member: what can break, what can scale, and what is hard to explain?',
        ],
      },
      {
        title: 'Production Readiness Layer',
        intro:
          'This layer prepares you for interviews and workplace expectations where clarity, reliability, and ownership matter.',
        points: [
          'Debug issues using logs, browser tools, API responses, query outputs, stack traces, or test data.',
          'Document setup steps, architecture, assumptions, limitations, and future improvements.',
          'Explain tradeoffs clearly: why you used a tool, pattern, structure, or implementation choice.',
          'Prepare a clean demo flow that shows the problem, solution, result, and your personal contribution.',
        ],
      },
    ];

    this.companyUsage = [
      {
        icon: 'fa-solid fa-building-columns',
        title: 'Enterprise Systems',
        description: `${course.title} skills are used to build secure internal portals, workflows, dashboards, and business applications.`,
      },
      {
        icon: 'fa-solid fa-cart-shopping',
        title: 'Product and Ecommerce',
        description:
          'Teams use these skills for catalogs, checkout flows, admin panels, reporting, customer journeys, and integrations.',
      },
      {
        icon: 'fa-solid fa-cloud',
        title: 'Cloud and SaaS Platforms',
        description:
          'Modern teams expect developers to understand environments, APIs, deployments, monitoring, and release readiness.',
      },
      {
        icon: 'fa-solid fa-chart-line',
        title: 'Analytics and Operations',
        description:
          'Companies value people who can connect technical output to revenue, user behavior, efficiency, and decision-making.',
      },
    ];

    this.companyScenarios = [
      {
        icon: 'fa-solid fa-users-gear',
        title: 'Internal Team Productivity',
        text: `Companies use ${course.title} skills to reduce manual work, improve team workflows, and make business operations faster.`,
      },
      {
        icon: 'fa-solid fa-money-bill-trend-up',
        title: 'Revenue and Customer Systems',
        text: 'These skills support checkout flows, sales dashboards, lead tracking, customer portals, billing, reports, and product features.',
      },
      {
        icon: 'fa-solid fa-lock',
        title: 'Secure Business Workflows',
        text: 'Real teams care about authentication, permissions, safe data handling, validation, audit trails, and controlled access.',
      },
      {
        icon: 'fa-solid fa-screwdriver-wrench',
        title: 'Maintenance and Scaling',
        text: 'Companies prefer people who can improve existing systems, fix bugs, read old code, optimize workflows, and support releases.',
      },
    ];

    this.skillMatrix = tools.map((tool, index) => ({
      name: tool,
      level: Math.max(68, 96 - index * 4),
      focus: index < 3 ? 'Core skill' : index < 6 ? 'Project skill' : 'Career add-on',
    }));

    this.detailedRoadmap = phases.map((phase, index) => ({
      week: `Phase ${index + 1}`,
      title: phase.phase,
      goal: phase.goal,
      deliverables: [
        ...phase.items.slice(0, 4),
        index === phases.length - 1 ? 'Portfolio README' : 'Mini implementation task',
      ],
    }));

    this.interviewTopics = [
      `${course.title} fundamentals and real-time use cases`,
      `Project explanation using ${course.projects[0]?.title || 'portfolio project'}`,
      `Debugging, errors, edge cases, and production issues`,
      `Tools and workflow: ${tools.slice(0, 5).join(', ')}`,
      'Scenario-based questions from roles, responsibilities, and team workflows',
      'Resume walkthrough with measurable project outcomes',
    ];

    this.proofItems = [
      'One polished GitHub repository with clean commits and README',
      'Architecture diagram or screen flow for the main project',
      'Demo video or screenshots showing end-to-end execution',
      'Interview notes explaining concepts in your own words',
      'A deployment, dashboard, API collection, or prototype depending on the course',
    ];

    this.practiceTracks = [
      {
        day: 'Daily',
        focus: 'Concept + Implementation',
        activity: `Spend focused time on one ${course.title} topic and immediately convert it into a small working example.`,
      },
      {
        day: 'Every 2 Days',
        focus: 'Debugging Practice',
        activity:
          'Break a feature intentionally, read the error, trace the cause, and document the fix in simple words.',
      },
      {
        day: 'Weekly',
        focus: 'Project Progress',
        activity:
          'Complete one visible feature, commit it to GitHub, and update README notes with screenshots or commands.',
      },
      {
        day: 'Weekend',
        focus: 'Interview Revision',
        activity:
          'Revise fundamentals, explain your project flow aloud, and prepare scenario-based answers from your own work.',
      },
    ];

    this.mistakes = [
      'Learning too many tools at once without building one complete project.',
      'Copying code or designs without understanding why each step exists.',
      'Ignoring debugging, logs, edge cases, empty states, validation, and error handling.',
      'Not maintaining GitHub commits, README files, screenshots, diagrams, or demo notes.',
      'Preparing interview definitions without being able to explain your own project clearly.',
      'Skipping fundamentals and jumping directly to advanced topics too early.',
    ];

    this.capstoneBlueprint = [
      `Choose one strong ${course.title} use case from business, education, ecommerce, HR, finance, analytics, cloud, or automation.`,
      'Create a clean feature list with must-have, good-to-have, and future improvement sections.',
      `Use the main tools from this track: ${tools.slice(0, 6).join(', ')}.`,
      'Add realistic data, role-based flows, validation, error states, and professional UI or documentation.',
      'Prepare a demo script: problem, users, architecture, features, challenges, solution, and improvements.',
      'Publish source code, screenshots, setup guide, and final learning notes in a portfolio-friendly format.',
    ];

    this.masteryChecklist = [
      `I can explain what ${course.title} is and why companies use it.`,
      'I can build a complete practical project without depending only on copied examples.',
      'I can debug common errors and explain the reason behind the fix.',
      'I can connect tools, concepts, workflows, and business use cases clearly.',
      'I can answer interview questions using examples from my own project.',
      'I can show proof through GitHub, README, screenshots, demo, or deployment.',
    ];

    this.faqItems = [
      {
        question: `Who should learn ${course.title}?`,
        answer: `This course is useful for learners who want practical career skills, project confidence, and a clear path toward roles like ${course.roles
          .slice(0, 2)
          .map((role) => role.title)
          .join(' or ')}.`,
      },
      {
        question: 'How should I practice for best results?',
        answer:
          'Do concept learning and project building together. Every important topic should become a feature, note, diagram, query, API, screen, model, workflow, or deployment step.',
      },
      {
        question: 'What makes a project interview-ready?',
        answer:
          'A project becomes interview-ready when you can explain the problem, users, architecture, tools, data flow, challenges, debugging, improvements, and your exact contribution.',
      },
      {
        question: 'Is this enough for jobs?',
        answer:
          'The course gives a strong path, but job readiness depends on consistent practice, project quality, communication, interview preparation, and how clearly you demonstrate proof of skill.',
      },
    ];
  }
}
