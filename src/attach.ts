import { MC_TOOLTIP_MANAGER_KEY } from './constants';
import { McTooltipManager } from './manager/manager';
import { McAttachToOptions } from './models';
import { McTooltip } from './tooltip';

export function attach(element: Element, tooltip: McTooltip, options: McAttachToOptions = {}): void {
  if (element[MC_TOOLTIP_MANAGER_KEY]) {
    throw new Error('McTooltip is already attached to this element');
  }

  let container: Element | null = null;

  if (options.container) {
    container = parseContainer(options.container);
  }

  const manager: McTooltipManager = new McTooltipManager(element, tooltip, container);

  element[MC_TOOLTIP_MANAGER_KEY] = manager;
}

export function detach(element: Element): void {
  if (!element[MC_TOOLTIP_MANAGER_KEY]) return;

  const manager: McTooltipManager = element[MC_TOOLTIP_MANAGER_KEY];

  delete element[MC_TOOLTIP_MANAGER_KEY];

  manager.destroy();
}

export function retrieveTooltipManager(element: Element): McTooltipManager | null {
  return element[MC_TOOLTIP_MANAGER_KEY] || null;
}

function parseContainer(container: Element | string): Element | null {
  if (container instanceof Element) return container;

  const element: Element | null = document.querySelector(container);

  if (element instanceof Element) return element;

  throw new Error(`No container found with selector ${container}`);
}
