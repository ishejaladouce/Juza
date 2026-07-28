/** Shared app types (match Supabase tables). */

export type UserRole = 'citizen' | 'contributor' | 'admin';
export type AccountStatus = 'active' | 'suspended' | 'removed';
export type ArticleStatus = 'draft' | 'in_review' | 'published' | 'archived';
export type LanguageCode = 'en' | 'fr' | 'rw';
export type ContributorRequestStatus = 'pending' | 'approved' | 'rejected';
export type ArticleReportStatus = 'open' | 'resolved' | 'dismissed';
export type ArticleReportReason =
  | 'wrong_info'
  | 'unsafe'
  | 'spam'
  | 'other'
  | 'question';

export interface ContactMessageRow {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  status: 'open' | 'closed';
  user_id: string | null;
  admin_reply: string | null;
  replied_at: string | null;
  replied_by: string | null;
  created_at: string;
}

export interface Profile {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  role: UserRole;
  preferred_language: LanguageCode;
  account_status: AccountStatus;
  email_notifications: boolean;
  onboarding_completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProfileInsert {
  id: string;
  username?: string | null;
  full_name?: string | null;
  avatar_url?: string | null;
  bio?: string | null;
  role?: UserRole;
  preferred_language?: LanguageCode;
  account_status?: AccountStatus;
  email_notifications?: boolean;
  onboarding_completed_at?: string | null;
}

export interface ProfileUpdate {
  username?: string | null;
  full_name?: string | null;
  avatar_url?: string | null;
  bio?: string | null;
  role?: UserRole;
  preferred_language?: LanguageCode;
  account_status?: AccountStatus;
  email_notifications?: boolean;
  onboarding_completed_at?: string | null;
}

export interface Category {
  id: string;
  slug: string;
  name_en: string;
  name_fr: string;
  name_rw: string;
  description_en: string | null;
  description_fr: string | null;
  description_rw: string | null;
  icon: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Article {
  id: string;
  translation_group_id: string;
  language: LanguageCode;
  slug: string;
  title: string;
  excerpt: string | null;
  body: string;
  category_id: string | null;
  author_id: string | null;
  status: ArticleStatus;
  review_note: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ArticleInsert {
  id?: string;
  translation_group_id?: string;
  language: LanguageCode;
  slug: string;
  title: string;
  excerpt?: string | null;
  body?: string;
  category_id?: string | null;
  author_id?: string | null;
  status?: ArticleStatus;
  published_at?: string | null;
}

export interface ArticleUpdate {
  translation_group_id?: string;
  language?: LanguageCode;
  slug?: string;
  title?: string;
  excerpt?: string | null;
  body?: string;
  category_id?: string | null;
  author_id?: string | null;
  status?: ArticleStatus;
  review_note?: string | null;
  published_at?: string | null;
}

export interface SavedArticle {
  user_id: string;
  article_id: string;
  created_at: string;
}

export interface ContributorRequest {
  id: string;
  user_id: string;
  reason: string;
  status: ContributorRequestStatus;
  admin_note: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ContributorRequestInsert {
  id?: string;
  user_id: string;
  reason: string;
  status?: ContributorRequestStatus;
}

export interface ContributorRequestUpdate {
  reason?: string;
  status?: ContributorRequestStatus;
  admin_note?: string | null;
  reviewed_by?: string | null;
  reviewed_at?: string | null;
}

export interface ContributorRequestWithProfile extends ContributorRequest {
  applicant: Profile | null;
}

export interface ArticleReport {
  id: string;
  article_id: string;
  reporter_user_id: string | null;
  reporter_email: string | null;
  reason: ArticleReportReason;
  note: string | null;
  status: ArticleReportStatus;
  resolved_by: string | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ArticleReportInsert {
  id?: string;
  article_id: string;
  reporter_user_id?: string | null;
  reporter_email?: string | null;
  reason: ArticleReportReason;
  note?: string | null;
}

export interface ArticleReportUpdate {
  status?: ArticleReportStatus;
  resolved_by?: string | null;
  resolved_at?: string | null;
}

export interface ArticleReportWithArticle extends ArticleReport {
  article: Pick<
    Article,
    'id' | 'slug' | 'title' | 'language' | 'status' | 'author_id'
  > | null;
  replies?: ArticleReportReply[];
}

export type ReportReplyAuthorKind = 'admin' | 'reporter';

export interface ArticleReportReply {
  id: string;
  report_id: string;
  article_id: string;
  author_id: string | null;
  author_kind: ReportReplyAuthorKind;
  body: string;
  created_at: string;
}

export interface ArticleReportReplyInsert {
  report_id: string;
  article_id: string;
  author_id?: string | null;
  author_kind: ReportReplyAuthorKind;
  body: string;
}

export interface ArticleFollow {
  user_id: string;
  article_id: string;
  created_at: string;
}

export type NotificationKind =
  | 'article_updated'
  | 'article_published'
  | 'system'
  | 'contact_reply';

export interface Notification {
  id: string;
  user_id: string;
  article_id: string | null;
  kind: NotificationKind;
  title: string;
  body: string | null;
  link: string | null;
  read_at: string | null;
  created_at: string;
}

export interface NotificationInsert {
  id?: string;
  user_id: string;
  article_id?: string | null;
  kind?: NotificationKind;
  title: string;
  body?: string | null;
  link?: string | null;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: ProfileInsert;
        Update: ProfileUpdate;
      };
      categories: {
        Row: Category;
        Insert: Omit<Category, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
        };
        Update: Partial<Omit<Category, 'id' | 'created_at' | 'updated_at'>>;
      };
      articles: {
        Row: Article;
        Insert: ArticleInsert;
        Update: ArticleUpdate;
      };
      saved_articles: {
        Row: SavedArticle;
        Insert: SavedArticle;
        Update: Partial<SavedArticle>;
      };
      article_follows: {
        Row: ArticleFollow;
        Insert: Omit<ArticleFollow, 'created_at'> & { created_at?: string };
        Update: Partial<ArticleFollow>;
      };
      notifications: {
        Row: Notification;
        Insert: NotificationInsert;
        Update: Partial<Pick<Notification, 'read_at' | 'title' | 'body'>>;
      };
      contributor_requests: {
        Row: ContributorRequest;
        Insert: ContributorRequestInsert;
        Update: ContributorRequestUpdate;
      };
      article_reports: {
        Row: ArticleReport;
        Insert: ArticleReportInsert;
        Update: ArticleReportUpdate;
      };
      article_report_replies: {
        Row: ArticleReportReply;
        Insert: ArticleReportReplyInsert;
        Update: Partial<Pick<ArticleReportReply, 'body'>>;
      };
      contact_messages: {
        Row: ContactMessageRow;
        Insert: {
          name: string;
          email: string;
          subject?: string | null;
          message: string;
          status?: 'open' | 'closed';
          user_id?: string | null;
        };
        Update: Partial<
          Pick<
            ContactMessageRow,
            | 'status'
            | 'admin_reply'
            | 'replied_at'
            | 'replied_by'
            | 'user_id'
          >
        >;
      };
    };
    Enums: {
      user_role: UserRole;
      article_status: ArticleStatus;
      language_code: LanguageCode;
      contributor_request_status: ContributorRequestStatus;
      article_report_status: ArticleReportStatus;
      article_report_reason: ArticleReportReason;
    };
  };
}
