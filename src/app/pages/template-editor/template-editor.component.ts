import { Component, signal, ViewChild, WritableSignal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommunicationService } from '../../Services/communication.service';
import { CommonModule, DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { EmailTemplateModalComponent } from '../../components/email-template-modal/email-template-modal.component';

@Component({
  selector: 'app-template-editor',
  standalone: true,
  imports: [DatePipe,CommonModule, ReactiveFormsModule, EmailTemplateModalComponent],
  templateUrl: './template-editor.component.html',
  styleUrl: './template-editor.component.scss'
})
export class TemplateEditorComponent {
   templateDetails: WritableSignal<{ name: string; lastUpdated: Date; content: string } | null> = signal(null);
    templateID!: number;
    companyId!: string;
    templateForm!: FormGroup;
    maxCharacters = 3400;
    currentCharCount = 0;
    isTyping = false;
    isAccordionOpen = true;
    @ViewChild('emailModal') emailModal!: EmailTemplateModalComponent;


    constructor(
      private route: ActivatedRoute, private communicationService: CommunicationService,private fb: FormBuilder, private router: Router) {}
  
    ngOnInit(): void {
      this.route.queryParams.subscribe(params => {
        this.templateID = params['templateID'];
        this.companyId = params['companyId'];
        if (this.templateID) {
          this.loadTemplate();
        }
      });
      this.templateForm = this.fb.group({
        name: ['', [Validators.required, Validators.maxLength(15)]],
        content: ['', [Validators.required, Validators.maxLength(3400)]],
      });
    }
  
    loadTemplate() {
      this.communicationService.getemailTemplateById(this.companyId, this.templateID).subscribe(
        (response) => {
          if (response.responseType === 'success' && response.data) {
            const { templateTitle, updatedOn, templateText } = response.data;
            
            this.templateDetails.set({
              name: templateTitle,
              lastUpdated: new Date(updatedOn),
              content: templateText
            });
  
            this.templateForm.patchValue({
              name: templateTitle,
              content: templateText
            });
          }
        },
        (error) => {
          console.error('Error loading template:', error);
        }
      );
    }
  
    saveTemplate() {
      const nameControl = this.templateForm.get('name');
      const contentControl = this.templateForm.get('content');

      if (!nameControl?.value?.trim() && !contentControl?.value?.trim()) {
        alert('Template name field is blank!');
        return;
      }

      if (!nameControl?.value?.trim()) {
        alert('Template name field is blank!');
        return;
      }

      if (!contentControl?.value?.trim()) {
        alert('Template text field is blank!');
        return;
      }

      const updatedTemplate = {
        templateID: this.templateID,
        templateTitle: this.templateForm.value.name,
        templateText: this.templateForm.value.content,
        companyId: this.companyId, 
        updatedOn: new Date(),
      };
  
      this.communicationService.emailTemplateUpdate(this.companyId, updatedTemplate).subscribe(
        (response) => {
          if (response.responseCode === 1) { 
            this.router.navigate(['/email-template']); 
          } else {
            console.error('Error in response:', response);
          }
        },
        (error) => {
          console.error('Error updating template:', error);
        }
      );
    }
    updateCharacterCount(): void {
      const contentControl = this.templateForm.get('content');
      if (contentControl) {
        this.currentCharCount = contentControl.value.length;
        this.isTyping = this.currentCharCount > 0;
      }
    }
  redirectTo(url: string) {
    window.location.href = url;
  }

  toggleAccordion() {
    this.isAccordionOpen = !this.isAccordionOpen;
  }
  openExample() {
    this.emailModal.openModal();
  }
  
 
}
