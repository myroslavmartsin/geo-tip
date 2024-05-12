import { attach } from './attach';
import {
  TOOLTIP_ALIGNMENT_ATTR,
  TOOLTIP_ATTR,
  TOOLTIP_CLASS_ATTR,
  TOOLTIP_CONTAINER_ATTR,
  TOOLTIP_HIDE_DELAY_ATTR,
  TOOLTIP_OFFSET_X_ATTR,
  TOOLTIP_OFFSET_Y_ATTR,
  TOOLTIP_PANEL_CLASS_ATTR,
  TOOLTIP_POSITION_ATTR,
  TOOLTIP_SHOW_DELAY_ATTR,
} from './constants';
import { McAttachToOptions, McTooltipOptions, TooltipAlignment, TooltipPosition } from './models';
import { McTooltip, createTooltip } from './tooltip';

window.addEventListener('load', () => {
  const targets: NodeListOf<Element> | null = document.querySelectorAll(`[${TOOLTIP_ATTR}]`);

  for (const target of targets) {
    if (target) {
      const attachOptions: McAttachToOptions = {};

      const message: string = target.getAttribute(TOOLTIP_ATTR);

      const tlOptions: McTooltipOptions = parseTooltipOptions(target);

      if (target.hasAttribute(TOOLTIP_CONTAINER_ATTR)) {
        attachOptions.container = target.getAttribute(TOOLTIP_CONTAINER_ATTR);
      }

      const tooltip: McTooltip = createTooltip(message, tlOptions);

      attach(target, tooltip, attachOptions);
    }
  }
});

function parseTooltipOptions(element: Element): McTooltipOptions {
  const options: McTooltipOptions = {};

  if (element.hasAttribute(TOOLTIP_POSITION_ATTR)) {
    options.position = element.getAttribute(TOOLTIP_POSITION_ATTR) as TooltipPosition;
  }

  if (element.hasAttribute(TOOLTIP_ALIGNMENT_ATTR)) {
    options.alignment = element.getAttribute(TOOLTIP_ALIGNMENT_ATTR) as TooltipAlignment;
  }

  if (element.hasAttribute(TOOLTIP_OFFSET_X_ATTR)) {
    options.offsetX = parseInt(element.getAttribute(TOOLTIP_OFFSET_X_ATTR));
  }

  if (element.hasAttribute(TOOLTIP_OFFSET_Y_ATTR)) {
    options.offsetY = parseInt(element.getAttribute(TOOLTIP_OFFSET_Y_ATTR));
  }

  if (element.hasAttribute(TOOLTIP_PANEL_CLASS_ATTR)) {
    options.panelClass = element.getAttribute(TOOLTIP_PANEL_CLASS_ATTR).split(',');
  }

  if (element.hasAttribute(TOOLTIP_CLASS_ATTR)) {
    options.tooltipClass = element.getAttribute(TOOLTIP_CLASS_ATTR).split(',');
  }

  if (element.hasAttribute(TOOLTIP_HIDE_DELAY_ATTR)) {
    options.hideDelay = parseInt(element.getAttribute(TOOLTIP_HIDE_DELAY_ATTR));
  }

  if (element.hasAttribute(TOOLTIP_SHOW_DELAY_ATTR)) {
    options.showDelay = parseInt(element.getAttribute(TOOLTIP_SHOW_DELAY_ATTR));
  }

  return options;
}
