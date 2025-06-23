// src/axiosConfig.js
import axios from 'axios';
const instance = axios.create({
    baseURL: "https://multicourse-q1mn.onrender.com",    //backend

    headers: {
      "Content-Type": "application/json",
    },
  });
  
  export default instance;
  
