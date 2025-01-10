import React from "react" // leave it in, otherwise it throws an error

import { Button } from "../components/button"
import { Layer } from "../components/layer"

export function Home({ onStart }: {
  onStart?: () => void
}) {
  return (
    <Layer
      title="Пошаговая установка гипсокартона"
      footer={
        <Button
          onClick={() => {
            if (onStart) { onStart() }
          }}
        >
          Приступить
        </Button>
      }
    />
  )
}
