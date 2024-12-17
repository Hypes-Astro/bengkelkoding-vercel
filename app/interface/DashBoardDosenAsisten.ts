export interface DashboardData {
  statistics: Statistics;
  class_information: ClassInformation;
  presence_this_week: PresenceThisWeek[];
  upcoming_assignment: UpcomingAssignment[];
}

export interface Statistics {
  classrooms_count: number;
  students_count: number;
}

export interface ClassInformation {
  permission_waiting_count: number;
  assignment_waiting_count: number;
}

export interface PresenceThisWeek {
  id: number;
  classroom_id: number;
  classroom: string;
  day: string;
  time: string;
  room: string;
  meet: string;
}

export interface UpcomingAssignment {
  id: number;
  classroom_id: number;
  classroom: string;
  title: string;
  deadline: string;
  student: Student;
}

export interface Student {
  total_submitted: number;
  student_need_to_submit: number;
}

export interface Meta {
  status_code: number;
  success: boolean;
  message: string;
}
