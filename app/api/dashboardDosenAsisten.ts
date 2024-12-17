import { AxiosResponse } from "axios";
import { createRequest } from "./request";

export const getDataDashboard = async (user: string): Promise<AxiosResponse> =>
  createRequest(`/api/v1/${user}/dashboard`);
