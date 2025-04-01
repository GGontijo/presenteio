import { CredentialResponse, GoogleLogin } from "@react-oauth/google";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function LoginModalButton({
  onLoginSuccess,
  onLoginFailure,
  onNoLoginOption,
}: {
  onLoginSuccess: (response: CredentialResponse) => void;
  onLoginFailure: () => void;
  onNoLoginOption: (noLoginState: boolean) => void;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="lg">Criar Página</Button>
      </DialogTrigger>
      <DialogContent className="flex flex-col sm:max-w-md jus">
        <div className="flex items-center">
          <DialogHeader className="text-center">
            <DialogTitle className="text-xl text-gray-800">
              Crie sua Página
            </DialogTitle>
            <DialogDescription>Entre com sua conta Google</DialogDescription>
          </DialogHeader>
        </div>
        <div className="flex flex-row items-center gap-4 justify-center w-full h-full">
          <GoogleLogin
            text="continue_with"
            onSuccess={(response) => onLoginSuccess(response)}
            onError={() => onLoginFailure()}
          />
          <Button variant={"outline"} onClick={() => onNoLoginOption(true)}>
            Continuar sem Entrar
          </Button>
        </div>
        <DialogFooter className="sm:justify-start"></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
