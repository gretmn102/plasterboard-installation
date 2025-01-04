import { Option, UnionCase } from "@fering-org/functional-helper"
import update from "immutability-helper"

export enum MaterialType {
  "UD",
  "CD",
  "Plasterboard",
}

export type UD = { length: number }
export namespace UD {
  export function create(length: number): UD {
    return {
      length
    }
  }
}

export type Material =
  | UnionCase<MaterialType.UD, UD>
  | UnionCase<MaterialType.CD, { lenght: number }>
  | UnionCase<MaterialType.Plasterboard, { width: number, height: number }>

export enum InstallerStateType {
  "Start",
  "AddUDProfileToFloor",
  "FinishAddUDProfileToFloor",
}

export type Floor = {
  uds: UD[]
  length: number
}
export namespace Floor {
  export function create(length: number): Floor {
    return {
      length,
      uds: [],
    }
  }

  export type AddUDProfileResult = {
    updatedState: Floor
    filled: Option<Option<UD>>
  }

  export function addUDProfile(floor: Floor, ud: UD): AddUDProfileResult {
    const remainingLength = (() => {
      let sum = 0
      floor.uds.forEach(ud => ud.length + sum)
      return sum
    })()
    if (remainingLength < 0) {
      const diff = Math.abs(remainingLength)
      return {
        updatedState: update(floor, {
          uds: { $push: [ UD.create(ud.length - diff) ] }
        }),
        filled: Option.mkSome(Option.mkSome(UD.create(diff))),
      }
    } else if (remainingLength === 0) {
      return {
        updatedState: update(floor, {
          uds: { $push: [ ud ] }
        }),
        filled: Option.mkSome(Option.mkNone()),
      }
    }
    return {
      updatedState: update(floor, {
        uds: { $push: [ ud ] }
      }),
      filled: Option.mkNone(),
    }
  }
}

export type InstallerState =
  | UnionCase<InstallerStateType.Start>
  | UnionCase<InstallerStateType.AddUDProfileToFloor, Floor>
  | UnionCase<InstallerStateType.FinishAddUDProfileToFloor, Floor.AddUDProfileResult["filled"]>

export type Size = { width: number; height: number }

export type ConstantMaterials = {
  ud: UD
}

export type Model = {
  roomSize: Size
  roomState: {
    floor: Floor
  }
  constantMaterials: ConstantMaterials
  installerState: InstallerState
}

export namespace Model {
  export function create(
    roomSize: Size,
    constantMaterials: ConstantMaterials,
  ): Model {
    return {
      roomSize,
      roomState: {
        floor: Floor.create(roomSize.width)
      },
      constantMaterials,
      installerState: UnionCase.mkEmptyUnionCase(InstallerStateType.Start),
    }
  }

  export function next(model: Model): Model {
    const updatedInstallerState: InstallerState = (() => {
      switch (model.installerState.case) {
        case InstallerStateType.Start: {
          const result = Floor.addUDProfile(model.roomState.floor, model.constantMaterials.ud)
          return UnionCase.mkUnionCase(
            InstallerStateType.AddUDProfileToFloor,
            result,
          )
        }
        case InstallerStateType.AddUDProfileToFloor: {
          // const result = model.installerState.fields
          const result = Floor.addUDProfile(
            model.roomState.floor,
            model.constantMaterials.ud,
          )
          return UnionCase.mkUnionCase(
            InstallerStateType.AddUDProfileToFloor,
            result,
          )
          return Option.reduce(
            result.filled,
            filled => {
              return UnionCase.mkUnionCase(
                InstallerStateType.FinishAddUDProfileToFloor,
                filled,
              )
              // return Option.reduce<Option<UD>, InstallerState>(
              //   filled,
              //   restUd => {
              //     return UnionCase.mkUnionCase(
              //       InstallerStateType.FinishAddUDProfileToFloor,
              //       filled,
              //     )
              //   },
              //   () => {
              //     return UnionCase.mkUnionCase(
              //       InstallerStateType.FinishAddUDProfileToFloor,
              //     )
              //   }
              // )
            },
            () => {
              const result = Floor.addUDProfile(model.roomState.floor, model.constantMaterials.ud)
              return UnionCase.mkUnionCase(
                InstallerStateType.AddUDProfileToFloor,
                result,
              )
            }
          )
        }


      }
    })()

    return update(model, {
      installerState: {
        $set: updatedInstallerState
      }
    })
  }
}
