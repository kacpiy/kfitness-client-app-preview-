export interface Ticket {
  id: number;
  name: string;
  entries: number | null;
  days: number | null;
  price: number | null;
  minAge: number | null;
  minHour: string | null;
  maxHour: string | null;
  active: boolean;
  priceExtra: number | null;
  ticket?: Ticket;
}