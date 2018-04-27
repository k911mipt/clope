// Чуть модифицированный код, взятый с
// https://github.com/rolftimmermans/event-iterator
//
import { EventEmitter } from "events";

export type PushCallback<T> = (res: T) => void;
export type StopCallback<T> = () => void;
export type FailCallback<T> = (err: Error) => void;

export type ListenHandler<T> = (push: PushCallback<T>, stop: StopCallback<T>, fail: FailCallback<T>) => void;
export type RemoveHandler<T> = (push: PushCallback<T>, stop: StopCallback<T>, fail: FailCallback<T>) => void;

(Symbol as any).asyncIterator = Symbol.asyncIterator || Symbol.iterator || Symbol.for("Symbol.asyncIterator");
// tslint:disable-next-line:interface-over-type-literal
type AsyncResolver<T> = {
    resolve: (res: IteratorResult<T>) => void
    reject: (err: Error) => void,
};

type AsyncQueue<T> = Array<Promise<IteratorResult<T>>>;

export class EventIterator<T> {
    private listen: ListenHandler<T>;
    private remove?: RemoveHandler<T>;

    constructor(listen: ListenHandler<T>, remove?: RemoveHandler<T>) {
        this.listen = listen;
        this.remove = remove;
        Object.freeze(this);
    }

    public [Symbol.asyncIterator](): AsyncIterator<T> {
        let placeholder: AsyncResolver<T> | void;
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
                // if (queue.length > 100 && console) {
                //     console.warn("EventIterator queue filling up");
                // }
            }
        };

        const stop: StopCallback<T> = () => {
            if (remove) {
                remove(push, stop, fail);
            }

            // tslint:disable-next-line:no-object-literal-type-assertion
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
                // tslint:disable-next-line:no-empty
                rejection.catch(() => { });
                queue.push(rejection);
            }
        };
        console.log("Start listen INSIDE EVENT-ITERATOR");

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
                // tslint:disable-next-line:no-object-literal-type-assertion
                return Promise.resolve({ done: true } as IteratorResult<T>);
            },
        };
    }
}

// export default EventIterator;
export function subscribeReadLine(emitter: EventEmitter, event: string) {
    return new EventIterator<Event>(
        (push, stop) => {
            emitter.addListener(event, push);
            emitter.addListener("close", stop);
        },

        (push, stop) => {
            emitter.removeListener(event, push);
            emitter.removeListener("close", stop);
        },
    );
}
