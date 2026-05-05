import useSWR from 'swr'
import { getSettings, updateSettings, type AgentSettings } from '@/lib/api'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Save, CheckCircle2, AlertCircle, Loader2, Info } from 'lucide-react'

const SUGGESTED_MODELS = [
  'gpt-4o',
  'gpt-4o-mini',
  'gpt-4-turbo',
  'gpt-3.5-turbo',
  'openai/gpt-4o',
  'openai/gpt-4o-mini',
  'anthropic/claude-3.5-sonnet',
  'anthropic/claude-3-haiku',
  'google/gemini-pro-1.5',
]

export function SettingsPage() {
  const { data, isLoading, mutate } = useSWR('settings', getSettings)
  const [form, setForm] = useState<AgentSettings>({ llmModel: '' })
  const [dirty, setDirty] = useState(false)
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')

  useEffect(() => {
    if (data) {
      setForm(data)
      setDirty(false)
    }
  }, [data])

  const handleChange = (field: keyof AgentSettings, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setDirty(true)
    setStatus('idle')
  }

  const handleSave = async () => {
    setSaving(true)
    setStatus('idle')
    try {
      await updateSettings(form)
      await mutate()
      setDirty(false)
      setStatus('success')
      setTimeout(() => setStatus('idle'), 3000)
    } catch {
      setStatus('error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Configuración</h1>
        <p className="text-slate-500 mt-1 text-sm">
          Parámetros del agente. Los cambios se aplican al guardar.
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 text-slate-400 h-40">
          <Loader2 className="h-5 w-5 animate-spin" />
          Cargando configuración…
        </div>
      ) : (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Modelo LLM</CardTitle>
              <CardDescription>
                Nombre del modelo que se pasa al proveedor (OpenAI directo o via OpenRouter/Cloudflare AI Gateway).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="llmModel">Modelo</Label>
                <Input
                  id="llmModel"
                  value={form.llmModel}
                  onChange={(e) => handleChange('llmModel', e.target.value)}
                  placeholder="gpt-4o"
                  list="model-suggestions"
                />
                <datalist id="model-suggestions">
                  {SUGGESTED_MODELS.map((m) => (
                    <option key={m} value={m} />
                  ))}
                </datalist>
              </div>
              <div className="flex items-start gap-2 rounded-md bg-blue-50 p-3 text-sm text-blue-700">
                <Info className="h-4 w-4 shrink-0 mt-0.5" />
                <span>
                  El modelo actual es <strong>{data?.llmModel}</strong>.
                  Para usar OpenRouter, utilizá el prefijo <code className="text-xs bg-blue-100 px-1 rounded">proveedor/modelo</code> (ej: <code className="text-xs bg-blue-100 px-1 rounded">openai/gpt-4o</code>).
                </span>
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-between">
            <div>
              {status === 'success' && (
                <span className="flex items-center gap-1.5 text-sm text-green-600">
                  <CheckCircle2 className="h-4 w-4" />
                  Guardado y agente recargado
                </span>
              )}
              {status === 'error' && (
                <span className="flex items-center gap-1.5 text-sm text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  Error al guardar
                </span>
              )}
              {dirty && status === 'idle' && (
                <span className="text-xs text-amber-600 font-medium">● Cambios sin guardar</span>
              )}
            </div>
            <Button onClick={handleSave} disabled={!dirty || saving}>
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Guardar y recargar agente
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
