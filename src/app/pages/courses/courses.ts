import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-courses',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './courses.html',
  styleUrl: './courses.css'
})
export class Courses {

  courses = [

    {
      title: 'Java Full Stack Development',
      duration: '4 Months',
      level: 'Beginner to Advanced',
      technologies: [
        'Core Java',
        'Spring Boot',
        'REST APIs',
        'Angular',
        'Microservices',
        'MySQL'
      ],
      desc: 'Become a professional Java Full Stack Developer with real-time projects and industry practices.'
    },

    {
      title: 'Python Full Stack Development',
      duration: '4 Months',
      level: 'Beginner to Advanced',
      technologies: [
        'Python',
        'Django',
        'REST APIs',
        'React',
        'PostgreSQL',
        'Project Development'
      ],
      desc: 'Learn Python web development from scratch and build powerful full stack applications.'
    },

    {
      title: 'Data Analytics',
      duration: '3 Months',
      level: 'Beginner Friendly',
      technologies: [
        'Excel',
        'SQL',
        'Power BI',
        'Data Visualization',
        'Dashboard Development'
      ],
      desc: 'Master data analytics tools and build dashboards to analyze and visualize business data.'
    }

  ];

}