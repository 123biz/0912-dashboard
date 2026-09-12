import { useEffect, useRef, useState } from 'react'

type Option = { value: string; label: string; hint?: string }

type Props = {
  label: string
  options: Option[]
  selected: string[]
  onChange: (next: string[]) => void
  /** 아무것도 선택되지 않았을 때의 표기 (= 전체) */
  allLabel: string
}

export function MultiSelect({
  label,
  options,
  selected,
  onChange,
  allLabel,
}: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    const onClickAway = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const onEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', onClickAway)
    document.addEventListener('keydown', onEscape)
    return () => {
      document.removeEventListener('mousedown', onClickAway)
      document.removeEventListener('keydown', onEscape)
    }
  }, [open])

  const toggle = (value: string) => {
    onChange(
      selected.includes(value)
        ? selected.filter((v) => v !== value)
        : [...selected, value],
    )
  }

  const summary =
    selected.length === 0
      ? allLabel
      : selected.length === 1
        ? (options.find((o) => o.value === selected[0])?.label ?? allLabel)
        : `${selected.length}개 선택`

  return (
    <div ref={ref} className="relative">
      <label className="mb-1 block text-xs font-medium text-neutral-500">
        {label}
      </label>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="listbox"
        className="flex h-9 w-full min-w-[150px] items-center justify-between gap-2 rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-800 hover:border-neutral-400"
      >
        <span className="truncate">{summary}</span>
        <span aria-hidden className="text-xs text-neutral-400">
          ▾
        </span>
      </button>

      {open && (
        <div
          role="listbox"
          aria-multiselectable
          className="absolute left-0 z-20 mt-1 max-h-72 w-64 overflow-y-auto rounded-md border border-neutral-200 bg-white py-1 shadow-lg"
        >
          {selected.length > 0 && (
            <button
              type="button"
              onClick={() => onChange([])}
              className="w-full px-3 py-1.5 text-left text-xs text-blue-700 hover:bg-neutral-50"
            >
              선택 해제 ({allLabel})
            </button>
          )}

          {options.map((opt) => {
            const isOn = selected.includes(opt.value)
            return (
              <label
                key={opt.value}
                role="option"
                aria-selected={isOn}
                className="flex cursor-pointer items-center gap-2.5 px-3 py-1.5 text-sm hover:bg-neutral-50"
              >
                <input
                  type="checkbox"
                  checked={isOn}
                  onChange={() => toggle(opt.value)}
                  className="h-3.5 w-3.5 accent-blue-600"
                />
                <span className="flex-1 truncate text-neutral-800">
                  {opt.label}
                </span>
                {opt.hint && (
                  <span className="text-xs text-neutral-400">{opt.hint}</span>
                )}
              </label>
            )
          })}
        </div>
      )}
    </div>
  )
}
