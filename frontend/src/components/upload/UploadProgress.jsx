const STEPS = ['Upload', 'Enrich', 'Vectorize', 'Index']

export default function UploadProgress({ status }) {
  const stepIndex = status === 'uploading' ? 1 : status === 'ready' ? 4 : 0

  return (
    <div className="grid grid-cols-2 gap-1.5 my-3">
      {STEPS.map((step, i) => (
        <div
          key={step}
          className={`flex items-center gap-1 text-[10px] px-2 py-1 rounded-full
            ${i < stepIndex ? 'bg-ts-green/20 text-ts-green-d' : i === stepIndex ? 'bg-ts-blue/10 text-ts-blue animate-pulse' : 'bg-ts-panel text-ts-muted'}`}
        >
          <span className="shrink-0">{i < stepIndex ? '✓' : i + 1}</span>
          <span className="truncate">{step}</span>
        </div>
      ))}
    </div>
  )
}
