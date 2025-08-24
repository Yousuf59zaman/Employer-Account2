import { Component, OnInit, ViewChild } from '@angular/core';
import { CommunicationComponent } from '../communication/communication.component';
import { CommunicationService } from '../../Services/communication.service';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { EmailTemplateModalComponent } from '../../components/email-template-modal/email-template-modal.component';

@Component({
  selector: 'app-template-creator',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, EmailTemplateModalComponent],
  templateUrl: './template-creator.component.html',
  styleUrl: './template-creator.component.scss'
})
export class TemplateCreatorComponent implements OnInit {
  templateForm!: FormGroup;
  companyId: string = '';
  isTyping = false;
  currentCharCount = 0;
  maxCharacters = 3400;
  isAccordionOpen = true;

  @ViewChild('emailModal') emailModal!: EmailTemplateModalComponent;
  

  constructor(
    private router: Router, private activatedRoute: ActivatedRoute, private communicationService: CommunicationService, private fb: FormBuilder
  ) {}

  ngOnInit() {
    this.activatedRoute.queryParams.subscribe(params => {
      this.companyId = params['companyId'] || '';
      
    });

    this.templateForm = this.fb.group({
      companyId: [this.companyId, Validators.required],
      templateTitle: ['', Validators.required],
      templateText: ['', [Validators.required, Validators.maxLength(3400)]]
    });
  }

  templateDetails() {
    return { lastUpdated: new Date() };
  }

  updateCharacterCount() {
    const content = this.templateForm.get('templateText')?.value || '';
    this.currentCharCount = content.length;
    this.isTyping = this.currentCharCount > 0;
  }

  saveTemplate() {
    if (this.templateForm.valid) {
      this.communicationService.createTemplate(this.templateForm.value).subscribe(
        (response) => {
          if (response.responseType === "Success" && response.responseCode === 1) {
            this.templateForm.reset({ companyId: this.companyId });
            this.router.navigate(['/email-template']); 
          } else {
          }
        },
        (error) => {
          console.error('Error creating template:', error);
        }
      );
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



