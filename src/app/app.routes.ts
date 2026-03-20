import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Courses } from './pages/courses/courses';
import { About } from './pages/about/about';
import { Contact } from './pages/contact/contact';
import { Curriculum } from './pages/curriculum/curriculum';
import { Admin } from './pages/admin/admin';
import { Placements } from './pages/placements/placements';
import { Resume } from './pages/resume/resume';
import { Terms } from './components/policy/terms/terms';
import { Privacy } from './components/policy/privacy/privacy';
import { Refund } from './components/policy/refund/refund';
import { Disclaimer } from './components/policy/disclaimer/disclaimer';
import { Cookies } from './components/policy/cookies/cookies';

export const routes: Routes = [
    { path: '', component: Home },
    { path: 'admin', component: Admin },
    { path: 'courses', component: Courses },
    { path: 'about', component: About },
    { path: 'contact', component: Contact },
    { path: 'curriculum', component: Curriculum },
    { path: 'placements', component: Placements },
    { path: 'resume', component: Resume },
    { path: 'terms', component: Terms },
    { path: 'privacy', component: Privacy },
    { path: 'refund', component: Refund },
    { path: 'disclaimer', component: Disclaimer },
    { path: 'cookies', component: Cookies },

];
