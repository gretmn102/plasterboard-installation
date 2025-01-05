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

export type RoomSide = {
  uds: UD[]
  length: number
}
export namespace RoomSide {
  export function create(length: number): RoomSide {
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
    updatedState: RoomSide
    filled: Filled
  }

  export function addUDProfile(floor: RoomSide, ud: UD): AddUDProfileResult {
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
    floor: RoomSide
    leftWall: RoomSide
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
        floor: RoomSide.create(roomSize.width),
        leftWall: RoomSide.create(roomSize.height),
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
  | UnionCase<ModelType.AddUDProfileToFloor, [RoomSide.AddUDProfileResult, () => Model]>
  | UnionCase<ModelType.AddUDProfileToLeftWall, [RoomSide.AddUDProfileResult, () => Model]>
  | UnionCase<ModelType.End, State>

export namespace Model {
  export function createStart(next: () => Model): Model {
    return UnionCase.mkUnionCase(ModelType.Start, next)
  }

  export function createAddUDProfileToFloor(
    result: RoomSide.AddUDProfileResult,
    next: () => Model
  ): Model {
    return UnionCase.mkUnionCase<
      ModelType.AddUDProfileToFloor,
      [RoomSide.AddUDProfileResult, () => Model]
    >(
      ModelType.AddUDProfileToFloor,
      [result, next],
    )
  }

  export function createAddUDProfileToLeftWall(
    result: RoomSide.AddUDProfileResult,
    next: () => Model
  ): Model {
    return UnionCase.mkUnionCase<
      ModelType.AddUDProfileToLeftWall,
      [RoomSide.AddUDProfileResult, () => Model]
    >(
      ModelType.AddUDProfileToLeftWall,
      [result, next],
    )
  }

  export function createEnd(state: State): Model {
    return UnionCase.mkUnionCase(ModelType.End, state)
  }

  export function fillRoomSideByUds(
    state: State,
    side: "floor" | "leftWall",
    next: (state: State) => Model,
  ): Model {
    const result = RoomSide.addUDProfile(
      state.room[side],
      state.constantMaterials.ud
    )
    const updatedState = update(state, {
      room: {
        [side]: {
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
            return fillRoomSideByUds(updatedState, side, next)
          }
          case "Filled": {
            return next(updatedState)
          }
        }
      }
    )
  }

  export function start(initState: State): Model {
    return createStart(() => (
      fillRoomSideByUds(initState, "floor", state => (
        fillRoomSideByUds(state, "leftWall", createEnd)
      ))
    ))
  }

  export function simulateToEnd(model: Model): State {
    switch (model.case) {
      case ModelType.Start:
        return simulateToEnd(model.fields())
      case ModelType.AddUDProfileToFloor: {
        const [_, next] = model.fields
        return simulateToEnd(next())
      }
      case ModelType.AddUDProfileToLeftWall: {
        const [_, next] = model.fields
        return simulateToEnd(next())
      }
      case ModelType.End: {
        const state = model.fields
        return state
      }
    }
  }
}
