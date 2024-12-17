import { Meta } from "./Meta";

export interface ActivityLogData {
  id: number;
  user_id: number;  
  name: string;
  action: string;
  ip_address: string;
  device: string;
  created_at: string;
}

export interface ActivityLogRespon {
  data: ActivityLogData[];
  meta: Meta;
}
