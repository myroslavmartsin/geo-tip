import {
  MC_TOOLTIP_SHOW_ANIMATION_KEY,
  MC_TOOLTIP_HIDE_ANIMATION_KEY,
  TOOLTIP_BEFORE_SPACER_CLASS,
  TOOLTIP_AFTER_SPACER_CLASS,
} from './constants';
import { McPositionOptions, McTooltipBounds, McTooltipConfig, McTooltipOptions } from './models';
import { makeConfig, removeTooltip } from './utils';

export class McTooltip {
  private _panel: HTMLElement;

  private _beforeElement: HTMLElement;

  private _afterElement: HTMLElement;

  private _content: HTMLElement;

  private _panelElements: Set<Element> = new Set();

  constructor(private message: string, private config: McTooltipConfig) {
    this._create();

    this._createAnimations();
  }

  get bounds(): McTooltipBounds {
    const rect: DOMRect = this._panel.getBoundingClientRect();

    return {
      top: rect.top,
      right: rect.right,
      bottom: rect.bottom,
      left: rect.left,
      offsetX: this.config.offsetX,
      offsetY: this.config.offsetY,
    };
  }

  get element(): HTMLElement {
    return this._panel;
  }

  get beforeElement(): HTMLElement {
    return this._beforeElement;
  }

  get afterElement(): HTMLElement {
    return this._afterElement;
  }

  get contentElement(): HTMLElement {
    return this._content;
  }

  get positionOptions(): McPositionOptions {
    return { position: this.config.position, alignment: this.config.alignment };
  }

  get hideDelay(): number {
    return this.config.hideDelay;
  }

  get showDelay(): number {
    return this.config.showDelay;
  }

  _containsElement(element: Element): boolean {
    return this._panelElements.has(element) || this._panel.contains(element);
  }

  private _createAnimations(): void {
    const showEffect = new KeyframeEffect(
      this._content,
      [
        { transform: 'scale(0.75)', opacity: 0 },
        { transform: 'scale(1)', opacity: 1 },
      ],
      { duration: 150, easing: 'cubic-bezier(0, 0, 0.2, 1)', fill: 'forwards' }
    );

    this.contentElement[MC_TOOLTIP_SHOW_ANIMATION_KEY] = new Animation(showEffect, document.timeline);

    const hideEffect = new KeyframeEffect(
      this._content,
      [
        { transform: 'scale(1)', opacity: 1 },
        { transform: 'scale(0.75)', opacity: 0 },
      ],
      { duration: 150, easing: 'cubic-bezier(0, 0, 0.2, 1)', fill: 'forwards' }
    );

    this.contentElement[MC_TOOLTIP_HIDE_ANIMATION_KEY] = new Animation(hideEffect, document.timeline);
  }

  private _create(): void {
    this._panel = this._createPanelElement();

    this._content = this._createContentElement();

    const arrow: HTMLElement = this._createArrowElement();

    this._panel.appendChild(this._content);

    this._panel.appendChild(arrow);
  }

  private _createPanelElement(): HTMLElement {
    const tooltipElement: HTMLElement = document.createElement('div');

    this._panelElements.add(tooltipElement);

    this.config.panelClass.forEach((className: string) => {
      tooltipElement.classList.add(className);
    });

    const beforeSpacer = document.createElement('div');

    beforeSpacer.classList.add(TOOLTIP_BEFORE_SPACER_CLASS);

    this._panelElements.add(beforeSpacer);

    this._beforeElement = beforeSpacer;

    const afterSpacer = document.createElement('div');

    afterSpacer.classList.add(TOOLTIP_AFTER_SPACER_CLASS);

    this._panelElements.add(afterSpacer);

    this._afterElement = afterSpacer;

    tooltipElement.appendChild(beforeSpacer);

    tooltipElement.appendChild(afterSpacer);

    return tooltipElement;
  }

  private _createContentElement(): HTMLElement {
    const contentElement: HTMLElement = document.createElement('div');

    this.config.tooltipClass.forEach((className: string) => {
      contentElement.classList.add(className);
    });

    contentElement.innerHTML = this.message;

    return contentElement;
  }

  private _createArrowElement(): HTMLElement {
    const arrowElement: HTMLElement = document.createElement('div');

    return arrowElement;
  }
}

export function createTooltip(message: string, options: McTooltipOptions = {}): McTooltip {
  const config: McTooltipConfig = makeConfig(options);

  return new McTooltip(message, config);
}
