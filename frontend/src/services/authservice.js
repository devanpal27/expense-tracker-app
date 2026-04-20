import API from "./api";

export const registerUser = async (data) => {
    const response = await API.post("/register", data)
    return response.data
};

export const loginUser = async (data) => {
    const response = await API.post("/login", data)
    return response.data
};
