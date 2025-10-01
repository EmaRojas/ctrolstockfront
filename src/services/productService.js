import axios from "axios";
const API_URL = "http://localhost:3000/products";
// const API_URL = "https://ctrlstockbackend-git-main-emarojas-projects.vercel.app/products"
export const getProducts = async () => {
    const res = await axios.get(API_URL, { withCredentials: true });
    return res.data;
};
export const getProduct = async (id) => {
    const res = await axios.get(`${API_URL}/${id}`);
    return res.data;
};
export const createProduct = async (product) => {
    const res = await axios.post(API_URL, product);
    return res.data;
};
export const updateProduct = async (id, product) => {
    const res = await axios.put(`${API_URL}/${id}`, product);
    return res.data;
};
export const deleteProduct = async (id) => {
    const res = await axios.delete(`${API_URL}/${id}`);
    return res.data;
};
