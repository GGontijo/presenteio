import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
} from "@/components/ui/select"

interface Item {
  id: number; // TODO: Obter id do retorno da API
  name: string;
  desc: string;
  image: string;
  value: number;
  payment_form: string;
  payment_info: string;
}

interface Gift {
  id: number; // TODO: Obter id do retorno da API
  sender_name: string;
  sender_phone: string;
  message: string;
  user_id: number;
  total: number;
}

export default function GiftRegistry() {
  const [gifts, setGifts] = useState<Item[]>([]);
  const [newGift, setNewGift] = useState({
    id: 0,
    name: "",
    desc: "",
    image: "",
    value: 0,
    payment_form: "",
    payment_info: "",
  });
  const [title, setTitle] = useState("Nome do Casal");
  const [subtitle, setSubtitle] = useState("Lista de Presentes de Casamento");
  const [message, setMessage] = useState(
    "Sua presença é o maior presente, mas se desejar nos presentear, ficaremos honrados com sua contribuição para o início de nossa vida a dois."
  );
  const [pixCode, setPixCode] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddGiftModalOpen, setIsAddGiftModalOpen] = useState(false);
  const [selectedGift, setSelectedGift] = useState<Item | null>(null);
  const [paymentForm, setPaymentForm] = useState("");
  
  const handlePaymentFormChange = (value) => {
    setPaymentForm(value);
    setNewGift({ ...newGift, payment_form: value });
  }

  const addGift = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      newGift.name &&
      newGift.image &&
      newGift.value &&
      newGift.payment_form
    ) {
      newGift.id = 1; // TODO: Obter id do retorno da API
      setGifts([...gifts, { ...newGift }]);
      setNewGift({
        id: 0,
        name: "",
        desc: "",
        image: "",
        value: 0,
        payment_form: "",
        payment_info: "",
      });
      setIsAddGiftModalOpen(false);
    }
  };

  const openModal = (gift: Item) => {
    setSelectedGift(gift);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedGift(null);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Código Pix copiado!");
  };

  return (
    <div className="w-screen h-screen bg-gradient-to-b from-gray-100 to-gray-200 text-gray-800 p-8">
      <header className="text-center mb-12">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="text-4xl font-bold text-pink-700 mb-4 bg-transparent border-none text-center w-full"
        />
        <input
          type="text"
          value={subtitle}
          onChange={(e) => setSubtitle(e.target.value)}
          className="text-2xl font-bold mb-4 bg-transparent border-none text-center w-full"
        />
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="text-gray-600 max-w-2xl mx-auto bg-transparent border-none text-center w-full resize-none"
          rows={3}
        />
      </header>

      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4">Configurações</h3>
        <div className="flex flex-wrap gap-4">
          <div>
            <Label htmlFor="pixCode">Código Pix</Label>
            <Input
              id="pixCode"
              value={pixCode}
              onChange={(e) => setPixCode(e.target.value)}
              placeholder="Ex: 123.456.789-00"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {gifts.map((gift) => (
          <Card
            key={gift.id}
            className="overflow-hidden transition-shadow hover:shadow-lg"
          >
            <img
              src={gift.image}
              alt={gift.image}
              className="w-full h-48 object-cover"
            />
            <CardContent className="p-4">
              <p className="text-sm mb-2">{gift.name}</p>
              <Button onClick={() => openModal(gift)} className="w-full">
                Presentear
              </Button>
            </CardContent>
          </Card>
        ))}
        <Card
          className="flex py-4 items-center justify-center cursor-pointer"
          onClick={() => setIsAddGiftModalOpen(true)}
        >
          <CardContent className="text-center">
            <PlusCircle className="mx-auto mb-2 h-14 w-12 text-gray-400" />
            <p className="text-gray-600">Adicionar Novo Item</p>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Contribuir com o Presente</DialogTitle>
          </DialogHeader>
          {selectedGift && (
            <div className="text-center">
              <img
                src={selectedGift.image}
                alt={selectedGift.desc}
                className="w-full max-w-xs mx-auto mb-4 rounded-lg"
              />
              <p className="mb-4">{selectedGift.desc}</p>
              <p className="mb-2">
                Escaneie o QR Code ou use o código Pix abaixo:
              </p>
              <div className="flex flex-col items-center gap-2">
                <span className="text-lg font-semibold">{pixCode}</span>
                <Button onClick={() => copyToClipboard(pixCode)}>
                  Copiar Código Pix
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isAddGiftModalOpen} onOpenChange={setIsAddGiftModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-black">
              Adicionar Novo Item
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={addGift} className="space-y-4">
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
            {/* <div>
              <Label className="text-black" htmlFor="giftImage">
                Link da Imagem
              </Label>
              <Input
                id="giftImage"
                value={newGift.image}
                onChange={(e) =>
                  setNewGift({ ...newGift, image: e.target.value })
                }
                placeholder="https://exemplo.com/imagem.jpg"
                required
              />
            </div> */}
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="picture">Imagem do Item</Label>
              <Input id="giftImage" type="file" />
            </div>
            <div>
              <Label className="text-black" htmlFor="giftDescription">
                Descrição
              </Label>
              <Textarea className="resize-none"
                id="giftDescription"
                value={newGift.desc}
                onChange={(e) =>
                  setNewGift({ ...newGift, desc: e.target.value })
                }
                placeholder="Descrição do item"
              />
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
                  type="number"
                  value={newGift.value}
                  onChange={(e) =>
                    setNewGift({ ...newGift, value: e.target.valueAsNumber })
                  }
                  placeholder="0,00"
                  className="flex items-center pl-9"
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
            <Button type="submit" className="w-full">
              Adicionar Presente
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
