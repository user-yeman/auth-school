import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiDashboardResponse, CardData } from '../../../model/card-model';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TutorDashboardService {
  cards: CardData[] = [];
  apiUrl = 'http://127.0.0.1:8000/api/tutor/dashboard';
  constructor(private http: HttpClient) {}
  getDashboardData(): Observable<ApiDashboardResponse> {
    return this.http.get<ApiDashboardResponse>(this.apiUrl);
  }
}
