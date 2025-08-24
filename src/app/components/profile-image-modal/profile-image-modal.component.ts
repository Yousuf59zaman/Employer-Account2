import { Component, EventEmitter, Input, Output, Inject, OnInit } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CheckNamesService } from '../../Services/check-names.service';
import { CompanyLogoErrorResponse, CompanyLogoUpdateRequest } from '../../Models/company';

interface UploadedImage {
  file: File;
  previewUrl: string;
}

@Component({
  selector: 'app-profile-image-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile-image-modal.component.html',
  styleUrls: ['./profile-image-modal.component.scss']
})
export class ProfileImageModalComponent implements OnInit {
  @Input() closeModal!: () => void;
  @Output() imageUploaded = new EventEmitter<string>();

  uploadForm: FormGroup;
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  uploadedImages: UploadedImage[] = [];
  isDragging = false;
  gridSize = 10;
  errorMessage: string | null = null;
  isUploading = false;
  latestImages: string[] = [];
  activeImageUrl: string | null = null;
  selectedImageUrl: string | null = null;
  visibleImagesStartIndex = 0;
  visibleImagesCount = 4;
  maxLogoCount = 10;
  isReplacing: boolean = false;

  private companyLogoLimits: { [key: string]: number } = {
    'ZRc9ZRU': 18,
    'ZiduZid': 16,
    'PECOZxc': 11,
    'IRY7IRd': 30,
    'ZRGwIEc': 11,
    'ZRG6ZiZ': 11,
    'ZRLwPEL': 15
  };

  constructor(
    private fb: FormBuilder,
    @Inject(DOCUMENT) private document: Document,
    private checkNamesService: CheckNamesService
  ) {
    this.uploadForm = this.fb.group({});
  }

  ngOnInit() {
    const companyId = localStorage.getItem('CompanyId');
    if (companyId) {
      const shortId = companyId.substring(0, 7);
      this.maxLogoCount = this.companyLogoLimits[shortId] || 10;
    }
    this.fetchLatestImages();
  }

  get visibleImages(): string[] {
    return this.latestImages.slice(this.visibleImagesStartIndex, this.visibleImagesStartIndex + this.visibleImagesCount);
  }

  canSlideLeft(): boolean {
    return this.visibleImagesStartIndex > 0;
  }

  canSlideRight(): boolean {
    return this.visibleImagesStartIndex + this.visibleImagesCount < this.latestImages.length;
  }

  slideLeft() {
    if (this.canSlideLeft()) {
      this.visibleImagesStartIndex = Math.max(0, this.visibleImagesStartIndex - this.visibleImagesCount);
    }
  }

  slideRight() {
    if (this.canSlideRight()) {
      this.visibleImagesStartIndex = Math.min(
        this.latestImages.length - this.visibleImagesCount,
        this.visibleImagesStartIndex + this.visibleImagesCount
      );
    }
  }

  fetchLatestImages() {
    const companyId = localStorage.getItem('CompanyId');
    if (!companyId) return;
    this.checkNamesService.getCompanyLogos(companyId).subscribe({
      next: (response) => {
        if (response.responseCode === 1 && response.data && response.data.length > 0) {
          const active = response.data.find(img => img.isActive === 1);
          const rest = response.data
            .filter(img => img.isActive !== 1)
            .sort((a, b) => b.logoName.localeCompare(a.logoName));
          this.latestImages = [];
          if (active) {
            const activeUrl = `https://corporate.bdjobs.com/logos/${active.logoName}?v=${new Date().getTime()}`;
            this.activeImageUrl = activeUrl;
            this.latestImages.push(activeUrl);
          }
          for (let i = 0; i < this.maxLogoCount - 1 && i < rest.length; i++) {
            this.latestImages.push(`https://corporate.bdjobs.com/logos/${rest[i].logoName}?v=${new Date().getTime()}`);
          }
          if (!active) {
            const sorted = response.data.sort((a, b) => b.logoName.localeCompare(a.logoName));
            this.latestImages = sorted.slice(0, this.maxLogoCount).map(img => `https://corporate.bdjobs.com/logos/${img.logoName}?v=${new Date().getTime()}`);
          }
          if (this.latestImages.length > 0) {
            this.selectedImageUrl = this.latestImages[0];
            this.previewUrl = this.selectedImageUrl;
            localStorage.setItem('CompanyLogoUrl', this.selectedImageUrl);
          }
        } else {
          this.latestImages = [];
          this.selectedImageUrl = null;
          this.previewUrl = null;
          localStorage.removeItem('CompanyLogoUrl');
          this.imageUploaded.emit('');
        }
      }
    });
    this.visibleImagesStartIndex = 0;
  }

  private validateImageDimensions(file: File): Promise<boolean> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        resolve(img.width === 300 && img.height === 300);
      };
      img.src = URL.createObjectURL(file);
    });
  }

  private validateFileType(file: File): boolean {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/bmp', 'image/webp'];
    return allowedTypes.includes(file.type.toLowerCase());
  }

  async handleFile(file: File) {
    this.errorMessage = null;
    if (!this.validateFileType(file)) {
      this.errorMessage = 'Invalid file extension. Allowed: .jpg, .jpeg, .png, .gif, .bmp, .webp';
      return;
    }
    const isValidDimensions = await this.validateImageDimensions(file);
    if (!isValidDimensions) {
      this.errorMessage = 'Image must be exactly 300x300 pixels.';
      return;
    }
    
    this.isUploading = true;
    
    const companyId = localStorage.getItem('CompanyId');
    if (!companyId) {
      this.errorMessage = 'Company ID not found';
      this.isUploading = false;
      return;
    }
    
    let oldLogoName: string | undefined = undefined;
    if (this.isReplacing && this.previewUrl && this.previewUrl.startsWith('https://corporate.bdjobs.com/logos/')) {
      const baseUrl = this.previewUrl.split('?')[0];
      oldLogoName = baseUrl.split('/').pop();
    }
    
    const formData = new FormData();
    formData.append('CompanyId', companyId);
    if (oldLogoName) {
      formData.append('LogoName', oldLogoName);
    }
    formData.append('ImageFile', file);
    
    fetch('https://api.bdjobs.com/EmployerAccount/api/EditAccount/InsertCompanyLogos', {
      method: 'POST',
      body: formData,
    })
      .then(async (res) => {
        this.isUploading = false;
        if (!res.ok) {
          const error = await res.json();
          if (error.dataContext?.length > 0) {
            this.errorMessage = error.dataContext.map((err: any) => err.message).join('\n');
          } else {
            this.errorMessage = 'Failed to upload image. Please try again.';
          }
          this.isReplacing = false;
          return;
        }
        const response = await res.json();
        if (response.responseCode === 1) {
          this.fetchLatestImages();
        } else {
          this.errorMessage = 'Failed to upload image. Please try again.';
        }
        this.isReplacing = false;
      })
      .catch((error) => {
        this.isUploading = false;
        this.errorMessage = 'Failed to upload image. Please try again.';
        this.isReplacing = false;
      });
    
    const fileInput = this.document.getElementById('fileInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  async onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      await this.handleFile(file);
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  async onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    const file = event.dataTransfer?.files?.[0];
    if (file) {
      await this.handleFile(file);
    }
  }

  onSubmit() {
    if (this.selectedImageUrl) {
      if (this.selectedImageUrl.startsWith('https://corporate.bdjobs.com/logos/')) {
        const baseUrl = this.selectedImageUrl.split('?')[0];
        const logoName = baseUrl.split('/').pop();
        const companyId = localStorage.getItem('CompanyId');
        
        if (logoName && companyId) {
          const updateRequest: CompanyLogoUpdateRequest = {
            companyId: companyId,
            logoName: logoName
          };
          
          this.isUploading = true;
          this.checkNamesService.updateCompanyLogo(updateRequest).subscribe({
            next: (response) => {
              this.isUploading = false;
              if (response.responseCode === 1) {
                localStorage.setItem('CompanyLogoUrl', this.selectedImageUrl!);
                this.imageUploaded.emit(this.selectedImageUrl!);
                this.closeModal();
              } else {
                this.errorMessage = 'Failed to update image';
              }
            }, 
          });
        } 
      } else {
        localStorage.setItem('CompanyLogoUrl', this.selectedImageUrl!);
        this.imageUploaded.emit(this.selectedImageUrl);
        this.closeModal();
      }
    } else {
      localStorage.removeItem('CompanyLogoUrl');
      this.imageUploaded.emit('');
      this.closeModal();
    }
  }

  removeImage() {
    if (this.selectedImageUrl && this.selectedImageUrl.startsWith('https://corporate.bdjobs.com/logos/')) {
      const baseUrl = this.selectedImageUrl.split('?')[0];
      const logoName = baseUrl.split('/').pop();
      const companyId = localStorage.getItem('CompanyId');
      
      if (logoName && companyId) {
        const deleteRequest = {
          companyId: companyId,
          logoName: logoName
        };
        
        this.checkNamesService.deleteCompanyLogo(deleteRequest).subscribe({
          next: (response) => {
            if (response.responseCode === 1) {
              this.fetchLatestImages();
              localStorage.removeItem('CompanyLogoUrl');
            } else if (response.dataContext && (response.dataContext as any[]).length > 0) {
              this.errorMessage = (response.dataContext as any[])
                .map((err: any) =>
                  err.message === "Cannot delete company logo. This logo is currently being used in one or more job postings"
                    ? "Unable to delete company logo. It was used in one or more previous job postings"
                    : err.message
                ).join('\n');
            } else {
              this.errorMessage = 'Failed to delete image';
            }
          },
          error: (error) => {
            this.errorMessage = 'Failed to delete image. Please try again.';
          }
        });
      }
    } else {
      this.selectedFile = null;
      this.previewUrl = null;
      this.errorMessage = null;
      localStorage.removeItem('CompanyLogoUrl');
      if (this.latestImages.length > 0) {
        this.selectImageFromApi(this.latestImages[0]);
      }
    }
  }

  selectImage(uploadedImage: UploadedImage) {
    this.selectedFile = uploadedImage.file;
    this.previewUrl = uploadedImage.previewUrl;
    this.errorMessage = null;
  }

  selectImageFromApi(url: string) {
    this.selectedImageUrl = url;
    this.previewUrl = url;
  }

  triggerFileInput(isReplace: boolean = false) {
    this.isReplacing = isReplace;
    if (this.latestImages.length < this.maxLogoCount || isReplace) {
      const fileInput = this.document.getElementById('fileInput') as HTMLInputElement;
      if (fileInput) {
        fileInput.click();
      }
    }
  }

  trackByImgUrl(index: number, url: string): string {
    return url;
  }
} 