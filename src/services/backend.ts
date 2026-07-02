import axios from "axios";

export const API = axios.create({
  baseURL: "http://192.168.1.103:8081",
  headers: {
    "Content-Type": "application/json",
  },
});