import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { useUpload } from '../../hooks/useUpload'
import useCopilotStore from '../../store/useCopilotStore'
import Spinner from '../shared/Spinner'

export default function DropZone() {
  const { handleUpload } = useUpload()
  const uploadStatus = useCopilotStore(s => s.uploadStatus)

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles[0]) handleUpload(acceptedFiles[0])
  }, [handleUpload])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'text/csv': ['.csv'] },
    multiple: false,
  })

  const isUploading = uploadStatus === 'uploading'

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors
        ${isDragActive ? 'border-ts-blue bg-ts-blue/10' : 'border-ts-border hover:border-ts-blue'}
        ${isUploading ? 'pointer-events-none opacity-60' : ''}`}
    >
      <input {...getInputProps()} />
      {isUploading ? (
        <div className="flex flex-col items-center gap-3">
          <Spinner size="lg" />
          <p className="text-ts-muted text-sm">Processing CSV...</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <div className="text-4xl">📦</div>
          <p className="text-ts-navy font-medium">
            {isDragActive ? 'Drop it here' : 'Drag & drop a CSV file'}
          </p>
          <p className="text-ts-muted text-sm">or click to browse</p>
        </div>
      )}
    </div>
  )
}
