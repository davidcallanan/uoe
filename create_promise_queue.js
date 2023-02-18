class PromiseQueue {
    constructor() {
        this._queue = new Set();
    }

    add(promise) {
        this._queue.add(promise);
    }

	_all(results) {
        let all = Promise.all(this._queue);
        this._queue = [];

        return all.then((new_results) => {
            results.push(...new_results);

            if (this._queue.length > 0) {
                return this._all(results);
            }

            return results;
        });
    }

	all() {
		if (this._existing_all === undefined) {
			this._existing_all = this._all([]);
		}

		return this._existing_all;
    }
}

export const create_promise_queue = () => new PromiseQueue();
export const createPromiseQueue = create_promise_queue;
