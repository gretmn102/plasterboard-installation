import { Option, UnionCase, ArrayExt } from "@fering-org/functional-helper"
import update from "immutability-helper"

export const stepBetweenCds = 30

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

export type CD = { length: number }
export namespace CD {
  export function create(length: number): CD {
    return {
      length
    }
  }
}

export type Material =
  | UnionCase<MaterialType.UD, UD>
  | UnionCase<MaterialType.CD, CD>
  | UnionCase<MaterialType.Plasterboard, { width: number, height: number }>

export type Noun = {
  /** именительный: что? */
  nominative: string
  /** винительный: куда? */
  accusative: string
  /** предложный: где? */
  adpositional: string
}

export type RoomSideName = "floor" | "leftWall" | "ceiling" | "rightWall"
export namespace RoomSideName {
  export function toNoun(side: RoomSideName): Noun {
    switch (side) {
      case "ceiling":
        return {
          nominative: "потолок",
          accusative: "потолок",
          adpositional: "потолке",
        }
      case "floor":
        return {
          nominative: "пол",
          accusative: "пол",
          adpositional: "полу",
        }
      case "leftWall":
        return {
          nominative: "левая стена",
          accusative: "левую стену",
          adpositional: "левой стене",
        }
      case "rightWall":
        return {
          nominative: "правая стена",
          accusative: "правую стену",
          adpositional: "правой стене",
        }
    }
  }
}

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

export type FrontWall = {
  size: Size
  verticalCds: {
    pos: number
    cd: CD
  }[]
  horizontalCds: {
    pos: number
    cd: CD
  }[]
}
export namespace FrontWall {
  export function create(size: Size): FrontWall {
    return {
      size,
      verticalCds: [],
      horizontalCds: [],
    }
  }

  export type AddVerticalCdProfileResult =
    | UnionCase<"DoesNotFit">
    | UnionCase<"Ok", FrontWall>

  export function AddVerticalCdProfile(wall: FrontWall, cd: CD, step: number): AddVerticalCdProfileResult {
    const cds = wall.verticalCds

    const newPos = (() => {
      if (cds.length === 0) {
        return step
      }
      const lastCd = cds[cds.length - 1]
      const newPos = lastCd.pos + step
      return newPos
    })()

    const wallWidth = wall.size.width

    if (newPos > wallWidth) {
      return UnionCase.mkEmptyUnionCase("DoesNotFit")
    } else {
      return UnionCase.mkUnionCase("Ok",
        update(wall, {
          verticalCds: {
            $push: [{
              pos: newPos,
              cd: cd,
            }]
          }
        })
      )
    }
  }

  export type AddHorizontalCdProfileResult =
    | UnionCase<"DoesNotFit">
    | UnionCase<"Ok", FrontWall>

  export function AddHorizontalCdProfile(wall: FrontWall, cd: CD, step: number): AddHorizontalCdProfileResult {
    const cds = wall.horizontalCds

    const newPosY = (() => {
      if (cds.length === 0) {
        return step
      }
      const lastCd = cds[cds.length - 1]
      return lastCd.pos + step
    })()

    const wallHeight = wall.size.height

    if (newPosY > wallHeight) {
      return UnionCase.mkEmptyUnionCase("DoesNotFit")
    } else {
      return UnionCase.mkUnionCase("Ok",
        update(wall, {
          horizontalCds: {
            $push: [{
              pos: newPosY,
              cd: cd,
            }]
          }
        })
      )
    }
  }
}

export type ConstantMaterials = {
  ud: UD
  cd: CD
}

export type State = {
  room: {
    size: Size
    floor: RoomSide
    ceiling: RoomSide
    leftWall: RoomSide
    rightWall: RoomSide
    frontWall: FrontWall
  }
  constantMaterials: ConstantMaterials
  usedMaterial: {
    ud: number
    cd: number
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
        ceiling: RoomSide.create(roomSize.width),
        leftWall: RoomSide.create(roomSize.height),
        rightWall: RoomSide.create(roomSize.height),
        frontWall: FrontWall.create(roomSize),
      },
      constantMaterials,
      usedMaterial: {
        ud: 0,
        cd: 0,
      },
    }
  }
}

export enum ModelType {
  "Start",
  "AddUDProfileToFloor",
  "AddUDProfileToCeiling",
  "AddUDProfileToLeftWall",
  "AddUDProfileToRightWall",
  "AddVerticalCdProfile",
  "AddHorizontalCdProfile",
  "End"
}

export type Model =
  | UnionCase<ModelType.Start, () => Model>
  | UnionCase<ModelType.AddUDProfileToFloor, [RoomSide.AddUDProfileResult, () => Model]>
  | UnionCase<ModelType.AddUDProfileToLeftWall, [RoomSide.AddUDProfileResult, () => Model]>
  | UnionCase<ModelType.AddUDProfileToRightWall, [RoomSide.AddUDProfileResult, () => Model]>
  | UnionCase<ModelType.AddUDProfileToCeiling, [RoomSide.AddUDProfileResult, () => Model]>
  | UnionCase<ModelType.AddVerticalCdProfile, [FrontWall, () => Model]>
  | UnionCase<ModelType.AddHorizontalCdProfile, [FrontWall, () => Model]>
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

  export function createAddUDProfileToRightWall(
    result: RoomSide.AddUDProfileResult,
    next: () => Model
  ): Model {
    return UnionCase.mkUnionCase<
      ModelType.AddUDProfileToRightWall,
      [RoomSide.AddUDProfileResult, () => Model]
    >(
      ModelType.AddUDProfileToRightWall,
      [result, next],
    )
  }

  export function createAddUDProfileToCeiling(
    result: RoomSide.AddUDProfileResult,
    next: () => Model
  ): Model {
    return UnionCase.mkUnionCase<
      ModelType.AddUDProfileToCeiling,
      [RoomSide.AddUDProfileResult, () => Model]
    >(
      ModelType.AddUDProfileToCeiling,
      [result, next],
    )
  }

  export function createAddVerticalCdProfile(
    result: FrontWall,
    next: () => Model
  ): Model {
    return UnionCase.mkUnionCase<
      ModelType.AddVerticalCdProfile,
      [FrontWall, () => Model]
    >(
      ModelType.AddVerticalCdProfile,
      [result, next],
    )
  }

  export function createAddHorizontalCdProfile(
    result: FrontWall,
    next: () => Model
  ): Model {
    return UnionCase.mkUnionCase<
      ModelType.AddHorizontalCdProfile,
      [FrontWall, () => Model]
    >(
      ModelType.AddHorizontalCdProfile,
      [result, next],
    )
  }

  export function createEnd(state: State): Model {
    return UnionCase.mkUnionCase(ModelType.End, state)
  }

  export function fillRoomSideByUds(
    state: State,
    side: RoomSideName,
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
    const createAddUDProfile = (() => {
      switch (side) {
        case "floor":
          return createAddUDProfileToFloor
        case "leftWall":
          return createAddUDProfileToLeftWall
        case "rightWall":
          return createAddUDProfileToRightWall
        case "ceiling":
          return createAddUDProfileToCeiling
      }
    })()
    return createAddUDProfile(
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

  export function fillFrontWallByVerticalCds(
    state: State,
    next: (state: State) => Model,
  ): Model {
    const cd = state.constantMaterials.cd
    const result = FrontWall.AddVerticalCdProfile(state.room.frontWall, cd, stepBetweenCds)
    switch (result.case) {
      case "Ok":
        const updatedState = update(state, {
          room: {
            frontWall: { $set: result.fields }
          },
          usedMaterial: {
            cd: { $apply: count => count + 1 }
          },
        })
        return createAddVerticalCdProfile(result.fields, () =>
          fillFrontWallByVerticalCds(updatedState, next)
        )
      case "DoesNotFit":
        return next(state)
    }
  }

  export function fillFrontWallByHorizontalCds(
    state: State,
    next: (state: State) => Model,
  ): Model {
    const cd = state.constantMaterials.cd
    const result = FrontWall.AddHorizontalCdProfile(state.room.frontWall, cd, stepBetweenCds)
    switch (result.case) {
      case "Ok":
        const updatedState = update(state, {
          room: {
            frontWall: { $set: result.fields }
          },
          usedMaterial: {
            cd: { $apply: count => count + 1 }
          },
        })
        return createAddHorizontalCdProfile(result.fields, () =>
          fillFrontWallByHorizontalCds(updatedState, next)
        )
      case "DoesNotFit":
        return next(state)
    }
  }

  export function start(initState: State): Model {
    return createStart(() => (
      fillRoomSideByUds(initState, "floor", state => (
        fillRoomSideByUds(state, "leftWall", state => (
          fillRoomSideByUds(state, "ceiling", state => (
            fillRoomSideByUds(state, "rightWall", state => (
              fillFrontWallByVerticalCds(state, state => (
                fillFrontWallByHorizontalCds(state, createEnd)
              ))
            ))
          ))
        ))
      ))
    ))
  }

  export function simulateToEnd(model: Model): State {
    switch (model.case) {
      case ModelType.Start:
        return simulateToEnd(model.fields())
      case ModelType.AddUDProfileToFloor:
      case ModelType.AddUDProfileToCeiling:
      case ModelType.AddUDProfileToLeftWall:
      case ModelType.AddUDProfileToRightWall:
      case ModelType.AddVerticalCdProfile:
      case ModelType.AddHorizontalCdProfile: {
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
