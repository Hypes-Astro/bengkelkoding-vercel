import { Meta } from "../../Meta";

export interface FeedbackData {
  id: number;
  student_name: string;
  course_title: string;
  rating: number;
  comment: string;
  created_at: string;
}

export interface FeedbackResponse {
  data: FeedbackData[];
  meta: Meta;
}
