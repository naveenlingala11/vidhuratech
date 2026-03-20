import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contact.html',
  styleUrl: './contact.css'
})
export class Contact {

  contactData = {
    name: '',
    email: '',
    phone: '',
    message: ''
  };

  submitContact() {

    console.log("Contact Data:", this.contactData);

    alert("Thank you! We will contact you soon.");

  }

}