import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { EmailTemplate } from '../Models/communication';

@Injectable({
  providedIn: 'root'
})
export class CommunicationService {

  private apiUrl = 'https://testmongo.bdjobs.com/Employer-Communications/api/EmailsOverview/GetSentEmails';
  private jobEmailsUrl = 'https://testmongo.bdjobs.com/Employer-Communications/api/EmailTemplate/EmailTemplates';
  private viewTemplatesUrl = 'https://testmongo.bdjobs.com/Employer-Communications/api/EmailTemplate/EmailTemplateViewer';
  private emailTemplateUrl = 'https://testmongo.bdjobs.com/Employer-Communications/api/EmailTemplate/EmailTemplateEditor';
  private emailUpdateTemplateUrl = 'https://testmongo.bdjobs.com/Employer-Communications/api/EmailTemplate/UpdateEmailTemplate';
  private getemailsinboxUrl = 'https://testmongo.bdjobs.com/Employer-Communications/api/EmailsOverview/GetEmailsInbox';
  private emailDetailsUrl = 'https://testmongo.bdjobs.com/Employer-Communications/api/EmailsOverview/GetEmailsDetails';
  private deleteEmailUrl = 'https://testmongo.bdjobs.com/Employer-Communications/api/EmailsOverview/DeleteEmails';
  private createTemplateUrl = 'https://testmongo.bdjobs.com/Employer-Communications/api/EmailTemplate/CreateEmailTemplate';

  constructor(private http: HttpClient) {}

  setCompanyId(companyId: string): void {
    localStorage.setItem('CompanyId', companyId);
  }
  getCompanyId(): string {
    let companyId = localStorage.getItem('companyId');
    if (!companyId) {
      companyId = localStorage.getItem('CompanyId') || '';
    }
    return companyId;
  }
  getEmailsOverview(companyId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}?companyId=${companyId}`);
  }
  getJobEmails(companyId: string, keyword: string): Observable<any> {
    const params = new HttpParams()
      .set('companyId', companyId)
      // .set('pageNo', pageNo.toString())
      .set('keyword', keyword);
  
    return this.http.get<any>(this.apiUrl, { params });
  }
   getJobEmails2(companyId: string, pageNo: number, keyword: string): Observable<any> {
      const params = new HttpParams()
        .set('companyId', companyId)
        .set('pageNo', pageNo.toString())
        .set('keyword', keyword);
    
      return this.http.get<any>(this.apiUrl, { params });
    }


  getEmailTemplates(companyId: string): Observable<EmailTemplate[]> {
    const params = new HttpParams().set('companyId', companyId);
    return this.http.get<any>(this.jobEmailsUrl, { params }).pipe(
      map((response: any) => response.data?.emailTemplates || [])
    );
  }
  
  getTemplateById(companyId: string, templateID: number): Observable<any> {
    const params = new HttpParams()
      .set('companyId', companyId)
      .set('templateID', templateID);
    
    return this.http.get<any>(this.viewTemplatesUrl, { params });
  }
  getemailTemplateById(companyId: string, templateID: number): Observable<any> {
    const params = new HttpParams()
      .set('companyId', companyId)
      .set('templateID', templateID);
    
    return this.http.get<any>(this.emailTemplateUrl, { params });
  }
  emailTemplateUpdate(companyId: string, templateData: any): Observable<any> {
    return this.http.post<any>(this.emailUpdateTemplateUrl, { companyId, ...templateData });
  }
  getemailsinbox(companyId: string, pageNo: number = 1, c_Type: string = 'cv', pageSize: number = 10,r_Type?: number): Observable<any> {
    let params = new HttpParams()
      .set('companyId', companyId)
      .set('c_Type', c_Type)
      .set('pageNo', pageNo)
      .set('pageSize', pageSize)
      if (r_Type !== undefined) {
        params = params.set('r_Type', r_Type);
      }
         
    
    return this.http.get<any>(this.getemailsinboxUrl, { params });
  }
  getEmailDetails(rId: number, name: string): Observable<any> {
    const params = new HttpParams()
      .set('rId', rId)
      .set('name', name);
  
    return this.http.get<any>(this.emailDetailsUrl, { params });
  }
  
  deleteEmail(requestBody: any): Observable<any> {
    return this.http.delete<any>(this.deleteEmailUrl, { body: requestBody });
  }
  createTemplate(payload: any): Observable<any> {
    return this.http.post<any>(this.createTemplateUrl, payload);
  }

  getJobSpecificEmails(companyId: string, jobId: number, pageNo: number, pageSize: number, r_Type?: number): Observable<any> {
    let params = new HttpParams()
      .set('companyId', companyId)
      .set('jobId', jobId.toString())
      .set('pageNo', pageNo.toString())
      .set('pageSize', pageSize.toString());
    if (r_Type !== undefined) {
      params = params.set('r_Type', r_Type.toString());
    }
    return this.http.get<any>(this.getemailsinboxUrl, { params });
  }
}

