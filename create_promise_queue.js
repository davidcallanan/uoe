import { create_unsuspended_factory } from "./create_unsuspended_factory.js";

class PromiseQueue {
    constructor() {
        this._queue = new Set();
    }

    add(promise) {
        this._queue.add(promise);
    }

    all() {
        let self = this;
        let already_iterated = false;

        return Promise.all({
            [Symbol.iterator]: function*() {
                if (already_iterated) {
                    console.error("already iterated");
                    throw new Error("already iterated");
                }

                already_iterated = true;

                while (true) {
                    let { value: promise, done } = self._queue.values().next();
                    
                    if (done) {
                        return;
                    }
                    
                    self._queue.delete(promise);

                    yield promise;
                }
            }
        });
    }
}

export const create_promise_queue = create_unsuspended_factory(PromiseQueue);
export const createPromiseQueue = create_promise_queue;
