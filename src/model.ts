import { Option, UnionCase, ArrayExt } from "@fering-org/functional-helper"
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
  | UnionCase<MaterialType.CD, { length: number }>
  | UnionCase<MaterialType.Plasterboard, { width: number, height: number }>

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

  export type Filled =
    | UnionCase<"NotFilledYet">
    | UnionCase<"Filled", Option<UD>>
  export namespace Filled {
    export function createNotFilledYet(): Filled {
      return UnionCase.mkEmptyUnionCase("NotFilledYet")
    }

    export function createFilled(rest: Option<UD>): Filled {
      return UnionCase.mkUnionCase("Filled", rest)
    }
  }

  export type AddUDProfileResult = {
    updatedState: Floor
    filled: Filled
  }

  export function addUDProfile(floor: Floor, ud: UD): AddUDProfileResult {
    const udsLength = ArrayExt.fold(
      floor.uds,
      0,
      (sum, ud) => sum + ud.length
    )
    const remainingLength = floor.length - (udsLength + ud.length)
    if (remainingLength < 0) {
      const diff = Math.abs(remainingLength)
      return {
        updatedState: update(floor, {
          uds: { $push: [ UD.create(ud.length - diff) ] }
        }),
        filled: Filled.createFilled(
          Option.mkSome(UD.create(diff))
        ),
      }
    } else if (remainingLength === 0) {
      return {
        updatedState: update(floor, {
          uds: { $push: [ ud ] }
        }),
        filled: Filled.createFilled(Option.mkNone()),
      }
    }
    return {
      updatedState: update(floor, {
        uds: { $push: [ ud ] }
      }),
      filled: Filled.createNotFilledYet(),
    }
  }
}

export type Size = { width: number; height: number }

export type ConstantMaterials = {
  ud: UD
}

export type State = {
  roomSize: Size
  roomState: {
    floor: Floor
  }
  constantMaterials: ConstantMaterials
}

export namespace State {
  export function create(
    roomSize: Size,
    constantMaterials: ConstantMaterials,
  ): State {
    return {
      roomSize,
      roomState: {
        floor: Floor.create(roomSize.width)
      },
      constantMaterials
    }
  }
}

export enum ModelType {
  "Start",
  "AddUDProfileToFloor",
  "End"
}

export type Model =
  | UnionCase<ModelType.Start, () => Model>
  | UnionCase<ModelType.AddUDProfileToFloor, [Floor.AddUDProfileResult, () => Model]>
  | UnionCase<ModelType.End>

export namespace Model {
  export function createStart(next: () => Model): Model {
    return UnionCase.mkUnionCase(ModelType.Start, next)
  }

  export function createAddUDProfileToFloor(
    result: Floor.AddUDProfileResult,
    next: () => Model
  ): Model {
    return UnionCase.mkUnionCase<
      ModelType.AddUDProfileToFloor,
      [Floor.AddUDProfileResult, () => Model]
    >(
      ModelType.AddUDProfileToFloor,
      [result, next],
    )
  }

  export function createEnd(): Model {
    return UnionCase.mkEmptyUnionCase(ModelType.End)
  }

  export function fillFloorByUds(state: State): Model {
    const result = Floor.addUDProfile(
      state.roomState.floor,
      state.constantMaterials.ud
    )
    return createAddUDProfileToFloor(
      result,
      () => {
        switch (result.filled.case) {
          case "NotFilledYet": {
            const updatedState: State = update(state, {
              roomState: {
                floor: {
                  $set: result.updatedState
                }
              }
            })
            return fillFloorByUds(updatedState)
          }
          case "Filled": {
            const filled = result.filled.fields
            return Option.reduce(
              filled,
              restUd => {
                return createEnd()
              },
              () => {
                return createEnd()
              },
            )
          }
        }
      }
    )
  }

  export function start(initState: State): Model {
    return createStart(() => {
      return fillFloorByUds(initState)
    })
  }
}
