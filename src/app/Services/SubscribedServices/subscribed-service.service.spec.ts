import { TestBed } from '@angular/core/testing';

import { SubscribedServiceService } from './subscribed-service.service';

describe('SubscribedServiceService', () => {
  let service: SubscribedServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SubscribedServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
