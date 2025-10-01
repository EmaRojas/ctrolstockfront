// services/cashRegisterService.ts
import axios from "axios";
// const API_URL = "http://localhost:3000/cashRegister"; // 🔁 ajustá el puerto si es distinto
const API_URL = "https://ctrlstockbackend-git-main-emarojas-projects.vercel.app/cashRegister";
// 🟢 Abrir caja
export const openCashRegister = async (initialAmount, openedBy) => {
    const { data } = await axios.post(`${API_URL}/open`, { initialAmount, openedBy });
    return data;
};
// 📊 Obtener caja activa
export const getActiveCashRegister = async () => {
    const { data } = await axios.get(`${API_URL}/active`);
    return data;
};
export const registerMovement = async (movementData) => {
    const res = await axios.post(`${API_URL}/movement`, movementData);
    return res.data;
};
export async function deleteMovement(movementId) {
    const { data } = await axios.delete(`${API_URL}/movement/${movementId}`);
    return data; // devuelve la caja actualizada
}
// 🔒 Cerrar caja
export const closeCashRegister = async () => {
    const { data } = await axios.post(`${API_URL}/close`);
    return data;
};
// 📜 Historial
export const getCashRegisterHistory = async () => {
    const { data } = await axios.get(`${API_URL}/history`);
    return data;
};
