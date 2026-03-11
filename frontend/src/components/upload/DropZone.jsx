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
        ${isDragActive ? 'border-blue-500 bg-blue-950/30' : 'border-gray-700 hover:border-gray-500'}
        ${isUploading ? 'pointer-events-none opacity-60' : ''}`}
    >
      <input {...getInputProps()} />
      {isUploading ? (
        <div className="flex flex-col items-center gap-3">
          <Spinner size="lg" />
          <p className="text-gray-400 text-sm">Processing CSV...</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <div className="text-4xl">📦</div>
          <p className="text-gray-300 font-medium">
            {isDragActive ? 'Drop it here' : 'Drag & drop a CSV file'}
          </p>
          <p className="text-gray-500 text-sm">or click to browse</p>
        </div>
      )}
    </div>
  )
}
