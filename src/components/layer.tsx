import React from "react" // leave it in, otherwise it throws an error

export function Layer({ title, footer, children }: {
  title: string
  footer?: React.ReactNode
  children?: React.ReactNode
}) {
  return (
    <main>
      <h1>{title}</h1>
      {children && (
        <div>{children}</div>
      )}
      {footer && (
        <div>{footer}</div>
      )}
    </main>
  )
}
