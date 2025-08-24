import { inject, Injectable } from '@angular/core';
import { LocalstorageService } from '../shared/essentials/localstorage.service';
import { environment } from '../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PasswordChangeRequest } from '../../Models/changePassword/changePassModel';
@Injectable({
  providedIn: 'root'
})
export class ChangePasswordService {
  http = inject(HttpClient)

  apiUrlChangePass: string = environment.apiUrl + 'ChangePassword/UpdateOldPassword'

  changePassPost(body: PasswordChangeRequest): Observable<any> {
    return this.http.post<any>(this.apiUrlChangePass, body)
  }
}
