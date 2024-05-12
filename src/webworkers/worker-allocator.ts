import { McEvent } from '../events/events';

const WORKERS: Worker[] = [
  new Worker('available-coords.js'),
  new Worker('available-coords.js'),
  new Worker('available-coords.js'),
];

WORKERS.forEach((worker: Worker) => {
  worker.addEventListener('message', (event: MessageEvent<McEvent>) => {
    const response: McEvent = event.data;

    postMessage(response);
  });
});

class WorkerAllocator {
  private _currentIndex: number = 0;

  public sendMessage(message: McEvent): void {
    const worker: Worker = WORKERS[this._currentIndex];

    worker.postMessage(message);

    this._nextIndex();
  }

  private _nextIndex(): void {
    if (this._currentIndex < WORKERS.length - 1) {
      this._currentIndex++;

      return;
    }

    this._currentIndex = 0;
  }

  private static _instance: WorkerAllocator;

  public static get instance(): WorkerAllocator {
    if (!WorkerAllocator._instance) {
      WorkerAllocator._instance = new WorkerAllocator();
    }

    return WorkerAllocator._instance;
  }
}

onmessage = (event: MessageEvent<McEvent>) => {
  const message: McEvent = event.data;

  if (message.type) {
    WorkerAllocator.instance.sendMessage(message);
  }
};
