export interface User {
  id: number;
  register_date: Date;
  username?: string;
  name: string;
  surname: string;
  mail: string;
  phone: string;
  gender?: boolean;
  birthday?: Date | null;
  card_id?: number;
}

export interface UserStats {
  visitCount: number;
  lastVisit: string | null;
  lastDuration: number;
  totalTrainingTime: number;
  longestTraining: number;
}

export interface UserStatsDailyTrainingTime {
  labels: string[];
  data: number[];
}

export type UserRoles = 'ROLE_ADMIN' | 'ROLE_CLIENT' | '...'