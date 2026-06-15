// Initialize tokens from localStorage
let token: string | null = localStorage.getItem("token");
let refreshToken: string | null = localStorage.getItem("refreshToken");

export const setTokens = (t: string | null, rt: string | null) => {
  token = t;
  refreshToken = rt;
  if (t) {
    localStorage.setItem("token", t);
  } else {
    localStorage.removeItem("token");
  }
  if (rt) {
    localStorage.setItem("refreshToken", rt);
  } else {
    localStorage.removeItem("refreshToken");
  }
};

export const getToken = () => token || localStorage.getItem("token");
export const getRefreshToken = () => refreshToken || localStorage.getItem("refreshToken");

export const clearTokens = () => {
  token = null;
  refreshToken = null;
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
};
