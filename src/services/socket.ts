import { io } from "socket.io-client";

export const socket = io("http://localhost:3000", {
  autoConnect: false,
  auth: {
    token: localStorage.getItem("auth_token"), // ou ton authStore
  },
});
