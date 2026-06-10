import { apiClient } from "./client.js";

export const loginUser = ({ email, password }) =>
  apiClient.post("/auth/login", { email, password });

export const registerUser = ({ firstName, lastName, email, password }) =>
  apiClient.post("/auth/register", { firstName, lastName, email, password });

export const refreshToken = ({ refreshToken }) =>
  apiClient.post("/auth/refresh", { refreshToken });

export const logout = ({ refreshToken }) =>
  apiClient.post("/auth/logout", { refreshToken });