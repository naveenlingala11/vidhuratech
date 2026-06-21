import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MentorQaService, QaQuestionDetail, QaAnswer } from '../../../services/mentor-qa.service';
import { AuthService } from '../../../features/auth/services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-mentor-qa-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './mentor-qa-detail.html',
  styleUrls: ['./mentor-qa-detail.css']
})
export class MentorQaDetailComponent implements OnInit {
  loading = true;
  questionId!: number;
  question: QaQuestionDetail | null = null;
  currentUser: any = null;
  isLoggedIn = false;
  
  // Submit Answer State
  newAnswerText = '';
  submittingAnswer = false;

  // Reputation Modal State
  showReputationModal = false;
  selectedUserReputation: any = null;

  // Threaded replies state
  flattenedAnswers: QaAnswer[] = [];
  replyingToAnswerId: number | null = null;
  replyText = '';
  submittingReply = false;

  // Autocomplete Mentions state
  mentionSearchQuery = '';
  mentionResults: any[] = [];
  showMentionDropdown = false;
  activeInputId: 'main' | number | null = null;
  mentionTriggerIndex = -1;

  // Edit Question/Post state with history
  editingQuestion = false;
  editTitle = '';
  editContent = '';
  editTags = '';
  questionHistory: { title: string; content: string; tags: string }[] = [];
  historyIndex = -1;

  // Edit Answer state
  editingAnswerId: number | null = null;
  editAnswerText = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private qaService: MentorQaService,
    private authService: AuthService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
    this.currentUser = this.authService.getUser();
    
    this.route.paramMap.subscribe(params => {
      const idParam = params.get('id');
      if (idParam) {
        this.questionId = +idParam;
        this.loadQuestionDetail();
      } else {
        this.toastr.error('Invalid question ID');
        this.router.navigate(['/ping-room']);
      }
    });
  }

  loadQuestionDetail(): void {
    this.loading = true;
    this.qaService.getQuestionDetail(this.questionId).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.question = res.data;
          
          // Sort answers so accepted answers are at the top, then mentors' answers, then chronologically
          if (this.question.answers) {
            this.question.answers.sort((a, b) => {
              if (a.isAccepted && !b.isAccepted) return -1;
              if (!a.isAccepted && b.isAccepted) return 1;
              if (a.isMentor && !b.isMentor) return -1;
              if (!a.isMentor && b.isMentor) return 1;
              return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            });

            this.flattenedAnswers = [];
            this.question.answers.forEach(ans => {
              this.flattenAnswerTree(ans);
            });
          }
        }
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        console.error('Error fetching question detail', err);
        this.toastr.error('Could not retrieve question details');
        this.router.navigate(['/ping-room']);
      }
    });
  }

  flattenAnswerTree(ans: QaAnswer): void {
    this.flattenedAnswers.push(ans);
    if (ans.replies && ans.replies.length > 0) {
      ans.replies.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      ans.replies.forEach(reply => {
        this.flattenAnswerTree(reply);
      });
    }
  }

  submitAnswer(): void {
    if (!this.isLoggedIn) {
      this.toastr.info('Please log in to answer this question');
      this.router.navigate(['/login']);
      return;
    }

    const text = this.newAnswerText.trim();
    if (!text) {
      this.toastr.warning('Please enter some answer content');
      return;
    }

    this.submittingAnswer = true;
    this.qaService.submitAnswer(this.questionId, text).subscribe({
      next: (res) => {
        this.submittingAnswer = false;
        if (res.success) {
          this.toastr.success('Your answer has been submitted!');
          this.newAnswerText = '';
          this.loadQuestionDetail();
        }
      },
      error: (err) => {
        this.submittingAnswer = false;
        this.toastr.error(err.error?.message || 'Failed to submit answer');
      }
    });
  }

  acceptAnswer(answerId: number): void {
    this.qaService.acceptAnswer(answerId).subscribe({
      next: (res) => {
        if (res.success) {
          this.toastr.success('Answer marked as accepted!');
          this.loadQuestionDetail();
        }
      },
      error: (err) => {
        this.toastr.error(err.error?.message || 'Failed to accept answer');
      }
    });
  }

  toggleLike(): void {
    if (!this.question) return;
    if (!this.isLoggedIn) {
      this.toastr.info('Please log in to like a post');
      this.router.navigate(['/login']);
      return;
    }
    
    const originalLiked = this.question.isLikedByMe;
    const originalCount = this.question.likesCount;
    this.question.isLikedByMe = !this.question.isLikedByMe;
    this.question.likesCount = this.question.isLikedByMe ? this.question.likesCount + 1 : Math.max(0, this.question.likesCount - 1);
    
    this.qaService.toggleLike(this.question.id).subscribe({
      next: (res) => {
        if (res.success) {
          if (this.question) {
            this.question.isLikedByMe = res.data.liked;
            this.question.likesCount = res.data.likesCount;
          }
        } else {
          if (this.question) {
            this.question.isLikedByMe = originalLiked;
            this.question.likesCount = originalCount;
          }
        }
      },
      error: (err) => {
        if (this.question) {
          this.question.isLikedByMe = originalLiked;
          this.question.likesCount = originalCount;
        }
        this.toastr.error('Failed to toggle like');
      }
    });
  }

  sharePost(): void {
    if (!this.question) return;
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      this.toastr.success('Link copied to clipboard!');
    }).catch(err => {
      console.error('Failed to copy link', err);
      this.toastr.error('Failed to copy link');
    });
  }

  isQuestionAuthor(): boolean {
    if (!this.isLoggedIn || !this.currentUser || !this.question) return false;
    return this.question.authorId === this.currentUser.id;
  }

  canToggleSolved(): boolean {
    if (!this.isLoggedIn || !this.currentUser || !this.question) return false;
    const role = this.currentUser.role;
    return this.question.authorId === this.currentUser.id || role === 'MENTOR' || role === 'ADMIN';
  }

  toggleSolved(): void {
    if (!this.question) return;
    if (!this.isLoggedIn) {
      this.toastr.info('Please log in first');
      return;
    }
    this.qaService.toggleSolved(this.question.id).subscribe({
      next: (res) => {
        if (res.success) {
          if (this.question) {
            this.question.isSolved = res.data.solved;
            this.toastr.success(this.question.isSolved ? 'Discussion marked as Solved!' : 'Discussion reopened.');
          }
        }
      },
      error: (err) => {
        this.toastr.error('Failed to update solved status');
      }
    });
  }

  getTagsArray(tags: string): string[] {
    if (!tags) return [];
    return tags.split(',').map(t => t.trim()).filter(t => t.length > 0);
  }

  // --- Client-Side Code Snippet Parser ---
  hasCodeSnippet(content: string): boolean {
    if (!content) return false;
    return content.includes('[CODE_LANG:') && content.includes('[CODE_END]');
  }

  getNonCodeContent(content: string): string {
    if (!content) return '';
    if (!this.hasCodeSnippet(content)) return content;
    const index = content.indexOf('[CODE_LANG:');
    return content.substring(0, index).trim();
  }

  getCodeSnippet(content: string): { lang: string; code: string } {
    if (!content || !this.hasCodeSnippet(content)) return { lang: '', code: '' };
    const startTag = '[CODE_LANG:';
    const startIndex = content.indexOf(startTag);
    const endIndex = content.indexOf('[CODE_END]');
    
    const langStart = startIndex + startTag.length;
    const langEnd = content.indexOf(']', langStart);
    const lang = content.substring(langStart, langEnd);
    
    const codeStart = langEnd + 1;
    const code = content.substring(codeStart, endIndex).trim();
    
    return { lang, code };
  }

  copyCode(code: string): void {
    navigator.clipboard.writeText(code).then(() => {
      this.toastr.success('Code copied to clipboard!');
    }).catch(err => {
      this.toastr.error('Failed to copy code');
    });
  }

  // --- Vote on Answer ---
  voteAnswer(answer: QaAnswer, type: 'UP' | 'DOWN'): void {
    if (!this.isLoggedIn) {
      this.toastr.info('Please log in to vote');
      this.router.navigate(['/login']);
      return;
    }

    // Optimistic update
    const originalVote = answer.userVote;
    const originalScore = answer.votesScore || 0;

    if (answer.userVote === type) {
      // Toggle off
      answer.userVote = null;
      answer.votesScore = originalScore + (type === 'UP' ? -1 : 1);
    } else {
      const delta = type === 'UP' ? 1 : -1;
      const rollbackDelta = originalVote === 'UP' ? -1 : originalVote === 'DOWN' ? 1 : 0;
      answer.userVote = type;
      answer.votesScore = originalScore + delta + rollbackDelta;
    }

    this.qaService.voteAnswer(answer.id, type).subscribe({
      next: (res) => {
        if (res.success) {
          answer.userVote = res.data.userVote;
          answer.votesScore = res.data.votesScore;
        } else {
          answer.userVote = originalVote;
          answer.votesScore = originalScore;
        }
      },
      error: () => {
        answer.userVote = originalVote;
        answer.votesScore = originalScore;
        this.toastr.error('Failed to register vote');
      }
    });
  }

  // --- Pin/Unpin Question ---
  isMentorOrAdmin(): boolean {
    if (!this.isLoggedIn || !this.currentUser) return false;
    return this.currentUser.role === 'MENTOR' || this.currentUser.role === 'ADMIN';
  }

  togglePin(): void {
    if (!this.question) return;
    this.qaService.pinQuestion(this.question.id).subscribe({
      next: (res) => {
        if (res.success && this.question) {
          this.question.isPinned = res.data.pinned;
          this.toastr.success(this.question.isPinned ? 'Post pinned!' : 'Post unpinned');
        }
      },
      error: () => this.toastr.error('Failed to toggle pin')
    });
  }

  toggleFollow(): void {
    if (!this.question) return;
    this.qaService.toggleFollowQuestion(this.question.id).subscribe({
      next: (res) => {
        if (res.success && this.question) {
          this.question.isFollowing = res.data.followed;
          this.toastr.success(this.question.isFollowing ? 'Following discussion' : 'Unfollowed discussion');
        }
      },
      error: () => this.toastr.error('Failed to toggle follow status')
    });
  }

  getReputationEmoji(level?: string): string {
    if (!level) return '🥉';
    switch (level.toUpperCase()) {
      case 'LEGEND': return '👑';
      case 'GURU': return '💎';
      case 'EXPERT': return '🥇';
      case 'ACTIVE': return '🥈';
      default: return '🥉';
    }
  }

  openReputationModal(userId: number, event: MouseEvent) {
    event.stopPropagation();
    this.qaService.getUserReputation(userId).subscribe({
      next: (res) => {
        if (res.success) {
          this.selectedUserReputation = res.data;
          this.showReputationModal = true;
        } else {
          this.toastr.error('Failed to load reputation details');
        }
      },
      error: () => {
        this.toastr.error('Failed to load reputation details');
      }
    });
  }

  closeReputationModal() {
    this.showReputationModal = false;
    this.selectedUserReputation = null;
  }

  availableReactions = ['👍', '❤️', '🎉', '🤔', '👀', '🚀'];

  toggleReaction(answer: QaAnswer, emoji: string): void {
    if (!this.isLoggedIn) {
      this.toastr.warning('Please log in to react');
      this.router.navigate(['/login']);
      return;
    }

    this.qaService.reactAnswer(answer.id, emoji).subscribe({
      next: (res) => {
        if (res.success) {
          answer.reactionCounts = res.data.reactionCounts;
          answer.userReactions = res.data.userReactions;
        }
      },
      error: () => this.toastr.error('Failed to update reaction')
    });
  }

  hasUserReacted(answer: QaAnswer, emoji: string): boolean {
    return answer.userReactions?.includes(emoji) || false;
  }

  getReactionCount(answer: QaAnswer, emoji: string): number {
    return answer.reactionCounts?.[emoji] || 0;
  }

  getActiveReactions(answer: QaAnswer): string[] {
    if (!answer.reactionCounts) return [];
    return Object.keys(answer.reactionCounts).filter(k => (answer.reactionCounts?.[k] || 0) > 0);
  }

  // --- Inline Replies ---
  toggleReplyForm(answerId: number): void {
    if (this.replyingToAnswerId === answerId) {
      this.replyingToAnswerId = null;
      this.replyText = '';
    } else {
      this.replyingToAnswerId = answerId;
      this.replyText = '';
    }
  }

  submitReply(parentAnswerId: number): void {
    if (!this.isLoggedIn) {
      this.toastr.info('Please log in to reply');
      this.router.navigate(['/login']);
      return;
    }

    const text = this.replyText.trim();
    if (!text) {
      this.toastr.warning('Please enter some content for your reply');
      return;
    }

    this.submittingReply = true;
    this.qaService.submitAnswer(this.questionId, text, parentAnswerId).subscribe({
      next: (res) => {
        this.submittingReply = false;
        if (res.success) {
          this.toastr.success('Reply posted successfully!');
          this.replyingToAnswerId = null;
          this.replyText = '';
          this.loadQuestionDetail();
        }
      },
      error: (err) => {
        this.submittingReply = false;
        this.toastr.error(err.error?.message || 'Failed to submit reply');
      }
    });
  }

  // --- Edit Question with Undo / Redo ---
  startEditQuestion(): void {
    if (!this.question) return;
    this.editingQuestion = true;
    this.editTitle = this.question.title;
    this.editContent = this.question.content;
    this.editTags = this.question.tags;
    this.questionHistory = [{ title: this.editTitle, content: this.editContent, tags: this.editTags }];
    this.historyIndex = 0;
  }

  recordHistoryState(): void {
    const currentState = { title: this.editTitle, content: this.editContent, tags: this.editTags };
    const lastState = this.questionHistory[this.historyIndex];
    if (lastState && lastState.title === currentState.title && lastState.content === currentState.content && lastState.tags === currentState.tags) {
      return;
    }
    this.questionHistory = this.questionHistory.slice(0, this.historyIndex + 1);
    this.questionHistory.push(currentState);
    this.historyIndex = this.questionHistory.length - 1;
  }

  undoQuestionEdit(): void {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      const state = this.questionHistory[this.historyIndex];
      this.editTitle = state.title;
      this.editContent = state.content;
      this.editTags = state.tags;
    }
  }

  redoQuestionEdit(): void {
    if (this.historyIndex < this.questionHistory.length - 1) {
      this.historyIndex++;
      const state = this.questionHistory[this.historyIndex];
      this.editTitle = state.title;
      this.editContent = state.content;
      this.editTags = state.tags;
    }
  }

  saveQuestionEdit(): void {
    if (!this.question) return;
    const payload = {
      title: this.editTitle.trim(),
      content: this.editContent.trim(),
      tags: this.editTags.trim()
    };
    if (!payload.title || !payload.content) {
      this.toastr.warning('Title and content are required');
      return;
    }
    this.qaService.updateQuestion(this.question.id, payload).subscribe({
      next: (res) => {
        if (res.success) {
          this.toastr.success('Question updated successfully!');
          this.editingQuestion = false;
          this.loadQuestionDetail();
        }
      },
      error: (err) => {
        this.toastr.error(err.error?.message || 'Failed to update question');
      }
    });
  }

  // --- Edit Answer / Reply ---
  isAnswerAuthor(ans: QaAnswer): boolean {
    if (!this.isLoggedIn || !this.currentUser) return false;
    return ans.authorId === this.currentUser.id;
  }

  startEditAnswer(ans: QaAnswer): void {
    this.editingAnswerId = ans.id;
    this.editAnswerText = ans.content;
  }

  cancelEditAnswer(): void {
    this.editingAnswerId = null;
    this.editAnswerText = '';
  }

  saveAnswerEdit(ans: QaAnswer): void {
    const text = this.editAnswerText.trim();
    if (!text) {
      this.toastr.warning('Content cannot be empty');
      return;
    }
    this.qaService.updateAnswer(ans.id, { content: text }).subscribe({
      next: (res) => {
        if (res.success) {
          this.toastr.success('Comment updated successfully!');
          this.editingAnswerId = null;
          this.editAnswerText = '';
          this.loadQuestionDetail();
        }
      },
      error: (err) => {
        this.toastr.error(err.error?.message || 'Failed to update comment');
      }
    });
  }

  // --- Autocomplete Mentions ---
  onInputKeyUp(event: any, inputId: 'main' | number): void {
    const textarea = event.target as HTMLTextAreaElement;
    const text = textarea.value;
    const caretPos = textarea.selectionStart;

    const textBeforeCaret = text.substring(0, caretPos);
    const lastAtIndex = textBeforeCaret.lastIndexOf('@');

    if (lastAtIndex !== -1 && lastAtIndex >= textBeforeCaret.lastIndexOf(' ')) {
      this.mentionTriggerIndex = lastAtIndex;
      const query = textBeforeCaret.substring(lastAtIndex + 1);
      this.activeInputId = inputId;
      this.searchMentions(query);
    } else {
      this.closeMentionDropdown();
    }
  }

  searchMentions(query: string): void {
    this.mentionSearchQuery = query;
    if (query.length === 0) {
      this.mentionResults = [];
      this.showMentionDropdown = true;
      return;
    }
    this.qaService.searchUsers(query).subscribe({
      next: (res) => {
        if (res.success) {
          this.mentionResults = res.data;
          this.showMentionDropdown = this.mentionResults.length > 0;
        }
      }
    });
  }

  selectMention(user: any): void {
    let text = '';
    let textarea: HTMLTextAreaElement | null = null;

    if (this.activeInputId === 'main') {
      text = this.newAnswerText;
      textarea = document.getElementById('main-textarea') as HTMLTextAreaElement;
    } else if (typeof this.activeInputId === 'number') {
      text = this.replyText;
      textarea = document.getElementById(`reply-textarea-${this.activeInputId}`) as HTMLTextAreaElement;
    }

    if (textarea && this.mentionTriggerIndex !== -1) {
      const beforeMention = text.substring(0, this.mentionTriggerIndex);
      const afterMention = text.substring(textarea.selectionEnd);
      const mentionStr = `@${user.name.replace(/\s+/g, '')} `;
      
      const newText = beforeMention + mentionStr + afterMention;
      if (this.activeInputId === 'main') {
        this.newAnswerText = newText;
      } else {
        this.replyText = newText;
      }

      setTimeout(() => {
        if (textarea) {
          textarea.focus();
          const newCursorPos = this.mentionTriggerIndex + mentionStr.length;
          textarea.setSelectionRange(newCursorPos, newCursorPos);
        }
      }, 50);
    }

    this.closeMentionDropdown();
  }

  closeMentionDropdown(): void {
    this.showMentionDropdown = false;
    this.mentionResults = [];
    this.activeInputId = null;
    this.mentionTriggerIndex = -1;
  }

  votePoll(optionId: number): void {
    if (!this.isLoggedIn) {
      this.toastr.warning('Please log in to vote in the poll');
      this.router.navigate(['/login']);
      return;
    }

    this.qaService.votePoll(optionId).subscribe({
      next: (res) => {
        if (res.success) {
          this.toastr.success('Your vote has been cast!');
          this.loadQuestionDetail();
        }
      },
      error: (err) => {
        this.toastr.error(err.error?.message || 'Failed to submit vote');
      }
    });
  }

  getPercentage(votes: number, total: number): number {
    if (!total) return 0;
    return Math.round((votes / total) * 100);
  }

  isMentorUser(authorId: number, tags?: string): boolean {
    return authorId === 2 || (tags ? tags.toLowerCase().includes('mentor') : false);
  }

  isProfileLinkable(userId: number, tags?: string): boolean {
    if (!this.isLoggedIn || !this.currentUser) {
      return this.isMentorUser(userId, tags);
    }
    return userId === this.currentUser.id || this.isMentorUser(userId, tags);
  }
}
