export default function Spinner({ size = 'md' }) {
  const sz = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-8 h-8' : 'w-6 h-6'
  return (
    <div className={`${sz} border-2 border-ts-border border-t-ts-blue rounded-full animate-spin`} />
  )
}
