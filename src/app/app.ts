import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Footer } from './components/footer/footer';
import { Navbar } from './components/navbar/navbar';
import { EnrollModal } from './shared/enroll-modal/enroll-modal';
import { FormsModule } from '@angular/forms';
import { environment } from '../environments/environment';

interface ChatMessage {
  text: string;
  type: 'bot' | 'user';
  showCTA?: boolean;
  options?: string[];
}

@Component({
  selector: 'app-root',
  imports: [CommonModule, FormsModule, RouterOutlet, Navbar, Footer, EnrollModal],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  @ViewChild('chatContainer') chatContainer!: ElementRef;

  chatOpen = false;
  typing = false;
  userInput = '';

  constructor(private cd: ChangeDetectorRef) { }
  messages: ChatMessage[] = [
    { text: `👋 Hello! Welcome to Vidhura Tech 🚀`, type: 'bot' },
    {
      text: `🎯 We help you build a successful IT career with:\n\n📌 Real-time projects\n📌 Expert mentors\n📌 Placement assistance`,
      type: 'bot',
    },
    {
      text: `📚 Available Courses:\n\n☕ Java + Data Structures\n🐍 Python + Data Structures`,
      type: 'bot',
    },
    {
      text: `👇 Please select a course to continue`,
      type: 'bot',
      options: ['☕ Java + DS', '🐍 Python + DS'],
    },
  ];

  toggleChat() {
    this.chatOpen = !this.chatOpen;
    setTimeout(() => this.scrollToBottom(), 100);
  }

  /* ================= OPTION CLICK ================= */
  selectedCourse = '';

  handleOption(option: string) {
    this.messages.push({ text: option, type: 'user' });

    if (option.toLowerCase().includes('java')) {
      this.selectedCourse = 'Java + Data Structures';
    }
    if (option.toLowerCase().includes('python')) {
      this.selectedCourse = 'Python + Data Structures';
    }

    this.typing = true;
    this.scrollToBottom();

    setTimeout(() => {
      this.typing = false;

      if (option.includes('Java')) {
        this.messages.push({
          text: `☕ *Java + Data Structures*\n\n⏳ Duration: 30 Days\n💻 Core Java + OOPs + DS\n📦 Real-time Projects\n🎯 Placement Assistance`,
          type: 'bot',
          options: ['💰 Fees', '🏢 Placement', '⏳ Duration'],
        });
      }
      else if (option.includes('Python')) {
        this.messages.push({
          text: `🐍 *Python + Data Structures*\n\n⏳ Duration: 30 Days\n💻 Core Python + DS\n📦 Hands-on Projects\n🎯 Placement Assistance`,
          type: 'bot',
          options: ['💰 Fees', '🏢 Placement', '⏳ Duration'],
        });
      }

      // 🔥 COMMON RESPONSE (AFTER ANY CLICK)
      if (this.selectedCourse) {
        this.messages.push({
          text: `🚀 Ready to start your career?\n\n👉 Click below to connect on WhatsApp`,
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

      if (userMsg.toLowerCase().includes('java')) {
        reply = `☕ Java + Data Structures\n\n⏳ 30 Days\n💻 Core Java + OOPs\n📦 Real-time Projects\n🎯 Placement Assistance`;
      }
      else if (userMsg.toLowerCase().includes('python')) {
        reply = `🐍 Python + Data Structures\n\n⏳ 30 Days\n💻 Core Python + APIs\n📦 Hands-on Projects\n🎯 Placement Assistance`;
      } else if (userMsg.toLowerCase().includes('fees')) {
        reply = `💰 Fees Info\n\n📌 Flexible plans\n📌 Demo explanation`;
      } else {
        reply = `🤖 I can help with:\n\n📚 Courses\n💰 Fees\n🏢 Placement\n⏳ Duration`;
      }

      this.messages.push({
        text: reply,
        type: 'bot',
        showCTA: true,
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
