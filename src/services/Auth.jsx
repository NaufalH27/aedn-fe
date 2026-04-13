import api from "./api";

// SIGN UP
export const signup = async (data) => {
  const res = await api.post("/auth/signup", data);
  return res.data;
};

// LOGIN (username / email fleksibel)
export const login = async (data) => {
  const res = await api.post("/auth/login", data);

  const { accessToken, refreshToken } = res.data.data;

  localStorage.setItem("accessToken", accessToken);
  localStorage.setItem("refreshToken", refreshToken);

  return res.data;
};

// REFRESH TOKEN 
export const refreshToken = async () => {
  const token = localStorage.getItem("refreshToken");

  const res = await api.post("/auth/refresh-token", { token });

  const { accessToken, refreshToken: newRefresh } = res.data.data;

  localStorage.setItem("accessToken", accessToken);
  localStorage.setItem("refreshToken", newRefresh);

  return res.data;
};