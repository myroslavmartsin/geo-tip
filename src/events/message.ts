import {
  McContainer,
  McCornerOffsets,
  McElementBounds,
  McElementRadii,
  McPositionOptions,
  McTooltipBounds,
  McWindow,
} from '../models';
import { McEvent, McEventType } from './events';

export interface McGetCoordsMessageData {
  tgBounds: McElementBounds;

  tlBounds: McTooltipBounds;

  options: McPositionOptions;

  cornerOffsets: McCornerOffsets;

  container: McContainer;

  window: McWindow;
}

export class McGetCoordsMessage implements McEvent {
  readonly type = McEventType.GET_AVAILABLE_COORDS;

  constructor(public data: McGetCoordsMessageData, public id: string) {}
}

export interface McGetSpacersBoundsData {
  tlBounds: McTooltipBounds;

  options: McPositionOptions;
}

export class McGetSpacersCoordsMessage implements McEvent {
  readonly type = McEventType.GET_SPACERS_BOUNDS;

  constructor(public data: McGetSpacersBoundsData, public id: string) {}
}

export interface McGetCornerOffsetsData {
  radii: McElementRadii;

  bounds: McElementBounds;
}

export class McGetCornerOffsetsMessage implements McEvent {
  readonly type = McEventType.GET_CORNER_OFFSETS;

  constructor(public data: McGetCornerOffsetsData, public id: string) {}
}
