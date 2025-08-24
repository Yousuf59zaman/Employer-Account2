import { Component, Input, OnInit, signal } from '@angular/core';
import { HeaderComponent } from "../../components/header/header.component";
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CommunicationService } from '../../Services/communication.service';
import { CommonModule, DatePipe } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { Job } from '../../Models/communication';

@Component({
  selector: 'app-communication',
  standalone: true,
  imports: [ReactiveFormsModule , CommonModule,],
  templateUrl: './communication.component.html',
  styleUrl: './communication.component.scss'
})
export class CommunicationComponent implements OnInit {
  jobs: Job[] = [];
  sentEmails = signal({ cv: 0, ap: 0, iv: 0 });
  readEmails = signal({ cv: 0, ap: 0, iv: 0 });
  keyword = new FormControl('');
  currentPage = 1;
  pageSize = 5;
  totalPages: number = 0;
  loading = signal<boolean>(false); 
  totalPagesArray: number[] = [];
  companyId: string = ''; 
  dataLoaded = signal<boolean>(false);
  paginatedJobs: Job[] = [];
  
  constructor(private communicationService: CommunicationService, private router: Router, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.companyId = localStorage.getItem('CompanyId') || '';
    
    
    if (!this.companyId) {
      this.companyId = localStorage.getItem('CompanyId') || '';
    }
    
   
    if (this.companyId) {
      this.communicationService.setCompanyId(this.companyId);
     
      this.fetchEmails().then(() => {
        this.fetchJobs();
      });
    } else {
      this.loading.set(false);
    }
  }
  
  redirectTo(url: string) {
    window.location.href = url;
  }
  
  fetchJobs(searchQuery: string = ''): void {
    this.loading.set(true);
    this.communicationService.getJobEmails(this.companyId, searchQuery).subscribe({
      next: (response) => {
        if (response.data && response.data.list?.length > 0) {
          this.jobs = response.data.list;
          this.totalPages = Math.ceil(this.jobs.length / this.pageSize);
          this.totalPagesArray = Array.from({ length: this.totalPages }, (_, i) => i + 1);
          this.updatePaginatedJobs();
        } else {
          this.jobs = [];
          this.totalPages = 0;
          this.totalPagesArray = [];
          this.paginatedJobs = [];
        }
        this.loading.set(false);
        this.dataLoaded.set(true);
      },
      error: (error) => {
        console.error('Error fetching jobs:', error);
        this.jobs = [];
        this.totalPages = 0;
        this.totalPagesArray = [];
        this.paginatedJobs = [];
        this.loading.set(false);
        this.dataLoaded.set(true);
      }
    });
  }
  
  updatePaginatedJobs(): void {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedJobs = this.jobs.slice(startIndex, endIndex);
  }
  
  onSearch(): void {
    const query = this.keyword.value?.trim();
    this.currentPage = 1;
    this.fetchJobs(query);
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePaginatedJobs();
    }
  }
  
  fetchEmails(): Promise<void> {
    return new Promise((resolve) => {
      this.communicationService.getEmailsOverview(this.companyId).subscribe({
        next: (response) => {
          if (response.responseType === 'success' && response.data) {
         
            this.sentEmails.set({
              cv: response.data.emailCVbank || 0,
              ap: response.data.emailByJobs || 0,
              iv: response.data.invited || 0
            });
    
            this.readEmails.set({
              cv: response.data.readEmailCVbank || 0,
              ap: response.data.readEmailbyJobs || 0,
              iv: response.data.invitedRead || 0
            });
          }
          resolve();
        },
        error: (error) => {
          console.error('Error fetching emails:', error);
          resolve();
        }
      });
    });
  }
  
  redirectToEmailTemplate(): void {
    this.router.navigate(['/email-template'], { queryParams: { companyId: this.companyId } });
  }
  
  redirectToSentEmails(c_Type: string) {
    this.router.navigate(['/sent-emails'], { queryParams: { companyId: this.companyId, c_Type } }); 
  }
  
  redirectToReadEmails(c_Type: string) {
    this.router.navigate(['/read-emails'], { 
      queryParams: { 
        companyId: this.companyId, 
        c_Type,
        r_Type: 1
      } 
    });
  }

  redirectToJobSentEmails(jobId: number) {
    this.router.navigate(['/sent-emails'], { 
      queryParams: { 
        companyId: this.companyId, 
        jobId: jobId,
        type: 'job',
        r_Type: 0
      } 
    });
  }

  redirectToJobReadEmails(jobId: number) {
    this.router.navigate(['/read-emails'], { 
      queryParams: { 
        companyId: this.companyId, 
        jobId: jobId,
        type: 'job',
        r_Type: 1
      } 
    });
  }
}
  


