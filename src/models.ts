export type TooltipPosition = 'above' | 'after' | 'below' | 'before';

export type TooltipAlignment = 'start' | 'center' | 'end';

export enum McXPositionSide {
  left = 'left',

  right = 'right',
}

export enum McYPositionSide {
  top = 'top',

  bottom = 'bottom',
}

export interface McPoint {
  x: number;

  y: number;
}

export enum McCorner {
  TopLeft = 'TopLeft',
  TopRight = 'TopRight',
  BottomLeft = 'BottomLeft',
  BottomRight = 'BottomRight',
}

export type McCornerOffsets = { [key in McCorner]: McPoint };

export type McElementRadii = { [key in McCorner]: string };

export interface McCoords extends McPoint {
  xPositionSide: McXPositionSide;

  yPositionSide: McYPositionSide;

  options: McPositionOptions;
}

export interface McSpacersBounds {
  before?: McElementBounds;

  after?: McElementBounds;
}

export interface McPositionOptions {
  position: TooltipPosition;

  alignment: TooltipAlignment;
}

export interface McCanRenderConfig {
  coords: McCoords;

  tlBounds: McTooltipBounds;

  options: McPositionOptions;

  container: McContainer;

  window: McWindow;
}

export interface McElementBounds {
  top: number;

  right: number;

  bottom: number;

  left: number;
}

export interface McContainer extends McElementBounds {}

export interface McWindow {
  width: number;

  height: number;
}

export type McOverflow = Record<keyof McElementBounds, boolean>;

export interface McCanRenderOutput extends Record<keyof McPositionOptions, boolean> {
  overflow: McOverflow;
}

export interface McTooltipBounds extends McElementBounds {
  offsetX: number;

  offsetY: number;
}

export interface McTooltipOptions extends Partial<McPositionOptions> {
  offsetX?: number;

  offsetY?: number;

  panelClass?: string[];

  tooltipClass?: string[];

  hideDelay?: number;

  showDelay?: number;
}

export interface McAttachToOptions {
  container?: Element | string;
}

export interface McTooltipConfig extends Required<McTooltipOptions> {}
