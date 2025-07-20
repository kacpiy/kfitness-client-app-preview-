import { Ticket } from "./ticket";
export interface CardValidationResult {
  isValid: boolean;
  message: string;
}
export interface Card {
  id: number;
}

export type CardUseAction = '';