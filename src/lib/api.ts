const API_URL = "https://functions.poehali.dev/095d2e54-670b-425f-b832-009bafce285f";

function getToken(): string {
  return localStorage.getItem("token") || "";
}

export function setToken(token: string) {
  localStorage.setItem("token", token);
}

export function clearToken() {
  localStorage.removeItem("token");
}

async function request(route: string, method = "GET", body?: unknown, extraParams?: Record<string, string>) {
  const params = new URLSearchParams({ route, ...extraParams });
  const url = `${API_URL}?${params.toString()}`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Ошибка сервера");
  return data;
}

export const api = {
  login: (email: string, password: string) =>
    request("auth/login", "POST", { email, password }),
  register: (email: string, password: string, name: string) =>
    request("auth/register", "POST", { email, password, name }),
  me: () => request("auth/me", "GET"),
  updateProfile: (data: Record<string, string>) =>
    request("auth/update-profile", "POST", data),

  getCategories: () => request("categories", "GET"),
  addCategory: (name: string) => request("categories", "POST", { name }),
  deleteCategory: (id: number) => request("categories", "DELETE", { id }),

  getServices: (params?: Record<string, string>) =>
    request("services", "GET", undefined, params),
  getService: (id: number) =>
    request("services", "GET", undefined, { id: String(id) }),
  addService: (data: unknown) => request("services", "POST", data),
  updateService: (data: unknown) => request("services", "PUT", data),
  deleteService: (id: number) => request("services", "DELETE", { id }),

  getBookings: () => request("bookings", "GET"),
  createBooking: (data: unknown) => request("bookings", "POST", data),

  getPromotions: () => request("promotions", "GET"),
  addPromotion: (data: unknown) => request("promotions", "POST", data),
  deletePromotion: (id: number) => request("promotions", "DELETE", { id }),

  getChats: () => request("chat", "GET"),
  getChatMessages: (userId: number) =>
    request("chat", "GET", undefined, { user_id: String(userId) }),
  sendMessage: (data: { message: string; user_id?: number }) =>
    request("chat", "POST", data),

  getFavorites: () => request("favorites", "GET"),
  toggleFavorite: (serviceId: number) =>
    request("favorites", "POST", { service_id: serviceId }),
};

export default api;
