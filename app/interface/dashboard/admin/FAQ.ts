import { Meta } from "../../Meta";

export interface FAQData {
  id: number;
  question: string;
  answer: string;
  status: number;
  status_label: string;
}

export interface FAQResponse {
  data: FAQData[];
  meta: Meta;
}
