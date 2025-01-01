import { Component, computed, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { CheckNamesService } from '../../Services/check-names.service';
import { debounceTime, distinctUntilChanged, filter, map } from 'rxjs/operators';
import { InputFieldComponent } from '../../components/input-field/input-field.component';
import { TextAreaComponent } from '../../components/text-area/text-area.component';
import { CheckboxGroupComponent } from '../../components/checkbox-group/checkbox-group.component';
import {  CommonModule } from '@angular/common';
import { BehaviorSubject, Subject } from 'rxjs';
import { IndustryTypeResponseDTO, IndustryType, LocationResponseDTO, RLNoRequestModel, CompanyNameCheckRequestDTO } from '../../Models/company';
import { ErrorModalComponent } from "../../components/error-modal/error-modal.component";
import { RadioGroupComponent } from '../../components/radio-group/radio-group.component';
import { PricingPolicyComponent } from '../../components/pricing-policy/pricing-policy.component';
import { MathCaptchaComponent } from '../../components/math-captcha/math-captcha.component';
import { filePath,countrie ,disabilities} from '../../constants/file-path.constants';
import { AddIndustryModalComponent } from "../../components/add-industry-modal/add-industry-modal.component";
import { AuthService } from '../../Services/shared/auth.service';
import { passwordMatchValidator, yearValidator, banglaTextValidator } from '../../utils/validators';
import { Router } from '@angular/router';
@Component({
  selector: 'app-create-account-page',
  standalone: true,
  imports: [
    MathCaptchaComponent,
    PricingPolicyComponent,
    RadioGroupComponent,
    InputFieldComponent,
    TextAreaComponent,
    CheckboxGroupComponent,
    ReactiveFormsModule,
    CommonModule,
    ErrorModalComponent,
    MathCaptchaComponent,
    AddIndustryModalComponent
],
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
  isOpen: boolean = false;
  showAddIndustryButton: boolean = false; 
  fieldsOrder: string[] = [];
  industries: BehaviorSubject<IndustryType[]> = new BehaviorSubject<IndustryType[]>([]);
  industryTypes: IndustryTypeResponseDTO[] = [];
  filteredIndustryTypes: IndustryTypeResponseDTO[] = [];
  countries: LocationResponseDTO[] = [];
  districts: LocationResponseDTO[] = [];
  thanas: LocationResponseDTO[] = [];
  outsideBd: boolean = false;  
  selectedIndustries: { IndustryValue: number; IndustryName: string }[] = [];
currentCountry = { name: 'Bangladesh', code: 'BD', phoneCode: '+880' }; 
currentFlagPath = this.filePath['Bangladesh'];
filteredCountriesList = this.countrie;

  employeeForm: FormGroup = new FormGroup({
    
    isPolicyAcceptedControl: new FormControl(''),
    facilitiesForDisabilities: new FormControl('', [Validators.required]),
    username: new FormControl('', [Validators.minLength(4),Validators.required,Validators.pattern(/^[a-zA-Z]+[a-zA-Z\d]*$/)  ]),  
    password: new FormControl('', [Validators.required, Validators.minLength(4),Validators.maxLength(10)]),
    confirmPassword: new FormControl('', [Validators.required]),
    companyNameBangla: new FormControl('',[Validators.required,banglaTextValidator()]),
    yearsOfEstablishMent: new FormControl('', [Validators.required, yearValidator()]),
    companySize: new FormControl('', Validators.required),
    outSideBd: new FormControl(''),
    businessDesc: new FormControl(''),
    tradeNo: new FormControl(''),
    webUrl: new FormControl(''),
    contactName: new FormControl('', [Validators.required]),
    contactDesignation: new FormControl('', [Validators.required]),
    contactEmail: new FormControl('', [Validators.required, Validators.email]),
    contactMobile: new FormControl(''),
    inclusionPolicy: new FormControl(''),
    support: new FormControl(0),
    disabilityWrap: new FormControl(''),
    training: new FormControl(''),
    companyName: new FormControl('', [Validators.required]),
    industryType: new FormControl('', Validators.required),
    industryName: new FormControl(''),
    industryTypeArray: new FormControl(''),
    hidEntrepreneur: new FormControl(''),
    rlNoStatus: new FormControl(''),
    country: new FormControl(''),  
    district: new FormControl(''),
    thana: new FormControl(''),
    outsideBDCompanyAddress: new FormControl(''),
    outsideBDCompanyAddressBng: new FormControl(''),
    companyAddress: new FormControl(''),
    captchaInput: new FormControl('', [Validators.required]),
    companyAddressBangla: new FormControl('',[Validators.required,banglaTextValidator()]),
    rlNo: new FormControl('', [Validators.pattern('^[0-9]*$')]),
  },{ validators: passwordMatchValidator() }
);
  usernameControl = computed(() => this.employeeForm.get('username') as FormControl<string>);
  companyNameControl = computed(() => this.employeeForm.get('companyName') as FormControl<string>);
  industryTypeControl = computed(() => this.employeeForm.get('industryType') as FormControl<string>);
  // countryControl = computed(() => this.employeeForm.get('country') as FormControl<string>);
  // districtControl = computed(() => this.employeeForm.get('district') as FormControl<string>);
  // thanaControl = computed(() => this.employeeForm.get('thana') as FormControl<string>);
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
  showAddIndustryModal = false;
  selectedIndustryId: number = 0;
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

    this.setupUsernameCheck();
    this.setupCompanyNameCheck();
    this.fetchIndustries();
    this.setupSearch();
    this.fetchIndustryTypes();
    this.fetchCountries();
    this.updateFlagPath();
    this.searchTerm.valueChanges.subscribe(() => this.filterCountries());
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
            } else {
              this.outsideBd = true;    
            }
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
        filter((value: string) => this.isValidUsername(value)) 
      )
      .subscribe((value) => {
        this.usernameSubject.next(value);
        this.checkUniqueUsername(value); 
      });
  }
  private isValidUsername(value: string): boolean {
    const usernameRegex = /^[a-zA-Z]+[a-zA-Z\d]*$/;
    return usernameRegex.test(value);
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
  this.checkNamesService.checkUniqueCompanyName(companyName).subscribe({
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
      this.companyNameExistsMessage = 'An error occurred while checking the company name.';
    },
  });
}

  // rl
  onRLNoBlur(): void {
    this.employeeForm.controls['rlNo'].markAsTouched();
  
    if (this.employeeForm.controls['rlNo'].valid) {
      this.verifyRLNo();  
    } else {
      this.showError = true;
      this.rlErrorMessage = 'RL Number is required';
      this.showErrorModal = true; 
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
   // Fetch industry types based on selected IndustryId
   private fetchIndustryTypes(industryId: number = -1): void {
    this.showAddIndustryButton = industryId !== -1;

    this.checkNamesService.fetchIndustryTypes(industryId).subscribe({
      next: (response: any) => {
        if (response.responseCode === 1 && Array.isArray(response.data)) {
          const industryData = response.data;
  
          if (industryData.length > 0) {
            this.industryTypes = industryData.map((item: any) => ({
              IndustryValue: item.industryValue,
              IndustryName: item.industryName,
            }));
  
            this.filteredIndustryTypes = [...this.industryTypes];
          } else {
            console.warn(`No industry types found for IndustryId: ${industryId}.`);
            this.industryTypes = [];
            this.filteredIndustryTypes = [];
          }
        } else {
          console.error('Unexpected response or responseCode:', response);
          this.industryTypes = [];
          this.filteredIndustryTypes = [];
        }
      },
      error: (error: any) => {
        console.error('Error fetching industry types:', error);
        this.industryTypes = [];
        this.filteredIndustryTypes = [];
      },
    });
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
  const currentIndustryNames = this.employeeForm.controls['industryName'].value;
  const updatedIndustryNames = currentIndustryNames
    ? `${currentIndustryNames}, ${industryName}`
    : industryName;
  this.employeeForm.controls['industryName'].setValue(updatedIndustryNames);
  this.checkNamesService.organizationCheck(industryName).subscribe({
    next: (response: any) => {
      if (response.responseCode === 200) {
        const existingIndustry = this.industryTypes.find(
          (industry) => industry.IndustryName.toLowerCase() === industryName.toLowerCase()
        );
        if (response.dataContext === 'Organization not found') {
          const newIndustry: IndustryTypeResponseDTO = {
            IndustryValue: Date.now() % 2147483647,
            IndustryName: industryName,
          };
          this.industryTypes.push(newIndustry);
          this.selectedIndustries.push(newIndustry);
        } else if (existingIndustry) {
          if (!this.selectedIndustries.includes(existingIndustry)) {
            this.selectedIndustries.push(existingIndustry);
          }
        }
        this.filteredIndustryTypes = [...this.industryTypes];
        const selectedValues = this.selectedIndustries
          .map((industry) => industry.IndustryValue)
          .join(',');
        this.employeeForm.controls['industryTypeArray'].setValue(selectedValues);
      }
    },
    error: (error: any) => {
      console.error('Error validating industry name:', error);
    },
  });
}


  // Trigger filtering of industries based on dropdown selection
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
      this.selectedIndustries.push(industry);
    } else {
      this.selectedIndustries = this.selectedIndustries.filter(
        (selected) => selected.IndustryValue !== industry.IndustryValue
      );
    }
  
    // Update the form control value
    const selectedValues = this.selectedIndustries
      .map((industry) => industry.IndustryValue)
      .join(',');
    this.employeeForm.controls['industryTypeArray'].setValue(selectedValues);
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

        // Store both raw and formatted values
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
      this.filteredIndustryTypes = [...this.industryTypes]; 
    } else {
      const lowerQuery = query.toLowerCase();
      this.filteredIndustryTypes = this.industryTypes.filter(type =>
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
    this.currentFlagPath = this.filePath[country.name];
    this.isOpen = false; 
  }
  private updateFlagPath() {
   const countryCode = this.employeeForm.controls['contactMobile'].value;
    const country = this.countrie.find(c => c.code === countryCode);
    this.currentFlagPath = country ? this.filePath[country.name] : '';
  }

formValue : any
currentValidationFieldIndex: number = 0;
isContinueClicked: boolean = false;

onInputChange(event: Event) {
  const input = event.target as HTMLInputElement;
  input.value = input.value.replace(/[^0-9]/g, '');
}
toggleShowAll() {
  this.showAll = !this.showAll;
}
checkCaptchaValidity() {
  this.isCaptchaValid = this.captchaComponent.isCaptchaValid();
}
onContinue() {
  this.checkCaptchaValidity(); 
  this.isContinueClicked = true;
  console.log('Current form values:', this.employeeForm.value);

  const credentials = {
    username: this.employeeForm.value.username || '',
    password: this.employeeForm.value.password || '',
  };
  this.authService.updateCredentials(credentials);
  // console.log('Credentials stored in AuthService:', credentials);
  const fieldsOrder = [
    'username', 
    'password',
    'confirmPassword',
    'companyName',
    'yearsOfEstablishMent',
    'companySize',
    'companyAddress',
    'companyAddressBangla',
    'contactName',
    'contactDesignation',
    'contactEmail',
    'captchaInput', 

  ];

  const currentField = fieldsOrder[this.currentValidationFieldIndex];
  const control = this.employeeForm.get(currentField);

  if (control && control.invalid) {
    control.markAsTouched();
    console.error(`Field ${currentField} is invalid:`, control.errors);
    return;
  }
  const payload = this.employeeForm.value;
  
  this.checkNamesService.insertAccount(payload).subscribe({
    next: (response) => {
      console.log('Account created successfully:', response);
      alert(`Account created successfully! CorporateAccountID: ${response.CorporateAccountID}`);

      this.router.navigate(['/account-created-successfully']);

    },
    error: (error) => {
      console.error('Error creating account:', error);
      alert('There was an error creating the account. Please try again.');
    },
  });
}
}