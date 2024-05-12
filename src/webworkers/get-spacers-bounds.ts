import { McEvent, McEventType } from '../events/events';
import { McGetSpacersBoundsData } from '../events/message';
import { McGetSpacersBoundsResponse } from '../events/response';
import { McCorner, McElementBounds, McSpacersBounds } from '../models';
import { getCorner } from '../utils';

const CORNER_TO_FN_MAP: { [keys in McCorner]: (config: McGetSpacersBoundsData) => McSpacersBounds } = {
  [McCorner.TopLeft]: (config: McGetSpacersBoundsData) => getTopLeftPointSpacersBounds(config),
  [McCorner.TopRight]: (config: McGetSpacersBoundsData) => getTopRightPointSpacersBounds(config),
  [McCorner.BottomLeft]: (config: McGetSpacersBoundsData) => getBottomLeftPointSpacersBounds(config),
  [McCorner.BottomRight]: (config: McGetSpacersBoundsData) => getBottomRightPointSpacersBounds(config),
};

export function getSpacersBounds(config: McGetSpacersBoundsData): McSpacersBounds {
  if (config.options.position === 'above') return getAboveSpacerBounds(config);
  if (config.options.position === 'below') return getBelowSpacerBounds(config);
  if (config.options.position === 'before') return getBeforeSpacerBounds(config);
  if (config.options.position === 'after') return getAfterSpacerBounds(config);
}

function getAboveSpacerBounds(config: McGetSpacersBoundsData): McSpacersBounds {
  if (config.options.alignment === 'center') {
    const bounds: McElementBounds = {
      top: config.tlBounds.bottom - config.tlBounds.top,
      bottom: -config.tlBounds.offsetY,
      right: 0,
      left: 0,
    };

    return { after: bounds };
  }

  return getPointSpacersBounds(config);
}

function getBelowSpacerBounds(config: McGetSpacersBoundsData): McSpacersBounds {
  if (config.options.alignment === 'center') {
    const bounds: McElementBounds = {
      top: -config.tlBounds.offsetY,
      bottom: config.tlBounds.bottom - config.tlBounds.top,
      right: 0,
      left: 0,
    };

    return { before: bounds };
  }

  return getPointSpacersBounds(config);
}

function getBeforeSpacerBounds(config: McGetSpacersBoundsData): McSpacersBounds {
  if (config.options.alignment === 'center') {
    const bounds: McElementBounds = {
      top: 0,
      bottom: 0,
      right: -config.tlBounds.offsetX,
      left: config.tlBounds.right - config.tlBounds.left,
    };

    return { before: bounds };
  }

  return getPointSpacersBounds(config);
}

function getAfterSpacerBounds(config: McGetSpacersBoundsData): McSpacersBounds {
  if (config.options.alignment === 'center') {
    const bounds: McElementBounds = {
      top: 0,
      bottom: 0,
      right: config.tlBounds.right - config.tlBounds.left,
      left: -config.tlBounds.offsetX,
    };

    return { before: bounds };
  }

  return getPointSpacersBounds(config);
}

function getPointSpacersBounds(config: McGetSpacersBoundsData): McSpacersBounds {
  const point: McCorner = getCorner(config.options.position, config.options.alignment);

  return CORNER_TO_FN_MAP[point](config);
}

function getTopLeftPointSpacersBounds(config: McGetSpacersBoundsData): McSpacersBounds {
  return {
    before: {
      top: config.tlBounds.bottom - config.tlBounds.top,
      bottom: -(config.tlBounds.offsetY + 15),
      right: -config.tlBounds.offsetX,
      left: config.tlBounds.right - config.tlBounds.left - 15,
    },
    after: {
      top: config.tlBounds.bottom - config.tlBounds.top - 15,
      bottom: -config.tlBounds.offsetY,
      right: -(config.tlBounds.offsetX + 15),
      left: config.tlBounds.right - config.tlBounds.left,
    },
  };
}

function getTopRightPointSpacersBounds(config: McGetSpacersBoundsData): McSpacersBounds {
  return {
    before: {
      top: config.tlBounds.bottom - config.tlBounds.top - 15,
      bottom: -config.tlBounds.offsetY,
      right: config.tlBounds.right - config.tlBounds.left,
      left: -(config.tlBounds.offsetX + 15),
    },
    after: {
      top: config.tlBounds.bottom - config.tlBounds.top,
      bottom: -(config.tlBounds.offsetY + 15),
      right: config.tlBounds.right - config.tlBounds.left - 15,
      left: -config.tlBounds.offsetX,
    },
  };
}

function getBottomLeftPointSpacersBounds(config: McGetSpacersBoundsData): McSpacersBounds {
  return {
    before: {
      top: -(config.tlBounds.offsetY + 15),
      bottom: config.tlBounds.bottom - config.tlBounds.top,
      right: -config.tlBounds.offsetX,
      left: config.tlBounds.right - config.tlBounds.left - 15,
    },
    after: {
      top: -config.tlBounds.offsetY,
      bottom: config.tlBounds.bottom - config.tlBounds.top - 15,
      right: -(config.tlBounds.offsetX + 15),
      left: config.tlBounds.right - config.tlBounds.left,
    },
  };
}

function getBottomRightPointSpacersBounds(config: McGetSpacersBoundsData): McSpacersBounds {
  return {
    before: {
      top: -config.tlBounds.offsetY,
      bottom: config.tlBounds.bottom - config.tlBounds.top - 15,
      right: config.tlBounds.right - config.tlBounds.left,
      left: -(config.tlBounds.offsetX + 15),
    },
    after: {
      top: -(config.tlBounds.offsetY + 15),
      bottom: config.tlBounds.bottom - config.tlBounds.top,
      right: config.tlBounds.right - config.tlBounds.left - 15,
      left: -config.tlBounds.offsetX,
    },
  };
}

// Message Handlers
onmessage = (event: MessageEvent<McEvent>) => {
  const message: McEvent = event.data;

  if (message.type === McEventType.GET_SPACERS_BOUNDS) {
    const isWithinBounds: McSpacersBounds = getSpacersBounds(message.data);

    postMessage(new McGetSpacersBoundsResponse(isWithinBounds, message.id));
  }
};
