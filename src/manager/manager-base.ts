import { McGetCoordsMessage, McGetCornerOffsetsMessage, McGetSpacersCoordsMessage } from '../events/message';
import { McGetCoordsResponse, McGetCornerOffsetsResponse, McGetSpacersBoundsResponse } from '../events/response';
import {
  McContainer,
  McCoords,
  McCornerOffsets,
  McElementBounds,
  McElementRadii,
  McPositionOptions,
  McTooltipBounds,
  McWindow,
  TooltipAlignment,
  TooltipPosition,
} from '../models';
import { McTooltip } from '../tooltip';
import { getElementRadii, newId, updateSpacersPosition } from '../utils';

const coordsWorker = new Worker('dist/src/webworkers/worker-allocator.js');

const spacersBoundsWorker = new Worker('dist/src/webworkers/get-spacers-bounds.js');

const cornerOffsetsWorker = new Worker('dist/src/webworkers/get-corner-offsets.js');

export class McTooltipManagerBase {
  protected readonly _id: string = newId();

  protected _isRendered: boolean = false;

  protected _isDestroyed: boolean = false;

  protected _pointerOverHandler: (event: MouseEvent) => void;

  protected _targetMoveOutHandlers: Set<(event: MouseEvent) => void> = new Set();

  protected _tooltipMoveOutHandlers: Set<(event: MouseEvent) => void> = new Set();

  protected _getCoordsHandlers: Set<(event: MessageEvent<McGetCoordsResponse>) => void> = new Set();

  protected _getSpacersBoundsHandlers: Set<(event: MessageEvent<McGetSpacersBoundsResponse>) => void> = new Set();

  protected _getCornerOffsetsHandlers: Set<(event: MessageEvent<McGetCornerOffsetsResponse>) => void> = new Set();

  protected _intersectionObservers: Set<IntersectionObserver> = new Set();

  protected _documentScrollHandlers: Set<() => void> = new Set();

  protected _showTimeoutRef: NodeJS.Timeout;

  protected _hideTimeoutRef: NodeJS.Timeout;

  protected _hidePanding: boolean = false;

  protected _showPanding: boolean = false;

  protected _lastPosition: TooltipPosition;

  protected _lastAlignment: TooltipAlignment;

  protected _isPositionChanged: boolean = false;

  protected _lastPointerCoords: { x: number; y: number } | null = null;

  protected _wasPointerInBounds: boolean = false;

  protected _cornerOffsets: McCornerOffsets;

  constructor(protected element: Element, protected tooltip: McTooltip, protected container: Element | null) {}

  protected get elementBounds(): McElementBounds {
    const rect: DOMRect = this.element.getBoundingClientRect();

    return { top: rect.top, right: rect.right, bottom: rect.bottom, left: rect.left };
  }

  protected get containerBounds(): McContainer {
    if (this.container === null) {
      return { top: 0, right: window.innerWidth, bottom: window.innerHeight, left: 0 };
    }

    const rect: DOMRect = (this.container as Element).getBoundingClientRect();

    return { top: rect.top, right: rect.right, bottom: rect.bottom, left: rect.left };
  }

  protected _getCornerOffsets = (): Promise<McCornerOffsets> => {
    this._removeGetCornerOffsetsHandlers();

    return new Promise<McCornerOffsets>(resolve => {
      const radii: McElementRadii = getElementRadii(this.element);

      const message: McGetCornerOffsetsMessage = new McGetCornerOffsetsMessage(
        { radii, bounds: this.elementBounds },
        this._id
      );

      const messageHandler = (event: MessageEvent<McGetCornerOffsetsResponse>) => {
        if (event.data.id !== this._id) return;

        resolve(event.data.data);

        cornerOffsetsWorker.removeEventListener('message', messageHandler);

        this._getCornerOffsetsHandlers.delete(messageHandler);
      };

      cornerOffsetsWorker.postMessage(message);

      cornerOffsetsWorker.addEventListener('message', messageHandler);

      this._getCornerOffsetsHandlers.add(messageHandler);
    });
  };

  protected _updateSpacersPosition(tlBounds: McTooltipBounds): void {
    const options: McPositionOptions = { position: this._lastPosition, alignment: this._lastAlignment };

    const message: McGetSpacersCoordsMessage = new McGetSpacersCoordsMessage({ tlBounds, options }, this._id);

    spacersBoundsWorker.postMessage(message);

    const messageHandler = (event: MessageEvent<McGetSpacersBoundsResponse>) => {
      if (event.data.id !== this._id) return;

      spacersBoundsWorker.removeEventListener('message', messageHandler);

      this._getSpacersBoundsHandlers.delete(messageHandler);

      updateSpacersPosition(this.tooltip, event.data.data);
    };

    spacersBoundsWorker.addEventListener('message', messageHandler);

    this._getSpacersBoundsHandlers.add(messageHandler);
  }

  protected _getAvailableCoords(tlBounds: McTooltipBounds, callback: (coords: McCoords) => void): void {
    const tgBounds: McElementBounds = this.elementBounds;

    let options: McPositionOptions = this.tooltip.positionOptions;

    const container: McContainer = this.containerBounds;

    const _window: McWindow = { width: window.innerWidth, height: window.innerHeight };

    const message: McGetCoordsMessage = new McGetCoordsMessage(
      { tgBounds, tlBounds, container, options, window: _window, cornerOffsets: this._cornerOffsets },
      this._id
    );

    coordsWorker.postMessage(message);

    const messageHandler = (event: MessageEvent<McGetCoordsResponse>) => {
      if (event.data.id !== this._id) return;

      const response: McGetCoordsResponse = event.data;

      if (response.data) {
        callback(response.data);

        this._isPositionChanged =
          this._lastPosition !== response.data.options.position ||
          this._lastAlignment !== response.data.options.alignment;

        this._lastPosition = response.data.options.position;

        this._lastAlignment = response.data.options.alignment;

        if (this._isPositionChanged) this._updateSpacersPosition(this.tooltip.bounds);
      }

      coordsWorker.removeEventListener('message', messageHandler);

      this._getCoordsHandlers.delete(messageHandler);
    };

    coordsWorker.addEventListener('message', messageHandler);

    this._getCoordsHandlers.add(messageHandler);
  }

  protected _cleanupTooltipPositionListeners(): void {
    this._removeGetCoordsHandlers();

    this._removeGetSpacersBoundsHandlers();

    this._removeGetCornerOffsetsHandlers();

    this._removeDocumentScrollHandlers();

    this._disconnectIntersectionObservers();
  }

  protected _removeMouseOutListeners() {
    this._targetMoveOutHandlers.forEach((handler: () => void) => {
      this.element.removeEventListener('mouseout', handler);
    });

    this._targetMoveOutHandlers.clear();

    this._tooltipMoveOutHandlers.forEach((handler: () => void) => {
      this.tooltip.element.removeEventListener('mouseout', handler);
    });

    this._tooltipMoveOutHandlers.clear();
  }

  protected _removeDocumentScrollHandlers() {
    this._documentScrollHandlers.forEach((handler: () => void) => {
      document.removeEventListener('scroll', handler, { capture: true });
    });

    this._documentScrollHandlers.clear();
  }

  protected _removeGetCoordsHandlers() {
    this._getCoordsHandlers.forEach((handler: () => void) => {
      coordsWorker.removeEventListener('message', handler);
    });

    this._getCoordsHandlers.clear();
  }

  protected _removeGetSpacersBoundsHandlers() {
    this._getSpacersBoundsHandlers.forEach((handler: () => void) => {
      spacersBoundsWorker.removeEventListener('message', handler);
    });

    this._getSpacersBoundsHandlers.clear();
  }

  protected _removeGetCornerOffsetsHandlers() {
    this._getCornerOffsetsHandlers.forEach((handler: () => void) => {
      cornerOffsetsWorker.removeEventListener('message', handler);
    });

    this._getCornerOffsetsHandlers.clear();
  }

  protected _disconnectIntersectionObservers() {
    this._intersectionObservers.forEach((observer: IntersectionObserver) => observer.disconnect());

    this._intersectionObservers.clear();
  }

  protected _getShowDelay(delay: number | null = null): number {
    return typeof delay === 'number' ? delay : this.tooltip.showDelay;
  }

  protected _getHideDelay(delay: number | null = null): number {
    return typeof delay === 'number' ? delay : this.tooltip.hideDelay;
  }

  protected _runShowTimeout(fn: () => void, delay: number): void {
    clearTimeout(this._showTimeoutRef);

    this._showTimeoutRef = setTimeout(() => fn(), delay);
  }

  protected _runHideTimeout(fn: () => void, delay: number): void {
    clearTimeout(this._hideTimeoutRef);

    this._hideTimeoutRef = setTimeout(() => fn(), delay);
  }
}
