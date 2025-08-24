import { CommonModule, DatePipe } from '@angular/common';
import { Component, signal, WritableSignal } from '@angular/core';
import { CommunicationService } from '../../Services/communication.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-email-template',
  standalone: true,
  imports: [DatePipe, CommonModule],
  templateUrl: './email-template.component.html',
  styleUrl: './email-template.component.scss'
})
export class EmailTemplateComponent {
  
  emailTemplates: WritableSignal<{  templateID: number; name: string; lastUpdated: Date }[]> = signal([]);
  constructor(private communicationService: CommunicationService, private router: Router, private route:ActivatedRoute) {}
  rowHoverIndex: number | null = null;
  companyId: string = ''; 
  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.companyId = params['companyId'] || this.communicationService.getCompanyId();
      this.companyId = window.localStorage.getItem('CompanyId') || '';

      if (!this.companyId) {
        console.error('Company ID is missing in EmailTemplateComponent');
        return;
      }
      this.communicationService.getCompanyId(); 
      this.loadEmailTemplates(this.companyId);
    });
  }
  onRowHover(index: number) {
    this.rowHoverIndex = index;
  }


  onRowLeave() {
    this.rowHoverIndex = null;
  }
  loadEmailTemplates(companyId: string): void {
    this.communicationService.getEmailTemplates(companyId).subscribe(templates => {
      this.emailTemplates.set(
        templates.map(template => ({
          templateID: template.templateID,
          name: template.tmplateTitle,
          lastUpdated: new Date(template.updatedOn)
        }))
      );
    });
  }
  get emailTemplatesList() {
    return this.emailTemplates(); 
  }
  
  redirectTo(url: string) {
    window.location.href = url;
  }

  viewTemplate(templateID: number) {
    this.router.navigate(['/template-viewer'], { queryParams: { templateID: templateID, companyId: this.companyId } });
  }
  viewTemplateEditor(templateID: number) {
    this.router.navigate(['/template-editor'], { queryParams: { templateID: templateID, companyId: this.companyId } });
  }
  createTemplate() {
    this.router.navigate(['/template-creator'], { queryParams: { companyId: this.companyId } });
  }
}
