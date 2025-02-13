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

interface ShareModalButtonProps {
  enabled: boolean;
  domain?: string;
}

export function ShareModalButton({ enabled, domain }: ShareModalButtonProps) {
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
              navigator.clipboard.writeText(`${import.meta.env.VITE_BASE_URL}/${domain}`)
            }
          >
            <span className="sr-only">Copiar</span>
            <Copy />
          </Button>
        </div>
        <DialogFooter className="sm:justify-start">
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Publicar
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
