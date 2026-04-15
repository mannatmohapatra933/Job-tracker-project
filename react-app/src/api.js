const API_BASE_URL = process.env.REACT_APP_API_URL;

const getHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const getJobs = async () => {
  const res = await fetch(`${API_BASE_URL}/jobs`, {
    headers: getHeaders(),
  });
  return res.json();
};

export const addJob = async (job) => {
  const res = await fetch(`${API_BASE_URL}/jobs`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(job),
  });
  return res.json();
};

export const deleteJob = async (id) => {
  await fetch(`${API_BASE_URL}/jobs/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
};

export const toggleWishlist = async (id) => {
  const res = await fetch(`${API_BASE_URL}/jobs/${id}/wishlist`, {
    method: "PUT",
    headers: getHeaders(),
  });
  return res.json();
};