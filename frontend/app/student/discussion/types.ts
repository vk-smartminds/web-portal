export interface DiscussionUser {
  _id: string;
  name?: string;
  email?: string;
  role: 'Student' | 'Teacher' | 'Guardian' | 'Admin';
}

export interface DiscussionVote {
  user: string;
  userModel: 'Student' | 'Teacher' | 'Guardian' | 'Admin';
  value: 1 | -1;
}

export interface DiscussionPost {
  _id: string;
  body: string;
  createdBy: DiscussionUser | string;
  createdByModel: 'Student' | 'Teacher' | 'Guardian' | 'Admin';
  parentPost?: string | null;
  votes: DiscussionVote[];
  images?: Array<{ url?: string; data?: string; contentType?: string; fileType?: string }>;
  edited?: boolean;
  editedAt?: string;
  deleted?: boolean;
  deletedAt?: string;
  createdAt?: string;
  replies?: DiscussionPost[];
}

export interface DiscussionThread {
  _id: string;
  title: string;
  body: string;
  tags: string[];
  createdBy: DiscussionUser | string;
  createdByModel: 'Student' | 'Teacher' | 'Guardian' | 'Admin';
  images?: Array<{ url?: string; data?: string; contentType?: string; fileType?: string }>;
  posts: DiscussionPost[];
  votes: DiscussionVote[];
  createdAt?: string;
  edited?: boolean;
  editedAt?: string;
  deleted?: boolean;
  deletedAt?: string;
} 