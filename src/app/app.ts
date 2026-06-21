import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, ViewChild } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { Footer } from './components/footer/footer';
import { Navbar } from './components/navbar/navbar';
import { EnrollModal } from './shared/enroll-modal/enroll-modal';
import { FormsModule } from '@angular/forms';
import { environment } from '../environments/environment';
import { filter } from 'rxjs';
import { AuthService } from './features/auth/services/auth.service';
import { DashboardLayout } from "./dashboard/layouts/dashboard-layout/dashboard-layout";
interface ChatMessage {
  text: string;
  type: 'bot' | 'user';
  showCTA?: boolean;
  options?: string[];
  suggestedRoutes?: { label: string; path: string; icon: string }[];
}

@Component({
  selector: 'app-root',
  imports: [CommonModule, FormsModule, RouterOutlet, Navbar, Footer, EnrollModal],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  @ViewChild('chatContainer') chatContainer!: ElementRef;
  hideLayout = false;
  isAuthPage = false;
  chatOpen = false;
  typing = false;
  userInput = '';
  selectedCourse = '';
  isDashboardRoute = false;
  isResumeRoute = false;

  constructor(
    private cd: ChangeDetectorRef,
    private router: Router,
    public authService: AuthService
  ) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        const url = event.urlAfterRedirects;
        this.isAuthPage =
          url === '/login' ||
          url === '/register' ||
          url.startsWith('/login?') ||
          url.startsWith('/register?');
        this.isDashboardRoute = url.startsWith('/dashboard');
        this.isResumeRoute =
          url.startsWith('/resume-workspace') ||
          url.startsWith('/resume-scanner') ||
          url.startsWith('/resume-customizer') ||
          url.startsWith('/resume-guide');
      });
  }

  messages: ChatMessage[] = [
    {
      text: `👋 Hello! Welcome to Vidhura Tech 🚀\n\nI am your Virtual Assistant. I'm here to help you guide through our training courses, placement drives, and practice tools.`,
      type: 'bot'
    },
    {
      text: `Quick links to explore our platform:`,
      type: 'bot',
      suggestedRoutes: [
        { label: 'Explore Final Year Projects', path: '/projects', icon: 'fa-diagram-project' },
        { label: 'Enter Practice Coding Labs', path: '/practice', icon: 'fa-code' },
        { label: 'View Placements Records', path: '/placements', icon: 'fa-briefcase' },
        { label: 'Try Resume Builder Tool', path: '/resume', icon: 'fa-file-invoice' }
      ]
    },
    {
      text: `👇 Select a course to view details:`,
      type: 'bot',
      options: ['☕ Java + DS Course', '🐍 Python + DS Course', '💼 Placement Prep Info'],
    },
  ];

  toggleChat() {
    this.chatOpen = !this.chatOpen;
    setTimeout(() => this.scrollToBottom(), 100);
  }

  navigateToRoute(path: string, event: Event) {
    event.stopPropagation();
    this.router.navigate([path]);
    this.chatOpen = false; // Close chat upon navigation
  }

  /* ================= OPTION CLICK ================= */
  handleOption(option: string) {
    this.messages.push({ text: option, type: 'user' });
    if (option.includes('Java')) {
      this.selectedCourse = 'Java + Data Structures';
    } else if (option.includes('Python')) {
      this.selectedCourse = 'Python + Data Structures';
    } else if (option.includes('Placement')) {
      this.selectedCourse = 'Placement Preparation';
    }

    this.typing = true;
    this.scrollToBottom();

    setTimeout(() => {
      this.typing = false;
      if (option.includes('Java')) {
        this.messages.push({
          text: `☕ *Java + Data Structures Training*\n\n⏳ *Duration:* 45 Days\n💻 *Curriculum:* Core Java + OOPs + DSA + Collections Framework\n📦 *Practicals:* 5+ Real-time projects & compiler challenges\n🎯 *Placements:* Unlimited mock interviews & resume review`,
          type: 'bot',
          options: ['💰 Fees for Java', '⏳ Duration info', '🏢 Career Outcomes'],
          suggestedRoutes: [
            { label: 'View Detailed Java Syllabus', path: '/courses', icon: 'fa-graduation-cap' },
            { label: 'Browse Java Projects', path: '/projects', icon: 'fa-folder-open' }
          ]
        });
      }
      else if (option.includes('Python')) {
        this.messages.push({
          text: `🐍 *Python + Data Structures Training*\n\n⏳ *Duration:* 45 Days\n💻 *Curriculum:* Core Python + File I/O + API integrations + DSA\n📦 *Practicals:* Hands-on scripting & project modules\n🎯 *Placements:* Placement cell credentials & mock drills`,
          type: 'bot',
          options: ['💰 Fees for Python', '⏳ Duration info', '🏢 Career Outcomes'],
          suggestedRoutes: [
            { label: 'View Detailed Python Syllabus', path: '/courses', icon: 'fa-graduation-cap' },
            { label: 'Browse Python Projects', path: '/projects', icon: 'fa-folder-open' }
          ]
        });
      }
      else if (option.includes('Placement')) {
        this.messages.push({
          text: `💼 *Placement Preparation Program*\n\n📈 Complete syllabus focused on cracking top IT company recruitment rounds.\n\n📌 Aptitude & reasoning training\n📌 Pseudo-code & competitive coding challenges\n📌 Tech interview FAQs (Java/Python/SQL)\n📌 Resume review & alignment`,
          type: 'bot',
          options: ['🐍 Python Course', '☕ Java Course'],
          suggestedRoutes: [
            { label: 'Check Placement History', path: '/placements', icon: 'fa-briefcase' },
            { label: 'Try Placement Prep Labs', path: '/preparation', icon: 'fa-shield-halved' }
          ]
        });
      }
      else if (option.includes('Fees')) {
        this.messages.push({
          text: `💰 *Course Fees & Payment Options*\n\nWe offer highly affordable training options for students with flexible installment schedules. Connect with our counselors to get the current syllabus pricing discount.`,
          type: 'bot',
          showCTA: true
        });
      }
      else if (option.includes('Duration')) {
        this.messages.push({
          text: `⏳ *Course Duration*\n\nStandard tracks take **45 Days** with daily classes. Fast-track options are available upon custom request.`,
          type: 'bot',
          showCTA: true
        });
      }
      else if (option.includes('Career')) {
        this.messages.push({
          text: `🏢 *Career & Placements*\n\nOur graduates are hired by leading tech MNCs. We offer resume-building assistance and coordinate active placement drives.`,
          type: 'bot',
          suggestedRoutes: [
            { label: 'See Hiring Partners', path: '/placements', icon: 'fa-handshake' },
            { label: 'Use Resume Builder', path: '/resume', icon: 'fa-file-invoice' }
          ]
        });
      }

      if (this.selectedCourse && !option.includes('Fees') && !option.includes('Duration')) {
        this.messages.push({
          text: `🚀 Ready to start your IT career?\n\n👉 Connect with our admissions counselors on WhatsApp for demo videos & registration:`,
          type: 'bot',
          showCTA: true,
        });
      }

      this.cd.detectChanges();
      this.scrollToBottom();
    }, 800);
  }

  /* ================= USER INPUT ================= */
  sendUserMessage() {
    if (!this.userInput.trim()) return;
    const userMsg = this.userInput;
    this.messages.push({ text: userMsg, type: 'user' });
    this.userInput = '';
    this.typing = true;
    this.scrollToBottom();

    setTimeout(() => {
      this.typing = false;
      let reply = '';
      let options: string[] = [];
      let routesList: { label: string; path: string; icon: string }[] = [];

      const query = userMsg.toLowerCase();
      if (query.includes('java')) {
        reply = `☕ *Java + Data Structures Training*\n\n⏳ Duration: 45 Days\n💻 Core Java + OOPs + DS\n📦 Real-time Projects\n🎯 Placement Assistance`;
        options = ['💰 Fees for Java', '🏢 Career Outcomes', '⏳ Duration info'];
        routesList = [
          { label: 'Browse Java Projects', path: '/projects', icon: 'fa-folder-open' },
          { label: 'Detailed Java Course', path: '/courses', icon: 'fa-graduation-cap' }
        ];
      }
      else if (query.includes('python')) {
        reply = `🐍 *Python + Data Structures Training*\n\n⏳ Duration: 45 Days\n💻 Core Python + DS\n📦 Hands-on Projects\n🎯 Placement Assistance`;
        options = ['💰 Fees for Python', '🏢 Career Outcomes', '⏳ Duration info'];
        routesList = [
          { label: 'Browse Python Projects', path: '/projects', icon: 'fa-folder-open' },
          { label: 'Detailed Python Course', path: '/courses', icon: 'fa-graduation-cap' }
        ];
      }
      else if (query.includes('fee') || query.includes('cost') || query.includes('price')) {
        reply = `💰 *Course Fees Info*\n\nWe provide student discounts and flexible payments. Get in touch via WhatsApp to check ongoing offers.`;
      }
      else if (query.includes('project')) {
        reply = `🚀 *Academic & Practice Projects*\n\nWe provide a library of 52+ premium projects across Java, Python, AI, and Full Stack domains with synopsis, code repositories, reports, and viva help.`;
        routesList = [{ label: 'View Academic Projects', path: '/projects', icon: 'fa-diagram-project' }];
      }
      else if (query.includes('placement') || query.includes('job') || query.includes('hire')) {
        reply = `🏢 *Placement Assistance & Drive Program*\n\nWe assist with resume building, mock viva defenses, technical interviews preparation, and direct references to hiring companies.`;
        routesList = [
          { label: 'View Placements History', path: '/placements', icon: 'fa-briefcase' },
          { label: 'Search Jobs Board', path: '/jobs-home', icon: 'fa-search' }
        ];
      }
      else if (query.includes('practice') || query.includes('code') || query.includes('lab')) {
        reply = `💻 *Interactive Coding Practice Labs*\n\nTest your coding skills directly in our web-based compiler labs featuring syntax checks and student leaderboard updates.`;
        routesList = [
          { label: 'Enter Practice Labs', path: '/practice', icon: 'fa-code' },
          { label: 'Check Leaderboard', path: '/leaderboard', icon: 'fa-trophy' }
        ];
      }
      else {
        reply = `🤖 Hello! I can help you navigate our platform and answer queries about courses, placement guides, or academic projects. Choose an option below or ask me any question.`;
        options = ['☕ Java + DS Course', '🐍 Python + DS Course', '💼 Placement Prep Info'];
        routesList = [
          { label: 'Explore Academic Projects', path: '/projects', icon: 'fa-diagram-project' },
          { label: 'Practice Labs', path: '/practice', icon: 'fa-code' }
        ];
      }

      this.messages.push({
        text: reply,
        type: 'bot',
        options: options.length > 0 ? options : undefined,
        suggestedRoutes: routesList.length > 0 ? routesList : undefined,
        showCTA: !routesList.length ? true : undefined
      });

      this.cd.detectChanges();
      this.scrollToBottom();
    }, 1200);
  }

  /* ================= WHATSAPP ================= */
  openWhatsApp(course: string) {
    if (!course) {
      course = 'General Inquiry';
    }
    const message =
      `👋 Hello Vidhura Tech Team,
🎯 I'm interested in joining:
➡️ ${course}
📌 Could you please share more details about the course?
📚 Syllabus & curriculum  
💰 Fees & payment options  
⏳ Duration & schedule  
🏢 Placement support  
🚀 Excited to start my journey with you!
🙏 Thank you`;
    const url = `https://api.whatsapp.com/send?phone=919108057464&text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  }

  scrollToBottom() {
    try {
      setTimeout(() => {
        this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;
      }, 100);
    } catch { }
  }
}
