import { CommonModule } from '@angular/common';
import { AfterViewInit, Component } from '@angular/core';

interface Course {
  title: string;
  duration: string;
  level: string;
  rating: number;
  students: number;
  startDate: string;
  status: string;
  technologies: string[];
  highlights: string[];
  syllabus: string[];
  outcomes: string[];
  desc: string;
  open?: boolean;
}

@Component({
  selector: 'app-courses',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './courses.html',
  styleUrl: './courses.css',
})
export class Courses implements AfterViewInit {
  /* ================= STATS ================= */
  stats = [
    { label: 'Students', value: 500 },
    { label: 'Placements', value: 120 },
    { label: 'Courses', value: 10 },
    { label: 'Success Rate', value: 95 },
  ];

  /* ================= TESTIMONIALS ================= */
  testimonials = [
    { name: 'Rahul', text: 'Got placed in 3 months!' },
    { name: 'Sneha', text: 'Best training with real projects.' },
    { name: 'Kiran', text: 'Excellent mentorship & support.' },
  ];

  /* ================= COURSES ================= */
courses: Course[] = [
  {
    title: 'Core Python + Data Structures',
    duration: '45 Days',
    level: 'Beginner Friendly',
    rating: 4.9,
    students: 320,
    startDate: 'May 02, 2026',
    status: 'Live Batch',
    technologies: ['Python', 'Logic Building', 'DSA', 'Problem Solving'],
    highlights: [
      'Perfect for beginners',
      'Daily coding practice',
      'Interview-focused DSA',
      'Placement preparation'
    ],
    syllabus: [
      'Python Fundamentals',
      'Advanced Python',
      'Data Structures',
      'Problem Solving'
    ],
    outcomes: [
      'Become Job-Ready Python Developer',
      'Crack Coding Interviews',
      'Build Strong Programming Logic'
    ],
    desc: 'Start your software career with Python and Data Structures from scratch.',
    open: false
  },

  {
    title: 'Java Full Stack',
    duration: '4 Months',
    level: 'Beginner → Advanced',
    rating: 4.8,
    students: 250,
    startDate: 'Coming Soon',
    status: 'Upcoming',
    technologies: ['Java', 'Spring Boot', 'Angular', 'Microservices', 'MySQL'],
    highlights: [
      'Enterprise backend development',
      'Real-time project architecture',
      'REST API mastery',
      'Placement support'
    ],
    syllabus: [
      'Core Java',
      'Advanced Java',
      'Spring Boot',
      'Angular',
      'Microservices'
    ],
    outcomes: [
      'Become Java Full Stack Developer',
      'Build Enterprise Apps',
      'Crack Backend Interviews'
    ],
    desc: 'Complete enterprise-grade Java full stack developer program.',
    open: false
  },

  {
    title: 'React JS Mastery',
    duration: '30 Days',
    level: 'Intermediate',
    rating: 4.8,
    students: 140,
    startDate: 'Coming Soon',
    status: 'Upcoming',
    technologies: ['React', 'Redux', 'Hooks', 'Routing'],
    highlights: [
      'Modern frontend architecture',
      'Hooks & State Management',
      'Reusable Components'
    ],
    syllabus: ['React Basics', 'Hooks', 'Redux', 'Projects'],
    outcomes: ['Build Modern UIs', 'Become React Developer'],
    desc: 'Master React JS with projects and production-level practices.',
    open: false
  },

  {
    title: 'Angular Enterprise Development',
    duration: '35 Days',
    level: 'Intermediate',
    rating: 4.9,
    students: 110,
    startDate: 'Coming Soon',
    status: 'Upcoming',
    technologies: ['Angular', 'RxJS', 'Signals', 'NgRx'],
    highlights: [
      'Enterprise Angular patterns',
      'State management',
      'Real-world architecture'
    ],
    syllabus: ['Angular Basics', 'RxJS', 'Signals', 'NgRx'],
    outcomes: ['Become Angular Developer'],
    desc: 'Enterprise Angular training for real-world frontend development.',
    open: false
  },

  {
    title: 'Power BI + Data Analytics',
    duration: '30 Days',
    level: 'Beginner Friendly',
    rating: 4.7,
    students: 150,
    startDate: 'Coming Soon',
    status: 'Upcoming',
    technologies: ['Excel', 'SQL', 'Power BI', 'Analytics'],
    highlights: ['Dashboards', 'Business Insights', 'Visualization'],
    syllabus: ['Excel', 'SQL', 'Power BI'],
    outcomes: ['Become Data Analyst'],
    desc: 'Learn analytics and dashboarding with real business datasets.',
    open: false
  },

  {
    title: 'DevOps Engineering',
    duration: '45 Days',
    level: 'Intermediate',
    rating: 4.8,
    students: 90,
    startDate: 'Coming Soon',
    status: 'Upcoming',
    technologies: ['Docker', 'Kubernetes', 'Jenkins', 'AWS'],
    highlights: ['CI/CD', 'Deployment Pipelines', 'Infra Automation'],
    syllabus: ['Docker', 'K8s', 'Jenkins', 'AWS'],
    outcomes: ['Become DevOps Engineer'],
    desc: 'Learn deployment, automation, CI/CD and cloud DevOps practices.',
    open: false
  },

  {
    title: 'AWS Cloud Fundamentals',
    duration: '30 Days',
    level: 'Beginner Friendly',
    rating: 4.7,
    students: 70,
    startDate: 'Coming Soon',
    status: 'Upcoming',
    technologies: ['AWS', 'EC2', 'S3', 'IAM'],
    highlights: ['Cloud Basics', 'Deployments', 'Security'],
    syllabus: ['Cloud Intro', 'AWS Services'],
    outcomes: ['Cloud Fundamentals'],
    desc: 'Start your cloud journey with AWS essentials.',
    open: false
  },

  {
    title: 'SQL + Database Development',
    duration: '20 Days',
    level: 'Beginner Friendly',
    rating: 4.6,
    students: 100,
    startDate: 'Coming Soon',
    status: 'Upcoming',
    technologies: ['SQL', 'Joins', 'Optimization', 'Procedures'],
    highlights: ['Database Design', 'Optimization', 'Real Queries'],
    syllabus: ['SQL Basics', 'Advanced SQL'],
    outcomes: ['Become SQL Pro'],
    desc: 'Master relational databases and SQL development.',
    open: false
  },

  {
    title: 'SAP FICO',
    duration: '50 Days',
    level: 'Professional',
    rating: 4.7,
    students: 60,
    startDate: 'Coming Soon',
    status: 'Upcoming',
    technologies: ['SAP FICO'],
    highlights: ['Finance Workflows', 'ERP Training'],
    syllabus: ['SAP FICO Modules'],
    outcomes: ['Become SAP Consultant'],
    desc: 'Comprehensive SAP FICO training.',
    open: false
  },

  {
    title: 'SAP MM',
    duration: '45 Days',
    level: 'Professional',
    rating: 4.6,
    students: 50,
    startDate: 'Coming Soon',
    status: 'Upcoming',
    technologies: ['SAP MM'],
    highlights: ['Material Management', 'ERP Procurement'],
    syllabus: ['SAP MM Modules'],
    outcomes: ['Become SAP MM Consultant'],
    desc: 'Master SAP MM procurement and inventory workflows.',
    open: false
  }
];

  /* ================= SLIDER ================= */
  currentSlide = 0;

  /* ================= LIFECYCLE ================= */
  ngAfterViewInit() {
    this.animateStats();
    this.autoSlide();

    setTimeout(() => {
      this.animateStats();
    }, 200); // small delay ensures DOM ready

    this.autoSlide();
  }

  /* ================= ACCORDION ================= */
  toggleCourse(course: Course) {
    course.open = !course.open;
  }

  /* ================= STATS ANIMATION ================= */
  animateStats() {
    const elements = document.querySelectorAll('.stat-number');

    elements.forEach((el: any) => {
      let count = 0;
      const target = +el.getAttribute('data-target');

      const update = () => {
        count += Math.ceil(target / 50);

        if (count < target) {
          el.innerText = count;
          requestAnimationFrame(update);
        } else {
          el.innerText = target;
        }
      };

      update();
    });
  }

  /* ================= TESTIMONIAL SLIDER ================= */
  autoSlide() {
    setInterval(() => {
      this.currentSlide = (this.currentSlide + 1) % this.testimonials.length;
    }, 3000);
  }
}
