'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { PlusCircle } from 'lucide-react'
import React, { useState } from 'react'

interface Gift {
  id: number
  image: string
  description: string
}

export default function GiftRegistry() {
  const [gifts, setGifts] = useState<Gift[]>([])
  const [newGift, setNewGift] = useState({ image: '', description: '' })
  const [title, setTitle] = useState('Nome do Casal')
  const [subtitle, setSubtitle] = useState('Lista de Presentes de Casamento')
  const [message, setMessage] = useState('Sua presença é o maior presente, mas se desejar nos presentear, ficaremos honrados com sua contribuição para o início de nossa vida a dois.')
  const [pixCode, setPixCode] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isAddGiftModalOpen, setIsAddGiftModalOpen] = useState(false)
  const [selectedGift, setSelectedGift] = useState<Gift | null>(null)

  const addGift = (e: React.FormEvent) => {
    e.preventDefault()
    if (newGift.image && newGift.description) {
      setGifts([...gifts, { ...newGift, id: Date.now() }])
      setNewGift({ image: '', description: '' })
      setIsAddGiftModalOpen(false)
    }
  }

  const openModal = (gift: Gift) => {
    setSelectedGift(gift)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedGift(null)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert("Código Pix copiado!")
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-100 to-pink-200 text-gray-800 p-8">
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
          <Card key={gift.id} className="overflow-hidden transition-shadow hover:shadow-lg">
            <img src={gift.image} alt={gift.description} className="w-full h-48 object-cover" />
            <CardContent className="p-4">
              <p className="text-sm mb-2">{gift.description}</p>
              <Button onClick={() => openModal(gift)} className="w-full">
                Presentear
              </Button>
            </CardContent>
          </Card>
        ))}
        <Card className="flex items-center justify-center cursor-pointer" onClick={() => setIsAddGiftModalOpen(true)}>
          <CardContent className="text-center">
            <PlusCircle className="mx-auto mb-2 h-12 w-12 text-gray-400" />
            <p className="text-gray-600">Adicionar Presente</p>
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
              <img src={selectedGift.image} alt={selectedGift.description} className="w-full max-w-xs mx-auto mb-4 rounded-lg" />
              <p className="mb-4">{selectedGift.description}</p>
              <p className="mb-2">Escaneie o QR Code ou use o código Pix abaixo:</p>
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
            <DialogTitle>Adicionar Novo Presente</DialogTitle>
          </DialogHeader>
          <form onSubmit={addGift} className="space-y-4">
            <div>
              <Label htmlFor="giftImage">URL da Imagem</Label>
              <Input
                id="giftImage"
                value={newGift.image}
                onChange={(e) => setNewGift({ ...newGift, image: e.target.value })}
                placeholder="https://exemplo.com/imagem.jpg"
              />
            </div>
            <div>
              <Label htmlFor="giftDescription">Descrição</Label>
              <Textarea
                id="giftDescription"
                value={newGift.description}
                onChange={(e) => setNewGift({ ...newGift, description: e.target.value })}
                placeholder="Descrição do presente"
              />
            </div>
            <Button type="submit" className="w-full">
              Adicionar Presente
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}