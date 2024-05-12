import { McGetCoordsMessageData } from '../events/message';
import { McCoords, McCorner, McCornerOffsets, McXPositionSide, McYPositionSide } from '../models';
import { getCorner } from '../utils';

export function getPositionCoords(config: McGetCoordsMessageData): McCoords {
  if (config.options.position === 'above') {
    return getAbovePositionCoords(config);
  } else if (config.options.position === 'after') {
    return getAfterPositionCoords(config);
  } else if (config.options.position === 'below') {
    return getBelowPositionCoords(config);
  }

  return getBeforePositionCoords(config);
}

function getAbovePositionCoords(config: McGetCoordsMessageData): McCoords {
  let x: number = alignHorizontally(config),
    y: number = config.window.height - config.tgBounds.top + config.tlBounds.offsetY;

  let xPositionSide: McXPositionSide =
      config.options.alignment === 'start' ? McXPositionSide.right : McXPositionSide.left,
    yPositionSide: McYPositionSide = McYPositionSide.bottom;

  return adjustCoords({ x, y, xPositionSide, yPositionSide, options: config.options }, config.cornerOffsets);
}

function getAfterPositionCoords(config: McGetCoordsMessageData): McCoords {
  let x: number = config.tgBounds.right + config.tlBounds.offsetX,
    y: number = alignVertically(config);

  let xPositionSide: McXPositionSide = McXPositionSide.left,
    yPositionSide: McYPositionSide =
      config.options.alignment === 'start' ? McYPositionSide.bottom : McYPositionSide.top;

  return adjustCoords({ x, y, xPositionSide, yPositionSide, options: config.options }, config.cornerOffsets);
}

function getBelowPositionCoords(config: McGetCoordsMessageData): McCoords {
  let x: number = alignHorizontally(config),
    y: number = config.tgBounds.bottom + config.tlBounds.offsetY;

  let xPositionSide: McXPositionSide =
      config.options.alignment === 'start' ? McXPositionSide.right : McXPositionSide.left,
    yPositionSide: McYPositionSide = McYPositionSide.top;

  return adjustCoords({ x, y, xPositionSide, yPositionSide, options: config.options }, config.cornerOffsets);
}

function getBeforePositionCoords(config: McGetCoordsMessageData): McCoords {
  let x: number = config.window.width - config.tgBounds.left + config.tlBounds.offsetX,
    y: number = alignVertically(config);

  let xPositionSide: McXPositionSide = McXPositionSide.right,
    yPositionSide: McYPositionSide =
      config.options.alignment === 'start' ? McYPositionSide.bottom : McYPositionSide.top;

  return adjustCoords({ x, y, xPositionSide, yPositionSide, options: config.options }, config.cornerOffsets);
}

function alignHorizontally(config: McGetCoordsMessageData): number {
  if (config.options.alignment === 'start') {
    return config.window.width - config.tgBounds.left + config.tlBounds.offsetX;
  } else if (config.options.alignment === 'center') {
    return (
      config.tgBounds.left +
      (config.tgBounds.right - config.tgBounds.left - (config.tlBounds.right - config.tlBounds.left)) / 2
    );
  }

  return config.tgBounds.right + config.tlBounds.offsetX;
}

function alignVertically(config: McGetCoordsMessageData): number {
  if (config.options.alignment === 'start') {
    return config.window.height - config.tgBounds.top + config.tlBounds.offsetY;
  } else if (config.options.alignment === 'center') {
    return (
      config.tgBounds.top +
      (config.tgBounds.bottom - config.tgBounds.top - (config.tlBounds.bottom - config.tlBounds.top)) / 2
    );
  }

  return config.tgBounds.bottom + config.tlBounds.offsetY;
}

function adjustCoords(coords: McCoords, cornerOffsets: McCornerOffsets): McCoords {
  if (coords.options.alignment !== 'center') {
    const corner: McCorner = getCorner(coords.options.position, coords.options.alignment);

    coords.y -= cornerOffsets[corner].y;

    coords.x -= cornerOffsets[corner].x;
  }

  return coords;
}
