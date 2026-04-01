import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-preparation',
  imports: [CommonModule],
  templateUrl: './preparation.html',
  styleUrl: './preparation.css',
})
export class Preparation {
  companies = [
    { name: 'TCS', logo: 'logos/tcs.svg', desc: 'Mass hiring company' },
    { name: 'Infosys', logo: 'logos/infosys.svg', desc: 'Strong in aptitude + coding' },
    { name: 'Wipro', logo: 'logos/wipro.svg', desc: 'Service based company' },
    { name: 'Cognizant', logo: 'logos/cognizant.svg', desc: 'IT services + consulting' },
    { name: 'EY', logo: 'logos/ey.svg', desc: 'Finance + tech consulting' },
    { name: 'IBM', logo: 'logos/ibm.svg', desc: 'Enterprise tech company' },
    { name: 'Amazon', logo: 'logos/amazon.svg', desc: 'Product based giant' },
    { name: 'Zoho', logo: 'logos/zoho.svg', desc: 'Product company India' },
    { name: 'Deloitte', logo: 'logos/deloitte.svg', desc: 'Consulting + audit' },
    { name: 'KPMG', logo: 'logos/kpmg.svg', desc: 'Big 4 firm' },
    { name: 'Meta', logo: 'logos/meta.svg', desc: 'FAANG company' },
    { name: 'Microsoft', logo: 'logos/microsoft.svg', desc: 'Top product company' },
    { name: 'PwC', logo: 'logos/pwc.svg', desc: 'Audit + consulting' },
    { name: 'Tech Mahindra', logo: 'logos/tech-mahindra.svg', desc: 'IT services' },
    { name: 'Salesforce', logo: 'logos/salesforce.svg', desc: 'Cloud CRM leader' }
  ];

  constructor(private router: Router) { }

  openCompany(company: any) {
    this.router.navigate(['/company', company.name]);
  }
}
