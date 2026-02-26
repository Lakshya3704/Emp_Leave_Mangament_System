import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: { "Content-Type": "application/json" },
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      if (
        window.location.pathname !== "/login" &&
        window.location.pathname !== "/register"
      ) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

// ========== AUTH ==========
export const loginAPI = (data) => API.post("/auth/login", data);
export const registerEmployeeAPI = (data) => API.post("/auth/register", data);
export const registerAdminAPI = (data) =>
  API.post("/auth/register-admin", data);
export const getMeAPI = () => API.get("/auth/me");
export const changePasswordAPI = (data) =>
  API.put("/auth/change-password", data);

// ========== ADMIN ==========
export const getAdminDashboardAPI = () => API.get("/admin/dashboard");
export const getEmployeesAPI = (params) =>
  API.get("/admin/employees", { params });
export const getAllAdminsAPI = () => API.get("/admin/admins");
export const createEmployeeAPI = (data) => API.post("/admin/employees", data);
export const updateEmployeeAPI = (id, data) =>
  API.put(`/admin/employees/${id}`, data);
export const deleteEmployeeAPI = (id) => API.delete(`/admin/employees/${id}`);

// ========== REIMBURSEMENTS ==========
export const createReimbursementAPI = (data) =>
  API.post("/reimbursements", data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
export const getMyReimbursementsAPI = (params) =>
  API.get("/reimbursements/my", { params });
export const getMyStatsAPI = () => API.get("/reimbursements/my-stats");
export const getReimbursementAPI = (id) => API.get(`/reimbursements/${id}`);
export const updateReimbursementAPI = (id, data) =>
  API.put(`/reimbursements/${id}`, data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
export const deleteReimbursementAPI = (id) =>
  API.delete(`/reimbursements/${id}`);
export const getAllReimbursementsAPI = (params) =>
  API.get("/reimbursements/all", { params });
export const reviewReimbursementAPI = (id, data) =>
  API.put(`/reimbursements/${id}/review`, data);

// ========== EMPLOYEE ==========
export const getProfileAPI = () => API.get("/employee/profile");
export const updateProfileAPI = (data) => API.put("/employee/profile", data);

// ========== LEAVES ========== ⭐ NEW
export const applyLeaveAPI = (data) => API.post("/leaves", data);
export const getMyLeavesAPI = (params) => API.get("/leaves/my", { params });
export const getMyLeaveBalanceAPI = () => API.get("/leaves/my-balance");
export const getMyLeaveStatsAPI = () => API.get("/leaves/my-stats");
export const cancelLeaveAPI = (id) => API.put(`/leaves/${id}/cancel`);
export const getLeaveByIdAPI = (id) => API.get(`/leaves/${id}`);
export const getAllLeavesAPI = (params) => API.get("/leaves/all", { params });
export const reviewLeaveAPI = (id, data) =>
  API.put(`/leaves/${id}/review`, data);
export const getLeaveDashboardStatsAPI = () =>
  API.get("/leaves/dashboard-stats");

// ========== LEAVE BALANCES ========== ⭐ NEW
export const getAllLeaveBalancesAPI = (params) =>
  API.get("/leave-balances", { params });
export const getEmployeeBalanceAPI = (id, params) =>
  API.get(`/leave-balances/${id}`, { params });
export const updateLeaveBalanceAPI = (id, data) =>
  API.put(`/leave-balances/${id}`, data);
export const resetLeaveBalancesAPI = (data) =>
  API.post("/leave-balances/reset", data);

export default API;
