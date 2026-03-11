import { useCallback } from 'react'
import { uploadCSV } from '../api/upload'
import useCopilotStore from '../store/useCopilotStore'

export function useUpload() {
  const { setUploadStatus, setSummary } = useCopilotStore()

  const handleUpload = useCallback(async (file) => {
    setUploadStatus('uploading')
    try {
      const response = await uploadCSV(file)
      setSummary(response.summary)
    } catch (err) {
      console.error(err)
      setUploadStatus('error')
    }
  }, [setUploadStatus, setSummary])

  return { handleUpload }
}
