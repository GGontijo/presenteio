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
import { Label } from "@/components/ui/label";

export function ShareModalButton({ enabled }: { enabled: boolean }) {
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
          <Input id="link" value={import.meta.env.VITE_BASE_URL} readOnly />
          <Button
            type="submit"
            size="sm"
            className="px-3"
            onClick={() =>
              navigator.clipboard.writeText(import.meta.env.VITE_BASE_URL)
            }
          >
            <span className="sr-only">Copiar</span>
            <Copy />
          </Button>
        </div>
        <DialogFooter className="sm:justify-start">
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Fechar
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
