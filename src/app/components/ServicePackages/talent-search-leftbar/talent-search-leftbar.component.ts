import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, OnInit } from '@angular/core';

interface TalentSearchOption {
  id: string;
  name: string;
  isActive: boolean;
}

@Component({
  selector: 'app-talent-search-leftbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './talent-search-leftbar.component.html',
  styleUrl: './talent-search-leftbar.component.scss'
})
export class TalentSearchLeftbarComponent implements OnInit {
  @Output() optionSelected = new EventEmitter<TalentSearchOption>();

  talentSearchOptions: TalentSearchOption[] = [
    { id: 'instant-buy', name: 'Instant Buy', isActive: true },
    { id: 'bulk', name: 'Bulk', isActive: false },
    { id: 'resume-on-demand', name: 'Resume on Demand', isActive: false }
  ];

  ngOnInit() {
    this.optionSelected.emit(this.talentSearchOptions[0]);
  }

  selectOption(optionId: string) {
    this.talentSearchOptions.forEach(option => {
      option.isActive = option.id === optionId;
    });

    const selectedOption = this.talentSearchOptions.find(option => option.id === optionId);
    if (selectedOption) {
      this.optionSelected.emit(selectedOption);
    }
  }
}
