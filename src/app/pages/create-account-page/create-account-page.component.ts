import { Component, computed, HostListener, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule} from '@angular/forms';
import { CheckNamesService } from '../../Services/check-names.service';
import { debounceTime, distinctUntilChanged, filter, map } from 'rxjs/operators';
import { InputFieldComponent } from '../../components/input-field/input-field.component';
import { TextAreaComponent } from '../../components/text-area/text-area.component';
import { CommonModule } from '@angular/common';
import { BehaviorSubject, Subject } from 'rxjs';
import { IndustryTypeResponseDTO, IndustryType, LocationResponseDTO, RLNoRequestModel } from '../../Models/company';
import { ErrorModalComponent } from "../../components/error-modal/error-modal.component";
import { RadioGroupComponent } from '../../components/radio-group/radio-group.component';
import { PricingPolicyComponent } from '../../components/pricing-policy/pricing-policy.component';
import { MathCaptchaComponent } from '../../components/math-captcha/math-captcha.component';
import { filePath,countrie ,disabilities} from '../../constants/file-path.constants';
import { AddIndustryModalComponent } from "../../components/add-industry-modal/add-industry-modal.component";
import { AuthService } from '../../Services/shared/auth.service';
import { passwordMatchValidator, yearValidator, banglaTextValidator, noWhitespaceValidator, noBlacklistCharacters, companyAddressValidator } from '../../utils/validators';
import { Router } from '@angular/router';
@Component({
  selector: 'app-create-account-page',
  standalone: true,
  imports: [MathCaptchaComponent,PricingPolicyComponent,RadioGroupComponent,InputFieldComponent,
    TextAreaComponent,ReactiveFormsModule,CommonModule,ErrorModalComponent,MathCaptchaComponent,AddIndustryModalComponent],
  templateUrl: './create-account-page.component.html',
  styleUrls: ['./create-account-page.component.scss']
})
export class CreateAccountPageComponent implements OnInit {
  filePath = filePath;
  countrie = countrie;
  disabilities = disabilities;
  @ViewChild(MathCaptchaComponent) captchaComponent!: MathCaptchaComponent;
  isCaptchaValid = false;
  selectedCountry: LocationResponseDTO | null = null;
  searchTerm = new FormControl('');
  isOpenCountry: boolean = false;
  isOpen: boolean = false;
  showAddIndustryButton: boolean = false; 
  fieldsOrder: string[] = [];
  newlyAddedIndustriesnew: { [key: number]: IndustryTypeResponseDTO[] } = {};

  industries: BehaviorSubject<IndustryType[]> = new BehaviorSubject<IndustryType[]>([]);
  industryTypes: IndustryTypeResponseDTO[] = [];
  allIndustryTypes: IndustryTypeResponseDTO[] = []; 
  filteredIndustryTypes: IndustryTypeResponseDTO[] = [];
  countries: LocationResponseDTO[] = [];
  districts: LocationResponseDTO[] = [];
  thanas: LocationResponseDTO[] = [];
  newlyAddedIndustries: IndustryTypeResponseDTO[] = [];
  outsideBd: boolean = false;  
  selectedIndustries: { IndustryValue: number; IndustryName: string }[] = [];
currentCountry = { name: 'Bangladesh', code: 'BD', phoneCode: '+880' }; 
currentFlagPath = this.filePath['Bangladesh'];
filteredCountriesList = this.countrie;

  employeeForm: FormGroup = new FormGroup({
    
    facilitiesForDisabilities: new FormControl(0),
    username: new FormControl('', [Validators.required, noBlacklistCharacters]),  
    password: new FormControl('', [Validators.required,Validators.maxLength(10), noBlacklistCharacters]),
    confirmPassword: new FormControl('', [Validators.required]),
    companyName: new FormControl('', [Validators.required, noWhitespaceValidator()]),
    companyNameBangla: new FormControl('',[banglaTextValidator()]),
    yearsOfEstablishMent: new FormControl('', [Validators.required, yearValidator()]),
    companySize: new FormControl('', [Validators.required]),
    country: new FormControl('',[Validators.required]), 
    district: new FormControl('',[Validators.required]),
    thana: new FormControl('',[Validators.required]), 
    companyAddress: new FormControl('', [Validators.required, noWhitespaceValidator(), companyAddressValidator()]),
    outSideBd: new FormControl('',[Validators.required]),
    outsideBDCompanyAddress: new FormControl('',[Validators.required]),
    industryType: new FormControl('-1'),
    industryTypeArray: new FormControl('', [Validators.required]),
    businessDesc: new FormControl(''),
    tradeNo: new FormControl(''),
    webUrl: new FormControl(''),
    contactName: new FormControl('', [Validators.required, noWhitespaceValidator()]),
    contactDesignation: new FormControl('', [Validators.required, noWhitespaceValidator()]),
    contactEmail: new FormControl('', [Validators.required, Validators.email, noWhitespaceValidator()]),
    contactMobile: new FormControl('', [Validators.required]),
    inclusionPolicy: new FormControl(0),
    support: new FormControl(0),
    disabilityWrap: new FormControl(''),
    training: new FormControl(0),
    industryName: new FormControl('', [Validators.maxLength(100),]),
    hidEntrepreneur: new FormControl(''),
    rlNoStatus: new FormControl(''),
    outsideBDCompanyAddressBng: new FormControl(''),
    captchaInput: new FormControl('', [Validators.required, Validators.maxLength(2),Validators.pattern('^[0-9]*$')]),
    companyAddressBangla: new FormControl('',[banglaTextValidator()]),
    rlNo: new FormControl(null,[Validators.pattern('^[0-9]*$')]),
    isPolicyAcceptedControl: new FormControl('')
  },{ validators: passwordMatchValidator() }
);
  formControlSignals = computed(() => {
    const signals: { [key: string]: FormControl<any> } = {};
    Object.keys(this.employeeForm.controls).forEach(key => {
      signals[key] = this.employeeForm.get(key) as FormControl<any>;
    });
    return signals;
  });
  usernameExistsMessage: string = '';
  companyNameExistsMessage: string = '';
  isUniqueCompanyName: boolean = false;
  rlErrorMessage: string = '';
  showError: boolean = false;
  showErrorModal: boolean = false; 
  showAll: boolean = false;  
  isDropdownUpwards = false;
  showAddIndustryModal = false;
  selectedIndustryId: number = 0;
  isBangladesh: boolean = false;
  searchControl: FormControl = new FormControl(''); 

  private usernameSubject: Subject<string> = new Subject();
  private companyNameSubject: Subject<string> = new Subject();
  constructor(private checkNamesService: CheckNamesService , private authService: AuthService ,
    private router: Router) {}
  ngOnInit(): void {
    this.searchControl.valueChanges
    .pipe(debounceTime(300)) 
    .subscribe(() => {
      this.filteredCountriesList = this.filteredCountrie();
    });
    this.isBangladesh = true;
    this.setupUsernameCheck();
    this.setupCompanyNameCheck();
    this.fetchIndustries();
    this.setupSearch();
    this.fetchIndustryTypes();
    this.fetchCountries();
    this.updateFlagPath();
    this.searchTerm.valueChanges.subscribe(() => this.filterCountries());

    // Add real-time validation for company address
    this.employeeForm.get('companyAddress')?.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(() => {
        this.employeeForm.get('companyAddress')?.updateValueAndValidity();
      });

    this.selectedCountry = {
      OptionText: 'Bangladesh',
      OptionValue: '118',
      flagPath: this.filePath['Bangladesh'],
    };
  
    this.currentCountry = { name: 'Bangladesh', code: 'BD', phoneCode: '+880' };
    this.currentFlagPath = this.filePath['Bangladesh'];
    this.employeeForm.get('industryType')?.valueChanges.subscribe(selectedIndustryId => {
      this.onIndustryTypeChange(selectedIndustryId);
      this.selectedIndustryId = selectedIndustryId;
      console.log('Parent Component - Selected Industry ID:', selectedIndustryId);

    });
    this.employeeForm.get('facilitiesForDisabilities')?.valueChanges.subscribe((value: boolean) => {
      this.employeeForm.patchValue({
        facilitiesForDisabilities: value ? 1 : 0,
      }, { emitEvent: false });
    });
    this.employeeForm.get('country')?.valueChanges.subscribe((value: string) => {
            if (value === 'Bangladesh') {
              this.outsideBd = false;  
              this.fetchDistricts();
              this.employeeForm.get('district')?.setValidators([Validators.required]);
              this.employeeForm.get('thana')?.setValidators([Validators.required]);
              this.employeeForm.get('companyAddress')?.setValidators([Validators.required, noWhitespaceValidator(),companyAddressValidator()]);
              this.employeeForm.get('outSideBd')?.clearValidators();
              this.employeeForm.get('outSideBd')?.setValue(''); 
              this.employeeForm.get('outsideBDCompanyAddress')?.clearValidators();
              this.employeeForm.get('outsideBDCompanyAddress')?.setValue('');       
            } else {
              this.outsideBd = true; 
              this.employeeForm.get('district')?.clearValidators();
              this.employeeForm.get('thana')?.clearValidators();
              this.employeeForm.get('companyAddress')?.clearValidators();
              this.employeeForm.get('district')?.setValue(''); 
              this.employeeForm.get('thana')?.setValue(''); 
              this.employeeForm.get('companyAddress')?.setValue(''); 
              this.employeeForm.get('outSideBd')?.setValidators([Validators.required]); 
              this.employeeForm.get('outsideBDCompanyAddress')?.setValidators([Validators.required,noWhitespaceValidator(),companyAddressValidator()]);   
            }
            this.employeeForm.get('district')?.updateValueAndValidity();
            this.employeeForm.get('thana')?.updateValueAndValidity();
            this.employeeForm.get('companyAddress')?.updateValueAndValidity();
            this.employeeForm.get('outSideBd')?.updateValueAndValidity();
            this.employeeForm.get('outsideBDCompanyAddress')?.updateValueAndValidity();

          });
    this.employeeForm.get('district')?.valueChanges.subscribe(districtId => {
      if (districtId) {
        this.fetchThanas(districtId);
      }
    });
  }
  filterCountries(): LocationResponseDTO[] {
    return this.countries.filter(country => 
      country.OptionText.toLowerCase().includes(this.searchTerm.value?.toLowerCase() || '')
    );
  }
  setupUsernameCheck(): void {
    const usernameControl = this.employeeForm.get('username') as FormControl;
    usernameControl.valueChanges
      .pipe(
        debounceTime(300), 
        distinctUntilChanged(), 
        filter((value: string) => !this.containsBlacklistCharacters(value)) 
      )
      .subscribe((value) => {
        this.usernameSubject.next(value);
        this.checkUniqueUsername(value); 
      });
  }
  private containsBlacklistCharacters(value: string): boolean {
    const blacklistPattern = /[!@&#${}%*\s]/; 
    return blacklistPattern.test(value);
  }

  filteredCountrie() {
    const query = this.searchControl.value?.toLowerCase() || '';
    return this.countrie.filter(country =>
      country.name.toLowerCase().includes(query)
    );
  }
  setupCompanyNameCheck(): void {
   const companyNameControl = this.employeeForm.get('companyName') as FormControl;
    companyNameControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((value) => {
        this.companyNameSubject.next(value);
        this.checkUniqueCompanyName(value);
      });
  }
  private checkUniqueUsername(username: string): void {
    this.checkNamesService.checkUniqueUserName(username).subscribe({
      next: (response: any) => {
        console.log('API Response:', response);
  
        if (response.responseType === 'Success' && response.responseCode === 1 && !response.data) {
          this.usernameExistsMessage = ''; 
        } else if (response.responseType === 'Error' && response.responseCode === 0 && response.data) {
          this.usernameExistsMessage = response.data; 
        } else {
          this.usernameExistsMessage = 'Unexpected response from the server.'; 
        }
      },
     
    });
  }
  
  // Check for unique company name 
  private checkUniqueCompanyName(companyName: string): void {
    const trimmedCompanyName = companyName.trim();
    if (!trimmedCompanyName) {
      return;
    }
  this.checkNamesService.checkUniqueCompanyName(trimmedCompanyName).subscribe({
    next: (response: any) => {
      console.log('API Response:', response);

      if (response.responseType === 'Success' && response.responseCode === 1 && !response.data) {
        this.companyNameExistsMessage = ''; 
      } else if (response.responseType === 'Error' && response.responseCode === 0 && response.data) {
        this.companyNameExistsMessage = response.data; 
      } else {
        this.companyNameExistsMessage = 'Unexpected response from the server.';
      }
    },
    error: (error: any) => {
      console.error('Error checking company name:', error);
    },
  });
}
  // rl
  onRLNoBlur(): void {
    this.employeeForm.controls['rlNo'].markAsTouched();
  
    if (this.rlNoHasValue && this.employeeForm.controls['rlNo'].invalid) {
      this.showError = true;
      this.rlErrorMessage = 'RL Number is required';  
      this.showErrorModal = true; 
    } else {
      this.showError = false; 
      this.showErrorModal = false; 
    }
  
    if (this.rlNoHasValue && this.employeeForm.controls['rlNo'].valid) {
      this.verifyRLNo();
    }
  }
  
  verifyRLNo(): void {
    const rlNo: string = this.employeeForm.get('rlNo')?.value?.toString();
    const companyName: string = this.employeeForm.get('companyName')?.value?.toString();
  
    if (rlNo && companyName) {
      const rlRequest: RLNoRequestModel = { RLNo: rlNo };
      console.log('Company Name Input:', companyName);
      this.checkNamesService.verifyRLNo(rlRequest).subscribe({
        next: (response: any) => {
          console.log('RL No Response:', response);
  
          if (
            response.responseType === 'Success' &&
            response.responseCode === 1 &&
            response.data?.error === '0' &&
            response.data?.company_Name === companyName
          ) {
            this.showError = false;
            this.rlErrorMessage = '';
            this.showErrorModal = false;
          } else {
            this.showError = true;
            this.rlErrorMessage =
              response.data?.error !== '0'
                ? 'Invalid RL No.'
                : 'Company name does not match.';
            this.showErrorModal = true;
          }
        },
        error: (error: any) => {
          console.error('Error verifying RL No:', error);
          this.showError = true;
          this.rlErrorMessage = 'An error occurred while verifying RL No.';
          this.showErrorModal = true;
        },
      });
    } else {
      this.showError = true;
      this.rlErrorMessage = 'RL No and Company Name are required.';
      this.showErrorModal = true;
    }
  }
  closeModal(): void {
  this.employeeForm.controls['rlNo'].reset();
  this.rlNoHasValue = false; 
  this.showErrorModal = false; 
  }
  // Fetch all industries
  fetchIndustries(): void {
    this.checkNamesService.getAllIndustryIds().pipe(
      map((response: any) => {
        if (response.responseCode === 1 && Array.isArray(response.data)) {
          const industries = response.data.map((industry: any) => ({
            IndustryId: industry.industryId,
            IndustryName: industry.industryName,
            OrganizationName: '',
          }));
  
          industries.push({ IndustryId: -10, IndustryName: 'Others' }); 
          return industries;
        } else {
          throw new Error('Failed to fetch industries due to an unexpected response');
        }
      })
    ).subscribe({
      next: (industries: { IndustryId: number; IndustryName: string; OrganizationName: string }[]) => {
        this.industries.next(industries); 
      },
      error: (err: any) => {
        console.error('Error fetching industry data:', err);
      },
    });
  }
 
  private fetchIndustryTypes(industryId: number = -1): void {
    this.showAddIndustryButton = industryId !== -1;
  
    this.checkNamesService.fetchIndustryTypes(industryId).subscribe({
      next: (response: any) => {
        if (response.responseCode === 1 && Array.isArray(response.data)) {
          const industryData = response.data.map((item: any) => ({
            IndustryValue: item.industryValue,
            IndustryName: item.industryName,
          }));
  
          this.industryTypes = [...industryData];
  
          if (industryId !== -1 && this.newlyAddedIndustriesnew[industryId]) {
            this.industryTypes.push(...this.newlyAddedIndustriesnew[industryId]);
          }
          else if (industryId === -1) {
            this.allIndustryTypes = industryData;
          }
  
          this.filteredIndustryTypes = [...this.industryTypes];
        } else {
          console.warn(
            `Unexpected response or no industry types found for IndustryId: ${industryId}.`
          );
          this.clearIndustryLists();
        }
      },
      error: (error: any) => {
        console.error('Error fetching industry types:', error);
        this.clearIndustryLists();
      },
    });
  }
  
  private clearIndustryLists(): void {
    this.industryTypes = [];
    this.filteredIndustryTypes = [];
    if (this.allIndustryTypes.length === 0) {
      this.allIndustryTypes = [];
    }
  }
  onCheckboxChange(event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    const value = parseInt(checkbox.value, 10);
    const currentValues = this.formControlSignals()['disabilityWrap'].value
      ? this.formControlSignals()['disabilityWrap'].value.split(',').map(Number) 
      : [];
    if (checkbox.checked) {
      if (!currentValues.includes(value)) {
        currentValues.push(value);
      }
    } else {
      const index = currentValues.indexOf(value);
      if (index !== -1) {
        currentValues.splice(index, 1);
      }
    }
    this.formControlSignals()['disabilityWrap'].setValue(currentValues.join(','));
  }
addNewIndustry(): void {
  this.showAddIndustryModal = true;
}
closeAddIndustryModal(): void {
  this.showAddIndustryModal = false;
}
onNewIndustryAdded(event: { IndustryName: string }): void {
    const industryName = event.IndustryName.trim(); 
    const currentIndustryId = this.selectedIndustryId;
    const currentIndustryNames = this.employeeForm.controls['industryName'].value;
    const updatedIndustryNames = currentIndustryNames
      ? `${currentIndustryNames}, ${industryName}`
      : industryName;
    this.employeeForm.controls['industryName'].setValue(updatedIndustryNames);
    this.checkNamesService.organizationCheck(industryName).subscribe({
      next: (response: any) => {
        if (response.responseCode === 200) {
          if (response.responseCode === 200) {
            const responseData = response.data;
            if (responseData && responseData.success && responseData.data === true) {
              const { orgTypeName, orgTypeId, industryId } = responseData;
    
              const isAlreadyChecked = this.selectedIndustries.some(
                (industry) => industry.IndustryName.toLowerCase() === orgTypeName.toLowerCase()
              );
    
              if (isAlreadyChecked) {
                alert('You have already added this industry.');
                return;
              }
              const backendIndustry: IndustryTypeResponseDTO = {
                IndustryValue: orgTypeId,
                IndustryName: orgTypeName,
              };
    
              if (!this.industryTypes.find((industry) => industry.IndustryName.toLowerCase() === orgTypeName.toLowerCase())) {
                this.industryTypes.push(backendIndustry);
              }
              this.selectedIndustries.push(backendIndustry);
            
          } 
             
            else if (response.dataContext === 'Organization not found') {
            const newIndustry: IndustryTypeResponseDTO = {
              IndustryValue: Date.now() % 2147483647, 
              IndustryName: industryName,
            };
            if (!this.newlyAddedIndustriesnew[currentIndustryId]) {
              this.newlyAddedIndustriesnew[currentIndustryId] = [];
            }
            this.newlyAddedIndustriesnew[currentIndustryId].push(newIndustry);
            if (this.selectedIndustryId === currentIndustryId) {
              this.industryTypes.push(newIndustry);
              this.filteredIndustryTypes = [...this.industryTypes];
            }
            this.selectedIndustries.push(newIndustry);
            const selectedValues = this.selectedIndustries
              .map((industry) => industry.IndustryValue)
              .join(',');
            this.employeeForm.controls['industryTypeArray'].setValue(selectedValues);
          }
          }
        }
      },
      error: (error: any) => {
        console.error('Error validating industry name:', error);
      },
    });
  }

onNewIndustryTypeChange(newIndustryId: number): void {
  this.employeeForm.get('industryType')?.setValue(newIndustryId); 
}
onIndustryTypeChange(selectedIndustryId: string | number): void {
    const parsedIndustryId = parseInt(selectedIndustryId as string, 10); 
    if (!isNaN(parsedIndustryId)) {
      this.fetchIndustryTypes(parsedIndustryId); 
    } else {
      this.filteredIndustryTypes = [...this.industryTypes];
    }
  }
 
 
  onIndustryCheckboxChange(event: Event, industry: IndustryTypeResponseDTO): void {
    const isChecked = (event.target as HTMLInputElement).checked;
  
    if (isChecked) {
      if (this.selectedIndustries.length >= 10) {
        alert('You cannot select more than 10 Industries.');
        (event.target as HTMLInputElement).checked = false;
        return;
      }
      this.selectedIndustries.push(industry);
    } else {
      this.selectedIndustries = this.selectedIndustries.filter(
        (selected) => selected.IndustryValue !== industry.IndustryValue
      );
  
      const currentIndustryId = this.selectedIndustryId;
      const newlyAddedIndustriesForId = this.newlyAddedIndustriesnew[currentIndustryId];
      if (newlyAddedIndustriesForId) {
        const index = newlyAddedIndustriesForId.findIndex(
          (newIndustry) => newIndustry.IndustryValue === industry.IndustryValue
        );
  
        if (index !== -1) {
          newlyAddedIndustriesForId.splice(index, 1);
          this.industryTypes = this.industryTypes.filter(
            (type) => type.IndustryValue !== industry.IndustryValue
          );
          this.filteredIndustryTypes = [...this.industryTypes];
        }
      }
    }
    const selectedValues = this.selectedIndustries
      .map((industry) => industry.IndustryValue)
      .join(',');
    this.employeeForm.controls['industryTypeArray'].setValue(selectedValues);
    this.employeeForm.controls['industryTypeArray'].markAsTouched();

  }
   
  isIndustryChecked(industryValue: number): boolean {
    return this.selectedIndustries.some(
      (industry) => industry.IndustryValue === industryValue
    );
  }
  removeIndustry(industry: { IndustryValue: number; IndustryName: string }): void {
    this.selectedIndustries = this.selectedIndustries.filter(
      (selected) => selected.IndustryValue !== industry.IndustryValue
    );
  
    const currentIndustryId = this.selectedIndustryId;
    const newlyAddedIndustriesForId = this.newlyAddedIndustriesnew[currentIndustryId];
  
    if (newlyAddedIndustriesForId) {
      const index = newlyAddedIndustriesForId.findIndex(
        (newIndustry) => newIndustry.IndustryValue === industry.IndustryValue
      );
  
      if (index !== -1) {
        newlyAddedIndustriesForId.splice(index, 1);
        this.industryTypes = this.industryTypes.filter(
          (type) => type.IndustryValue !== industry.IndustryValue
        );
  
        this.filteredIndustryTypes = [...this.industryTypes];
      }
    }
  
    const selectedValues = this.selectedIndustries
      .map((industry) => industry.IndustryValue)
      .join(',');
    this.employeeForm.controls['industryTypeArray'].setValue(selectedValues);
  
    const updatedIndustryNames = this.selectedIndustries
      .map((industry) => industry.IndustryName)
      .join(', ');
    this.employeeForm.controls['industryName'].setValue(updatedIndustryNames);
  
    const checkbox = document.getElementById(
      `industry_type_${industry.IndustryValue}`
    ) as HTMLInputElement;
    if (checkbox) {
      checkbox.checked = false;
    }
  }
  
  
  // Fetch countries (Outside Bangladesh included)
  private fetchCountries(): void {
    const selectedCountryText = this.selectedCountry?.OptionText || this.employeeForm.get('country')?.value;
    const requestPayload = { OutsideBd: '1', DistrictId: '',   CountryId: selectedCountryText,  };
    this.checkNamesService.getLocations(requestPayload).subscribe({
      next: (response: any) => {
        console.log("Full response:", response);
  
        if (response.responseCode === 1 && Array.isArray(response.data)) {  
          const countryData = response.data;
          if (countryData.length > 0) {
            this.countries = countryData.map((item: any) => ({
              OptionValue: item.optionValue,
              OptionText: item.optionText,
              flagPath: this.filePath[item.optionText] || '', 
            }));
  
            this.employeeForm.get('country')?.setValue('Bangladesh'); 
          } else {
            console.error('No countries found in the response.');
            this.countries = [];
          }
        } else {
          console.error('Unexpected responseCode or response format:', response);
          this.countries = [];
        }
      },
      error: (error: any) => {
        console.error('Error fetching countries:', error);
        this.countries = [];
      },
    });
  }
// Fetch districts within Bangladesh
private fetchDistricts(): void {
  const requestPayload = { OutsideBd: '0', DistrictId: '' };
  this.checkNamesService.getLocations(requestPayload).subscribe({
    next: (response: any) => {
      if (response.responseCode === 1 && Array.isArray(response.data)) {
        const districtData = response.data;
        this.districts = districtData.map((item: any) => ({
          OptionValue: `${item.optionValue}##${item.optionText}`, 
          OptionText: item.optionText,
        }));

        this.thanas = [];
      } else {
        console.error('Unexpected responseCode or response format:', response);
        this.districts = [];
      }
    },
    error: (error: any) => {
      console.error('Error fetching districts:', error);
      this.districts = [];
    },
  });
}
  toggleDropdown() {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.checkDropdownPosition();
    }
  }
  toggleDropdownCountry() {
    this.isOpenCountry = !this.isOpenCountry;
  }
  checkDropdownPosition() {
    const dropdownButton = document.querySelector('.dropdown-container button') as HTMLElement;
    const viewportHeight = window.innerHeight;

    if (dropdownButton) {
      const buttonRect = dropdownButton.getBoundingClientRect();
      this.isDropdownUpwards = buttonRect.bottom + 200 > viewportHeight; 
    }
  }
  @HostListener('document:click', ['$event'])
  closeDropdown(event: Event) {
    const targetElement = event.target as HTMLElement;

    const isInsideDropdown = targetElement.closest('.dropdown-container');
    if (!isInsideDropdown) {
      this.isOpen = false;
      this.isOpenCountry = false;
    }
  }

  selectCountry(country: LocationResponseDTO) {
    this.selectedCountry = country;
    this.isOpen = false;
    this.searchTerm.setValue('');
    this.employeeForm.get('country')?.setValue(country.OptionText); 
  }

  get filteredCountries() {
    return this.filterCountries();
  }

 public getFlagSvg(country: LocationResponseDTO): string {
    const filePath = country.flagPath;
      `<img src="${filePath}" alt="flag" width="24" height="24" />`
    return filePath;
  
  }
// Fetch thanas for the selected district
private fetchThanas(districtFormattedValue: string): void {
  const districtId = districtFormattedValue.split('##')[0]; 
  const requestPayload = { OutsideBd: '0', DistrictId: districtId };
  this.checkNamesService.getLocations(requestPayload).subscribe({
    next: (response: any) => {
      if (response.responseCode === 1 && Array.isArray(response.data)) {
        const thanaData = response.data;

        this.thanas = thanaData.map((item: any) => ({
          OptionValue: `${item.optionValue}##${item.optionText}`,
          OptionText: item.optionText,
        }));
      } else {
        console.error('Unexpected responseCode or response format:', response);
        this.thanas = [];
      }
    },
    error: (error: any) => {
      console.error('Error fetching thanas:', error);
      this.thanas = [];
    },
  });
}
setupSearch(): void {
  this.searchControl.valueChanges.pipe(debounceTime(300), distinctUntilChanged())
    .subscribe((query: string) => {
      this.filterIndustryTypes(query);
    });
}
 
  getTypes(): IndustryTypeResponseDTO[] {
    return this.filteredIndustryTypes;
  }

  filterIndustryTypes(query: string): void {
    if (!query) {
      this.filteredIndustryTypes = [...this.allIndustryTypes]; 
    } else {
      const lowerQuery = query.toLowerCase();
      this.filteredIndustryTypes = this.allIndustryTypes.filter(type =>
        type.IndustryName.toLowerCase().includes(lowerQuery)
      );
    }
  }
  onCategoryChange(event: Event): void {
    const selectedIndustryId = parseInt((event.target as HTMLSelectElement).value);
    this.fetchIndustryTypes(selectedIndustryId);
    this.onIndustryTypeChange(selectedIndustryId);
    this.showAddIndustryButton = false;
  }
  chooseCountry(country: any) {
    this.currentCountry = country;
    this.isBangladesh = country.name === 'Bangladesh';
    this.currentFlagPath = this.filePath[country.name];
    this.isOpenCountry = false;
  }
  private updateFlagPath() {
   const countryCode = this.employeeForm.controls['contactMobile'].value;
    const country = this.countrie.find(c => c.code === countryCode);
    this.currentFlagPath = country ? this.filePath[country.name] : '';
  }

formValue : any
currentValidationFieldIndex: number = 0;
firstInvalidField: string | null = null;
isContinueClicked: boolean = false;
rlNoHasValue: boolean = false;
isLoading: boolean = false;

onInputChange(event: Event) {
  const input = event.target as HTMLInputElement;
  input.value = input.value.replace(/[^0-9]/g, '');
  this.rlNoHasValue = input.value.trim().length > 0;

}
toggleShowAll() {
  this.showAll = !this.showAll;
}
checkCaptchaValidity() {
  this.isCaptchaValid = this.captchaComponent.isCaptchaValid();
}

get isButtonDisabled(): boolean {
  return (!this.employeeForm.get('isPolicyAcceptedControl')?.value && !this.isCaptchaValid);
}
onDisabledButtonClick(event: Event): void {
  if (this.isButtonDisabled) {
    alert('Please accept the pricing policy to proceed');
    return;
  }
}


onContinue() {
  this.checkCaptchaValidity();
  this.isContinueClicked = true;
  this.isLoading = true;

  if (this.isLoading && !this.employeeForm.get('isPolicyAcceptedControl')?.value && !this.isCaptchaValid) {
    return;
  }

  console.log('Current form values:', this.employeeForm.value);
  const credentials = {
    username: this.employeeForm.value.username || '',
    password: this.employeeForm.value.password || '',
  };
  this.authService.updateCredentials(credentials);

  const controls = this.employeeForm.controls;
  let firstInvalidKey: string | null = null;
  let firstErrorMsgElement: HTMLElement | null = null;

  for (const key in controls) {
    if (controls.hasOwnProperty(key)) {
      const control = controls[key];

      if (control.invalid) {
        control.markAsTouched();
        if (key === 'industryTypeArray' && control.errors?.['required']) {
        }
        if (control.errors) {
          console.error(`Validation error in ${key}:`, control.errors);
          if (control.errors['required']) {
            console.error(`The field "${key}" is required.`);
          }
        }

        const errorElements = document.querySelectorAll(`[data-error-for="${key}"]`);
        
        for (const errorElement of Array.from(errorElements)) {
          if (!firstErrorMsgElement) {
            firstErrorMsgElement = errorElement as HTMLElement;
          }
        }

        if (!firstInvalidKey) {
          firstInvalidKey = key;
          this.firstInvalidField = key;
        }
      }
    }
  }

  if (firstErrorMsgElement) {
    firstErrorMsgElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    this.isLoading = false;
    return;
  } 
  
  if (firstInvalidKey) {
    const element = document.getElementById(firstInvalidKey);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      element.focus();
    }
    this.isLoading = false;
    return;
  }

  if (!this.isCaptchaValid) {
    console.error('Captcha validation failed.');
    alert('Enter the Valid Verification Code');
    this.isLoading = false;
    return;
  }

  if (this.employeeForm.valid) {
    const payload = this.employeeForm.value;
    this.checkNamesService.insertAccount(payload).subscribe({
      next: (response) => {
        console.log('Account created successfully:', response);
        this.router.navigate(['/account-created-successfully']);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error creating account:', error);
        alert('There was an error creating the account. Please try again.');
      },
    });
  }
}

}