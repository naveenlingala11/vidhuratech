import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-checkout-help',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './checkout-help.html',
  styleUrl: './checkout-help.css',
})
export class CheckoutHelp implements OnInit {
  searchQuery = '';
  activeFaqIndex: number | null = null;
  activeTab = 'all';

  constructor(public router: Router) {}

  ngOnInit() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  faqs = [
    {
      category: 'payment',
      question: 'What payment methods are supported on Razorpay?',
      answer: 'Our secure checkout supports all major payment modes including UPI (Google Pay, PhonePe, Paytm), Credit & Debit Cards (Visa, Mastercard, RuPay), Net Banking (SBI, HDFC, ICICI, etc.), Popular Wallets, and cardless/card EMI options.'
    },
    {
      category: 'payment',
      question: 'What if money is deducted but the enrollment is not active?',
      answer: 'Don\'t worry! Sometimes network delays between Razorpay and banking servers can delay receipt validation. Usually, the enrollment becomes active within 15-30 minutes. If it exceeds 1 hour, please email us with the payment screenshot at support@vidhuratech.com or call +91 9108057464.'
    },
    {
      category: 'invoices',
      question: 'How do I download my payment invoice?',
      answer: 'After a successful transaction, an official tax invoice is generated instantly and sent to your registered email address. You can also access and download all your past invoices directly from the "Invoices" section in your Student Dashboard.'
    },
    {
      category: 'enrollment',
      question: 'Can I change my batch after completing payment?',
      answer: 'Yes! If you accidentally selected the wrong batch, or want to postpone your course start date, you can request a batch transfer within 7 days of enrollment. Simply go to settings or contact your assigned mentor.'
    },
    {
      category: 'refund',
      question: 'What is your refund policy?',
      answer: 'We offer a 100% money-back guarantee if requested within 7 days of course commencement, provided you haven\'t completed more than 2 live classes or accessed paid labs/quizzes. Read our complete Refund Policy link in the footer.'
    },
    {
      category: 'access',
      question: 'How do I access the course material after payment?',
      answer: 'Once payment succeeds, your account is immediately upgraded. Go to "Student Dashboard" -> "My Courses" or "LMS Batches". You will find the syllabus, coding sandboxes, live class links, and student forums instantly active.'
    }
  ];

  toggleFaq(index: number) {
    this.activeFaqIndex = this.activeFaqIndex === index ? null : index;
  }

  switchTab(category: string) {
    this.activeTab = category;
    this.activeFaqIndex = null;
  }

  get filteredFaqs() {
    let list = this.faqs;
    if (this.activeTab !== 'all') {
      list = list.filter(f => f.category === this.activeTab);
    }
    if (!this.searchQuery.trim()) return list;
    const query = this.searchQuery.toLowerCase();
    return list.filter(faq => 
      faq.question.toLowerCase().includes(query) || 
      faq.answer.toLowerCase().includes(query)
    );
  }

  contactWhatsApp() {
    window.open('https://wa.me/919108057464', '_blank');
  }

  callSupport() {
    window.location.href = 'tel:9108057464';
  }
}
