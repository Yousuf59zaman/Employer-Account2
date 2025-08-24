import { Component, computed, signal, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Feature {
  text?: string;
  boldText?: string;
  isBold?: boolean;
  prefix?: string;
  suffix?: string;
}

interface TalentSearchOption {
  id: string;
  name: string;
  isActive: boolean;
}

@Component({
  selector: 'app-talent-search-rightbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './talent-search-rightbar.component.html',
  styleUrl: './talent-search-rightbar.component.scss'
})
export class TalentSearchRightbarComponent {
  @Input() selectedTalentSearchOption: TalentSearchOption | null = null;
  
  private companyCountry = signal<string>('');

  constructor() {
    this.companyCountry.set(localStorage.getItem('CompanyCountry') || '');
  }

  protected readonly isInternational = computed(() => {
    const country = (localStorage.getItem('CompanyCountry') || '').trim().toLowerCase();
    return country !== '' && country !== 'bangladesh';
  });

  protected readonly currencyLabel = computed(() => 
    this.isInternational() ? 'USD' : 'BDT'
  );

  protected readonly startingPrice = computed(() => 
    this.isInternational() ? '2.5' : '99'
  );

  protected getFeatures(): Feature[] {
    if (this.selectedTalentSearchOption?.id === 'resume-on-demand') {
      if (this.isInternational()) {
        return [
          {
            text: 'Get an <b>expert\'s help</b> to find the right candidate within the shortest possible time.',
            isBold: false
          },
          {
            text: 'Our experts will search, take initial interviews and forward selected candidates within a week.'
          },
          {
            text: 'Service fee <b>200 USD</b> per post or Tk. <b>25 USD</b> per person recruited whichever is higher.',
            isBold: false
          },
          {
            text: 'Minimum charge Tk. <b>75 USD</b> if none is recruited.',
            isBold: false
          }
        ];
      }
      return [
        {
          text: 'Get an <b>expert\'s help</b> to find the right candidate within the shortest possible time.',
          isBold: false
        },
        {
          text: 'Our experts will search, take initial interviews and forward selected candidates within a week.'
        },
        {
          text: 'Service fee <b>15,000 BDT</b> per post or Tk. <b>2,000 BDT</b> per person recruited whichever is higher.',
          isBold: false
        },
        {
          text: 'Minimum charge Tk. <b>5,000 BDT</b> if none is recruited.',
          isBold: false
        }
      ];
    } else if (this.selectedTalentSearchOption?.id === 'bulk') {
      if (this.isInternational()) {
        return [
          {
            text: 'Search the <b>right candidates</b> from the <b>largest database</b> of professionals anytime and from anywhere.'
          },
          {
            text: 'Search by category, skill, experience, keywords, etc.'
          },
          {
            text: 'Our Talent Search currently hosts <b>40+ lacs</b> of different professionals.'
          },
          {
            text: 'Packages start from <b>65 USD</b> only.'
          }
        ];
      }
      return [
        {
          text: 'Search the <b>right candidates</b> from the <b>largest database</b> of professionals anytime and from anywhere.'
        },
        {
          text: 'Search by category, skill, experience, keywords, etc.'
        },
        {
          text: 'Our Talent Search currently hosts <b>40+ lacs</b> of different professionals.'
        },
        {
          text: 'Packages start from <b>4,000 BDT</b> only.'
        }
      ];
    } else {
      // Default features for Instant Buy
      return [
        {
          prefix: 'Instant Talent Search Access starts from ',
          boldText: `${this.startingPrice()} ${this.currencyLabel()}`,
          suffix: '.'
        },
        {
          prefix: 'Instant direct access to the largest database of professionals in Bangladesh (currently hosts more than ',
          boldText: '2.5 million+',
          suffix: ' CV of professionals).'
        },
        {
          text: 'Directly contact the prospective candidates who meet your job requirements.'
        },
        {
          text: 'Buy more, Save more.',
          isBold: true
        }
      ];
    }
  }





  updateCompanyCountry(country: string): void {
    this.companyCountry.set(country);
    localStorage.setItem('CompanyCountry', country);
  }
}
