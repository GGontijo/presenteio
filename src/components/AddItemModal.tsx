export function AddItemModal({isAddGiftModalOpen}) {
    return (
        <Dialog open={isAddGiftModalOpen}>
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
              <Textarea
                className="resize-none"
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
                  type="text"
                  value={newGift.value}
                  defaultValue={newGift.value}
                  onChange={(e) => {
                    let value = e.target.value.replace(/\D/g, "");
                    value = (Number(value) / 100).toFixed(2).replace(".", ",");
                    setNewGift({ ...newGift, value });
                  }}
                  placeholder="0,00"
                  pattern="^[0-9]*[.,]?[0-9]*$"
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
            <Button type="submit" className="w-full">
              Adicionar Presente
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    )
}