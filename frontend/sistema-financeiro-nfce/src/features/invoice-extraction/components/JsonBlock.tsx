import React from "react"

type Props = {
  json: unknown
}

export function JsonBlock({ json }: Props) {
  const preRef = React.useRef<HTMLPreElement | null>(null)

  async function copy() {
    const text = JSON.stringify(json, null, 2)
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      if (preRef.current) {
        const range = document.createRange()
        range.selectNodeContents(preRef.current)
        const selection = window.getSelection()
        selection?.removeAllRanges()
        selection?.addRange(range)
        document.execCommand("copy")
        selection?.removeAllRanges()
      }
    }
  }

  return (
    <div>
      <div className="rounded-md overflow-hidden bg-gray-900">
        <pre ref={preRef} className="p-4 text-sm text-gray-100 overflow-auto max-h-96">
          <code>{JSON.stringify(json, null, 2)}</code>
        </pre>
      </div>
      <button
        type="button"
        onClick={copy}
        className="mt-3 inline-flex items-center px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition"
      >
        Copiar JSON
      </button>
    </div>
  )
}


