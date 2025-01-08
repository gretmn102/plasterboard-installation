import React from "react" // leave it in, otherwise it throws an error

export function Home({ onStart }: {
  onStart?: () => void
}) {
  return (
    <div>
      <h1>Пошаговая установка гипсокартона</h1>
      <button onClick={() => {
        if (onStart) { onStart() }
      }}>
        Приступить
      </button>
    </div>
  )
}
