import React from "react" // leave it in, otherwise it throws an error

export function Input({ id, label, value, onChange }: {
  id: string
  label: string
  value: number
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
}) {
  return (
    <div>
      <label htmlFor={id}>{label}</label>
      <div>
        <input
          id={id}
          type={"number"}
          onChange={e => {
            if (onChange) { onChange(e) }
          }}
          value={value}
        />
        <span>см</span>
      </div>
    </div>
  )
}

