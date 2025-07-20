import { Location } from "./location";

export interface Solarium {
  id: number;
  location: Location;
  description: string;
  status: string;
  code: string;
  usage?: boolean;
  usageMessage?: string;
  state?: {
    busy: boolean;
    busyUntil?: string;
  }
}
