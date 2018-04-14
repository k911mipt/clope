// A bit modified code from
// https://github.com/rolftimmermans/event-iterator

export type PushCallback = (res: any) => void;
export type StopCallback = () => void;
export type FailCallback = (err: Error) => void;

export type ListenHandler = (push: PushCallback, stop: StopCallback, fail: FailCallback) => void;
export type RemoveHandler = (push: PushCallback, stop: StopCallback, fail: FailCallback) => void;

interface IAsyncResolver<T> {
    resolve(res: IteratorResult<T>): void;
    reject(err: Error): void;
}

type AsyncQueue<T> = Promise<IteratorResult<T>>[];

export default class EventIterator<T> {
    private listen: ListenHandler;
    private remove?: RemoveHandler;

    constructor(listen: ListenHandler, remove?: RemoveHandler) {
        this.listen = listen;
        this.remove = remove;
        Object.freeze(this);
    }

    public [Symbol.asyncIterator](): AsyncIterableIterator<T> {
        let placeholder: IAsyncResolver<T> | void;
        const queue: AsyncQueue<T> = [];
        const listen = this.listen;
        const remove = this.remove;

        const push: PushCallback = (value: T) => {
            const resolution = { value, done: false };
            if (placeholder) {
                placeholder.resolve(resolution);
                placeholder = undefined;
            } else {
                queue.push(Promise.resolve(resolution));
            }
        };

        const stop: StopCallback = () => {
            if (remove) {
                remove(push, stop, fail);
            }

            const resolution = <IteratorResult<T>>{ done: true };
            if (placeholder) {
                placeholder.resolve(resolution);
                placeholder = undefined;
            } else {
                queue.push(Promise.resolve(resolution));
            }
        };

        const fail: FailCallback = (error: Error) => {
            if (remove) {
                remove(push, stop, fail);
            }

            if (placeholder) {
                placeholder.reject(error);
                placeholder = undefined;
            } else {
                const rejection = Promise.reject(error);
                /* Attach error handler to avoid leaking an unhandled promise rejection. */
                /**
                 * Empty arrow function is to "handle" but skip error, no need to really handle
                 * it here unless you want to make some "error" queue to have a deal with later
                 *
                 * For this algorithm its better to skip other IO errors and not continue
                 * otherwise it could lead us to incorrect results
                 */
                rejection.catch(() => {});
                queue.push(rejection);
            }
        };

        listen(push, stop, fail);

        return {
            next(): Promise<IteratorResult<T>> {
                if (queue.length) {
                    return queue.shift()!;
                }
                return new Promise((resolve, reject) => {
                    placeholder = { resolve, reject };
                });
            },

            return(): Promise<IteratorResult<T>> {
                if (remove) {
                    remove(push, stop, fail);
                }
                return Promise.resolve(<IteratorResult<T>>{ done: true });
            },
            [Symbol.asyncIterator](): AsyncIterableIterator<T> {
                return this;
            },
        };
    }
}
