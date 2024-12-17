import { AxiosResponse } from "axios";
import { createRequest, deleteRequest } from "../request";

// Get Activity Logs
export const getActivityLogs = async (
  search: string,
  page: number,
  per_page: number,
  start_date: string,
  end_date: string
): Promise<AxiosResponse> =>
  createRequest(
    `/api/v1/superadmin/activity-logs?search=${search}&page=${page}&per_page=${per_page}&start_date=${start_date}&end_date=${end_date}`
  );

// Get Detal Activity Logs
export const getDetailActivityLogs = async (
  activity_log_id: string
): Promise<AxiosResponse> =>
  createRequest(`/api/v1/superadmin/activity-logs/${activity_log_id}`);

// Delete Activity Logs
export const deleteActivityLogs = async (
  activity_log_id: number
): Promise<AxiosResponse> =>
  deleteRequest(`/api/v1/superadmin/activity-logs/${activity_log_id}`);
