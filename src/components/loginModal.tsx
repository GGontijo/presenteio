import { CredentialResponse, GoogleLogin } from "@react-oauth/google";

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

export function LoginModalButton({
  onLoginSuccess,
  onLoginFailure,
}: {
  onLoginSuccess: (response: CredentialResponse) => void;
  onLoginFailure: () => void;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="lg">Entrar</Button>
      </DialogTrigger>
      <DialogContent className="flex flex-col sm:max-w-md jus">
        <div className="flex items-center">
          <DialogHeader className="text-center">
            <DialogTitle className="text-xl text-gray-800">
              Realizar Login
            </DialogTitle>
            <DialogDescription>
              Entre com sua conta google para continuar
            </DialogDescription>
          </DialogHeader>
        </div>
        <div>
          <GoogleLogin
            text="continue_with"
            onSuccess={(response) => onLoginSuccess(response)}
            onError={() => onLoginFailure()}
          />
        </div>
        <DialogFooter className="sm:justify-start"></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
