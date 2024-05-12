import { McCoords, McCornerOffsets, McSpacersBounds } from '../models';
import { McEvent, McEventType } from './events';

// Get Coords
export class McGetCoordsResponse implements McEvent {
  readonly type = McEventType.GET_AVAILABLE_COORDS;

  constructor(public data: McCoords | null, public id: string) {}
}

// Get Spacers Bounds
export class McGetSpacersBoundsResponse implements McEvent {
  readonly type = McEventType.GET_SPACERS_BOUNDS;

  constructor(public data: McSpacersBounds, public id: string) {}
}

// Is Cursor Within Bounds
export class McGetCornerOffsetsResponse implements McEvent {
  readonly type = McEventType.GET_CORNER_OFFSETS;

  constructor(public data: McCornerOffsets, public id: string) {}
}
