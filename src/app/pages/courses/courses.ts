import { CommonModule } from '@angular/common';
import { AfterViewInit, Component } from '@angular/core';

interface Course {
  title: string;
  duration: string;
  level: string;
  rating: number;
  students: number;
  technologies: string[];
  highlights: string[];
  syllabus: string[];
  outcomes: string[];
  desc: string;
  open?: boolean; // 🔥 for accordion
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
      title: 'Java Full Stack Development',
      duration: '4 Months',
      level: 'Beginner → Advanced',
      rating: 4.8,
      students: 250,
      technologies: ['Java', 'Spring Boot', 'Microservices', 'Angular', 'MySQL'],
      highlights: [
        'Build enterprise-level applications',
        'Hands-on REST API development',
        'Real-time project experience',
        'Mock interviews & placement support',
      ],
      syllabus: [
        'Core Java & OOP concepts',
        'Spring Boot & Microservices',
        'REST API development',
        'Angular frontend',
        'Database design with MySQL',
      ],
      outcomes: [
        'Become Full Stack Developer',
        'Crack technical interviews',
        'Build real-world applications',
        'Gain industry-ready skills',
      ],
      desc: 'This course is designed to transform beginners into industry-ready Java Full Stack Developers with real-time project experience and hands-on coding.',
      open: false,
    },

    {
      title: 'Python Full Stack ',
      duration: '4 Months',
      level: 'Beginner → Advanced',
      rating: 4.7,
      students: 180,
      technologies: ['Python', 'Django', 'React', 'PostgreSQL','MongoDB'],
      highlights: [
        'End-to-end web development',
        'Build scalable applications',
        'Frontend + backend integration',
        'Career guidance',
      ],
      syllabus: [
        'Python fundamentals',
        'Django framework',
        'REST APIs',
        'React frontend',
        'Database integration',
      ],
      outcomes: [
        'Become Python Developer',
        'Build scalable apps',
        'Understand full stack flow',
        'Deploy real applications',
      ],
      desc: 'Master Python web development from scratch and learn how to build scalable full stack applications in real time.',
      open: false,
    },

    {
      title: 'Data Analytics',
      duration: '3 Months',
      level: 'Beginner Friendly',
      rating: 4.6,
      students: 120,
      technologies: ['Excel', 'SQL', 'Power BI','Machine Learning','SQL'],
      highlights: [
        'Work with real datasets',
        'Dashboard building',
        'Business insights',
        'Case studies',
        'Scenario based practise'
      ],
      syllabus: [
        'Excel basics to advanced',
        'SQL queries',
        'Power BI dashboards',
        'Data visualization',
      ],
      outcomes: [
        'Become Data Analyst',
        'Analyze business data',
        'Create dashboards',
        'Make data-driven decisions',
      ],
      desc: 'Learn how to analyze data and build dashboards used in real business scenarios.',
      open: false,
    },
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
