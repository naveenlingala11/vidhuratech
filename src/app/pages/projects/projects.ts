import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PROJECTS, Project } from '../../data/projects.data';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './projects.html',
  styleUrl: './projects.css'
})
export class Projects implements OnInit {
  searchQuery: string = '';
  selectedLevel: string = 'all';
  selectedDomain: string = 'all';

  // Smart Project Hub State
  activeHubTech: 'java' | 'python' | 'ai' | 'fullstack' | 'iot' = 'java';

  setHubTech(tech: 'java' | 'python' | 'ai' | 'fullstack' | 'iot') {
    this.activeHubTech = tech;
  }

  // Interactive Seminar Assistant State
  selectedSeminarDomain: string = 'cloud';
  selectedSeminarTopic: string = 'Serverless Computing Architectures';

  seminarTopics: { [key: string]: string[] } = {
    cloud: [
      'Serverless Computing Architectures',
      'Edge Computing in IoT Ecosystems',
      'Kubernetes Orchestration & Container Security',
      'Hybrid Cloud Integration Challenges'
    ],
    ai: [
      'Generative Adversarial Networks (GANs)',
      'Explainable AI (XAI) in Healthcare',
      'Transformer Networks & Large Language Models',
      'Computer Vision for Autonomous Vehicles'
    ],
    cyber: [
      'Zero Trust Security Architectures',
      'Ransomware Detection & Mitigation',
      'Quantum Cryptography & Post-Quantum Algorithms',
      'Biometric Multi-Factor Authentication'
    ],
    blockchain: [
      'Smart Contract Vulnerability Detection',
      'DeFi Protocol Security Analysis',
      'Sharding in High-Throughput Blockchains',
      'Consensus Protocols in Web 3.0'
    ]
  };

  onSeminarDomainChange() {
    const topics = this.seminarTopics[this.selectedSeminarDomain];
    if (topics && topics.length > 0) {
      this.selectedSeminarTopic = topics[0];
    }
  }

  requestSeminarWhatsApp(topic: string) {
    const message = `Hello Vidhura Tech, I am interested in the Technical Seminar topic: "${topic}". Please share the abstract, speech script, PPT templates, and report information.`;
    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/919108057464?text=${encoded}`, '_blank');
  }

  // Flipped Deliverables State
  flippedDeliverables: { [key: number]: boolean } = {};

  toggleDeliverableFlip(index: number, event: Event) {
    event.stopPropagation();
    this.flippedDeliverables[index] = !this.flippedDeliverables[index];
  }

  // Modal State
  selectedProject: Project | null = null;
  activeModalTab: 'overview' | 'arch' | 'steps' | 'code' | 'viva' = 'overview';

  // Alert State
  alertMessage: string | null = null;
  alertType: 'success' | 'info' = 'info';

  projects: Project[] = PROJECTS;
  filteredProjects: Project[] = [];

  // Pagination State
  currentPage: number = 1;
  itemsPerPage: number = 6;
  paginatedProjects: Project[] = [];
  isPageTransitioning: boolean = false;

  get totalPages(): number {
    return Math.ceil(this.filteredProjects.length / this.itemsPerPage) || 1;
  }

  get totalItems(): number {
    return this.filteredProjects.length;
  }

  get startIndex(): number {
    return (this.currentPage - 1) * this.itemsPerPage;
  }

  get endIndex(): number {
    return Math.min(this.startIndex + this.itemsPerPage, this.totalItems);
  }

  ngOnInit() {
    this.applyFilters();
  }

  scrollToProjects() {
    const element = document.querySelector('.filter-controls-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  applyFilters() {
    this.filteredProjects = this.projects.filter(project => {
      // 1. Level Filter
      if (this.selectedLevel !== 'all') {
        const levelLower = project.difficulty.toLowerCase();
        if (this.selectedLevel === 'basic' && levelLower !== 'basic') return false;
        if (this.selectedLevel === 'intermediate' && levelLower !== 'intermediate') return false;
        if (this.selectedLevel === 'advanced' && levelLower !== 'advanced') return false;
      }

      // 2. Domain Filter
      if (this.selectedDomain !== 'all') {
        if (project.domain !== this.selectedDomain) return false;
      }

      // 3. Search Query Filter
      if (this.searchQuery.trim()) {
        const query = this.searchQuery.toLowerCase();
        const matchesTitle = project.title.toLowerCase().includes(query);
        const matchesDesc = project.shortDesc.toLowerCase().includes(query);
        const matchesTech = project.techStack.some(tech => tech.toLowerCase().includes(query));
        if (!matchesTitle && !matchesDesc && !matchesTech) return false;
      }

      return true;
    });

    // Reset pagination to first page on filter change
    this.currentPage = 1;
    this.updatePaginatedList();
  }

  updatePaginatedList() {
    this.paginatedProjects = this.filteredProjects.slice(this.startIndex, this.endIndex);
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages || page === this.currentPage) return;
    
    this.isPageTransitioning = true;
    
    // Smooth transition delay
    setTimeout(() => {
      this.currentPage = page;
      this.updatePaginatedList();
      this.isPageTransitioning = false;
      
      // Smooth scroll back to projects section
      const element = document.querySelector('.filter-controls-section');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 200);
  }

  changeItemsPerPage(size: number) {
    if (this.itemsPerPage === size) return;
    this.itemsPerPage = size;
    this.currentPage = 1;
    this.updatePaginatedList();
  }

  getPagesArray(): number[] {
    const total = this.totalPages;
    if (total <= 5) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    
    const pages: number[] = [];
    const current = this.currentPage;
    
    // Always include page 1
    pages.push(1);
    
    if (current > 3) {
      pages.push(-1); // Representing ellipsis
    }
    
    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    if (current < total - 2) {
      pages.push(-1); // Ellipsis
    }
    
    // Always include last page
    pages.push(total);
    
    return pages;
  }

  getArchitectureFlow(archStr: string): string[] {
    if (!archStr) return [];
    return archStr.split('->').map(s => s.trim());
  }

  onSearchChange() {
    this.applyFilters();
  }

  filterByLevel(level: string) {
    this.selectedLevel = level;
    this.applyFilters();
  }

  filterByDomain(domain: string) {
    this.selectedDomain = domain;
    this.applyFilters();
  }

  toggleArchitecture(project: Project, event: Event) {
    event.stopPropagation();
    project.showArch = !project.showArch;
  }

  openGuide(project: Project) {
    this.selectedProject = project;
    this.activeModalTab = 'overview';
    document.body.style.overflow = 'hidden'; // Lock background scrolling
  }

  closeModal() {
    this.selectedProject = null;
    document.body.style.overflow = 'auto'; // Release background scrolling
  }

  setModalTab(tab: 'overview' | 'arch' | 'steps' | 'code' | 'viva') {
    this.activeModalTab = tab;
  }

  requestMentorship(projectName: string, event: Event) {
    event.stopPropagation();
    const message = `Hello Vidhura Tech, I am interested in building the project: "${projectName}" and would like to get mentor guidance and code access.`;
    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/919108057464?text=${encoded}`, '_blank');
  }

  triggerDownload(project: Project) {
    if (!project) return;

    const code = project.skeletonCode;
    const lang = project.skeletonLanguage;
    let ext = 'txt';
    if (lang === 'typescript') ext = 'ts';
    else if (lang === 'java') ext = 'java';
    else if (lang === 'python') ext = 'py';
    else if (lang === 'sql') ext = 'sql';

    const filename = `${project.id}-skeleton.${ext}`;
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    this.alertType = 'success';
    this.alertMessage = `✓ "${project.title}" source outline file downloaded successfully!`;
    
    // Auto-clear alert
    setTimeout(() => {
      this.alertMessage = null;
    }, 4000);
  }

  requestServiceInfo() {
    const message = `Hello Vidhura Tech, I am interested in your upcoming Final-Year College Project Services (Synopsis, Code setup, Reports, PPTs, and Viva Mock Drills). Please add me to the early-bird list for the 30% discount!`;
    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/919108057464?text=${encoded}`, '_blank');
  }

  getStarsArray(count: number): number[] {
    return Array(count).fill(0);
  }
}
