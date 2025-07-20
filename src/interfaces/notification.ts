import { User } from "./user";

export interface INotification {
  id: number;
  user?: User;
  title: string;
  message: string;
  createdAt: Date;
  isRead: boolean;
}