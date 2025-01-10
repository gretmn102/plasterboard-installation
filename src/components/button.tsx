import React from "react" // leave it in, otherwise it throws an error

export function Button({ onClick, children }: {
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      className="self-center px-5 py-2.5 text-4xl text-white whitespace-nowrap rounded-xl bg-slate-500"
      onClick={() => {
        if (onClick) { onClick() }
      }}
    >
      {children}
    </button>
  )
}
