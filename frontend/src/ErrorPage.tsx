import { Button } from "./components/ui/button";

const ErrorPage = () => {

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 text-center font-mono">
      <h1 className="text-5xl font-bold text-gray-500 mb-6">
        Houve um erro não esperado
      </h1>
      <h2 className="text-2xl font-bold text-gray-500 mb-6 font-mono">
        Por favor, tente novamente mais tarde
      </h2>
      <img
        src="https://media.giphy.com/media/A9EcBzd6t8DZe/giphy.gif"
        alt="Erro GIF"
        className="w-80 h-80"
      />
      <Button
        variant={"outline"}
        size="lg"
        className="mt-6"
        onClick={() => (window.location.href = "/")}
      >
        Tentar Novamente
      </Button>
    </div>
  );
};

export default ErrorPage;
