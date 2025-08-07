export const BASE_URL = "https://se-register-api.en.tripleten-services.com/v1";

export const register = (email, password) => {
  return fetch(`${BASE_URL}/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  }).then((res) => {
    if (res.ok) return res.json();
    return res
      .json()
      .then((err) => Promise.reject(err.message || `Error: ${res.status}`));
  });
};

export const authorize = (email, password) => {
  return fetch(`${BASE_URL}/signin`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  }).then((res) => {
    if (res.ok) return res.json();
    return res
      .json()
      .then((err) => Promise.reject(err.message || `Error: ${res.status}`));
  });
};

export const checkToken = (token) => {
  return fetch(`${BASE_URL}/users/me`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  }).then((res) => {
    if (res.ok) return res.json();
    return res
      .json()
      .then((err) => Promise.reject(err.message || `Error: ${res.status}`));
  });
};
