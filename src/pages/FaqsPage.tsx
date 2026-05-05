import useSWR from 'swr'
import { getFaqs, createFaq, updateFaq, deleteFaq, type FaqEntry } from '@/lib/api'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Save,
  Loader2,
  HelpCircle,
  Tag,
} from 'lucide-react'

const EMPTY_FORM: Omit<FaqEntry, 'id'> = {
  keywords: [],
  question: '',
  answer: '',
  category: '',
}

function FaqForm({
  initial,
  onSave,
  onCancel,
}: {
  initial: Omit<FaqEntry, 'id'>
  onSave: (data: Omit<FaqEntry, 'id'>) => Promise<void>
  onCancel: () => void
}) {
  const [form, setForm] = useState(initial)
  const [keywordInput, setKeywordInput] = useState(initial.keywords.join(', '))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.question.trim() || !form.answer.trim()) {
      setError('La pregunta y la respuesta son obligatorias.')
      return
    }
    setSaving(true)
    setError('')
    try {
      const keywords = keywordInput
        .split(',')
        .map((k) => k.trim().toLowerCase())
        .filter(Boolean)
      await onSave({ ...form, keywords })
    } catch {
      setError('Error al guardar la FAQ.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="question">Pregunta</Label>
        <Input
          id="question"
          value={form.question}
          onChange={(e) => setForm({ ...form, question: e.target.value })}
          placeholder="¿Cómo restablezco mi contraseña?"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="answer">Respuesta</Label>
        <Textarea
          id="answer"
          value={form.answer}
          onChange={(e) => setForm({ ...form, answer: e.target.value })}
          rows={6}
          placeholder="Para restablecer tu contraseña…"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="keywords">Keywords (separadas por coma)</Label>
          <Input
            id="keywords"
            value={keywordInput}
            onChange={(e) => setKeywordInput(e.target.value)}
            placeholder="password, contraseña, reset"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="category">Categoría (opcional)</Label>
          <Input
            id="category"
            value={form.category ?? ''}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            placeholder="acceso, rendimiento, facturación…"
          />
        </div>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          <X className="h-4 w-4" />
          Cancelar
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Guardar
        </Button>
      </div>
    </form>
  )
}

export function FaqsPage() {
  const { data: faqs = [], isLoading, mutate } = useSWR('faqs', getFaqs)
  const [creating, setCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const filtered = faqs.filter(
    (f) =>
      f.question.toLowerCase().includes(search.toLowerCase()) ||
      f.answer.toLowerCase().includes(search.toLowerCase()) ||
      (f.category ?? '').toLowerCase().includes(search.toLowerCase()),
  )

  const handleCreate = async (data: Omit<FaqEntry, 'id'>) => {
    await createFaq(data)
    await mutate()
    setCreating(false)
  }

  const handleUpdate = async (id: string, data: Omit<FaqEntry, 'id'>) => {
    await updateFaq(id, data)
    await mutate()
    setEditingId(null)
  }

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    try {
      await deleteFaq(id)
      await mutate()
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">FAQs estáticas</h1>
          <p className="text-slate-500 mt-1 text-sm">
            Respuestas automáticas que el agente usa antes de crear un ticket.
          </p>
        </div>
        <Button onClick={() => { setCreating(true); setEditingId(null) }} disabled={creating}>
          <Plus className="h-4 w-4" />
          Nueva FAQ
        </Button>
      </div>

      <div className="mb-4">
        <Input
          placeholder="Buscar en FAQs…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {creating && (
        <Card className="mb-4 border-slate-900">
          <CardHeader>
            <CardTitle className="text-base">Nueva FAQ</CardTitle>
          </CardHeader>
          <CardContent>
            <FaqForm
              initial={EMPTY_FORM}
              onSave={handleCreate}
              onCancel={() => setCreating(false)}
            />
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center h-40 text-slate-400">
          <Loader2 className="h-5 w-5 animate-spin mr-2" />
          Cargando FAQs…
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-40 text-slate-400 gap-2">
          <HelpCircle className="h-8 w-8" />
          <p className="text-sm">{search ? 'Sin resultados para la búsqueda.' : 'No hay FAQs todavía.'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((faq) => (
            <Card key={faq.id}>
              {editingId === faq.id ? (
                <>
                  <CardHeader>
                    <CardTitle className="text-base">Editando FAQ</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <FaqForm
                      initial={{ keywords: faq.keywords, question: faq.question, answer: faq.answer, category: faq.category }}
                      onSave={(data) => handleUpdate(faq.id, data)}
                      onCancel={() => setEditingId(null)}
                    />
                  </CardContent>
                </>
              ) : (
                <CardContent className="pt-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        {faq.category && (
                          <Badge variant="outline">
                            <Tag className="h-3 w-3 mr-1" />
                            {faq.category}
                          </Badge>
                        )}
                        {faq.keywords.map((kw) => (
                          <Badge key={kw} variant="secondary">{kw}</Badge>
                        ))}
                      </div>
                      <p className="font-medium text-slate-900 text-sm">{faq.question}</p>
                      <p className="text-slate-500 text-sm mt-1 whitespace-pre-wrap line-clamp-3">{faq.answer}</p>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => { setEditingId(faq.id); setCreating(false) }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(faq.id)}
                        disabled={deletingId === faq.id}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        {deletingId === faq.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
