import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Footer } from './components/footer/footer';
import { Navbar } from './components/navbar/navbar';
import { EnrollModal } from './shared/enroll-modal/enroll-modal';
import { FormsModule } from '@angular/forms';

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

  messages: ChatMessage[] = [
    { text: `👋 Hello! Welcome to Vidhura Tech 🚀`, type: 'bot' },
    {
      text: `🎯 We help you build a successful IT career with:\n\n📌 Real-time projects\n📌 Expert mentors\n📌 Placement assistance`,
      type: 'bot',
    },
    {
      text: `📚 Available Courses:\n\n☕ Java Full Stack\n🐍 Python Full Stack\n📊 Data Analytics`,
      type: 'bot',
    },
    {
      text: `👇 Please select a course to continue`,
      type: 'bot',
      options: ['☕ Java Full Stack', '🐍 Python Full Stack', '📊 Data Analytics'],
    },
  ];

  toggleChat() {
    this.chatOpen = !this.chatOpen;
    setTimeout(() => this.scrollToBottom(), 100);
  }

  /* ================= OPTION CLICK ================= */
  handleOption(option: string) {
    this.messages.push({ text: option, type: 'user' });

    this.typing = true;
    this.scrollToBottom();

    setTimeout(() => {
      this.typing = false;

      if (option.includes('Java')) {
        this.messages.push({
          text: `☕ *Java Full Stack Development*\n\n⏳ Duration: 4 Months\n💻 Technologies: Java, Spring Boot, Angular\n📦 Real-time Projects\n🎯 Placement Support`,
          type: 'bot',
          options: ['💰 Fees', '🏢 Placement', '⏳ Duration'],
        });
      } else if (option.includes('Python')) {
        this.messages.push({
          text: `🐍 *Python Full Stack Development*\n\n⏳ Duration: 4 Months\n💻 Technologies: Python, Django, React\n📦 Hands-on Projects\n🎯 Career Support`,
          type: 'bot',
          options: ['💰 Fees', '🏢 Placement', '⏳ Duration'],
        });
      } else if (option.includes('Data')) {
        this.messages.push({
          text: `📊 *Data Analytics Program*\n\n⏳ Duration: 3 Months\n📈 Tools: Excel, SQL, Power BI\n📊 Dashboard Projects\n🎯 Industry Skills`,
          type: 'bot',
          options: ['💰 Fees', '🏢 Placement', '🛠 Tools'],
        });
      } else if (option.includes('Fees')) {
        this.messages.push({
          text: `💰 *Course Fees*\n\n📌 Affordable pricing\n📌 Flexible payments\n📌 EMI options available`,
          type: 'bot',
          showCTA: true,
        });
      } else if (option.includes('Placement')) {
        this.messages.push({
          text: `🏢 *Placement Support*\n\n✅ Resume building\n✅ Mock interviews\n✅ HR training\n✅ Job referrals`,
          type: 'bot',
          showCTA: true,
        });
      } else if (option.includes('Duration')) {
        this.messages.push({
          text: `⏳ *Course Duration*\n\n📅 3–4 Months\n🕒 Daily sessions\n💻 Project-based learning`,
          type: 'bot',
          showCTA: true,
        });
      }

      this.messages.push({
        text: `🚀 Ready to start your career?\n\n👉 Click below to connect with us on WhatsApp`,
        type: 'bot',
        showCTA: true,
      });

      this.scrollToBottom();
    }, 1000);
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
        reply = `☕ Java Full Stack\n\n⏳ 4 Months\n💻 Real-time projects\n🎯 Placement support`;
      } else if (userMsg.toLowerCase().includes('python')) {
        reply = `🐍 Python Full Stack\n\n📦 Django + React\n💻 Hands-on training`;
      } else if (userMsg.toLowerCase().includes('data')) {
        reply = `📊 Data Analytics\n\n📈 Excel + SQL + Power BI\n📊 Dashboard projects`;
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

      this.scrollToBottom();
    }, 1200);
  }

  /* ================= WHATSAPP ================= */
  openWhatsApp(msg: string) {
    const message =
      '👋 Hello Vidhura Tech,\n\n' +
      '📚 I am interested in:\n' +
      '➡️ ' +
      msg +
      '\n\n' +
      '🚀 Ready to start my career!\n\n' +
      '📩 Please share details:\n' +
      '✅ Course information\n' +
      '✅ Fees structure\n' +
      '✅ Duration\n' +
      '✅ Placement support\n\n' +
      '🙏 Thank you!';

    window.open(`https://wa.me/919108057464?text=${encodeURIComponent(message)}`, '_blank');
  }

  scrollToBottom() {
    try {
      setTimeout(() => {
        this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;
      }, 100);
    } catch {}
  }
}
