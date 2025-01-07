import React from "react" // leave it in, otherwise it throws an error

export function Layer({ title, footer, children }: {
  title: string
  footer?: React.ReactNode
  children?: React.ReactNode
}) {
  return (
    <main className="flex flex-col flex-1 justify-between items-center px-2.5 py-24 w-full">
      <h1 className="text-4xl text-center text-black">{title}</h1>
      {children && (
        <div>{children}</div>
      )}
      {footer && (
        <div>{footer}</div>
      )}
    </main>
  )
}
