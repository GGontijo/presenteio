import { Copy } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import api from "@/axiosConfig";
import { toast } from "@/hooks/use-toast";

interface ShareModalButtonProps {
  enabled: boolean;
  domain?: string;
  pageId?: number;
}

const publishPage = async (pageId?: number) => {
  if (!pageId) {
    toast({
      title: "Erro ao publicar a página",
      description: "ID da página não encontrado.",
    });
    return;
  }
  try {
    const response = await api.patch(`/pages/${pageId}`, {
      status: "published",
    });
    if (response.status === 200) {
      toast({
        title: "Página publicada com sucesso!",
      });
    } else {
      console.error("Erro ao publicar a página: ", response.statusText);
      toast({
        title: "Houve um erro ao tentar publicar a página!",
        description:
          "Erro ao tentar publicar a página. Tente novamente mais tarde.",
      });
    }
  } catch (error) {
    console.error("Erro ao publicar a página: ", error);
    toast({
      title: "Houve um erro ao tentar publicar a página!",
      description:
        "Erro ao tentar publicar a página. Tente novamente mais tarde.",
    });
  }
};

export function ShareModalButton({
  enabled,
  domain,
  pageId,
}: ShareModalButtonProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {enabled == true ? (
          <Button size="lg" variant="outline">
            Publicar
          </Button>
        ) : (
          <Button size="lg" variant="outline" disabled>
            Publicar
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Publicar Site</DialogTitle>
          <DialogDescription>
            Qualquer um com este link poderá acessar seu site.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-2">
          <Input
            id="link"
            value={`${import.meta.env.VITE_BASE_URL}/${domain}`}
            readOnly
          />
          <Button
            type="submit"
            size="sm"
            className="px-3"
            onClick={() =>
              navigator.clipboard.writeText(
                `${import.meta.env.VITE_BASE_URL}/${domain}`
              )
            }
          >
            <span className="sr-only">Copiar</span>
            <Copy />
          </Button>
        </div>
        <DialogFooter className="sm:justify-start">
          <DialogClose asChild>
            <Button
              type="button"
              variant="secondary"
              onClick={() => publishPage(pageId)}
            >
              Publicar
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
