import API from "./api";

export const createProfile = async (userId, profileData) => {
  const response = await API.post(`/profiles?user_id=${userId}`, profileData);
  return response.data;
};

export const getProfiles = async (userId) => {
  const response = await API.get(`/profiles?user_id=${userId}`);
  return response.data;
};