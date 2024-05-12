import {
  DEFAULT_TOOLTIP_CONFIG,
  MC_TOOLTIP_HIDE_ANIMATION_KEY,
  MC_TOOLTIP_SHOW_ANIMATION_KEY,
  POSITION_TO_CORNER_MAP,
} from './constants';
import {
  McCoords,
  McCorner,
  McElementRadii,
  McPositionOptions,
  McSpacersBounds,
  McTooltipBounds,
  McTooltipConfig,
  McTooltipOptions,
  TooltipAlignment,
  TooltipPosition,
} from './models';
import { McTooltip } from './tooltip';

export function newId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

export function makeConfig(options: McTooltipOptions): McTooltipConfig {
  const config: McTooltipConfig = { ...DEFAULT_TOOLTIP_CONFIG };

  for (const prop in config) {
    if (prop in options) {
      if (config[prop] instanceof Array) {
        config[prop] = [config[prop], ...options[prop]];
      } else {
        config[prop] = options[prop];
      }
    }
  }

  return config;
}

export function measureBeforeRender(tooltip: McTooltip): McTooltipBounds {
  if (document.body.contains(tooltip.element)) {
    resetPositionStyles(tooltip.element);

    document.body.removeChild(tooltip.element);
  }

  tooltip.element.style.top = '0';

  tooltip.element.style.left = '0';

  tooltip.element.style.visibility = 'hidden';

  document.body.appendChild(tooltip.element);

  const dimensions: McTooltipBounds = tooltip.bounds;

  tooltip.element.style.removeProperty('visibility');

  document.body.removeChild(tooltip.element);

  tooltip.element.style.top = null;

  tooltip.element.style.left = null;

  return dimensions;
}

export function updateSpacersPosition(tooltip: McTooltip, bounds: McSpacersBounds): void {
  resetSpacersPosition(tooltip);

  if (bounds.after) {
    tooltip.afterElement.style.top = bounds.after.top + 'px';
    tooltip.afterElement.style.bottom = bounds.after.bottom + 'px';
    tooltip.afterElement.style.left = bounds.after.left + 'px';
    tooltip.afterElement.style.right = bounds.after.right + 'px';
  }

  if (bounds.before) {
    tooltip.beforeElement.style.top = bounds.before.top + 'px';
    tooltip.beforeElement.style.bottom = bounds.before.bottom + 'px';
    tooltip.beforeElement.style.left = bounds.before.left + 'px';
    tooltip.beforeElement.style.right = bounds.before.right + 'px';
  }
}

export function resetSpacersPosition(tooltip: McTooltip): void {
  resetSpacerPositionStyles(tooltip.afterElement);

  resetSpacerPositionStyles(tooltip.beforeElement);
}

export function updatePosition(tooltip: McTooltip, coords: McCoords, animate: boolean = false): void {
  resetPositionStyles(tooltip.element);

  tooltip.element.style[coords.xPositionSide] = coords.x + 'px';

  tooltip.element.style[coords.yPositionSide] = coords.y + 'px';

  if (animate) {
    tooltip.contentElement.style.transformOrigin = getTransformOrigin(coords.options);

    tooltip.contentElement[MC_TOOLTIP_HIDE_ANIMATION_KEY].cancel();

    tooltip.contentElement[MC_TOOLTIP_SHOW_ANIMATION_KEY].play();
  }
}

export function renderTooltip(tooltip: McTooltip, coords: McCoords): void {
  resetPositionStyles(tooltip.element);

  tooltip.element.style[coords.xPositionSide] = coords.x + 'px';

  tooltip.element.style[coords.yPositionSide] = coords.y + 'px';

  if (!document.body.contains(tooltip.element)) {
    document.body.appendChild(tooltip.element);
  }

  tooltip.contentElement.style.transformOrigin = getTransformOrigin(coords.options);

  tooltip.contentElement[MC_TOOLTIP_HIDE_ANIMATION_KEY].cancel();

  tooltip.contentElement[MC_TOOLTIP_SHOW_ANIMATION_KEY].play();
}

export function hideTooltip(tooltip: McTooltip): void {
  tooltip.contentElement[MC_TOOLTIP_SHOW_ANIMATION_KEY].cancel();

  tooltip.contentElement[MC_TOOLTIP_HIDE_ANIMATION_KEY].play();

  tooltip.contentElement[MC_TOOLTIP_HIDE_ANIMATION_KEY].onfinish = () => removeTooltip(tooltip);
}

export function removeTooltip(tooltip: McTooltip): void {
  resetPositionStyles(tooltip.element);

  if (document.body.contains(tooltip.element)) {
    document.body.removeChild(tooltip.element);
  }
}

export function getElementRadii(element: Element): McElementRadii {
  const computedStyle: CSSStyleDeclaration = window.getComputedStyle(element);

  return {
    [McCorner.TopLeft]: computedStyle.getPropertyValue('border-top-left-radius'),
    [McCorner.TopRight]: computedStyle.getPropertyValue('border-top-right-radius'),
    [McCorner.BottomLeft]: computedStyle.getPropertyValue('border-bottom-left-radius'),
    [McCorner.BottomRight]: computedStyle.getPropertyValue('border-bottom-right-radius'),
  };
}

function getTransformOrigin(options: McPositionOptions): string {
  if (options.alignment === 'start' || options.position === 'before') return 'right center';

  if (options.alignment === 'end' || options.position === 'after') return 'left center';

  if (options.position === 'above') return 'bottom center';

  return 'top center';
}

export function getCorner(position: TooltipPosition, alignment: TooltipAlignment): McCorner {
  return POSITION_TO_CORNER_MAP[`${position}:${alignment}`];
}

function resetPositionStyles(element: HTMLElement): void {
  element.style.removeProperty('top');
  element.style.removeProperty('right');
  element.style.removeProperty('bottom');
  element.style.removeProperty('left');
}

function resetSpacerPositionStyles(element: HTMLElement): void {
  element.style.removeProperty('top');
  element.style.removeProperty('right');
  element.style.removeProperty('bottom');
  element.style.removeProperty('left');
}
