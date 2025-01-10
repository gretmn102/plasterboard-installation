import React, { useRef, useState } from "react"

import { concat } from "../utils"

export function Input({ id, label, initValue, onChange }: {
  id: string
  label?: string
  initValue: number
  onChange?: (prompt: number) => void
}) {
  const [value, setValue] = useState(initValue)
  const inputId = useRef<HTMLInputElement>(null)
  const [focused, setFocused] = useState(false)

  return (
    <div>
      {label && (
        <label
          className={concat([
            "block",
            "text-center",
            "text-sm",
          ])}
          htmlFor={id}
        >
          {label}
        </label>
      )}
      <div
        role="textbox"
        className={concat([
          "w-fit",
          "px-3",
          "py-2.5",
          "focus:outline-none",
          "border",
          "border-solid",
          focused ? "border-blue-500" : "border-gray-300 hover:border-gray-400",
          "rounded-xl",
          "flex",
          "items-center",
          "gap-2.5",
        ])}
        onClick={() => {
          if (inputId.current) {
            inputId.current.focus()
            setFocused(true)
          }
        }}
      >
        <input
          id={id}
          ref={inputId}
          type="number"
          className={concat([
            "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
            "w-20",
            "focus:outline-none",
            "text-2xl",
            "font-light",
            "placeholder:text-slate-400",
          ])}
          placeholder="1000"
          value={value}
          onChange={e => {
            const newValue = Number.parseInt(e.currentTarget.value)
            setValue(newValue)
            if (onChange) { onChange(newValue) }
          }}
          onBlur={() => {
            setFocused(false)
          }}
        />
        <div>см</div>
      </div>
    </div>
  )
}
