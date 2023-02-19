class SubstitutablePromise {
	constructor(initial_promise) {
		this._promise = promise;
	}

	substitute(promise) {
		this._promise = promise;
	}

	_exposed() {
		let promise = Promise.resolve(this._promise);

		return promise.then(result => {
			if (this._promise !== promise) {
				return this._exposed();
			}

			return result;
		}).catch(err => {
			if (this._promise !== promise) {
				return this._exposed();
			}

			return err;
		});
	}

	exposed() {
		if (this._existing_exposed === undefined) {
			this._existing_exposed = this._exposed();
		}

		return this._existing_exposed;
	}
}

export const create_substitutable_promise = (initial_promise) => new SubstitutablePromise(initial_promise);
export const createSubstitutablePromise = create_substitutable_promise;
