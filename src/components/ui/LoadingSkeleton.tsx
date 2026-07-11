interface LoadingSkeletonProps {
  type?: 'card' | 'hero' | 'list'
  count?: number
}

export default function LoadingSkeleton({ type = 'card', count = 1 }: LoadingSkeletonProps) {
  const items = Array.from({ length: count })

  if (type === 'hero')
    return (
      <div className="animate-pulse">
        <div className="h-12 bg-slate-200 rounded w-2/3 mx-auto mb-4"></div>
        <div className="h-5 bg-slate-200 rounded w-1/2 mx-auto mb-2"></div>
        <div className="h-5 bg-slate-200 rounded w-1/3 mx-auto mb-8"></div>
        <div className="flex justify-center gap-4">
          <div className="h-10 bg-slate-200 rounded w-32"></div>
          <div className="h-10 bg-slate-200 rounded w-32"></div>
        </div>
      </div>
    )

  if (type === 'list')
    return (
      <div className="animate-pulse space-y-4">
        {items.map((_, i) => (
          <div key={i} className="flex items-start gap-4 p-5 bg-white border border-slate-200" style={{ borderRadius: '4px' }}>
            <div className="w-14 h-14 bg-slate-200 shrink-0" style={{ borderRadius: '4px' }}></div>
            <div className="flex-1">
              <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-slate-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    )

  return (
    <>
      {items.map((_, i) => (
        <div key={i} className="animate-pulse bg-white border border-slate-200 p-6" style={{ borderRadius: '4px' }}>
          <div className="h-3 bg-slate-200 w-1/4 mb-4" style={{ borderRadius: '4px' }}></div>
          <div className="h-5 bg-slate-200 rounded w-3/4 mb-3"></div>
          <div className="h-3 bg-slate-200 rounded w-full mb-2"></div>
          <div className="h-3 bg-slate-200 rounded w-5/6 mb-5"></div>
          <div className="flex gap-3 mb-4">
            <div className="h-3 bg-slate-200 rounded w-24"></div>
            <div className="h-3 bg-slate-200 rounded w-24"></div>
          </div>
          <div className="h-10 bg-slate-200 w-32" style={{ borderRadius: '4px' }}></div>
        </div>
      ))}
    </>
  )
}
