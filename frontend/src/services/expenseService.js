import API from "./api";

export const createExpenses = async (userId, expenseData) => {
  const response = await API.post(`/expenses?user_id=${userId}`, expenseData);
  return response.data;
};

export const getExpenses = async (userId) => {
  const response = await API.get(`/expenses?user_id=${userId}`);
  return response.data;
};

export const updateExpenseReceivedAmount = async (expenseId, received_amount) => {
  const response = await API.put(`/expenses/${expenseId}`, {
    received_amount,
  });
  return response.data;
};

export const deleteExpense = async (expenseId) => {
  const response = await API.delete(`/expenses/${expenseId}`);
  return response.data;
};