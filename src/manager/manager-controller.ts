import { McTooltipBounds, McCornerOffsets, McCoords } from '../models';
import { McTooltip } from '../tooltip';
import { hideTooltip, measureBeforeRender, renderTooltip, updatePosition } from '../utils';
import { McTooltipManagerBase } from './manager-base';

export class McTooltipManagerController extends McTooltipManagerBase {
  constructor(protected element: Element, protected tooltip: McTooltip, protected container: Element | null) {
    super(element, tooltip, container);
  }

  protected _showTooltip(delay: number | null = null, done: () => void = () => {}): void {
    const showDelay: number = this._getShowDelay(delay);

    this._showPanding = true;

    this._runShowTimeout(async () => {
      const tlBounds: McTooltipBounds = measureBeforeRender(this.tooltip);

      const offsets: McCornerOffsets = await this._getCornerOffsets();

      this._cornerOffsets = offsets;

      this._getAvailableCoords(tlBounds, (coords: McCoords) => {
        this._isRendered = true;

        this._showPanding = false;

        renderTooltip(this.tooltip, coords);

        this._handleDocumentScroll();

        this._handleIntersections();

        done();
      });
    }, showDelay);

    this._handlePointerOut();
  }

  protected _hideTooltip(delay: number | null = null, done: () => void = () => {}): void {
    const hideDelay: number = this._getHideDelay(delay);

    this._hidePanding = true;

    this._runHideTimeout(() => {
      hideTooltip(this.tooltip);

      this._isRendered = false;

      this._hidePanding = false;

      this._removeMouseOutListeners();

      this._cleanupTooltipPositionListeners();

      done();
    }, hideDelay);
  }

  private _handlePointerOut(): void {
    this._removeMouseOutListeners();

    const handleMouseOut = (event: MouseEvent) => {
      const element: Element = event.relatedTarget as Element;

      if (element !== this.element && !this.element.contains(element) && !this.tooltip._containsElement(element)) {
        if (this._showPanding) {
          this._showPanding = false;

          clearTimeout(this._showTimeoutRef);
        }

        if (!this._isRendered) {
          clearTimeout(this._showTimeoutRef);

          this._removeMouseOutListeners();
        }

        this._hideTooltip();
      }
    };

    const tooltipMouseOut = (event: MouseEvent) => handleMouseOut(event);

    const targetMouseOut = (event: MouseEvent) => handleMouseOut(event);

    this.tooltip.element.addEventListener('mouseout', tooltipMouseOut);

    this._tooltipMoveOutHandlers.add(tooltipMouseOut);

    this.element.addEventListener('mouseout', targetMouseOut);

    this._targetMoveOutHandlers.add(targetMouseOut);
  }

  private _handleIntersections(): void {
    this._disconnectIntersectionObservers();

    let options = { root: document, rootMargin: '0px', threshold: [0.0] };

    let observer = new IntersectionObserver(entries => {
      if (!entries[entries.length - 1].isIntersecting) this._hideTooltip();
    }, options);

    this._intersectionObservers.add(observer);

    observer.observe(this.element);
  }

  private _handleDocumentScroll(): void {
    const documentScroll = () => {
      this._getAvailableCoords(this.tooltip.bounds, (coords: McCoords) => {
        requestAnimationFrame(() => updatePosition(this.tooltip, coords, this._isPositionChanged));
      });
    };

    document.addEventListener('scroll', documentScroll, { capture: true });

    this._documentScrollHandlers.add(documentScroll);
  }
}
