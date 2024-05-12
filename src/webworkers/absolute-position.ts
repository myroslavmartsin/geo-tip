import { TOOLTIP_CONTAINER_INSETS } from '../constants';
import { McGetCoordsMessageData } from '../events/message';
import { McContainer, McCoords, McXPositionSide, McYPositionSide } from '../models';

export function getAbsolutePositionCoords(config: McGetCoordsMessageData): McCoords {
  const container: McContainer = config.container;

  if (config.container.top < 0) container.top = TOOLTIP_CONTAINER_INSETS;

  if (config.container.left < 0) container.left = TOOLTIP_CONTAINER_INSETS;

  if (config.container.bottom > config.window.height)
    container.bottom = config.window.height - TOOLTIP_CONTAINER_INSETS;

  if (config.container.right > config.window.width) container.right = config.window.width - TOOLTIP_CONTAINER_INSETS;

  const middleOfTooltip = config.tlBounds.right - config.tlBounds.left;

  let x: number = config.tgBounds.left + (config.tgBounds.right - config.tgBounds.left - middleOfTooltip) / 2,
    y: number = config.window.height - config.tgBounds.top + config.tlBounds.offsetY,
    yPositionSide = McYPositionSide.bottom,
    xPositionSide = McXPositionSide.left;

  if (config.tlBounds.right - config.tlBounds.left >= container.right - container.left) {
    if (config.tlBounds.left <= 0) x = 0;
    else x = container.left + (container.right - container.left - middleOfTooltip) / 2;
  } else if (x < container.left) {
    x = container.left;

    xPositionSide = McXPositionSide.left;
  } else if (x + middleOfTooltip > container.right) {
    x = config.window.width - container.right;

    xPositionSide = McXPositionSide.right;
  }

  if (config.window.height - y - (config.tlBounds.bottom - config.tlBounds.top) < container.top) {
    y = container.top;

    yPositionSide = McYPositionSide.top;
  }

  return { x, y, xPositionSide, yPositionSide, options: { position: 'above', alignment: 'center' } };
}
