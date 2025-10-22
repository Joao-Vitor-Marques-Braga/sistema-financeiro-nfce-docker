import type { ActiveTab } from "../hooks/useInvoiceExtraction"

type Props = {
  activeTab: ActiveTab
  onChange: (tab: ActiveTab) => void
}

export function ResultTabs({ activeTab, onChange }: Props) {
  const tabBase = "px-4 py-2 text-sm font-medium rounded-t-md border-b-2"
  const active = "border-blue-600 text-blue-700"
  const inactive = "border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300"

  return (
    <div>
      <div className="flex gap-2 border-b border-gray-200">
        <button
          type="button"
          className={`${tabBase} ${activeTab === "json" ? active : inactive}`}
          onClick={() => onChange("json")}
        >
          &lt;&gt; Dados em JSON
        </button>
      </div>
    </div>
  )
}


