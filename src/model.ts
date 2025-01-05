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
    | UnionCase<"Filled", Option<{ installedUd: UD, restUd: UD }>>
  export namespace Filled {
    export function createNotFilledYet(): Filled {
      return UnionCase.mkEmptyUnionCase("NotFilledYet")
    }

    export function createFilled(
      rest: Option<{ installedUd: UD, restUd: UD }>
    ): Filled {
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
      const installedUd = UD.create(ud.length - diff)
      return {
        updatedState: update(floor, {
          uds: { $push: [ installedUd ] }
        }),
        filled: Filled.createFilled(
          Option.mkSome({
            installedUd: installedUd,
            restUd: UD.create(diff),
          })
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
  room: {
    size: Size
    floor: Floor
    leftWall: Floor
  }
  constantMaterials: ConstantMaterials
  usedMaterial: {
    ud: number
  },
}

export namespace State {
  export function create(
    roomSize: Size,
    constantMaterials: ConstantMaterials,
  ): State {
    return {
      room: {
        size: roomSize,
        floor: Floor.create(roomSize.width),
        leftWall: Floor.create(roomSize.height),
      },
      constantMaterials,
      usedMaterial: {
        ud: 0
      },
    }
  }
}

export enum ModelType {
  "Start",
  "AddUDProfileToFloor",
  "AddUDProfileToLeftWall",
  "End"
}

export type Model =
  | UnionCase<ModelType.Start, () => Model>
  | UnionCase<ModelType.AddUDProfileToFloor, [Floor.AddUDProfileResult, () => Model]>
  | UnionCase<ModelType.AddUDProfileToLeftWall, [Floor.AddUDProfileResult, () => Model]>
  | UnionCase<ModelType.End, State>

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

  export function createAddUDProfileToLeftWall(
    result: Floor.AddUDProfileResult,
    next: () => Model
  ): Model {
    return UnionCase.mkUnionCase<
      ModelType.AddUDProfileToLeftWall,
      [Floor.AddUDProfileResult, () => Model]
    >(
      ModelType.AddUDProfileToLeftWall,
      [result, next],
    )
  }

  export function createEnd(state: State): Model {
    return UnionCase.mkUnionCase(ModelType.End, state)
  }

  export function fillFloorByUds(state: State): Model {
    const result = Floor.addUDProfile(
      state.room.floor,
      state.constantMaterials.ud
    )
    const updatedState = update(state, {
      room: {
        floor: {
          $set: result.updatedState
        }
      },
      usedMaterial: {
        ud: { $apply: current => current + 1 }
      },
    })
    return createAddUDProfileToFloor(
      result,
      () => {
        switch (result.filled.case) {
          case "NotFilledYet": {
            return fillFloorByUds(updatedState)
          }
          case "Filled": {
            return fillLeftWallByUds(updatedState)
          }
        }
      }
    )
  }

  export function fillLeftWallByUds(state: State): Model {
    const result = Floor.addUDProfile(
      state.room.leftWall,
      state.constantMaterials.ud
    )
    const updatedState = update(state, {
      room: {
        leftWall: {
          $set: result.updatedState
        }
      },
      usedMaterial: {
        ud: { $apply: current => current + 1 }
      },
    })
    return createAddUDProfileToLeftWall(
      result,
      () => {
        switch (result.filled.case) {
          case "NotFilledYet": {
            return fillLeftWallByUds(updatedState)
          }
          case "Filled": {
            return createEnd(updatedState)
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
