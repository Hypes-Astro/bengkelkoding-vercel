import { Meta } from "../../Meta";

export interface CourseData {
  id: number;
  first_article_id: number;
  title: string;
  image: string;
  background_image: string;
  tools: string;
  rating: number;
  level: string;
  student_count: number;
}

export interface CourseResponse {
  data: CourseData[];
  meta: Meta;
}
