import { McEvent, McEventType } from '../events/events';
import { McGetCoordsMessage, McGetCoordsMessageData } from '../events/message';
import { McGetCoordsResponse } from '../events/response';
import {
  McOverflow,
  McCanRenderOutput,
  McContainer,
  McCoords,
  McElementBounds,
  McPositionOptions,
  McTooltipBounds,
  McXPositionSide,
  McYPositionSide,
  TooltipPosition,
  McWindow,
  McCanRenderConfig,
  TooltipAlignment,
} from '../models';
import { getAbsolutePositionCoords } from './absolute-position';
import { getPositionCoords } from './position-by-coords';

const NEXT_AXIS: Map<TooltipPosition, TooltipPosition> = new Map([
  ['above', 'before'],
  ['below', 'before'],
  ['before', 'above'],
  ['after', 'above'],
]);

const NEXT_POSITION: Map<TooltipPosition, TooltipPosition> = new Map([
  ['above', 'below'],
  ['below', 'above'],
  ['before', 'after'],
  ['after', 'before'],
]);

class AvailablePoints {
  positions: Set<TooltipPosition> = new Set(['above', 'below', 'after', 'before']);

  xAlignment: Set<TooltipAlignment> = new Set(['start', 'center', 'end']);

  yAlignment: Set<TooltipAlignment> = new Set(['start', 'center', 'end']);

  positionToAxis: { [key in TooltipPosition]: Set<TooltipAlignment> } = {
    above: this.xAlignment,
    below: this.xAlignment,
    before: this.yAlignment,
    after: this.yAlignment,
  };

  positionToPerpAxis: { [key in TooltipPosition]: Set<TooltipAlignment> } = {
    above: this.yAlignment,
    below: this.yAlignment,
    before: this.xAlignment,
    after: this.xAlignment,
  };

  positionToPerpAxisAlignment: { [key in TooltipPosition]: TooltipAlignment } = {
    above: 'start',
    below: 'end',
    before: 'start',
    after: 'end',
  };

  alignmentToPerpPosition: {
    [key in TooltipPosition]: { [key in Exclude<TooltipAlignment, 'center'>]: TooltipPosition };
  } = {
    above: { start: 'before', end: 'after' },
    below: { start: 'before', end: 'after' },
    before: { start: 'above', end: 'below' },
    after: { start: 'above', end: 'below' },
  };

  excludePositionsOption(position: TooltipPosition): void {
    this.positions.delete(position);

    this.positionToPerpAxis[position].delete(this.positionToPerpAxisAlignment[position]);
  }

  excludeAlignmentOption(position: TooltipPosition, alignment: TooltipAlignment): void {
    this.positionToAxis[position].delete(alignment);

    if (alignment === 'center') return;

    this.positions.delete(this.alignmentToPerpPosition[position][alignment]);
  }
}

function nextAlignment(alignment: TooltipAlignment, available: Set<TooltipAlignment>): TooltipAlignment {
  if (alignment === 'start' || alignment === 'end') return 'center';

  if (available.has('start')) return 'start';

  if (available.has('end')) return 'end';
}

function prepareContainer(container: McContainer): void {
  container.top += 10;
  container.left += 10;
  container.right -= 10;
  container.bottom -= 10;
}

function getAvailableCoords(config: McGetCoordsMessageData): McCoords {
  const points = new AvailablePoints();

  prepareContainer(config.container);

  let coords: McCoords,
    pOptions: McPositionOptions = { ...config.options };

  const makeCanRenderConfig = (): McCanRenderConfig => {
    return { coords, tlBounds: config.tlBounds, container: config.container, window: config.window, options: pOptions };
  };

  let crOutput: McCanRenderOutput = { position: false, alignment: false, overflow: null };

  while ((!crOutput.position || !crOutput.alignment) && points.positions.size > 0) {
    coords = getPositionCoords({ ...config, options: pOptions });

    crOutput = canRender(makeCanRenderConfig());

    if (crOutput.position && crOutput.alignment) return coords;

    if (!points.xAlignment.size || !points.yAlignment.size) break;

    if (!crOutput.position) points.excludePositionsOption(pOptions.position);

    if (!crOutput.alignment) points.excludeAlignmentOption(pOptions.position, pOptions.alignment);

    pOptions = getNextPositionRegardingCrOutput(pOptions, crOutput, points);
  }

  return getAbsolutePositionCoords(config);
}

// Get Next Position
function getNextPositionRegardingCrOutput(
  options: McPositionOptions,
  crOutput: McCanRenderOutput,
  points: AvailablePoints
): McPositionOptions {
  if (!crOutput.position) {
    let position = NEXT_POSITION.get(options.position);

    if (!points.positions.has(position)) {
      position = NEXT_AXIS.get(position);
    }

    return { position, alignment: options.alignment };
  }

  const axis = points.positionToAxis[options.position];

  return { position: options.position, alignment: nextAlignment(options.alignment, axis) };
}

// Can Render
function canRender(config: McCanRenderConfig): McCanRenderOutput {
  const bounds: McElementBounds = resolveBoundsFromCoords(config.tlBounds, config.coords, config.window);

  const hAvailablility: Pick<McOverflow, 'left' | 'right'> = canRenderHorizontally(bounds, config.container);

  const vAvailablility: Pick<McOverflow, 'top' | 'bottom'> = canRenderVertically(bounds, config.container);

  const output: McCanRenderOutput = {
    position: vAvailablility.top && vAvailablility.bottom,
    alignment: hAvailablility.left && hAvailablility.right,
    overflow: { ...hAvailablility, ...vAvailablility },
  };

  if (config.options.position === 'before' || config.options.position === 'after') {
    output.position = hAvailablility.left && hAvailablility.right;

    output.alignment = vAvailablility.top && vAvailablility.bottom;
  }

  return output;
}

function resolveBoundsFromCoords(tlBounds: McTooltipBounds, coords: McCoords, window: McWindow): McElementBounds {
  const bounds: McElementBounds = {
    top: coords.y,
    right: coords.x + (tlBounds.right - tlBounds.left),
    bottom: coords.y + (tlBounds.bottom - tlBounds.top),
    left: coords.x,
  };

  if (coords.xPositionSide === McXPositionSide.right) {
    bounds.right = window.width - coords.x;
    bounds.left = window.width - coords.x - (tlBounds.right - tlBounds.left);
  }

  if (coords.yPositionSide === McYPositionSide.bottom) {
    bounds.top = window.height - coords.y - (tlBounds.bottom - tlBounds.top);
    bounds.bottom = window.height - coords.y;
  }

  return bounds;
}

function canRenderHorizontally(bounds: McElementBounds, container: McContainer): Pick<McOverflow, 'left' | 'right'> {
  const width: number = container.right;

  return { left: bounds.left >= container.left, right: bounds.right <= width };
}

function canRenderVertically(bounds: McElementBounds, container: McContainer): Pick<McOverflow, 'top' | 'bottom'> {
  const height: number = container.bottom;

  return { top: bounds.top >= container.top, bottom: bounds.bottom <= height };
}

// Visibility Validation
function isVisible(config: McGetCoordsMessageData): boolean {
  if (config.container.top > config.tgBounds.bottom) return false;

  if (config.container.bottom < config.tgBounds.top) return false;

  if (config.container.left > config.tgBounds.right) return false;

  if (config.container.right < config.tgBounds.left) return false;

  return true;
}

// Message Handlers
onmessage = (event: MessageEvent<McEvent>) => {
  const message: McEvent = event.data;

  if (message.type === McEventType.GET_AVAILABLE_COORDS) {
    handleGetCoordsMessage(message as McGetCoordsMessage);
  }
};

function handleGetCoordsMessage(message: McGetCoordsMessage): void {
  let coords: McCoords = null;

  if (isVisible(message.data)) {
    coords = getAvailableCoords(message.data);
  }

  postMessage(new McGetCoordsResponse(coords, message.id));
}
