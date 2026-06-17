export interface Family {
  id: string;
  name: string;
  created_by: string;
  created_at: string;
}

export interface FamilyMember {
  id: string;
  family_id: string;
  user_id: string;
  role: 'owner' | 'member';
  joined_at: string;
  profiles?: {
    id: string;
    full_name: string | null;
  };
}

export interface FamilyInvite {
  id: string;
  family_id: string;
  email: string;
  invited_by: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  families?: {
    name: string;
  };
  profiles?: {
    full_name: string | null;
  };
}
