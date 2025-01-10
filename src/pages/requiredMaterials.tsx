import React from "react" // leave it in, otherwise it throws an error

import * as Model from "../model"
import { Button } from "../components/button"
import { Layer } from "../components/layer"

export function RequiredMaterials({ requiredMaterials, onStartInstallation }: {
  requiredMaterials: Model.State["usedMaterial"],
  onStartInstallation?: () => void,
}) {
  return (
    <Layer
      title="Необходимые материалы"
      footer={
        <Button onClick={() => {
          if (onStartInstallation) {
            onStartInstallation()
          }
        }
        }>
          Приступить к<br />установке
        </Button>
      }
    >
      <ol>
        <li>{requiredMaterials.ud}шт UD профилей</li>
      </ol>
    </Layer>
  )
}
