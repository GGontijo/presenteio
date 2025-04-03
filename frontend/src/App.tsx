import api from "@/axiosConfig";
import Layout from "@/layout";
import { useEffect, useState } from "react";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import ErrorPage from "./ErrorPage";
import GiftRegistry from "./GiftRegistry";

// Interface para os dados da página
interface PageObject {
  id?: number;
  domain?: string;
  title?: string;
  description?: string;
  picture_url?: string;
}

const App = () => {
  const [page, setPage] = useState<PageObject | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchPageData = async () => {
      try {
        // Obtém a primeira parte da URL após "/"
        const currentDomain = location.pathname.split("/")[1];
        console.log(`Dominio atual: ${currentDomain}`);

        // Ignorar caso esteja na rota "/error"
        if (currentDomain === "error") {
          return;
        }

        // Faz a requisição para o backend
        if (currentDomain) {
          const response = await api.get(`/domains/${currentDomain}`);
          if (response && response.status !== 200) {
            throw new Error(`Domínio não encontrado: ${currentDomain}`);
          }

          const pageId: number = response.data;

          const responsePageData = await api.get(`/pages/${pageId}`);
          if (response && response.status !== 200) {
            throw new Error(`Página não encontrada: ${pageId}`);
          }

          const data = responsePageData.data;

          // Valida os dados retornados
          if (data?.id) {
            setPage(data);
          } else {
            console.error("Resposta inválida da API:", data);
            navigate("/error");
          }
        }
      } catch (error) {
        console.error("Erro ao buscar dados da página:", error);
        navigate("/error");
      }
    };

    fetchPageData();
  }, [location.pathname, navigate]);

  return (
    <Layout>
      <Routes>
        {/* Página de login */}
        <Route path="/" element={<GiftRegistry page={page} />} />

        {/* Página para rotas dinâmicas */}
        <Route
          path="/*"
          element={
            page ? <GiftRegistry page={page} isPublic={true} /> : <ErrorPage />
          }
        />

        {/* Página de erro */}
        <Route path="/error" element={<ErrorPage />} />
      </Routes>
    </Layout>
  );
};

export default App;
