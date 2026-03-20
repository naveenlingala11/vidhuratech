import { CommonModule } from '@angular/common';
import { AfterViewInit, Component } from '@angular/core';
import { ModalService } from '../../services/modal';

@Component({
  selector: 'app-placements',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './placements.html',
  styleUrl: './placements.css',
})
export class Placements implements AfterViewInit {
  counters = [
    { label: 'Students Placed', value: 0, target: 120 },
    { label: 'Hiring Companies', value: 0, target: 35 },
    { label: 'Success Rate', value: 0, target: 95 },
    { label: 'Interviews Scheduled', value: 0, target: 300 },
  ];

  ngAfterViewInit() {
    this.animateCounters();
  }

  animateCounters() {
    this.counters.forEach((counter) => {
      let count = 0;
      const interval = setInterval(() => {
        count++;
        counter.value = count;
        if (count >= counter.target) clearInterval(interval);
      }, 20);
    });
  }

  companies = [
    { name: 'TCS' },
    { name: 'Infosys' },
    { name: 'Wipro' },
    { name: 'HCL' },
    { name: 'Tech Mahindra' },
    { name: 'Capgemini' },
  ];

  process = [
    {
      step: '01',
      title: 'Skill Development',
      desc: 'Strong foundation with real-time practical training and projects.',
    },
    {
      step: '02',
      title: 'Resume Building',
      desc: 'Professional resume creation aligned with industry expectations.',
    },
    {
      step: '03',
      title: 'Mock Interviews',
      desc: 'Practice with real interview scenarios and expert feedback.',
    },
    {
      step: '04',
      title: 'Placement Support',
      desc: 'Continuous support until you get placed successfully.',
    },
  ];

  successStories = [
    {
      name: 'Karthik',
      company: 'TCS',
      role: 'Java Developer',
      msg: 'The placement training helped me crack interviews confidently.',
    },
    {
      name: 'Divya',
      company: 'Infosys',
      role: 'Frontend Developer',
      msg: 'Mock interviews and projects made a huge difference.',
    },
    {
      name: 'Rahul',
      company: 'Wipro',
      role: 'Software Engineer',
      msg: 'From beginner to professional — amazing journey.',
    },
  ];

  constructor(private modalService: ModalService) {}

  openEnrollModal() {
    this.modalService.open();
  }
}
