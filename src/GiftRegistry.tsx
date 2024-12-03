"use client";

import api from "@/axiosConfig";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Cookies from "js-cookie";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle } from "lucide-react";
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
import { Gift } from "@phosphor-icons/react";
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
import { ToastAction } from "./components/ui/toast";

interface PageObject {
  id?: number;
  user_id?: number;
  domain?: string;
  title?: string;
  description?: string;
  picture_url?: string;
}

interface ItemObject {
  id?: number; // TODO: Obter id do retorno da API
  name?: string;
  desc?: string;
  image_url?: string;
  value?: number;
  payment_form?: string;
  payment_info?: string;
}

interface GiftObject {
  id?: number; // TODO: Obter id do retorno da API
  sender_name?: string;
  sender_phone?: string;
  message?: string;
  user_id?: number;
  total?: number;
}

interface UserObject {
  id: number;
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

interface GiftRegistryProps {
  page: PageObject | null;
  isPublic?: boolean;
}

export default function GiftRegistry({
  page = null,
  isPublic = false,
}: GiftRegistryProps) {
  // bulding, preview, published
  const [stage, setStage] = useState("building");
  const [items, setItems] = useState<ItemObject[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isGiftModalOpen, setIsGiftModalOpen] = useState(false);
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [isEditItemModalOpen, setIsEditItemModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ItemObject | null>(null);
  const [isDomainDialogOpen, setIsDomainDialogOpen] = useState(false);
  const [CurrentUser, setCurrentUser] = useState<UserObject | null>(null);
  const [CurrentUserPage, setCurrentUserPage] = useState<PageObject | null>(
    page
  );
  const [publicAccess] = useState(isPublic);
  const [paymentForm, setPaymentForm] = useState("");
  const [sendMessage, setSendMessage] = useState(false);
  const [userLogged, setUserLogged] = useState(false);
  const [newPageName, setNewPageName] = useState("");
  const baseDomain = import.meta.env.VITE_BASE_URL;
  const { toast } = useToast();
  const [newItem, setNewItem] = useState<ItemObject | null>(null);
  const [newGift, setNewGift] = useState<GiftObject | null>(null);
  const [itemUseImageLink, setItemUseImageLink] = useState(false);

  const userLogout = () => {
    setCurrentUser(null);
    setUserLogged(false);
    Cookies.remove("sessionToken");
    window.location.reload();
  };

  const userLogin = (token: string) => {
    setUserLogged(true);
    Cookies.set("sessionToken", token, {
      expires: 1,
      path: "/",
      secure: true,
    });
  };

  const resetNewItem = () => {
    setNewItem(null);
  };

  const resetNewGift = () => {
    setNewGift(null);
  };

  useEffect(() => {
    // Carregamento inicial da página
    const fetchUser = async () => {
      try {
        const decodedLoadedSessionToken = jwtDecode<JwtObject>(
          loadedSessionToken as string
        );
        const loadedSessionUserId = decodedLoadedSessionToken.sub;
        const response = await api.get(`/users/${loadedSessionUserId}`);
        if (response.status === 200) {
          setCurrentUser(response.data);
          userLogin(loadedSessionToken as string);
        } else {
          userLogout();
        }
      } catch (err) {
        console.log(err);
      }
    };

    const fetchUserPage = async () => {
      try {
        const response = await api.get("/pages");
        if (response.data && response.data.length > 0) {
          setCurrentUserPage(response.data[0]);
          setTitle(response.data[0].title);
          setDescription(response.data[0].description);
        } else {
          setCurrentUserPage(null);
        }
      } catch (err) {
        console.log(err);
      }
    };

    const loadedSessionToken = Cookies.get("sessionToken");

    if (loadedSessionToken) {
      fetchUser();
      fetchUserPage();
    }
  }, []);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await api.get(`/pages/${CurrentUserPage?.id}/items`);
        const pageItemsList = response.data;

        if (pageItemsList.length > 0) {
          const fetchedItems: ItemObject[] = []; // Array temporário para armazenar itens

          for (const pageItem of pageItemsList) {
            const responseItem = await api.get(`/items/${pageItem.item_id}`);
            const itemData = responseItem.data;

            // Verifica se o item já existe no array
            if (!fetchedItems.find((item) => item.id === itemData.id)) {
              fetchedItems.push(itemData);
            }
          }

          // Atualiza o estado com os itens únicos
          setItems(fetchedItems);
        }
      } catch (err) {
        console.log(err);
      }
    };

    const fetchPageDetails = async () => {
      try {
        const response = await api.get(`/pages/${CurrentUserPage?.id}`);
        if (response.data) {
          setTitle(response.data.title);
          setDescription(response.data.description);
        }
      } catch (err) {
        console.log(err);
      }
    };

    if (CurrentUserPage) {
      setItems([]); // Limpa todos os itens
      fetchPageDetails(); // Busca Título e Descrição
      fetchItems(); // Busca todos os itens
    }
    if (publicAccess) {
      setStage("published");
    }
  }, [CurrentUserPage, publicAccess]);

  useEffect(() => {
    const fetchUserPage = async () => {
      try {
        const response = await api.get("/pages");
        if (response.data && response.data.length > 0) {
          setCurrentUserPage(response.data[0]);
        } else {
          setCurrentUserPage(null);
        }
      } catch (err) {
        console.log(err);
      }
    };

    if (!CurrentUserPage && CurrentUser) {
      fetchUserPage();
      setIsDomainDialogOpen(true);
    }
  }, [CurrentUserPage, CurrentUser]);

  const createBlankPage = async (domain: string) => {
    const newPage = {
      domain: domain,
    };
    const response = await api.post("/pages", newPage);
    if (response.status === 409) {
      return;
    }
    setCurrentUserPage(response.data);
    return response.data;
  };

  const handlePaymentFormChange = (value: string) => {
    setPaymentForm(value);
    setNewItem({ ...newItem, payment_form: value });
  };

  const handleEditPaymentFormChange = (value: string) => {
    setPaymentForm(value);
    if (selectedItem) {
      selectedItem.payment_form = value;
    }
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

  const addItem = async (e: React.FormEvent) => {
    console.log("Adicionando item...");
    e.preventDefault();
    if (
      newItem?.name &&
      newItem?.image_url &&
      newItem?.value &&
      newItem?.payment_form
    ) {
      try {
        const responseNewItem = await api.post("/items", newItem);
        console.log(responseNewItem);

        const createdItem = await responseNewItem.data;

        setItems([...items, { ...createdItem }]);
        resetNewItem();

        const responseNewPageItem = api.post(
          `/pages/${CurrentUserPage?.id}/items/${createdItem.id}`,
          newItem
        );

        console.log(responseNewPageItem);
        setIsAddItemModalOpen(false);
      } catch (err) {
        console.log(err);
        toast({
          title: "Houve um erro ao tentar adicionar o item.",
          description: "Erro ao adicionar o item. Tente mais tarde.",
          action: <ToastAction altText="Tentar novamente" onClick={addItem} />,
        });
      }
    }
  };

  const editItem = async (e: React.FormEvent) => {
    console.log("Editando item...");
    e.preventDefault();
    if (
      selectedItem &&
      selectedItem?.name &&
      selectedItem?.image_url &&
      selectedItem?.value &&
      selectedItem?.payment_form
    ) {
      try {
        const responseEditItem = await api.put(
          `/items/${selectedItem.id}`,
          selectedItem
        );
        console.log(responseEditItem);

        const editedItem = await responseEditItem.data;

        if (responseEditItem.status === 200) {
          setItems(
            items.map((gift) =>
              gift.id === selectedItem.id ? editedItem : gift
            )
          );
          console.log(responseEditItem);
        } else {
          toast({
            title: "Houve um erro ao tentar adicionar o item.",
            description: "Erro ao adicionar o item. Tente mais tarde.",
          });
        }

        closeEditModal();
      } catch (err) {
        console.log(err);
        toast({
          title: "Houve um erro ao tentar adicionar o item.",
          description: "Erro ao adicionar o item. Tente mais tarde.",
        });
      }
    }
  };

  const openGiftModal = (item: ItemObject) => {
    setSendMessage(false);
    setSelectedItem(item);
    setIsGiftModalOpen(true);
  };

  const closeGiftModal = () => {
    setIsGiftModalOpen(false);
    setSelectedItem(null);
  };

  const openEditModal = (item: ItemObject) => {
    setSelectedItem(item);
    setIsEditItemModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditItemModalOpen(false);
    setSelectedItem(null);
  };

  const handleSendGift = async (
    item: ItemObject,
    gift: GiftObject | null,
    user_id: number | null
  ) => {
    if (!gift || !user_id) {
      return;
    }

    try {
      console.log("Enviando presente...");
      const response = await api.post("/gifts", {
        user_id: user_id,
        sender_name: gift.sender_name,
        sender_phone: gift.sender_phone,
        message: gift.message,
      });
      
      console.log(response);

      if (response.status === 200) {
        const createdGift = await response.data;
        const responseGiftItem = await api.post(
          `/gifts/${createdGift.id}/items/${item.id}`
        );

        if (responseGiftItem.status === 200) {
          toast({
            title: "Presente enviado com sucesso!",
          });
          resetNewGift();
          closeGiftModal();
        }
      }

      console.log("f presente...");
    } catch {
      toast({
        title: "Houve um erro ao tentar criar o presente!",
        description: "Erro ao tentar criar o presente. Tente mais tarde.",
      });
      resetNewGift();
    }
  };

  const handleTitleChange = async (title: string) => {
    if (title.trim().length > 0 && title !== CurrentUserPage?.title) {
      const response = await api.patch(`/pages/${CurrentUserPage?.id}`, {
        title: title,
      });

      if (response.status === 200) {
        setCurrentUserPage({ ...CurrentUserPage, title: title });
        setTitle(title);
        toast({
          title: "Título da página editado com sucesso!",
        });
      } else {
        toast({
          title: "Houve um erro ao tentar editar o título da página.",
          description: "Erro ao editar o título da página. Tente mais tarde.",
        });
      }
    }
  };

  const handleDescChange = async (desc: string) => {
    if (desc.trim().length > 0 && desc !== CurrentUserPage?.description) {
      const response = await api.patch(`/pages/${CurrentUserPage?.id}`, {
        description: desc,
      });

      if (response.status === 200) {
        setCurrentUserPage({ ...CurrentUserPage, description: desc });
        setDescription(desc);
        toast({
          title: "Descrição da página editado com sucesso!",
        });
      } else {
        toast({
          title: "Houve um erro ao tentar editar a descrição da página.",
          description:
            "Erro ao editar editar a descrição da página. Tente mais tarde.",
        });
      }
    }
  };

  const handleItemImageUpload = async (image: File) => {
    // Cria um FormData para enviar o arquivo
    const formData = new FormData();
    formData.append("file", image);

    try {
      const response = await api.post("/uploads", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.status === 200) {
        toast({
          title: "Upload feito com sucesso!",
          description: response.data.file_url,
        });
        return response.data.file_url; // Retorna a URL do arquivo
      } else {
        toast({
          title: "Houve um erro ao tentar realizar upload.",
          description:
            "Houve um erro ao tentar realizar upload. Tente mais tarde.",
        });
      }
    } catch (err) {
      console.error("Erro no upload:", err);
      toast({
        title: "Erro no Upload",
        description: "Não foi possível enviar o arquivo.",
        variant: "destructive",
      });
    }
  };

  const handlePageNameFormat = (e: React.ChangeEvent<HTMLInputElement>) => {
    let sanitizedValue = e.target.value
      .replace(/[^a-z0-9-]/g, "")
      .toLowerCase();
    if (sanitizedValue === "error") {
      toast({
        title: "Nome inválido!",
        description:
          "Alguns nomes são reservados para o sistema. Por favor, escolha outro.",
        variant: "destructive",
      });
      sanitizedValue = "";
    }
    setNewPageName(sanitizedValue);
  };

  const handleGoogleLoginResponse = async (
    GoogleLoginResponse?: CredentialResponse
  ) => {
    if (GoogleLoginResponse) {
      if (!userLogged) {
        const tokenDecoded = jwtDecode<JwtObject>(
          GoogleLoginResponse.credential as string
        );

        try {
          const response = await api.post("/users", {
            name: tokenDecoded.name,
            email: tokenDecoded.email,
            bearer_token: GoogleLoginResponse.credential,
            auth_provider: "google",
          });

          const responseToken = response.headers["authorization"];
          userLogin(responseToken?.split("Bearer ")[1] as string);
          setCurrentUser(response.data);
        } catch (err) {
          console.log(err);
        }
      }
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Valor copiado:",
      description: text,
    });
  };

  async function removeItem(id: number): Promise<void> {
    const response = await api.delete(`/items/${id}`);
    if (response.status === 200) {
      setItems(items.filter((gift) => gift.id !== id));
    } else {
      console.log(response.data);
      toast({
        title: "Houve um erro ao tentar remover o item.",
        description: response.data,
        action: (
          <ToastAction
            altText="Tentar novamente"
            onClick={() => removeItem(id)}
          />
        ),
      });
    }
  }

  return (
    <div className="flex flex-col w-screen h-full min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 text-gray-800 p-8">
      {publicAccess ? null : (
        <nav
          className={
            stage === "building"
              ? "fixed inset-x-0 top-0 z-50 bg-white shadow-lg dark:bg-gray-950/90 "
              : "fixed inset-x-0 top-0 z-50 bg-transparent"
          }
        >
          <div className="w-full max-w-8xl mx-auto px-4">
            <div className="flex justify-between h-14">
              {
                <div
                  className={`flex items-center space-x-2 justify-start ${
                    CurrentUserPage != null && userLogged
                      ? ""
                      : "text-transparent"
                  }`}
                >
                  <Switch
                    className={userLogged && CurrentUserPage ? "" : "hidden"}
                    onCheckedChange={() =>
                      setStage(stage === "building" ? "preview" : "building")
                    }
                    disabled={!CurrentUserPage || !userLogged}
                    id="preview"
                  />
                  <Label htmlFor="previewMode">Ver como público</Label>
                </div>
              }
              {stage === "building" ? (
                <nav className="flex items-center gap-2 text-xl font-mono text-gray-500 hover:text-black">
                  <Gift size={24} weight="thin" />
                  Presenteio
                </nav>
              ) : null}
              {stage === "building" ? (
                <div className="flex items-center gap-4">
                  {userLogged && (
                    <ShareModalButton
                      enabled={CurrentUserPage != null}
                      domain={CurrentUserPage?.domain}
                    />
                  )}
                  {userLogged == false ? (
                    <LoginModalButton
                      onLoginSuccess={(loginResponse: CredentialResponse) =>
                        handleGoogleLoginResponse(loginResponse)
                      }
                      onLoginFailure={() => handleGoogleLoginResponse()}
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
                        {/* <DropdownMenuItem className="cursor-pointer">
                        Configurações
                      </DropdownMenuItem> */}
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
      )}
      <div className="my-2 h-6"></div>
      {userLogged || publicAccess ? (
        CurrentUserPage ? (
          <div>
            <header className="text-center mb-12 space-y-4 ">
              {stage === "building" ? (
                <input
                  type="text"
                  value={title}
                  maxLength={50}
                  placeholder="Clique para adicionar um título"
                  onBlur={(e) => handleTitleChange(e.target.value)}
                  onChange={(e) => setTitle(e.target.value)}
                  className="text-4xl font-bold text-slate-800 mb-4 bg-transparent border-black border text-center w-full"
                />
              ) : (
                <input
                  type="text"
                  disabled
                  value={title}
                  maxLength={50}
                  className="text-4xl font-bold text-slate-800 mb-4 bg-transparent text-center w-full"
                />
              )}
              {stage === "building" ? (
                <textarea
                  value={description}
                  placeholder="Clique para adicionar uma descrição"
                  onBlur={(e) => handleDescChange(e.target.value)}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={250}
                  className="text-gray-800 max-w-2xl mx-auto bg-transparent border-black border text-center w-full resize-none"
                  rows={3}
                />
              ) : (
                <textarea
                  value={description}
                  disabled
                  maxLength={250}
                  className="text-gray-600 max-w-2xl mx-auto bg-transparent text-center w-full resize-none"
                  rows={3}
                />
              )}
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {items.map((item) => (
                <Card
                  key={item.id}
                  className="overflow-hidden transition-shadow hover:shadow-lg flex flex-col"
                >
                  {stage === "building" && (
                    <div className="flex">
                      <Button
                        className="w-full bg-gray-400 h-8 hover:bg-blue-500"
                        onClick={() => openEditModal(item)}
                      >
                        Editar Item
                      </Button>
                      <Button
                        className="bg-gray-500 h-8 hover:bg-red-500"
                        onClick={() => removeItem(item?.id as number)}
                      >
                        Remover
                      </Button>
                    </div>
                  )}
                  <img
                    src={item.image_url}
                    alt={item.image_url}
                    className="w-full h-60 object-scale-down"
                  />
                  <CardContent className="p-4 flex flex-col flex-grow">
                    <div className="flex justify-center">
                      <p className="text-lg mb-2 text-center font-serif">
                        {item.name}
                      </p>
                    </div>
                    <div>
                      <p className="mb-2 text-lg font-mono text-center text-gray-700">
                        R$ {item.value}
                      </p>
                    </div>
                    <p className="text-sm mb-2 text-center font-mono">
                      {item.desc}
                    </p>
                    <Button
                      onClick={() => openGiftModal(item)}
                      className="w-full mt-auto"
                    >
                      Quero Presentear
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
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center">
            <h1 className="text-2xl font-bold text-gray-600 mb-6 text-center">
              Você ainda não tem nenhuma página criada, vamos criar uma!
            </h1>
            <Button
              onClick={() => setIsDomainDialogOpen(true)}
              className="items-center justify-center hover:bg-black hover:text-white text-lg"
              variant={"outline"}
            >
              Criar uma página
            </Button>
            <Dialog
              open={isDomainDialogOpen}
              onOpenChange={setIsDomainDialogOpen}
            >
              <DialogContent aria-describedby="dialog-description">
                <DialogHeader>
                  <DialogTitle>Vamos criar a sua página!</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    type="text"
                    placeholder="Escolha um identificador para a sua página"
                    value={newPageName}
                    onChange={handlePageNameFormat}
                  />
                  {newPageName && (
                    <p className="text-gray-600">
                      O link da sua página será:{" "}
                      <span className="font-bold">{`${baseDomain}/${newPageName}`}</span>
                    </p>
                  )}
                  <Button
                    onClick={() => {
                      if (!newPageName.trim()) {
                        // Exibir um toast de erro se o campo estiver vazio
                        toast({
                          title: "Erro ao criar a página",
                          description:
                            "Por favor, informe um identificador válido.",
                          variant: "destructive", // Estilo de erro, se configurado
                          action: (
                            <ToastAction altText="Entendi">Entendi</ToastAction>
                          ),
                        });
                        return; // Impedir a execução de createBlankPage
                      }

                      // Se o campo for válido, continue
                      createBlankPage(newPageName).then((pageCreated) => {
                        if (!pageCreated) {
                          toast({
                            title: "O domínio escolhido já está em uso!",
                            description: "Por favor, escolha outro domínio.",
                            variant: "destructive",
                            action: (
                              <ToastAction altText="Entendi">
                                Entendi
                              </ToastAction>
                            ),
                          });
                        } else {
                          toast({
                            title: "Página criada com sucesso!",
                            description: `O link será ${baseDomain}/${newPageName}`,
                          });
                        }
                      });
                    }}
                  >
                    Confirmar
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )
      ) : (
        <div className="">
          <h1 className="text-center text-xl text-gray-600">
            Faça login para criar a sua página
          </h1>
        </div>
      )}

      <Dialog open={isGiftModalOpen} onOpenChange={setIsGiftModalOpen}>
        <DialogContent
          className="max-h-screen overflow-y-auto"
          aria-describedby="addgift-description"
        >
          <DialogHeader>
            <DialogTitle className="text-center">
              {selectedItem?.name}
            </DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <form
              onSubmit={() =>
                handleSendGift(
                  selectedItem,
                  newGift,
                  CurrentUserPage?.user_id as number
                )
              }
              className="space-y-4"
              id="sendgift-form"
            >
              <div className="text-center">
                <div className="flex justify-center">
                  <img
                    src={selectedItem.image_url}
                    alt={selectedItem.image_url}
                    className="relative max-w-[90%] sm:max-w-[300px] max-h-[500px] center mb-5 rounded-lg shadow-2xl"
                  />
                </div>
                <p className="mb-4">{selectedItem.desc}</p>
                <p className="mb-2 text-3xl font-mono font-bold">
                  {"R$ " + selectedItem?.value}
                </p>
                <div className="space-y-5 flex flex-col">
                  <p className="text-gray-800">
                    Forma de Pagamento:{" "}
                    {selectedItem.payment_form === "pix"
                      ? "Pix"
                      : selectedItem.payment_form === "purchase_link"
                      ? "Link de Compra"
                      : "Outro"}
                  </p>
                  <div className="justify-center flex gap-2">
                    <input
                      className="text-md font-semibold text-gray-700 border-black border px-4"
                      id="payment_info"
                      value={selectedItem.payment_info}
                      readOnly
                      autoFocus={true}
                    />
                    <Button
                      className="bg-transparent text-black shadow-lg border-black border hover:bg-gray-600 hover:text-white"
                      onClick={() =>
                        copyToClipboard(selectedItem.payment_info as string)
                      }
                    >
                      Copiar
                    </Button>
                  </div>
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
                        value={newGift?.sender_name}
                        required={true}
                        onChange={(e) =>
                          setNewGift({
                            ...newGift,
                            sender_name: e.target.value,
                          })
                        }
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
                        placeholder="(99) 9 9999-9999"
                        value={newGift?.sender_phone}
                        required={true}
                        onChange={(e) =>
                          setNewGift({
                            ...newGift,
                            sender_phone: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  {/* TODO: Feature de envio de E-mail ao criar presente */}
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
                          value={newGift?.message}
                          onChange={(e) =>
                            setNewGift({
                              ...newGift,
                              message: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                  )}
                  {/* TODO: Fix send gift adding a <form> to this dialog */}
                  <Button
                    className="bg-transparent text-black shadow-lg border-black border hover:bg-gray-600 hover:text-white"
                    type="submit"
                    disabled={stage === "published" ? false : true}
                  >
                    Confirmar Escolha
                  </Button>
                </div>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isAddItemModalOpen} onOpenChange={setIsAddItemModalOpen}>
        <DialogContent aria-describedby="additem-description">
          <DialogHeader>
            <DialogTitle className="text-black">
              Adicionar Novo Item
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={addItem} className="space-y-4" id="additem-form">
            <div>
              <Label className="text-black" htmlFor="itemName">
                Nome do Item
              </Label>
              <Input
                id="itemName"
                value={newItem?.name}
                onChange={(e) =>
                  setNewItem({ ...newItem, name: e.target.value })
                }
                placeholder="Cafeteira Black Decker"
                required
              />
            </div>
            <div>
              <Label className="text-black" htmlFor="giftImage">
                Descrição
              </Label>
              <Textarea
                id="giftImage"
                value={newItem?.desc}
                onChange={(e) =>
                  setNewItem({ ...newItem, desc: e.target.value })
                }
                placeholder="Descrição do Item (Opcional)"
              />
            </div>
            <div className="space-y-2">
              {/* Switch para alternar entre link público e upload */}
              <div className="flex gap-2">
                <Label className="text-black flex items-center mb-2">
                  Upload do Arquivo
                </Label>
                <Switch
                  className="ml-2"
                  checked={itemUseImageLink}
                  onCheckedChange={(value) => setItemUseImageLink(value)}
                />
                <Label className="text-black flex items-center mb-2">
                  Link da Internet
                </Label>
              </div>

              {itemUseImageLink ? (
                // Campo para link público
                <div>
                  <Label className="text-black" htmlFor="giftImage">
                    Link da Imagem
                  </Label>
                  <Input
                    id="giftImage"
                    value={newItem?.image_url}
                    onChange={(e) =>
                      setNewItem({ ...newItem, image_url: e.target.value })
                    }
                    placeholder="https://exemplo.com/imagem.jpg"
                    required
                  />
                </div>
              ) : (
                // Campo para upload de imagem
                <div>
                  <Label className="text-black" htmlFor="uploadImage">
                    Upload da Imagem
                  </Label>
                  <Input
                    id="uploadImage"
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      if (e.target.files && e.target.files[0]) {
                        const fileUploadedUrl = await handleItemImageUpload(
                          e.target.files[0]
                        );
                        if (fileUploadedUrl) {
                          setNewItem({
                            ...newItem,
                            image_url: fileUploadedUrl,
                          });
                        }
                      }
                    }}
                    required
                  />
                </div>
              )}
            </div>
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
                    newItem?.value
                      ? new Intl.NumberFormat("pt-BR", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }).format(newItem?.value)
                      : ""
                  }
                  onChange={(e) => {
                    let value = e.target.value;

                    // Remove caracteres não numéricos, mantendo a vírgula
                    value = value.replace(/\D/g, "");

                    // Divide por 100 para obter o valor correto
                    const floatValue = Number(value) / 100;

                    // Atualiza o estado com o valor numérico
                    setNewItem({ ...newItem, value: floatValue });
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
                  <SelectItem value="purchase-link">Link de Compra</SelectItem>
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
                value={newItem?.payment_info}
                onChange={(e) =>
                  setNewItem({ ...newItem, payment_info: e.target.value })
                }
                placeholder={
                  paymentForm === "pix"
                    ? "Código Pix"
                    : paymentForm === "purchase-link"
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

      {/* Edit Item Modal */}
      <Dialog open={isEditItemModalOpen} onOpenChange={setIsEditItemModalOpen}>
        <DialogContent aria-describedby="edititem-description">
          <DialogHeader>
            <DialogTitle className="text-black">Editar Item</DialogTitle>
          </DialogHeader>
          <form onSubmit={editItem} className="space-y-4" id="edititem-form">
            <div>
              <Label className="text-black" htmlFor="itemName">
                Nome do Item
              </Label>
              <Input id="itemName" value={selectedItem?.name} required />
            </div>
            <div>
              <Label className="text-black" htmlFor="giftImage">
                Descrição
              </Label>
              <Textarea id="giftImage" value={selectedItem?.desc} />
            </div>
            <div>
              <Label className="text-black" htmlFor="giftImage">
                Link da Imagem
              </Label>
              <Input id="giftImage" value={selectedItem?.image_url} required />
            </div>
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
                    selectedItem?.value
                      ? new Intl.NumberFormat("pt-BR", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }).format(selectedItem?.value)
                      : ""
                  }
                  onChange={(e) => {
                    let value = e.target.value;

                    // Remove caracteres não numéricos, mantendo a vírgula
                    value = value.replace(/\D/g, "");

                    // Divide por 100 para obter o valor correto
                    const floatValue = Number(value) / 100;

                    // Atualiza o estado usando setSelectedItem
                    setSelectedItem((prevItem) => ({
                      ...prevItem,
                      value: floatValue,
                    }));
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
              <Select
                value={selectedItem?.payment_form}
                onValueChange={handleEditPaymentFormChange}
                required
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Selecionar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pix">Pix</SelectItem>
                  <SelectItem value="purchase-link">Link de Compra</SelectItem>
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
                value={selectedItem?.payment_info}
                placeholder={
                  paymentForm === "pix"
                    ? "Código Pix"
                    : paymentForm === "purchase-link"
                    ? "Link de Compra do Produto"
                    : "Insira Informação de Pagamento"
                }
              />
            </div>
            <Button type="submit" className="w-full" onSubmit={editItem}>
              Editar Item
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
