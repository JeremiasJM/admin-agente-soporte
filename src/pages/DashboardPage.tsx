import useSWR from 'swr'
import { getPrompt, getFaqs, getSettings } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Bot, HelpCircle, Settings, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

export function DashboardPage() {
  const { data: promptData } = useSWR('prompt', getPrompt)
  const { data: faqs = [] } = useSWR('faqs', getFaqs)
  const { data: settings } = useSWR('settings', getSettings)

  const promptLen = promptData?.prompt?.length ?? 0

  const stats = [ 
    {
      label: 'Prompt',
      value: `${promptLen.toLocaleString()} chars`,
      icon: Bot,
      to: '/prompt',
      description: 'Instrucciones del sistema',
    },
    {
      label: 'FAQs estáticas',
      value: `${faqs.length} entradas`,
      icon: HelpCircle,
      to: '/faqs',
      description: 'Respuestas automáticas',
    },
    {
      label: 'Modelo LLM',
      value: settings?.llmModel ?? '—',
      icon: Settings,
      to: '/settings',
      description: 'Motor de lenguaje activo',
    },
  ]

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Panel de administración</h1>
        <p className="text-slate-500 mt-1 text-sm">
          Configurá el agente de soporte de Fullmindtech desde acá.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, to, description }) => (
          <Link key={to} to={to} className="group">
            <Card className="hover:border-slate-400 transition-colors h-full">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex h-9 w-9 items-center justify-center rounded-md bg-slate-100 group-hover:bg-slate-900 transition-colors">
                    <Icon className="h-4 w-4 text-slate-600 group-hover:text-white transition-colors" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-slate-600 transition-colors" />
                </div>
                <CardTitle className="text-sm font-medium text-slate-500 mt-3">{label}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xl font-bold text-slate-900">{value}</p>
                <p className="text-xs text-slate-400 mt-0.5">{description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Acciones rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-slate-600">
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
              <Link to="/prompt" className="hover:text-slate-900 hover:underline">Editar el prompt del agente</Link>
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
              <Link to="/faqs" className="hover:text-slate-900 hover:underline">Agregar o editar FAQs estáticas</Link>
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
              <Link to="/settings" className="hover:text-slate-900 hover:underline">Cambiar el modelo LLM</Link>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
