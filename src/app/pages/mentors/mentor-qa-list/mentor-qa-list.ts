import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MentorQaService, QaQuestion, QaAnswer } from '../../../services/mentor-qa.service';
import { MentorService, MentorProfile } from '../../../services/mentor.service';
import { AuthService } from '../../../features/auth/services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-mentor-qa-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './mentor-qa-list.html',
  styleUrls: ['./mentor-qa-list.css']
})
export class MentorQaListComponent implements OnInit {
  loading = true;
  questions: QaQuestion[] = [];
  searchText = '';
  isLoggedIn = false;
  currentUser: any = null;
  mentors: MentorProfile[] = [];
  
  // Navigation, Sorting & Filter States
  activeFilter = 'all'; // 'all' | 'unanswered' | 'mentor-answered' | 'liked' | 'saved' | 'following' | 'leaderboard' | 'profile'
  activeTag: string | null = null;
  sortBy: 'newest' | 'popular' | 'replies' = 'newest';
  feedLayout: 'list' | 'grid' = 'list';
  popularTags = ['Angular', 'Spring Boot', 'Java', 'TypeScript', 'System Design', 'Interview Prep', 'Career'];
  
  // Saved / Bookmarked Posts
  savedPostIds: number[] = [];
  followedTags: string[] = [];

  // Sidebar Activity Stats
  stats = {
    totalDiscussions: 0,
    unanswered: 0,
    verifiedAnswers: 0
  };

  // Inline Comments State
  activeCommentsQuestionId: number | null = null;
  commentsLoadingMap: { [key: number]: boolean } = {};
  commentsMap: { [key: number]: QaAnswer[] } = {};
  newCommentTextMap: { [key: number]: string } = {};
  submittingCommentMap: { [key: number]: boolean } = {};

  // Avatar Popover State
  activeAvatarPopoverQuestionId: number | null = null;

  // Ask Question Modal State
  showAskModal = false;
  
  // Reputation Modal State
  showReputationModal = false;
  selectedUserReputation: any = null;

  submitting = false;
  showCodeInput = false;
  uploadingMedia = false;
  
  // Poll input in ask form
  showPollInput = false;

  askForm = {
    title: '',
    content: '',
    tags: '',
    mediaUrl: '',
    mediaType: 'NONE',
    codeSnippet: '',
    codeLanguage: 'javascript',
    pollOptions: ['', '']
  };

  // Leaderboard and Profile States
  selectedProfileId: number | null = null;
  userProfile: any = null;
  leaderboardUsers: any[] = [];
  heatmapDays: any[] = [];
  loadingProfile = false;
  loadingLeaderboard = false;
  showEditProfileModal = false;
  editProfileForm = { bio: '', skills: '', socialLinks: '' };
  savingProfile = false;

  constructor(
    private qaService: MentorQaService,
    private mentorService: MentorService,
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
    if (this.isLoggedIn) {
      this.currentUser = this.authService.getUser();
    }
    this.loadSavedPosts();
    this.loadMentors();
    this.loadFollowedTags();

    // Check query params to load appropriate tabs/views
    this.route.queryParams.subscribe(params => {
      if (params['tab']) {
        this.activeFilter = params['tab'];
        if (params['tab'] === 'profile' && params['userId']) {
          this.loadUserProfile(+params['userId']);
        } else if (params['tab'] === 'leaderboard') {
          this.loadLeaderboard();
        } else {
          this.loadQuestions();
        }
      } else {
        this.loadQuestions();
      }
    });
  }

  loadQuestions(): void {
    this.loading = true;
    this.qaService.getQuestions('').subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.questions = res.data;
          this.calculateStats();
        }
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        console.error('Error loading questions', err);
        this.toastr.error('Failed to load discussions');
      }
    });
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

  calculateStats(): void {
    const total = this.questions.length;
    const unanswered = this.questions.filter(q => q.answersCount === 0).length;
    const verified = this.questions.filter(q => q.isSolved).length;
    
    this.stats = {
      totalDiscussions: total,
      unanswered: unanswered,
      verifiedAnswers: verified
    };
  }

  loadMentors(): void {
    this.mentorService.getPublicMentors().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.mentors = res.data.slice(0, 4);
        }
      },
      error: (err) => {
        console.error('Error loading mentors for sidebar', err);
      }
    });
  }

  onSearch(): void {
    // Dynamic filteredQuestions getter
  }

  selectFilter(filter: string): void {
    this.activeFilter = filter;
    if (filter === 'leaderboard') {
      this.loadLeaderboard();
    } else if (filter === 'profile') {
      if (this.currentUser) {
        this.loadUserProfile(this.currentUser.id);
      } else {
        this.toastr.info('Please log in to view your profile');
        this.router.navigate(['/login']);
      }
    }
  }

  selectTag(tag: string | null): void {
    this.activeTag = tag;
  }

  setSort(sort: 'newest' | 'popular' | 'replies'): void {
    this.sortBy = sort;
  }

  setLayout(layout: 'list' | 'grid'): void {
    this.feedLayout = layout;
  }

  loadSavedPosts(): void {
    const saved = localStorage.getItem('vt_saved_questions');
    this.savedPostIds = saved ? JSON.parse(saved) : [];
  }

  toggleSavePost(q: QaQuestion, event: Event): void {
    event.stopPropagation();
    if (!this.isLoggedIn) {
      this.toastr.info('Please log in to save posts');
      this.router.navigate(['/login']);
      return;
    }

    const index = this.savedPostIds.indexOf(q.id);
    if (index > -1) {
      this.savedPostIds.splice(index, 1);
      this.toastr.success('Post removed from saved bookmarks');
    } else {
      this.savedPostIds.push(q.id);
      this.toastr.success('Post saved to bookmarks successfully!');
    }
    localStorage.setItem('vt_saved_questions', JSON.stringify(this.savedPostIds));
  }

  isPostSaved(id: number): boolean {
    return this.savedPostIds.includes(id);
  }

  // --- Client-Side Code Snippet Parser ---
  hasCodeSnippet(content: string): boolean {
    return content.includes('[CODE_LANG:') && content.includes('[CODE_END]');
  }

  getNonCodeContent(content: string): string {
    if (!this.hasCodeSnippet(content)) return content;
    const index = content.indexOf('[CODE_LANG:');
    return content.substring(0, index).trim();
  }

  getCodeSnippet(content: string): { lang: string; code: string } {
    if (!this.hasCodeSnippet(content)) return { lang: '', code: '' };
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

  copyCode(code: string, event: Event): void {
    event.stopPropagation();
    navigator.clipboard.writeText(code).then(() => {
      this.toastr.success('Code copied to clipboard!');
    }).catch(err => {
      this.toastr.error('Failed to copy code');
    });
  }

  get filteredQuestions(): QaQuestion[] {
    let result = this.questions.filter(q => {
      // 1. Filter by Active Category
      if (this.activeFilter === 'unanswered' && q.answersCount > 0) {
        return false;
      }
      if (this.activeFilter === 'mentor-answered' && !q.isSolved) {
        return false;
      }
      if (this.activeFilter === 'liked' && !q.isLikedByMe) {
        return false;
      }
      if (this.activeFilter === 'saved' && !this.isPostSaved(q.id)) {
        return false;
      }
      if (this.activeFilter === 'following' && !q.isFollowing) {
        return false;
      }

      // 2. Filter by Active Tags
      if (this.activeTag) {
        const tagsArr = this.getTagsArray(q.tags).map(t => t.toLowerCase());
        if (!tagsArr.includes(this.activeTag.toLowerCase())) {
          return false;
        }
      }

      // 3. Filter by Search Query
      if (this.searchText) {
        const searchLower = this.searchText.toLowerCase();
        return q.title.toLowerCase().includes(searchLower) ||
               q.content.toLowerCase().includes(searchLower) ||
               (q.tags && q.tags.toLowerCase().includes(searchLower));
      }

      return true;
    });

    // 4. Apply Sorting
    if (this.sortBy === 'newest') {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (this.sortBy === 'popular') {
      result.sort((a, b) => (b.likesCount || 0) - (a.likesCount || 0));
    } else if (this.sortBy === 'replies') {
      result.sort((a, b) => (b.answersCount || 0) - (a.answersCount || 0));
    }

    // 5. Pinned posts always float to top
    result.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return 0;
    });

    return result;
  }

  openAskModal(mediaType: string = 'NONE'): void {
    if (!this.isLoggedIn) {
      this.toastr.info('Please log in to start a post');
      this.router.navigate(['/login']);
      return;
    }
    
    this.askForm = {
      title: '',
      content: '',
      tags: '',
      mediaUrl: '',
      mediaType: mediaType,
      codeSnippet: '',
      codeLanguage: 'javascript',
      pollOptions: ['', '']
    };
    this.showCodeInput = false;
    this.showPollInput = false;
    this.showAskModal = true;
  }

  closeAskModal(): void {
    this.showAskModal = false;
  }

  selectMediaType(type: string): void {
    this.askForm.mediaType = type;
    if (type === 'NONE') {
      this.askForm.mediaUrl = '';
    }
  }

  submitQuestion(): void {
    const { title, content, tags, mediaUrl, mediaType, codeSnippet, codeLanguage, pollOptions } = this.askForm;
    if (!title.trim() || !content.trim()) {
      this.toastr.warning('Please fill in both the title and details');
      return;
    }

    if (mediaType !== 'NONE' && (!mediaUrl || !mediaUrl.trim())) {
      this.toastr.warning('Please enter a valid URL for your selected media attachment');
      return;
    }

    let finalContent = content.trim();
    if (this.showCodeInput && codeSnippet.trim()) {
      finalContent = finalContent + '\n\n[CODE_LANG:' + codeLanguage + ']\n' + codeSnippet + '\n[CODE_END]';
    }

    let activePollOptions: string[] | undefined = undefined;
    if (this.showPollInput) {
      const opts = pollOptions.map(o => o.trim()).filter(o => o.length > 0);
      if (opts.length < 2) {
        this.toastr.warning('Please provide at least 2 non-empty poll options');
        return;
      }
      activePollOptions = opts;
    }

    this.submitting = true;
    this.qaService.askQuestion(title, finalContent, tags, mediaUrl, mediaType, activePollOptions).subscribe({
      next: (res) => {
        this.submitting = false;
        if (res.success) {
          this.toastr.success('Your post has been shared successfully!');
          this.closeAskModal();
          this.loadQuestions();
        }
      },
      error: (err) => {
        this.submitting = false;
        this.toastr.error(err.error?.message || 'Failed to share post');
      }
    });
  }

  toggleLike(q: QaQuestion): void {
    if (!this.isLoggedIn) {
      this.toastr.info('Please log in to like a post');
      this.router.navigate(['/login']);
      return;
    }
    
    // Optimistic update
    const originalLiked = q.isLikedByMe;
    const originalCount = q.likesCount;
    q.isLikedByMe = !q.isLikedByMe;
    q.likesCount = q.isLikedByMe ? q.likesCount + 1 : Math.max(0, q.likesCount - 1);
    
    this.qaService.toggleLike(q.id).subscribe({
      next: (res) => {
        if (res.success) {
          q.isLikedByMe = res.data.liked;
          q.likesCount = res.data.likesCount;
        } else {
          q.isLikedByMe = originalLiked;
          q.likesCount = originalCount;
        }
      },
      error: (err) => {
        q.isLikedByMe = originalLiked;
        q.likesCount = originalCount;
        this.toastr.error('Failed to toggle like');
      }
    });
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    this.activeAvatarPopoverQuestionId = null;
  }

  toggleAvatarPopover(questionId: number, event: Event): void {
    event.stopPropagation();
    if (this.activeAvatarPopoverQuestionId === questionId) {
      this.activeAvatarPopoverQuestionId = null;
    } else {
      this.activeAvatarPopoverQuestionId = questionId;
      // Close comments panel if open to keep UI clean
      this.activeCommentsQuestionId = null;
    }
  }

  toggleComments(questionId: number): void {
    if (this.activeCommentsQuestionId === questionId) {
      this.activeCommentsQuestionId = null;
      return;
    }
    this.activeCommentsQuestionId = questionId;
    if (!this.newCommentTextMap[questionId]) {
      this.newCommentTextMap[questionId] = '';
    }
    this.loadComments(questionId);
  }

  loadComments(questionId: number): void {
    this.commentsLoadingMap[questionId] = true;
    this.qaService.getQuestionDetail(questionId).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.commentsMap[questionId] = res.data.answers || [];
        }
        this.commentsLoadingMap[questionId] = false;
      },
      error: (err) => {
        this.commentsLoadingMap[questionId] = false;
        console.error('Error loading comments', err);
        this.toastr.error('Failed to load comments');
      }
    });
  }

  submitComment(questionId: number): void {
    const text = this.newCommentTextMap[questionId];
    if (!text || !text.trim()) {
      this.toastr.warning('Comment text cannot be empty');
      return;
    }

    if (!this.isLoggedIn) {
      this.toastr.info('Please log in to submit a comment');
      this.router.navigate(['/login']);
      return;
    }

    this.submittingCommentMap[questionId] = true;
    this.qaService.submitAnswer(questionId, text.trim()).subscribe({
      next: (res) => {
        this.submittingCommentMap[questionId] = false;
        if (res.success) {
          this.toastr.success('Comment posted successfully');
          this.newCommentTextMap[questionId] = '';
          
          const question = this.questions.find(q => q.id === questionId);
          if (question) {
            question.answersCount++;
          }
          
          this.loadComments(questionId);
        }
      },
      error: (err) => {
        this.submittingCommentMap[questionId] = false;
        this.toastr.error(err.error?.message || 'Failed to post comment');
      }
    });
  }

  sharePost(q: QaQuestion): void {
    const url = `${window.location.origin}/ping-room/${q.id}`;
    navigator.clipboard.writeText(url).then(() => {
      this.toastr.success('Link copied to clipboard!');
    }).catch(err => {
      console.error('Failed to copy link', err);
      this.toastr.error('Failed to copy link');
    });
  }

  getTagsArray(tags: string): string[] {
    if (!tags) return [];
    return tags.split(',').map(t => t.trim()).filter(t => t.length > 0);
  }

  // --- Manual Solved Toggles ---
  toggleSolved(q: QaQuestion, event: Event): void {
    event.stopPropagation();
    if (!this.isLoggedIn) {
      this.toastr.info('Please log in to update status');
      this.router.navigate(['/login']);
      return;
    }
    
    this.qaService.toggleSolved(q.id).subscribe({
      next: (res) => {
        if (res.success) {
          q.isSolved = res.data.solved;
          this.calculateStats();
          this.toastr.success(q.isSolved ? 'Discussion marked as Solved!' : 'Discussion marked as Open.');
        }
      },
      error: (err) => {
        this.toastr.error('Failed to change solved status');
      }
    });
  }

  canToggleSolved(q: QaQuestion): boolean {
    if (!this.isLoggedIn || !this.currentUser) return false;
    const role = this.currentUser.role;
    return q.authorId === this.currentUser.id || role === 'MENTOR' || role === 'ADMIN';
  }

  // --- File Drag & Drop + Upload handlers ---
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  onFileDropped(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      this.handleFile(event.dataTransfer.files[0]);
    }
  }

  onFileSelected(event: any): void {
    const files = event.target.files;
    if (files && files.length > 0) {
      this.handleFile(files[0]);
    }
  }

  handleFile(file: File): void {
    if (!file) return;
    
    const isVideo = file.type.startsWith('video/');
    const sizeLimit = isVideo ? 10 * 1024 * 1024 : 5 * 1024 * 1024; // 10MB video, 5MB image
    
    if (file.size > sizeLimit) {
      this.toastr.warning(
        isVideo ? 'Video file size cannot exceed 10MB.' : 'Image file size cannot exceed 5MB.',
        'File Too Large'
      );
      return;
    }

    this.uploadingMedia = true;
    this.qaService.uploadMedia(file).subscribe({
      next: (res) => {
        this.uploadingMedia = false;
        if (res.success && res.data?.url) {
          this.askForm.mediaUrl = res.data.url;
          if (file.type.startsWith('image/')) {
            this.askForm.mediaType = file.type.includes('gif') ? 'GIF' : 'IMAGE';
          } else if (isVideo) {
            this.askForm.mediaType = 'VIDEO';
          }
          this.toastr.success('File uploaded and linked successfully!');
        } else {
          this.toastr.error('Upload failed, no URL returned');
        }
      },
      error: (err) => {
        this.uploadingMedia = false;
        console.error('File upload error', err);
        this.toastr.error('Failed to upload file');
      }
    });
  }

  clearUploadedFile(event: Event): void {
    event.stopPropagation();
    this.askForm.mediaUrl = '';
    this.askForm.mediaType = 'NONE';
    this.toastr.info('Uploaded file attachment removed');
  }

  onMediaUrlChange(value: string): void {
    if (!value || !value.trim()) return;
    const url = value.trim();
    
    // Check if it's already a direct file URL to prevent infinite loop / unnecessary resolution
    const isDirectFile = /\.(jpeg|jpg|gif|png|webp|mp4|webm|ogg)(\?.*)?$/i.test(url);
    if (isDirectFile) {
      return; 
    }

    this.qaService.resolveMediaUrl(url).subscribe({
      next: (res) => {
        if (res.success && res.data?.url && res.data.url !== url) {
          this.askForm.mediaUrl = res.data.url;
          this.toastr.success('Link resolved to direct media source!');
        }
      },
      error: (err) => {
        console.error('Failed to resolve URL via backend', err);
      }
    });
  }

  // ========== EDIT POST (Owner Only) ==========
  editingQuestionId: number | null = null;
  editForm = { title: '', content: '', tags: '' };
  editHistory: { title: string; content: string; tags: string }[] = [];
  editHistoryIndex = -1;
  savingEdit = false;

  canEditPost(q: QaQuestion): boolean {
    if (!this.isLoggedIn || !this.currentUser) return false;
    return q.authorId === this.currentUser.id;
  }

  startEditPost(q: QaQuestion, event: Event): void {
    event.stopPropagation();
    this.editingQuestionId = q.id;
    this.editForm = {
      title: q.title,
      content: this.getNonCodeContent(q.content),
      tags: q.tags || ''
    };
    // Initialize undo/redo history with the original state
    this.editHistory = [{ ...this.editForm }];
    this.editHistoryIndex = 0;
  }

  cancelEditPost(): void {
    this.editingQuestionId = null;
    this.editForm = { title: '', content: '', tags: '' };
    this.editHistory = [];
    this.editHistoryIndex = -1;
  }

  pushEditHistory(): void {
    // Trim future states if we're not at the end
    this.editHistory = this.editHistory.slice(0, this.editHistoryIndex + 1);
    this.editHistory.push({ ...this.editForm });
    this.editHistoryIndex = this.editHistory.length - 1;
  }

  canUndo(): boolean {
    return this.editHistoryIndex > 0;
  }

  canRedo(): boolean {
    return this.editHistoryIndex < this.editHistory.length - 1;
  }

  undoEdit(): void {
    if (!this.canUndo()) return;
    this.editHistoryIndex--;
    const state = this.editHistory[this.editHistoryIndex];
    this.editForm = { ...state };
  }

  redoEdit(): void {
    if (!this.canRedo()) return;
    this.editHistoryIndex++;
    const state = this.editHistory[this.editHistoryIndex];
    this.editForm = { ...state };
  }

  saveEditPost(): void {
    if (!this.editingQuestionId) return;
    if (!this.editForm.title.trim() || !this.editForm.content.trim()) {
      this.toastr.warning('Title and content cannot be empty');
      return;
    }

    this.savingEdit = true;
    this.qaService.updateQuestion(this.editingQuestionId, {
      title: this.editForm.title,
      content: this.editForm.content,
      tags: this.editForm.tags
    }).subscribe({
      next: (res) => {
        this.savingEdit = false;
        if (res.success) {
          const q = this.questions.find(x => x.id === this.editingQuestionId);
          if (q) {
            q.title = this.editForm.title;
            q.content = this.editForm.content;
            q.tags = this.editForm.tags;
            q.isEdited = true;
            q.editCount = res.data?.editCount || (q.editCount || 0) + 1;
            q.updatedAt = res.data?.updatedAt || new Date().toISOString();
          }
          this.toastr.success('Post updated successfully!');
          this.cancelEditPost();
        }
      },
      error: (err) => {
        this.savingEdit = false;
        this.toastr.error(err.error?.message || 'Failed to update post');
      }
    });
  }

  // ========== EDIT COMMENT (Author Only) ==========
  editingCommentId: number | null = null;
  editCommentText = '';
  savingCommentEdit = false;

  canEditComment(comment: QaAnswer): boolean {
    if (!this.isLoggedIn || !this.currentUser) return false;
    return comment.authorId === this.currentUser.id;
  }

  startEditComment(comment: QaAnswer, event: Event): void {
    event.stopPropagation();
    this.editingCommentId = comment.id;
    this.editCommentText = comment.content;
  }

  cancelEditComment(): void {
    this.editingCommentId = null;
    this.editCommentText = '';
  }

  saveEditComment(questionId: number): void {
    if (!this.editingCommentId) return;
    if (!this.editCommentText.trim()) {
      this.toastr.warning('Comment cannot be empty');
      return;
    }

    this.savingCommentEdit = true;
    this.qaService.updateAnswer(this.editingCommentId, { content: this.editCommentText }).subscribe({
      next: (res) => {
        this.savingCommentEdit = false;
        if (res.success) {
          const comments = this.commentsMap[questionId];
          if (comments) {
            const c = comments.find(x => x.id === this.editingCommentId);
            if (c) {
              c.content = this.editCommentText;
              c.isEdited = true;
              c.updatedAt = res.data?.updatedAt || new Date().toISOString();
            }
          }
          this.toastr.success('Comment updated!');
          this.cancelEditComment();
        }
      },
      error: (err) => {
        this.savingCommentEdit = false;
        this.toastr.error(err.error?.message || 'Failed to update comment');
      }
    });
  }

  // ========== TIME AGO HELPER ==========
  timeAgo(dateStr: string | undefined): string {
    if (!dateStr) return '';
    const now = new Date();
    const date = new Date(dateStr);
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    const weeks = Math.floor(days / 7);
    if (weeks < 4) return `${weeks}w ago`;
    const months = Math.floor(days / 30);
    if (months < 12) return `${months}mo ago`;
    return `${Math.floor(months / 12)}y ago`;
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

  loadFollowedTags(): void {
    if (!this.isLoggedIn) return;
    this.qaService.getFollowedTags().subscribe({
      next: (res) => {
        if (res.success) {
          this.followedTags = res.data;
        }
      }
    });
  }

  isTagFollowed(tag: string): boolean {
    return this.followedTags.includes(tag);
  }

  toggleFollowTag(tag: string, event: Event): void {
    event.stopPropagation();
    if (!this.isLoggedIn) {
      this.toastr.warning('Please log in to follow tags');
      this.router.navigate(['/login']);
      return;
    }

    this.qaService.toggleFollowTag(tag).subscribe({
      next: (res) => {
        if (res.success) {
          if (res.data.followed) {
            this.followedTags.push(tag);
            this.toastr.success(`Following tag #${tag}`);
          } else {
            this.followedTags = this.followedTags.filter(t => t !== tag);
            this.toastr.success(`Unfollowed tag #${tag}`);
          }
        }
      },
      error: () => this.toastr.error('Failed to toggle tag follow')
    });
  }

  toggleFollowQuestion(q: QaQuestion, event: Event): void {
    event.stopPropagation();
    if (!this.isLoggedIn) {
      this.toastr.warning('Please log in to follow discussions');
      this.router.navigate(['/login']);
      return;
    }

    this.qaService.toggleFollowQuestion(q.id).subscribe({
      next: (res) => {
        if (res.success) {
          q.isFollowing = res.data.followed;
          this.toastr.success(q.isFollowing ? 'Following discussion' : 'Unfollowed discussion');
        }
      },
      error: () => this.toastr.error('Failed to toggle follow status')
    });
  }

  // --- Poll Management ---
  addPollOption(): void {
    if (this.askForm.pollOptions.length < 6) {
      this.askForm.pollOptions.push('');
    } else {
      this.toastr.warning('Maximum 6 options allowed');
    }
  }

  removePollOption(index: number): void {
    if (this.askForm.pollOptions.length > 2) {
      this.askForm.pollOptions.splice(index, 1);
    } else {
      this.toastr.warning('At least 2 options are required');
    }
  }

  trackByIndex(index: number, obj: any): any {
    return index;
  }

  votePoll(q: QaQuestion, optionId: number): void {
    if (!this.isLoggedIn) {
      this.toastr.warning('Please log in to vote in the poll');
      this.router.navigate(['/login']);
      return;
    }

    this.qaService.votePoll(optionId).subscribe({
      next: (res) => {
        if (res.success) {
          this.toastr.success('Your vote has been cast!');
          this.loadQuestions();
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

  // --- User Profiles ---
  loadUserProfile(userId: number): void {
    this.selectedProfileId = userId;
    this.loadingProfile = true;
    this.qaService.getUserProfile(userId).subscribe({
      next: (res) => {
        if (res.success) {
          this.userProfile = res.data;
          this.generateHeatmapData(this.userProfile.reputationHistory || []);
        } else {
          this.toastr.error('Failed to load user profile');
        }
        this.loadingProfile = false;
      },
      error: () => {
        this.toastr.error('Error loading user profile');
        this.loadingProfile = false;
      }
    });
  }

  // --- Leaderboards ---
  loadLeaderboard(): void {
    this.loadingLeaderboard = true;
    this.qaService.getLeaderboard().subscribe({
      next: (res) => {
        if (res.success) {
          this.leaderboardUsers = res.data;
        } else {
          this.toastr.error('Failed to load leaderboard');
        }
        this.loadingLeaderboard = false;
      },
      error: () => {
        this.toastr.error('Error loading leaderboard');
        this.loadingLeaderboard = false;
      }
    });
  }

  // --- Contribution Heatmap Generator ---
  generateHeatmapData(logs: any[]): void {
    const contributionsMap = new Map<string, number>();
    if (logs) {
      logs.forEach(log => {
        if (log.createdAt) {
          const dateKey = new Date(log.createdAt).toISOString().split('T')[0];
          contributionsMap.set(dateKey, (contributionsMap.get(dateKey) || 0) + 1);
        }
      });
    }

    const today = new Date();
    const dayMillis = 24 * 60 * 60 * 1000;
    const days: { dateStr: string; label: string; count: number; level: number }[] = [];
    
    // Generate exactly 364 days + today (total 365 squares)
    for (let i = 364; i >= 0; i--) {
      const dayDate = new Date(today.getTime() - i * dayMillis);
      const dateKey = dayDate.toISOString().split('T')[0];
      const count = contributionsMap.get(dateKey) || 0;
      
      let level = 0;
      if (count > 0 && count <= 1) level = 1;
      else if (count > 1 && count <= 3) level = 2;
      else if (count > 3 && count <= 5) level = 3;
      else if (count > 5) level = 4;

      days.push({
        dateStr: dateKey,
        label: `${dayDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}: ${count} contributions`,
        count,
        level
      });
    }
    
    this.heatmapDays = days;
  }

  // --- Profile Editing ---
  openEditProfile(): void {
    if (!this.userProfile) return;
    this.editProfileForm = {
      bio: this.userProfile.bio || '',
      skills: this.userProfile.skills || '',
      socialLinks: this.userProfile.socialLinks || ''
    };
    this.showEditProfileModal = true;
  }

  closeEditProfile(): void {
    this.showEditProfileModal = false;
  }

  saveProfile(): void {
    this.savingProfile = true;
    this.qaService.updateUserProfile(this.editProfileForm).subscribe({
      next: (res) => {
        this.savingProfile = false;
        if (res.success) {
          this.toastr.success('Profile updated successfully');
          this.closeEditProfile();
          if (this.selectedProfileId) {
            this.loadUserProfile(this.selectedProfileId);
          }
        }
      },
      error: (err) => {
        this.savingProfile = false;
        this.toastr.error(err.error?.message || 'Failed to update profile');
      }
    });
  }
}

