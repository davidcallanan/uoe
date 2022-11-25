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

TODO

## Externally-influenced interfaces

TODO
