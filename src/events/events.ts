export enum McEventType {
  GET_AVAILABLE_COORDS = 'GET_AVAILABLE_COORDS',
  GET_SPACERS_BOUNDS = 'GET_SPACERS_BOUNDS',
  GET_CORNER_OFFSETS = 'GET_CORNER_OFFSETS',
}

export class McEvent<T = any> {
  readonly type: McEventType;

  id: string;

  data: T;
}
