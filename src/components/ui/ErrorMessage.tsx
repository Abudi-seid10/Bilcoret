import { AlertTriangle, RefreshCw } from 'lucide-react'

interface ErrorMessageProps {
  message?: string
  onRetry?: () => void
}

export default function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-bilcor-charcoal/40">
      <AlertTriangle className="w-12 h-12 text-bilcor-gold mb-4" />
      <p className="text-lg font-semibold text-bilcor-charcoal/60 mb-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>Something went wrong</p>
      <p className="text-sm mb-6">{message || 'Could not load data. Please try again later.'}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-bilcor-green text-white text-sm font-bold uppercase tracking-wide hover:bg-bilcor-green-light transition"
          style={{ borderRadius: '4px' }}
        >
          <RefreshCw className="w-4 h-4" />
          Try again
        </button>
      )}
    </div>
  )
}
