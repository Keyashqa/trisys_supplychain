const STEPS = ['Upload', 'Enrich', 'Vectorize', 'Index']

export default function UploadProgress({ status }) {
  const stepIndex = status === 'uploading' ? 1 : status === 'ready' ? 4 : 0

  return (
    <div className="grid grid-cols-2 gap-1.5 my-3">
      {STEPS.map((step, i) => (
        <div
          key={step}
          className={`flex items-center gap-1 text-[10px] px-2 py-1 rounded-full
            ${i < stepIndex ? 'bg-green-900 text-green-300' : i === stepIndex ? 'bg-blue-900 text-blue-300 animate-pulse' : 'bg-gray-800 text-gray-500'}`}
        >
          <span className="shrink-0">{i < stepIndex ? '✓' : i + 1}</span>
          <span className="truncate">{step}</span>
        </div>
      ))}
    </div>
  )
}
