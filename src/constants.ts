import { McCorner, McTooltipConfig } from './models';

export const TOOLTIP_ATTR = 'data-mc-tooltip';

export const TOOLTIP_POSITION_ATTR = 'data-mc-tooltip-position';

export const TOOLTIP_ALIGNMENT_ATTR = 'data-mc-tooltip-alignment';

export const TOOLTIP_OFFSET_X_ATTR = 'data-mc-tooltip-offset-x';

export const TOOLTIP_OFFSET_Y_ATTR = 'data-mc-tooltip-offset-y';

export const TOOLTIP_PANEL_CLASS_ATTR = 'data-mc-tooltip-panel-class';

export const TOOLTIP_CLASS_ATTR = 'data-mc-tooltip-class';

export const TOOLTIP_HIDE_DELAY_ATTR = 'data-mc-tooltip-hide-delay';

export const TOOLTIP_SHOW_DELAY_ATTR = 'data-mc-tooltip-show-delay';

export const TOOLTIP_CONTAINER_ATTR = 'data-mc-tooltip-container';

export const TOOLTIP_BEFORE_SPACER_CLASS = 'mc-before-spacer';

export const TOOLTIP_AFTER_SPACER_CLASS = 'mc-after-spacer';

export const TOOLTIP_CONTAINER_INSETS = 10;

export const DEFAULT_TOOLTIP_CONFIG: McTooltipConfig = {
  offsetX: 10,

  offsetY: 10,

  position: 'above',

  alignment: 'center',

  panelClass: ['mc-tooltip-panel'],

  tooltipClass: ['mc-tooltip'],

  hideDelay: 0,

  showDelay: 0,
};

export const POSITION_TO_CORNER_MAP: { [key: string]: McCorner } = {
  [`above:start`]: McCorner.TopLeft,
  [`above:end`]: McCorner.TopRight,
  [`before:start`]: McCorner.TopLeft,
  [`before:end`]: McCorner.BottomLeft,
  [`below:start`]: McCorner.BottomLeft,
  [`below:end`]: McCorner.BottomRight,
  [`after:start`]: McCorner.TopRight,
  [`after:end`]: McCorner.BottomRight,
};

export const MC_TOOLTIP_MANAGER_KEY = Symbol('MC_TOOLTIP_MANAGER');

export const MC_TOOLTIP_SHOW_ANIMATION_KEY = Symbol('MC_TOOLTIP_SHOW_ANIMATION_KEY');

export const MC_TOOLTIP_HIDE_ANIMATION_KEY = Symbol('MC_TOOLTIP_HIDE_ANIMATION_KEY');
