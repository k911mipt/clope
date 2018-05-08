// A bit modified code from
// https://github.com/rolftimmermans/event-iterator

import { EventEmitter } from "stream";

export type PushCallback<T> = (res: T) => void;
export type StopCallback<T> = () => void;
export type FailCallback<T> = (err: Error) => void;

export type ListenHandler<T> = (push: PushCallback<T>, stop: StopCallback<T>, fail: FailCallback<T>) => void;
export type RemoveHandler<T> = (push: PushCallback<T>, stop: StopCallback<T>, fail: FailCallback<T>) => void;

interface IAsyncResolver<T> {
    resolve: (res: IteratorResult<T>) => void;
    reject: (err: Error) => void;
}

type AsyncQueue<T> = Array<Promise<IteratorResult<T>>>;

export default class EventIterator<T> {
    private listen: ListenHandler<T>;
    private remove?: RemoveHandler<T>;

    constructor(listen: ListenHandler<T>, remove?: RemoveHandler<T>) {
        this.listen = listen;
        this.remove = remove;
        Object.freeze(this);
    }

    public [Symbol.asyncIterator](): AsyncIterableIterator<T> {
        let placeholder: IAsyncResolver<T> | void;
        const queue: AsyncQueue<T> = [];
        const listen = this.listen;
        const remove = this.remove;

        const push: PushCallback<T> = (value: T) => {
            const resolution = { value, done: false };
            if (placeholder) {
                placeholder.resolve(resolution);
                placeholder = undefined;
            } else {
                queue.push(Promise.resolve(resolution));
            }
        };

        const stop: StopCallback<T> = () => {
            if (remove) {
                remove(push, stop, fail);
            }

            const resolution = { done: true } as IteratorResult<T>;
            if (placeholder) {
                placeholder.resolve(resolution);
                placeholder = undefined;
            } else {
                queue.push(Promise.resolve(resolution));
            }
        };

        const fail: FailCallback<T> = (error: Error) => {
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
            next(value?: any) {
                if (queue.length) {
                    return queue.shift()!;
                } else {
                    return new Promise((resolve, reject) => {
                        placeholder = { resolve, reject };
                    });
                }
            },

            return() {
                if (remove) {
                    remove(push, stop, fail);
                }
                return Promise.resolve({ done: true } as IteratorResult<T>);
            },
            [Symbol.asyncIterator]() {
                return this;
            },
        };
    }
}
