/**
 * This function will bind the `this` value of a callable during invocation, but will still let through access to properties of the original callable.
 * 
 * @example
 * 
 * const person = () => console.log("Hello");
 * person.name = "tejohnst";
 * 
 * console.log(person.bind({}).name); // undefined
 * console.log(bind_callable(person, {}).name); // "tejohnst"
 */
export const bind_callable = (callable, this_value) => {
	return new Proxy(callable, {
		get: (target, prop) => {
			return target[prop];
		},
		apply: (target, _this_value, args) => {
			return Reflect.apply(target, this_value, args);
		},
	});
};

export const bindCallable = bind_callable;
