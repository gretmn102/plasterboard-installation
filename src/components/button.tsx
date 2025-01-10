import React from "react" // leave it in, otherwise it throws an error

export function Button({ onClick, children }: {
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={() => {
        if (onClick) { onClick() }
      }}
    >
      {children}
    </button>
  )
}
