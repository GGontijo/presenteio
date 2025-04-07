"use client";

import api from "@/axiosConfig";
import { ShareModalButton } from "@/components/ShareModal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Gift } from "@phosphor-icons/react";
import { CredentialResponse } from "@react-oauth/google";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { PlusCircle } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { LoginModalButton } from "./components/loginModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
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
  user_id?: number;
  page_id?: number;
  description?: string;
  image_url?: string;
  payment_form?: string;
  payment_info?: string;
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
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [isEditItemModalOpen, setIsEditItemModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ItemObject | null>(null);
  const [isDomainDialogOpen, setIsDomainDialogOpen] = useState(false);
  const [CurrentUser, setCurrentUser] = useState<UserObject | null>(null);
  const [noLoginState, setNoLoginState] = useState<boolean>(false);
  const [CurrentUserPage, setCurrentUserPage] = useState<PageObject | null>(
    page
  );
  const [publicAccess] = useState(isPublic);
  const [paymentForm, setPaymentForm] = useState("");
  const [userLogged, setUserLogged] = useState(false);
  const [newPageName, setNewPageName] = useState("");
  const baseDomain = import.meta.env.VITE_BASE_URL;
  const { toast } = useToast();
  const [newItem, setNewItem] = useState<ItemObject | null>(null);
  const [itemUseImageLink, setItemUseImageLink] = useState(false);
  const [provideItemDetails, setProvideItemDetails] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const userLogout = () => {
    setCurrentUser(null);
    setUserLogged(false);
    Cookies.remove("sessionToken");
    window.location.reload();
  };

  const userLogin = (token: string) => {
    setUserLogged(true);
    Cookies.set("sessionToken", token, {
      path: "/",
      secure: true,
    });
  };

  const resetNewItem = () => {
    setNewItem(null);
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
    const fetchPageItems = async () => {
      try {
        const response = await api.get(`/pages/${CurrentUserPage?.id}/items`);
        const pageItemsList = response.data;

        if (pageItemsList.length > 0) {
          setItems(pageItemsList); // Adiciona os itens da página
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
      fetchPageDetails(); // Busca Título e Descrição
    }
    if (CurrentUserPage && items.length === 0) {
      fetchPageItems(); // Busca os itens da página
    }
    if (publicAccess) {
      setStage("published");
    }
  }, [CurrentUserPage, items, publicAccess]);

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

    if (CurrentUser?.name == "Temp User") {
      setNoLoginState(true);
    }

    if (!CurrentUserPage && CurrentUser) {
      fetchUserPage();
      setIsDomainDialogOpen(true);
    }
  }, [CurrentUserPage, CurrentUser]);

  const handleNoLoginReponse = async () => {
    if (!userLogged) {
      try {
        const response = await api.post("/users");
        const responseToken = response.headers["authorization"];
        userLogin(responseToken?.split("Bearer ")[1] as string);
        setCurrentUser(response.data);
      } catch (err) {
        console.log(err);
      }
    }
  };

  useEffect(() => {
    if (noLoginState) {
      setItemUseImageLink(true);
    }
  }, [noLoginState]);

  const createBlankPage = async (domain: string) => {
    const newPage = {
      domain: domain,
    };
    const response = await api.post("/pages", newPage);
    if (response?.status == 409) {
      toast({
        title: "Este nome de página já está em uso!",
        description: "Por favor, escolha outro nome de página.",
      });
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
    if (newItem?.name && newItem?.image_url) {
      try {
        const responseNewItem = await api.post(
          `/pages/${CurrentUserPage?.id}/items`,
          newItem
        );

        const createdItem = await responseNewItem.data;

        setItems([...items, { ...createdItem }]);
        resetNewItem();
        setIsAddItemModalOpen(false);
      } catch (err) {
        console.log(err);
        toast({
          title: "Houve um erro ao tentar adicionar o item.",
          description: "Erro ao adicionar o item. Tente novamente mais tarde.",
          action: <ToastAction altText="Tentar novamente" onClick={addItem} />,
        });
      }
    }
  };

  const editItem = async (e: React.FormEvent) => {
    console.log("Editando item...");
    e.preventDefault();
    if (selectedItem && selectedItem?.name && selectedItem?.image_url) {
      try {
        const responseEditItem = await api.put(
          `/pages/${CurrentUserPage?.id}/items/${selectedItem.id}`,
          selectedItem
        );

        const editedItem = await responseEditItem.data;

        if (responseEditItem.status === 200) {
          setItems(
            items.map((gift) =>
              gift.id === selectedItem.id ? editedItem : gift
            )
          );
          toast({
            title: "Item editado com sucesso!",
          });
        } else {
          toast({
            title: "Houve um erro ao tentar adicionar o item.",
            description:
              "Erro ao adicionar o item. Tente novamente mais tarde.",
          });
        }

        closeEditModal();
      } catch (err) {
        console.log(err);
        toast({
          title: "Houve um erro ao tentar adicionar o item.",
          description: "Erro ao adicionar o item. Tente novamente mais tarde.",
        });
      }
    }
  };

  const openEditModal = (item: ItemObject) => {
    setSelectedItem(item);
    setIsEditItemModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditItemModalOpen(false);
    setSelectedItem(null);
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
          description:
            "Erro ao editar o título da página. Tente novamente mais tarde.",
        });
      }
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto"; // Reset para recálculo
      el.style.height = `${el.scrollHeight}px`; // Altura ideal
    }

    setDescription(e.target.value);
  };

  const handleDescChange = async (description: string) => {
    if (
      description.trim().length > 0 &&
      description !== CurrentUserPage?.description
    ) {
      const response = await api.patch(`/pages/${CurrentUserPage?.id}`, {
        description: description,
      });

      if (response.status === 200) {
        setCurrentUserPage({ ...CurrentUserPage, description: description });
        setDescription(description);
        toast({
          title: "Descrição da página editado com sucesso!",
        });
      } else {
        toast({
          title: "Houve um erro ao tentar editar a descrição da página.",
          description:
            "Erro ao editar editar a descrição da página. Tente novamente mais tarde.",
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
            "Houve um erro ao tentar realizar upload. Tente novamente mais tarde.",
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
        try {
          const response = await api.post("/users", {
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
    console.log(id);
    const response = await api.delete(
      `/pages/${CurrentUserPage?.id}/items/${id}`
    );
    if (response.status === 200) {
      setItems(items.filter((gift) => gift.id !== id));
      toast({
        title: "Item removido com sucesso!",
        description: `O item foi removido com sucesso.`,
      });
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
    <div className="flex flex-col items-center w-full h-full min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 text-gray-800 p-8">
      <div>
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
                {userLogged === false ? (
                  <div className="flex items-center justify-center gap-2 text-xl font-mono text-gray-500 hover:text-black">
                    <Gift size={24} weight="thin" />
                    <p>Presenteio</p>
                  </div>
                ) : null}
                {stage === "building" ? (
                  <div className="flex items-center gap-4">
                    {userLogged || noLoginState ? (
                      <ShareModalButton
                        enabled={CurrentUserPage != null}
                        domain={CurrentUserPage?.domain}
                        pageId={CurrentUserPage?.id ?? 0}
                      />
                    ) : null}
                    {userLogged == false && noLoginState == false ? (
                      <LoginModalButton
                        onLoginSuccess={(loginResponse: CredentialResponse) =>
                          handleGoogleLoginResponse(loginResponse)
                        }
                        onLoginFailure={() => handleGoogleLoginResponse()}
                        onNoLoginOption={() => handleNoLoginReponse()}
                      />
                    ) : userLogged /*&& noLoginState == false*/ ? (
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
                          <DropdownMenuLabel>
                            {CurrentUser?.name}
                          </DropdownMenuLabel>
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
                    ) : null}
                  </div>
                ) : null}
              </div>
            </div>
          </nav>
        )}
        <div className="my-2 h-6"></div>
        {userLogged || noLoginState || publicAccess ? (
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
                    ref={textareaRef}
                    value={description}
                    placeholder="Clique para adicionar uma descrição"
                    onBlur={(e) => handleDescChange(e.target.value)}
                    onChange={handleTextareaChange}
                    maxLength={500}
                    className="text-gray-800 max-w-2xl mx-auto bg-transparent border-black border text-center w-full resize-none overflow-hidden"
                    rows={3}
                  />
                ) : (
                  <textarea
                    value={description}
                    disabled
                    maxLength={500}
                    className="text-gray-600 max-w-2xl mx-auto bg-transparent text-center w-full resize-none overflow-hidden"
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
                          onClick={() => removeItem(item.id as number)}
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
                      <p className="text-sm mb-2 text-center font-mono">
                        {item.description}
                      </p>
                      {item.payment_form == "pix" ? (
                        <div className="justify-center flex gap-2">
                          <input
                            className="text-md font-semibold text-gray-700 border-black border px-4"
                            id="payment_info"
                            value={item.payment_info}
                            readOnly
                            autoFocus={true}
                          />
                          <Button
                            className="bg-transparent text-black shadow-lg border-black border hover:bg-gray-600 hover:text-white"
                            onClick={() =>
                              copyToClipboard(item.payment_info as string)
                            }
                          >
                            Copiar
                          </Button>
                        </div>
                      ) : item.payment_form == "purchase-link" ? (
                        <div className="text-center mb-2">
                          <Button
                            onClick={() => open(item.payment_info)}
                            className="w-full mt-auto"
                          >
                            {"Comprar"}
                          </Button>
                        </div>
                      ) : item.payment_form == "other" ? (
                        <p className="text-sm mb-2 text-center font-mono">
                          {item.payment_info}
                        </p>
                      ) : null}
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
                      placeholder="Escolha um nome para a sua página"
                      value={newPageName}
                      maxLength={50}
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
                              <ToastAction altText="Entendi">
                                Entendi
                              </ToastAction>
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
          <div className="flex flex-col items-center justify-center">
            <h1 className="text-center text-2xl text-gray-600">
              Crie sua lista de presente incrível e compartilhe com seus
              convidados
            </h1>
            <div className="sm:max-w-2xl py-8">
              <Carousel>
                <CarouselContent>
                  <CarouselItem key={"1"}>
                    <Card>
                      <CardContent className="p-2">
                        <img
                          className="object-fill"
                          src="/assets/example.png"
                        />
                      </CardContent>
                    </Card>
                  </CarouselItem>
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
              </Carousel>
            </div>
          </div>
        )}

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
                  value={newItem?.description}
                  onChange={(e) =>
                    setNewItem({ ...newItem, description: e.target.value })
                  }
                  placeholder="Descrição do Item (Opcional)"
                />
              </div>
              <div className="space-y-2">
                {/* Switch para alternar entre link público e upload */}
                <div className="flex gap-2">
                  <Label className="text-black flex items-center mb-2">
                    Usar um Link com a Imagem
                  </Label>
                  <Switch
                    className="ml-2"
                    checked={itemUseImageLink}
                    onCheckedChange={(value) => setItemUseImageLink(value)}
                    disabled={noLoginState}
                  />
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
              <div className="flex gap-2">
                <div>
                  <Label className="text-black flex items-center mb-2">
                    Adicionar informações extras sobre o Item
                  </Label>
                  <p className="text-xs text-gray-800">
                    Informe como e onde comprar
                  </p>
                </div>
                <Switch
                  className="ml-2"
                  checked={provideItemDetails}
                  onCheckedChange={(value) => setProvideItemDetails(value)}
                />
              </div>
              {provideItemDetails ? (
                <div className="space-y-2">
                  <div>
                    <Label className="text-black" htmlFor="itemPaymentForm">
                      Forma de Pagamento
                    </Label>
                    <Select
                      value={selectedItem?.payment_form}
                      onValueChange={handlePaymentFormChange}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Selecionar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pix">Pix</SelectItem>
                        <SelectItem value="purchase-link">
                          Link de Compra
                        </SelectItem>
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
                </div>
              ) : null}
              <Button type="submit" className="w-full" onSubmit={addItem}>
                Adicionar Item na Página
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit Item Modal */}
        <Dialog
          open={isEditItemModalOpen}
          onOpenChange={setIsEditItemModalOpen}
        >
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
                <Textarea id="giftImage" value={selectedItem?.description} />
              </div>
              <div>
                <Label className="text-black" htmlFor="giftImage">
                  Link da Imagem
                </Label>
                <Input
                  id="giftImage"
                  value={selectedItem?.image_url}
                  required
                />
              </div>
              <div>
                <Label className="text-black" htmlFor="itemPaymentForm">
                  Forma de Pagamento
                </Label>
                <Select
                  value={selectedItem?.payment_form}
                  onValueChange={handleEditPaymentFormChange}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Selecionar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pix">Pix</SelectItem>
                    <SelectItem value="purchase-link">
                      Link de Compra
                    </SelectItem>
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
                  onChange={(e) =>
                    setSelectedItem({
                      ...selectedItem,
                      payment_info: e.target.value,
                    })
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
              <Button type="submit" className="w-full" onSubmit={editItem}>
                Editar Item
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <footer className="footer footer-center p-4 bg-base-200 text-base-content rounded mt-auto">
        <p className="text-muted-foreground text-sm">
          Feito com ❤ por <a href="https://github.com/ggontijo">GGontijo.</a>{" "}
          <a href="https://github.com/ggontijo/presenteio">
            Este site é open source.
          </a>{" "}
        </p>
      </footer>
    </div>
  );
}
