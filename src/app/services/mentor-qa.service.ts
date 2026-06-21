import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface QaQuestion {
  id: number;
  title: string;
  content: string;
  tags: string;
  mediaUrl?: string;
  mediaType?: string;
  isSolved: boolean;
  createdAt: string;
  updatedAt?: string;
  isEdited?: boolean;
  editCount?: number;
  lastActivity?: string;
  authorId: number;
  authorName: string;
  authorAvatar: string;
  authorProfileImageUrl?: string;
  answersCount: number;
  likesCount: number;
  isLikedByMe: boolean;
  isPinned?: boolean;
  viewsCount?: number;
  authorReputation?: number;
  authorLevel?: string;
  isFollowing?: boolean;
  poll?: {
    options: { id: number; optionText: string; votesCount: number }[];
    totalVotes: number;
    hasVoted: boolean;
    votedOptionId?: number;
  } | null;
}

export interface QaAnswer {
  id: number;
  content: string;
  isAccepted: boolean;
  createdAt: string;
  updatedAt?: string;
  isEdited?: boolean;
  authorId: number;
  authorName: string;
  authorAvatar: string;
  authorProfileImageUrl?: string;
  authorRole: string;
  isMentor: boolean;
  votesScore?: number;
  userVote?: string | null; // 'UP' | 'DOWN' | null
  authorReputation?: number;
  authorLevel?: string;
  reactionCounts?: { [emoji: string]: number };
  userReactions?: string[];
  showPicker?: boolean;
  parentAnswerId?: number;
  depth?: number;
  replies?: QaAnswer[];
}

export interface QaQuestionDetail extends QaQuestion {
  answers: QaAnswer[];
}

@Injectable({
  providedIn: 'root',
})
export class MentorQaService {
  private publicApi = `${environment.apiUrl}/api/public/qa`;
  private authApi = `${environment.apiUrl}/api/qa`;

  constructor(private http: HttpClient) {}

  getQuestions(search?: string): Observable<{ success: boolean; data: QaQuestion[] }> {
    let params = new HttpParams();
    if (search) {
      params = params.set('search', search);
    }
    return this.http.get<{ success: boolean; data: QaQuestion[] }>(this.publicApi, { params });
  }

  getQuestionDetail(id: number): Observable<{ success: boolean; data: QaQuestionDetail }> {
    return this.http.get<{ success: boolean; data: QaQuestionDetail }>(`${this.publicApi}/${id}`);
  }

  askQuestion(
    title: string, 
    content: string, 
    tags?: string, 
    mediaUrl?: string, 
    mediaType?: string,
    pollOptions?: string[]
  ): Observable<{ success: boolean; data: any }> {
    return this.http.post<{ success: boolean; data: any }>(`${this.authApi}/questions`, {
      title,
      content,
      tags,
      mediaUrl,
      mediaType,
      pollOptions,
    });
  }

  toggleLike(questionId: number): Observable<{ success: boolean; data: { liked: boolean; likesCount: number } }> {
    return this.http.post<{ success: boolean; data: { liked: boolean; likesCount: number } }>(`${this.authApi}/questions/${questionId}/like`, null);
  }

  toggleSolved(questionId: number): Observable<{ success: boolean; data: { solved: boolean } }> {
    return this.http.post<{ success: boolean; data: { solved: boolean } }>(`${this.authApi}/questions/${questionId}/solved`, null);
  }

  uploadMedia(file: File): Observable<{ success: boolean; data: { url: string } }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ success: boolean; data: { url: string } }>(`${this.authApi}/upload`, formData);
  }

  submitAnswer(questionId: number, content: string, parentAnswerId?: number): Observable<{ success: boolean; data: any }> {
    return this.http.post<{ success: boolean; data: any }>(`${this.authApi}/questions/${questionId}/answers`, {
      content,
      parentAnswerId,
    });
  }

  acceptAnswer(answerId: number): Observable<{ success: boolean; data: any }> {
    return this.http.post<{ success: boolean; data: any }>(`${this.authApi}/answers/${answerId}/accept`, null);
  }

  resolveMediaUrl(url: string): Observable<{ success: boolean; data: { url: string } }> {
    return this.http.get<{ success: boolean; data: { url: string } }>(`${this.publicApi}/resolve-url`, {
      params: new HttpParams().set('url', url)
    });
  }

  updateQuestion(id: number, payload: { title: string; content: string; tags?: string }): Observable<{ success: boolean; data: any }> {
    return this.http.put<{ success: boolean; data: any }>(`${this.authApi}/questions/${id}`, payload);
  }

  updateAnswer(id: number, payload: { content: string }): Observable<{ success: boolean; data: any }> {
    return this.http.put<{ success: boolean; data: any }>(`${this.authApi}/answers/${id}`, payload);
  }

  voteAnswer(answerId: number, type: 'UP' | 'DOWN'): Observable<{ success: boolean; data: { userVote: string | null; votesScore: number } }> {
    return this.http.post<{ success: boolean; data: { userVote: string | null; votesScore: number } }>(`${this.authApi}/answers/${answerId}/vote`, { type });
  }

  pinQuestion(questionId: number): Observable<{ success: boolean; data: { pinned: boolean } }> {
    return this.http.post<{ success: boolean; data: { pinned: boolean } }>(`${this.authApi}/questions/${questionId}/pin`, null);
  }

  getUserReputation(userId: number): Observable<{ success: boolean; data: any }> {
    return this.http.get<{ success: boolean; data: any }>(`${this.publicApi}/reputation/${userId}`);
  }

  reactAnswer(answerId: number, emoji: string): Observable<{ success: boolean; data: any }> {
    return this.http.post<{ success: boolean; data: any }>(`${this.authApi}/answers/${answerId}/react`, { emoji });
  }

  toggleFollowQuestion(questionId: number): Observable<{ success: boolean; data: { followed: boolean } }> {
    return this.http.post<{ success: boolean; data: { followed: boolean } }>(`${this.authApi}/questions/${questionId}/follow`, null);
  }

  toggleFollowTag(tag: string): Observable<{ success: boolean; data: { followed: boolean } }> {
    return this.http.post<{ success: boolean; data: { followed: boolean } }>(`${this.authApi}/tags/follow`, { tag });
  }

  getFollowedQuestions(): Observable<{ success: boolean; data: QaQuestion[] }> {
    return this.http.get<{ success: boolean; data: QaQuestion[] }>(`${this.authApi}/following`);
  }

  getFollowedTags(): Observable<{ success: boolean; data: string[] }> {
    return this.http.get<{ success: boolean; data: string[] }>(`${this.authApi}/tags/following`);
  }

  searchUsers(query: string): Observable<{ success: boolean; data: any[] }> {
    return this.http.get<{ success: boolean; data: any[] }>(`${this.authApi}/users/search`, {
      params: new HttpParams().set('q', query)
    });
  }

  votePoll(optionId: number): Observable<{ success: boolean; data: any }> {
    return this.http.post<{ success: boolean; data: any }>(`${this.authApi}/polls/${optionId}/vote`, null);
  }

  getLeaderboard(): Observable<{ success: boolean; data: any[] }> {
    return this.http.get<{ success: boolean; data: any[] }>(`${this.publicApi}/leaderboard`);
  }

  getUserProfile(userId: number): Observable<{ success: boolean; data: any }> {
    return this.http.get<{ success: boolean; data: any }>(`${this.publicApi}/profile/${userId}`);
  }

  updateUserProfile(payload: { bio: string; skills: string; socialLinks: string }): Observable<{ success: boolean; data: any }> {
    return this.http.put<{ success: boolean; data: any }>(`${this.authApi}/profile`, payload);
  }
}
