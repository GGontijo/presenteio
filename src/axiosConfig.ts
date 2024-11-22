import axios from 'axios';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

// Criação da instância do axios com configurações padrão
const api = axios.create({
  baseURL: apiBaseUrl, // Substitua pelo seu endpoint base
  timeout: 10000, // Tempo máximo de espera em ms
  headers: {
    'Content-Type': 'application/json',
    // Outros cabeçalhos personalizados, se necessário
  },
});

// Interceptores para manipular requests e responses, se necessário
api.interceptors.request.use(
  config => {
    // Adicione tokens de autenticação ou outras modificações nas requisições aqui
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  response => {
    // Você pode manipular a resposta aqui
    return response;
  },
  error => {
    // Tratar erros globais aqui
    console.error('Erro na resposta:', error);
    return Promise.reject(error);
  }
);

export default api;

