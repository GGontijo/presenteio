import api from "@/axiosConfig";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Cookies from "js-cookie";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Cookie, PlusCircle } from "lucide-react";
import React, { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ShareModalButton } from "@/components/shareModal";
import { Gift as GiftObject } from "@phosphor-icons/react";
import { useEffect } from "react";
import { LoginModalButton } from "./components/loginModal";
import { jwtDecode } from "jwt-decode";
import { CredentialResponse } from "@react-oauth/google";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./components/ui/dropdown-menu";

interface ItemObject {
  id: number; // TODO: Obter id do retorno da API
  name: string;
  desc: string;
  image_url: string;
  value: number;
  payment_form: string;
  payment_info: string;
}

interface GiftObject {
  id: number; // TODO: Obter id do retorno da API
  sender_name: string;
  sender_phone: string;
  message: string;
  user_id: number;
  total: number;
}

interface UserObject {
  id?: number; // TODO: Obter id do retorno da API
  name: string;
  email: string;
  picture_url: string;
  password?: string;
}

interface JwtObject {
  exp: number;
  sub: string;
  name: string;
  email: string;
  picture: string;
}

export default function GiftRegistry() {
  const [gifts, setGifts] = useState<ItemObject[]>([]);
  const [newGift, setNewGift] = useState({
    id: 0,
    name: "",
    desc: "",
    image_url: "",
    value: 0,
    payment_form: "",
    payment_info: "",
  });

  const [sessionToken, setSessionToken] = useState("");
  const [userId, setUserId] = useState("");

  const userLogout = () => {
    setUserLogged(false);
    setSessionToken("");
    setUserId("");
    Cookies.remove("sessionToken");
    Cookies.remove("userId");
    window.location.reload();
  };

  useEffect(() => {
    if (sessionToken) {
      Cookies.set("sessionToken", sessionToken, {
        expires: 1,
        path: "/",
        secure: true,
      });
    }
  }, [sessionToken]);

  useEffect(() => {
    if (userId) {
      Cookies.set("userId", userId, {
        expires: 1,
        path: "/",
        secure: false,
      });
    }
  }, [userId]);

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [isGiftModalOpen, setIsGiftModalOpen] = useState(false);
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [selectedGift, setSelectedGift] = useState<ItemObject | null>(null);
  const [CurrentUser, setCurrentUser] = useState<UserObject | null>(null);
  const [paymentForm, setPaymentForm] = useState("");

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await api.get("/items");
        setGifts(response.data);
        console.log(response.data);
      } catch (err) {
        console.log(err);
      }
    };

    fetchItems();
  }, []); // O array vazio garante que o efeito seja executado apenas uma vez, ao montar o componente

  const handlePaymentFormChange = (value: string) => {
    setPaymentForm(value);
    setNewGift({ ...newGift, payment_form: value });
  };

  const getInitials = (fullName: string | undefined) => {
    if (!fullName) return "NA";

    const nameParts = fullName.trim().split(" ");
    if (nameParts.length === 1) {
      return nameParts[0].charAt(0).toUpperCase();
    }

    const firstInitial = nameParts[0].charAt(0);
    const lastInitial = nameParts[nameParts.length - 1].charAt(0);

    return (firstInitial + lastInitial).toUpperCase();
  };

  const [stage, setStage] = useState("building");
  const stages = ["building", "preview"];

  const [sendMessage, setSendMessage] = useState(false);

  const [userLogged, setUserLogged] = useState(false);

  const addItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      newGift.name &&
      newGift.image_url &&
      newGift.value &&
      newGift.payment_form
    ) {
      const response = api.post("/items", newGift);
      console.log(response);

      setGifts([...gifts, { ...newGift }]);
      setNewGift({
        id: 0,
        name: "",
        desc: "",
        image_url: "",
        value: 0,
        payment_form: "",
        payment_info: "",
      });
      setIsAddItemModalOpen(false);
    }
  };

  const openModal = (gift: ItemObject) => {
    setSendMessage(false);
    setSelectedGift(gift);
    setIsGiftModalOpen(true);
  };

  const closeModal = () => {
    setIsGiftModalOpen(false);
    setSelectedGift(null);
  };

  const handleLoginResponse = async (loginResponse?: CredentialResponse) => {
    console.log(loginResponse);
    if (loginResponse) {
      if (!userLogged) {
        const tokenDecoded = jwtDecode<JwtObject>(
          loginResponse.credential as string
        );

        console.log(tokenDecoded);

        try {
          const response = await api.post("/users", {
            name: tokenDecoded.name,
            email: tokenDecoded.email,
            bearer_token: loginResponse.credential,
            auth_provider: "google",
          });
          console.log(response.data);
          setSessionToken(loginResponse.credential as string);
          setUserId(response.data.id);
          setCurrentUser(response.data);
          setUserLogged(true);
        } catch (err) {
          console.log(err);
        }
      }
    } else {
      setUserLogged(false);
      userLogout();
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert(`"Valor copiado: ${text}!"`);
  };

  function removeItem(id: number): void {
    const response = api.delete("/items/" + id);
    console.log(response);
    setGifts(gifts.filter((gift) => gift.id !== id));
  }

  return (
    <div className="w-screen h-screen bg-gradient-to-b from-gray-100 to-gray-200 text-gray-800 p-8 ">
      <nav
        className={
          stage === "building"
            ? "fixed inset-x-0 top-0 z-50 bg-white shadow-lg dark:bg-gray-950/90"
            : "fixed inset-x-0 top-0 z-50 bg-transparent"
        }
      >
        <div className="w-full max-w-8xl mx-auto px-4">
          <div className="flex justify-between h-14">
            {
              <div
                className={`flex items-center space-x-2 justify-start ${
                  !userLogged ? "text-transparent" : ""
                }`}
              >
                <Switch
                  className={!userLogged ? "hidden" : ""}
                  onCheckedChange={() =>
                    setStage(stage === "building" ? "preview" : "building")
                  }
                  disabled={!userLogged}
                  id="preview"
                />
                <Label htmlFor="previewMode">Ver como público</Label>
              </div>
            }
            {stage === "building" ? (
              <nav className="flex items-center gap-2 text-xl font-mono text-gray-400 hover:text-black">
                <GiftObject size={24} weight="thin" />
                Presenteio
              </nav>
            ) : null}
            {stage === "building" ? (
              <div className="flex items-center gap-4">
                {userLogged == true && <ShareModalButton enabled={true} />}
                {userLogged == false ? (
                  <LoginModalButton
                    onLoginSuccess={(loginResponse: CredentialResponse) =>
                      handleLoginResponse(loginResponse)
                    }
                    onLoginFailure={() => handleLoginResponse()}
                  />
                ) : (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Avatar className="cursor-pointer">
                        <AvatarImage src={CurrentUser?.picture_url} />
                        <AvatarFallback>
                          {getInitials(CurrentUser?.name)}
                        </AvatarFallback>
                        <span className="sr-only">Toggle user menu</span>
                      </Avatar>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem className="cursor-pointer">
                        Configurações
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={() => userLogout()}
                      >
                        Sair
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </nav>
      <div className="my-2 h-6"></div>
      <header className="text-center mb-12 space-y-4 ">
        {stage === "building" ? (
          <input
            type="text"
            value={title}
            maxLength={50}
            placeholder="Clique para adicionar um título"
            onChange={(e) => setTitle(e.target.value)}
            className="text-4xl font-bold text-slate-800 mb-4 bg-transparent border-black border text-center w-full"
          />
        ) : (
          <input
            type="text"
            disabled
            value={title}
            maxLength={50}
            onChange={(e) => setTitle(e.target.value)}
            className="text-4xl font-bold text-slate-800 mb-4 bg-transparent text-center w-full"
          />
        )}
        {stage === "building" ? (
          <textarea
            value={message}
            placeholder="Clique para adicionar uma descrição"
            onChange={(e) => setMessage(e.target.value)}
            maxLength={250}
            className="text-gray-800 max-w-2xl mx-auto bg-transparent border-black border text-center w-full resize-none"
            rows={3}
          />
        ) : (
          <textarea
            value={message}
            disabled
            onChange={(e) => setMessage(e.target.value)}
            maxLength={250}
            className="text-gray-600 max-w-2xl mx-auto bg-transparent text-center w-full resize-none"
            rows={3}
          />
        )}
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {gifts.map((item) => (
          <Card
            key={item.id}
            className="overflow-hidden transition-shadow hover:shadow-lg"
          >
            {stage === "building" && (
              <div className="flex">
                <Button className="w-full bg-blue-400 h-8 hover:bg-blue-500">
                  Editar Item
                </Button>
                <Button
                  className="bg-gray-500 h-8 hover:bg-red-500"
                  onClick={() => removeItem(item.id)}
                >
                  Remover
                </Button>
              </div>
            )}
            <img
              src={item.image_url}
              alt={item.image_url}
              className="w-full h-60 object-cover"
            />
            <CardContent className="p-4">
              <div className="flex justify-between">
                <p className="text-xl mb-2 text-center font-serif">
                  {item.name}
                </p>
                <p className="mb-2 text-xl font-mono text-center text-gray-700">
                  R$ {item.value}
                </p>
              </div>
              <p className="text-sm mb-2 text-center">{item.desc}</p>
              <Button onClick={() => openModal(item)} className="w-full">
                Presentear
              </Button>
            </CardContent>
          </Card>
        ))}
        {stage === "building" && (
          <Card
            className="flex py-4 items-center justify-center cursor-pointer"
            onClick={() => setIsAddItemModalOpen(true)}
          >
            <CardContent className="text-center">
              <PlusCircle className="mx-auto mb-2 h-14 w-12 text-gray-400" />
              <p className="text-gray-600">Adicionar Novo Item</p>
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={isGiftModalOpen} onOpenChange={setIsGiftModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-center">
              {selectedGift?.name}
            </DialogTitle>
          </DialogHeader>
          {selectedGift && (
            <div className="text-center">
              <img
                src={selectedGift.image_url}
                alt={selectedGift.image_url}
                className="w-full mb-5 rounded-lg shadow-2xl"
              />
              <p className="mb-4">{selectedGift.desc}</p>
              <p className="mb-2 text-3xl font-mono font-bold">
                {"R$" + selectedGift.value.toFixed(2)}
              </p>
              <div className="space-y-5">
                <p className="text-gray-800">
                  Forma de Pagamento: {selectedGift.payment_form}
                </p>
                <div className="justify-center flex gap-2">
                  <input
                    className="text-md font-semibold text-gray-700 border-black border px-4"
                    id="payment_info"
                    value={selectedGift.payment_info}
                    readOnly
                    autoFocus={true}
                  />
                  <Button
                    className="bg-transparent text-black shadow-lg border-black border hover:bg-gray-600 hover:text-white"
                    onClick={() => copyToClipboard(selectedGift?.payment_info)}
                  >
                    Copiar
                  </Button>
                </div>
                <div className="flex gap-2 justify-center">
                  <Switch
                    onCheckedChange={() =>
                      setSendMessage(sendMessage === false ? true : false)
                    }
                    checked={sendMessage}
                    id="sendMessage"
                  />
                  <p className="text-gray-800">Desejo enviar uma mensagem</p>
                </div>
                {sendMessage && (
                  <div className="justify-center gap-4 flex flex-col">
                    <div className="flex gap-4 w-full">
                      <div className="flex-1 flex flex-col">
                        <Label
                          className="text-black mb-1 text-lg"
                          htmlFor="sender_name"
                        >
                          Nome
                        </Label>
                        <Input
                          className="text-black"
                          id="sender_name"
                          placeholder="João da Silva"
                        />
                      </div>
                      <div className="flex-1 flex flex-col">
                        <Label
                          className="text-black mb-1 text-lg"
                          htmlFor="sender_phone"
                        >
                          Telefone
                        </Label>
                        <Input
                          className="text-black"
                          id="sender_phone"
                          placeholder="(99) 9999-9999"
                        />
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <Label
                        className="text-black mb-1 text-lg"
                        htmlFor="sender_phone"
                      >
                        Sua Mensagem
                      </Label>
                      <Textarea
                        className="text-black resize-none"
                        id="message"
                        placeholder="Escreva sua mensagem..."
                        rows={3}
                        maxLength={250}
                      />
                    </div>
                    <Button
                      className="bg-transparent text-black shadow-lg border-black border hover:bg-gray-600 hover:text-white ml-4"
                      onClick={() => setIsGiftModalOpen(false)}
                      disabled={stage === "building" ? true : false}
                    >
                      Enviar Mensagem
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isAddItemModalOpen} onOpenChange={setIsAddItemModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-black">
              Adicionar Novo Item
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={addItem} className="space-y-4">
            <div>
              <Label className="text-black" htmlFor="itemName">
                Nome do Item
              </Label>
              <Input
                id="itemName"
                value={newGift.name}
                onChange={(e) =>
                  setNewGift({ ...newGift, name: e.target.value })
                }
                placeholder="Cafeteira Black Decker"
                required
              />
            </div>
            <div>
              <Label className="text-black" htmlFor="giftImage">
                Link da Imagem
              </Label>
              <Input
                id="giftImage"
                value={newGift.image_url}
                onChange={(e) =>
                  setNewGift({ ...newGift, image_url: e.target.value })
                }
                placeholder="https://exemplo.com/imagem.jpg"
                required
              />
            </div>
            {/* <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="picture">Imagem do Item</Label>
              <Input id="giftImage" type="file" />
            </div>
            <div>
              <Label className="text-black" htmlFor="giftDescription">
                Descrição do Item
              </Label>
              <Textarea
                className="resize-none"
                id="giftDescription"
                value={newGift.desc}
                onChange={(e) =>
                  setNewGift({ ...newGift, desc: e.target.value })
                }
                placeholder="Descrição do item"
              />
            </div> */}
            <div>
              <Label className="text-black" htmlFor="giftValue">
                Valor do Item
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <span className="text-muted-foreground">R$</span>
                </div>
                <Input
                  id="giftValue"
                  type="text"
                  value={
                    newGift.value
                      ? new Intl.NumberFormat("pt-BR", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }).format(newGift.value)
                      : ""
                  }
                  onChange={(e) => {
                    let value = e.target.value;

                    // Remove caracteres não numéricos, mantendo a vírgula
                    value = value.replace(/\D/g, "");

                    // Divide por 100 para obter o valor correto
                    const floatValue = Number(value) / 100;

                    // Atualiza o estado com o valor numérico
                    setNewGift({ ...newGift, value: floatValue });
                  }}
                  placeholder="0,00"
                  inputMode="decimal"
                  className="flex items-center pl-9 text-xl"
                  required
                />
              </div>
            </div>
            <div>
              <Label className="text-black" htmlFor="itemPaymentForm">
                Forma de Pagamento
              </Label>
              <Select onValueChange={handlePaymentFormChange} required>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Selecionar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pix">Pix</SelectItem>
                  <SelectItem value="purchase_link">Link de Compra</SelectItem>
                  <SelectItem value="other">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-black" htmlFor="itemName">
                Informação de Pagamento
              </Label>
              <Input
                id="itemPaymentInfo"
                value={newGift.payment_info}
                onChange={(e) =>
                  setNewGift({ ...newGift, payment_info: e.target.value })
                }
                placeholder={
                  paymentForm === "pix"
                    ? "Código Pix"
                    : paymentForm === "purchase_link"
                    ? "Link de Compra do Produto"
                    : "Insira Informação de Pagamento"
                }
              />
            </div>
            <Button type="submit" className="w-full" onSubmit={addItem}>
              Adicionar Item na Página
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
