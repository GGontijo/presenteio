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
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Remove o cookie de sessão
      Cookies.remove("sessionToken");
      window.location.href = '/';

      // Opcional: Recarrega a página (para resetar o estado do componente)
      // window.location.reload();
    } else {
      switch (error.code) {
        case 'ECONNABORTED':
          console.error('Erro: Timeout - O backend demorou demais para responder.')
          window.location.href = '/error';
          break;
        case 'ENOTFOUND':
          console.error('Erro: Servidor não encontrado.');
          window.location.href = '/error';
          break;
        case 'ECONNREFUSED':
          console.error('Erro: Conexão recusada - Não foi possível conectar ao servidor.');
          window.location.href = '/error';
          break;
        case 'ERR_NETWORK':
          console.error('Erro: Falha de rede - Verifique sua conexão com a internet.');
          window.location.href = '/error';
          break;
    }
    console.error('Erro na resposta:', error);
    return Promise.reject(error);
  }
});

export default api;

