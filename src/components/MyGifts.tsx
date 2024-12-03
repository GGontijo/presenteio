import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface MyGiftsModalButtonProps {
  enabled: boolean;
}

export function MyGiftsModalButton({ enabled }: MyGiftsModalButtonProps) {
  return enabled ? (
    <Sheet>
      <SheetTrigger>
        <Button size="lg" variant="outline">
          Meus Presentes
        </Button>
      </SheetTrigger>
      <SheetContent side={"left"}>
        <SheetHeader>
          <SheetTitle>Presentes Recebidos</SheetTitle>
          <SheetDescription>
            Veja todos os presentes que as pessoas escolheram
          </SheetDescription>
        </SheetHeader>
        
      </SheetContent>
    </Sheet>
  ) : null;
}
