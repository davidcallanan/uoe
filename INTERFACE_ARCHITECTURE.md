# Interface Architecture

This file describes the principal types of interfaces that may exist in a project.

I have been gradually adjusting my terminology over the last few years so I often have many terms for the same thing.

Interfaces consist of multiple methods, and one method may be designated as the "primary" or "default" method which is invoked if the interface itself is invoked (syntactic sugar). This means all function types can be encoded as interfaces with a single primary method. It also allows function-like interfaces to be extended with additional methods at a later date.

Interfaces can initially be split into three categories:

 - Deterministic interfaces.
 - Stateful interfaces (which I often call "machines" or more recently "contracts" or sometimes "owned services").
 - Externally-influenced interfaces (which I often call "open interfaces" or more recently "services" or sometimes "unowned services").

## Deterministic interfaces

A deterministic interface is one who's output is solely determined by its input for any given method.

If the implementation fails to uphold this contractual obligation, the regular flow of the program must be interrupted.

There is no connection between different methods in a deterministic interface and thus I have lately preferred the idea of limiting each determinstic interface to containing a single primary method. Users of various interfaces can collect these methods together in whatever way suits if so desired.

There are only two types of errors that can occur in a determinstic interface, user errors and internal errors (see `error.js`).

User errors are equivalent to type errors, however, limitations of the type system may prevent some errors from being caught at compile-time. In this case, the user error may be thrown at runtime. `throw user_error("reason")`. Alternatively, one may opt for undefined behaviour.

There are three user error policies a deterministic interface can choose to use:

 - (strict/safe) Just type-system enforced (when possible).
 - (strict/safe) Type-system enforced with additional runtime checks due to type-system limitations.
 - (lenient/error-prone) Type-system enforced with undefined behaviour due to type-system limitations.

For any "public-facing" deterministic interfaces, it is preferable to avoid undefined behaviour where possible.

It is the responsibility of the user to ensure that the input to a deterministic interface is valid. If the user is working with unverified input, it is their responsibility to verify the validity of the input before passing it to the deterministic interface.

Internal errors are caused by implementation details and external factors. A bug is an internal error that is not reported, where undesired behaviour follows. If an error is caught, use `throw internal_error("reason")`.

There are two internal error policies a deterministic interface can choose to use:

 - (strict/safe) Either the error is reported or the program's execution is paused.
 - (lenient/error-prone) The program may continue execution with undefined behaviour.

User errors and internal errors must break the regular flow of the program due to contractual obligations not being met. This can be achieved using the language's exception system, and in the case of JavaScript, this is the `throw` keyword.

## Stateful interfaces

A stateful interface is one who's outputs are determined by its input and its "implied state". I have used the terminology "implied state" for years now even though I'm actively looking for a more accurate term.

A stateful interface consists of two types of methods: "views" and "actions". An action alters the implied state whereas views merely extract data from the system. Actually, there are no views, I think that only applies to the next section. Technically, a stateful interface should only have one action (and enums can be used for different behaviours) but we won't get into that, and we'll just allow multiple methods for the time being.

A stateful interface has actions applied to it over time. For a given action, it may be accepted or rejected.

At any point, the implied state of the interface is the set of all action-acceptance pair lists such that for any action-acceptance pair list, inputting those actions should result in those acceptance statuses being returned, and any further actions not being accepted if the list is not infinite.

Here is an example of an implied state (`{}` notation is used to denote a set):

```
{
	[("increment", true), ("increment"), false],
	[("double_increment", false)]
}
```

Here are two examples of contracts which have this implied state:

```
// Example 1

let counter = 0;
const max_count = 1;

const increment = () => {
	if (counter + 1 > max_count) {
		throw "rejected";
	}

	counter += 1;
};

const double_increment = () => {
	if (counter + 2 > max_count) {
		throw "rejected";
	}

	counter += 2;
};

// Example 2

// The same system as above except where `max_count = 3` but `increment` has already been invoked two times.
```

A stateful interface is only useful for interfaces that are solely owned by a single user, and so they have complete deterministic control over the state. The interface user can build up their own representation of the implied state (there are many many ways to encode the same applied state!) and it is the responsibility of the interface user to not call actions that would be rejected.

Internal errors work the same way as deterministic interfaces, only that the state after such an error is now unknown and so the interface instance has been corrupted, thus further method calls should all result in additional internal errors being reported.

User errors are when either illegal input is provided, or input is provided when the system is in a state where the action would be rejected.

There are three policies for user errors as is the case for deterministic interfaces. It is preferable to avoid user errors by using the type-system but the reality is that most programming languages struggle to encode this in the type-system, so we often have to resort to reported user errors or undefined behaviour. It is the responsibility of the interface user to vaerify input and maintain state to ensure that methods are not invoked at bad times.

In a perfect world, a stateful interface is entirely a compile-time construct. There is no implementation, as all an implementation may do is report user errors when the type-system fails to provide these errors instead.

## Externally-influenced interfaces

An externally-influenced interface is where the implementation is responsible for maintaining state, where multiple users (through potentially different entry interfaces) will have an impact on the state of the system. The external sources that can alter the state of these interfaces can potentially include factors such as randomness.

It would seem that any externally-influenced interface can be built on top of a stateful interface, implementing a specific state representation for the implied state of the stateful interface.

These interfaces consist of two types of methods, which are actions and views. Actions alter the state whereas views merely extract data from the state of the system.

Actions and views can be compared with commands and queries and the command-query segragation principle is quite prominent. It is recommended (but not sure if should be required) for an implementation to expose separate view and action interfaces.

The views will always return stale data in a sense, as the user is not gaining any transactional lock over the interface, so there is no way a user can guarantee that this is up-to-date in any way.

All actions are transactions. If they alter the state, they have the ability to read the current state under-the-hood and are required to implement any appropriate locking mechanisms to gain complete control over this state until the action has been applied. They must conceptually/logically apply these actions in order as if they are transactions, but under-the-hood, optimization mechanisms may allow for implementations to process actions in a different order and perhaps at the same time.

Externally-influenced interfaces bring some more errors directly into the interface.

User errors should still be part of the type system where possible, but the same policies as before allow for a user error to be thrown at runtime or to follow the route of undefined behaviour.

A new type of error, a state error, is directly part of the interface. It is to be returned in the signature of any action. This type of error does not use the language's exception feature to break the regular flow of the program, as it is a type of error that is expected, and strongly part of the interface. In a language like Rust, you would use a Result-type enum where the error option is then another enum specific to the method in question (as each method can have different combinations of errors that are allowed, so there should not be an interface-wide error enum that is used).

I think that's all that has to be said for externally-influenced interfaces.
