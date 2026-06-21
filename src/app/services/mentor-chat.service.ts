import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ChatMessage {
  id: number;
  senderId: number;
  senderName: string;
  messageText: string;
  createdAt: string;
}

export interface ChatHistoryResponse {
  relationId: number;
  recipientName: string;
  recipientEmail: string;
  recipientAvatar: string;
  recipientRole: string;
  messages: ChatMessage[];
}

@Injectable({
  providedIn: 'root',
})
export class MentorChatService {
  private chatAPI = `${environment.apiUrl}/api/mentor-chat`;

  constructor(private http: HttpClient) {}

  getChatHistory(relationId: number): Observable<{ success: boolean; data: ChatHistoryResponse }> {
    return this.http.get<{ success: boolean; data: ChatHistoryResponse }>(`${this.chatAPI}/${relationId}/messages`);
  }

  sendMessage(relationId: number, messageText: string): Observable<{ success: boolean; data: ChatMessage }> {
    return this.http.post<{ success: boolean; data: ChatMessage }>(`${this.chatAPI}/${relationId}/messages`, {
      messageText,
    });
  }
}
