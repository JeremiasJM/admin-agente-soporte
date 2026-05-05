import useSWR from 'swr'
import { getPrompt, updatePrompt } from '@/lib/api'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Save, RotateCcw, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'

export function PromptPage() {
  const { data, isLoading, mutate } = useSWR('prompt', getPrompt)
  const [value, setValue] = useState('')
  const [dirty, setDirty] = useState(false)
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')

  useEffect(() => {
    if (data?.prompt) {
      setValue(data.prompt)
      setDirty(false)
    }
  }, [data?.prompt])

  const handleChange = (v: string) => {
    setValue(v)
    setDirty(true)
    setStatus('idle')
  }

  const handleReset = () => {
    if (data?.prompt) {
      setValue(data.prompt)
      setDirty(false)
      setStatus('idle')
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setStatus('idle')
    try {
      await updatePrompt(value)
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

  const charCount = value.length

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Prompt del agente</h1>
        <p className="text-slate-500 mt-1 text-sm">
          Editá las instrucciones del sistema que el agente recibe en cada conversación. Los cambios se aplican de inmediato al guardar.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>System prompt</CardTitle>
          <CardDescription>
            Define el comportamiento, tono y flujos que sigue el agente.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-40 text-slate-400">
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              Cargando prompt…
            </div>
          ) : (
            <>
              <div className="relative">
                <Textarea
                  value={value}
                  onChange={(e) => handleChange(e.target.value)}
                  rows={28}
                  className="font-mono text-xs leading-relaxed resize-y"
                  placeholder="Escribí las instrucciones del agente aquí…"
                />
                <span className="absolute bottom-3 right-3 text-xs text-slate-400">
                  {charCount.toLocaleString()} caracteres
                </span>
              </div>

              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-2">
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
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={handleReset}
                    disabled={!dirty || saving}
                  >
                    <RotateCcw className="h-4 w-4" />
                    Descartar
                  </Button>
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
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
