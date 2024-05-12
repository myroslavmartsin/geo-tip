import { McEvent, McEventType } from '../events/events';
import { McGetCornerOffsetsData } from '../events/message';
import { McGetCornerOffsetsResponse } from '../events/response';
import { McCorner, McCornerOffsets, McElementBounds, McPoint } from '../models';

const DEFAULT_CORNER_OFFSETS: McCornerOffsets = {
  [McCorner.TopLeft]: { x: 0, y: 0 },
  [McCorner.TopRight]: { x: 0, y: 0 },
  [McCorner.BottomLeft]: { x: 0, y: 0 },
  [McCorner.BottomRight]: { x: 0, y: 0 },
};

interface PixelRadiusValues {
  rx: number;

  ry: number;
}

function getCornerOffsets(data: McGetCornerOffsetsData): McCornerOffsets {
  const cornerOffsets: McCornerOffsets = { ...DEFAULT_CORNER_OFFSETS };

  for (const corner in data.radii) {
    cornerOffsets[corner] = getOffsets(data.bounds, data.radii[corner]);
  }

  return cornerOffsets;
}

function getOffsets(bounds: McElementBounds, cssValue: string): McPoint {
  const { rx, ry }: PixelRadiusValues = getPixelRadiusValues(bounds, cssValue);

  const angle = Math.PI / 4;

  const x = rx - rx * Math.cos(angle);

  const y = ry - ry * Math.sin(angle);

  return { x: parseFloat(x.toFixed(2)), y: parseFloat(y.toFixed(2)) };
}

function getPixelRadiusValues(bounds: McElementBounds, cssValue: string): PixelRadiusValues {
  const { unit, value } = parseUnitValue(cssValue);

  if (unit === '%') return convertPercentsToPixels(bounds, value);

  return { rx: value, ry: value };
}

export function parseUnitValue(cssValue: string): { unit: string; value: number } {
  const match = cssValue.match(/^(\d+(\.\d+)?)(px|em|rem|vh|vw|in|cm|mm|pt|%)$/);

  return { value: parseFloat(match[1]), unit: match[3] };
}

function convertPercentsToPixels(bounds: McElementBounds, percent: number): PixelRadiusValues {
  const radiusDecimal = percent / 100;

  const rx = (bounds.right - bounds.left) * radiusDecimal;

  const ry = (bounds.bottom - bounds.top) * radiusDecimal;

  return { rx, ry };
}

// Message Handlers
onmessage = (event: MessageEvent<McEvent>) => {
  const message: McEvent = event.data;

  if (message.type === McEventType.GET_CORNER_OFFSETS) {
    const cornerOffsets: McCornerOffsets = getCornerOffsets(message.data);

    postMessage(new McGetCornerOffsetsResponse(cornerOffsets, message.id));
  }
};
