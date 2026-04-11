const API_BASE_URL = "http://localhost:8081";

export const getJobs = async () => {
  const res = await fetch(`${API_BASE_URL}/jobs`);
  return res.json();
};

export const addJob = async (job) => {
  const res = await fetch(`${API_BASE_URL}/jobs`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(job),
  });
  return res.json();
};

export const deleteJobAPI = async (id) => {
  const res = await fetch(`${API_BASE_URL}/jobs/${id}`, {
    method: "DELETE",
  });
  return res.text();
};