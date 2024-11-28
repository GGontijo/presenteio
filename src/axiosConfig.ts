import axios from 'axios';
import Cookies from "js-cookie";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

// Criação da instância do axios com configurações padrão
const api = axios.create({
  baseURL: apiBaseUrl, // Substitua pelo seu endpoint base
  timeout: 60000, // Tempo máximo de espera em ms
  headers: {
    'Content-Type': 'application/json',
    // Outros cabeçalhos personalizados, se necessário
  },
});

// Interceptores para manipular requests e responses, se necessário
api.interceptors.request.use(
  config => {
    // Adicione tokens de autenticação ou outras modificações nas requisições aqui
    const sessionToken = Cookies.get("sessionToken");
    if (sessionToken) {
      config.headers.authorization = `Bearer ${sessionToken}`;
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
    if (error.response?.status === 401) {
      // Remove o cookie de sessão
      Cookies.remove("sessionToken");

      // Opcional: Recarrega a página (para resetar o estado do componente)
      window.location.reload();
    }
    console.error('Erro na resposta:', error);
    return Promise.reject(error);
  }
);

export default api;

