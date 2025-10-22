import React from "react"

type Props = {
  onChange: (file: File | null) => void
  accept?: string
  id?: string
  label?: string
  fileName?: string | null
}

export function FileUpload({ onChange, accept = "application/pdf", id = "pdf-upload", label = "Escolher arquivo", fileName }: Props) {
  const inputRef = React.useRef<HTMLInputElement | null>(null)

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files && e.target.files[0] ? e.target.files[0] : null
    onChange(file)
  }

  function triggerFileDialog() {
    inputRef.current?.click()
  }

  return (
    <div className="w-full">
      <div className="flex items-center gap-3">
        <input
          ref={inputRef}
          id={id}
          type="file"
          accept={accept}
          className="hidden"
          onChange={handleInputChange}
        />
        <button
          type="button"
          onClick={triggerFileDialog}
          className="px-4 py-2 rounded-md border border-gray-300 bg-white text-gray-800 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition"
        >
          {label}
        </button>
        <span className="text-sm text-gray-600 truncate max-w-[18rem]" aria-live="polite">
          {fileName ?? "Nenhum arquivo selecionado"}
        </span>
      </div>
      <p className="text-xs text-gray-500 mt-2">Apenas arquivos PDF.</p>
    </div>
  )
}


