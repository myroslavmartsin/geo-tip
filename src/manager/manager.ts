import { McTooltip } from '../tooltip';
import { hideTooltip } from '../utils';
import { McTooltipManagerController } from './manager-controller';

export class McTooltipManager extends McTooltipManagerController {
  constructor(protected element: Element, protected tooltip: McTooltip, protected container: Element | null = null) {
    super(element, tooltip, container);

    this._handlePointerOver();
  }

  show(delay: number | null = null, done: () => void = () => {}): void {
    this._showTooltip(delay, done);
  }

  hide(delay: number | null = null, done: () => void = () => {}): void {
    this._hideTooltip(delay, done);
  }

  destroy(): void {
    this._isDestroyed = true;

    hideTooltip(this.tooltip);

    this._removeMouseOutListeners();

    this._cleanupTooltipPositionListeners();

    this.element.removeEventListener('mouseover', this._pointerOverHandler);
  }

  private _handlePointerOver(): void {
    const handler = () => {
      if (this._hidePanding) {
        this._hidePanding = false;

        return clearTimeout(this._hideTimeoutRef);
      }

      if (this._isRendered) return;

      this._wasPointerInBounds = true;

      this._showTooltip();
    };

    this.element.addEventListener('mouseover', handler);

    this._pointerOverHandler = handler;
  }
}
