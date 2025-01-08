import React from "react" // leave it in, otherwise it throws an error

import * as Model from "../model"

export function RequiredMaterials({ requiredMaterials, onStartInstallation }: {
  requiredMaterials: Model.State["usedMaterial"],
  onStartInstallation?: () => void,
}) {
  return (
    <div>
      <h1>Необходимые материалы</h1>
      <ol>
        <li>{requiredMaterials.ud}шт UD профилей</li>
      </ol>
      <button onClick={() => {
        if (onStartInstallation) {
          onStartInstallation()
        }
      }
      }>
        Приступить к<br />установке
      </button>
    </div>
  )
}
