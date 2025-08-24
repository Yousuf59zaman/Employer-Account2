import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-service-packages-footer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './service-packages-footer.component.html',
  styleUrl: './service-packages-footer.component.scss'
})
export class ServicePackagesFooterComponent {
  readonly masterCardLogoUrl = 'https://corporate3.bdjobs.com/images/bdj_card_mastercard_srv.png';
  readonly defaultLogoUrl = 'https://corporate3.bdjobs.com/images/bdj_card_dbbl_srv.png';
  readonly bracLogoUrl = 'https://corporate3.bdjobs.com/images/bdj_card_visa_srv.png';
  readonly bkashLogoUrl = 'https://corporate3.bdjobs.com/images/bdj_card_bkash_srv.png';
  readonly qcashLogoUrl = 'https://corporate3.bdjobs.com/images/bdj_card_q_cash_srv.png';
  readonly bankAsiaLogoUrl = 'https://corporate3.bdjobs.com/images/bdj_card_bank_asia_srv.png';
  readonly ddblMobile = 'https://corporate3.bdjobs.com/images/bdj_card_DBBL_Mobile_Banking_srv.png';
  readonly islamiBankLogoUrl = 'https://corporate3.bdjobs.com/images/bdj_card_islami_bank_srv.png';
  readonly mutualTrustBankLogoUrl = 'https://corporate3.bdjobs.com/images/bdj_card_mutual_trust_bank_srv.png';
  readonly mCashLogourl = 'https://corporate3.bdjobs.com/images/bdj_card_M_Cash_srv.png'
  readonly cityBankLogoUrl = 'https://corporate3.bdjobs.com/images/bdj_card_City_Touch_srv.png';
  readonly AmexLogoUrl = 'https://corporate3.bdjobs.com/images/bdj_card_American_Express_srv.png'
  readonly fastCashLogoUrl = 'https://corporate3.bdjobs.com/images/bdj_card_fast_cash_srv.png';
  readonly MTBLogoUrl = 'https://corporate3.bdjobs.com/images/bdj_card_MTB_srv.png';

  readonly logos: { name: string; src: string }[] = [
    { name: 'MasterCard', src: this.masterCardLogoUrl },
    { name: 'DBBL Nexus', src: this.defaultLogoUrl },
    { name: 'BRAC', src: this.bracLogoUrl },
    { name: 'BKASH', src: this.bkashLogoUrl },
    { name: 'QCash', src: this.qcashLogoUrl },
    { name: 'Bank Asia', src: this.bankAsiaLogoUrl },
    { name: 'DBBL Mobile Banking', src: this.ddblMobile },
    { name: 'Islami Bank', src: this.islamiBankLogoUrl },
    { name: 'Mutual Trust Bank', src: this.mutualTrustBankLogoUrl },
    { name: 'M Cash', src: this.mCashLogourl },
    { name: 'City Touch', src: this.cityBankLogoUrl },
    { name: 'American Express', src: this.AmexLogoUrl },
    { name: 'Fast Cash', src: this.fastCashLogoUrl },
    { name: 'MTB', src: this.MTBLogoUrl },
  ];
}


