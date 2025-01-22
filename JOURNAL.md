# Development Journal

## 2025-01-04

Initial development with the help of Abacus.ai - project structure and initial code.
Made working proof-of-concept. Set up publishing to NPM. Started with "locking" functionality.

## 2025-01-05

Decided to implement unit tests. Had plenty of issues with REQUIRE_ESM errors. While trying
to fix them, messed up the whole thing. Had to revert to previous state, losing some of the
"locking" functionality I previously got working.
Resumed working on it, this time starting with the backend side of things. Managed to successfully "lock" route, essentially caching it. Schema changed multiple times, need
something more flexible - LowDB or MikroORM for now?

## 2025-01-06

Made a project README.md. Will resume working on frontend now. Should I install v0?

## 2025-01-08

Successfully published to NPM. Had to fix some issues with the build process: switched to 
tsx from ts-node-dev. Now have to add ".js" when importing local modules. Will investigate
further - this changes might solve my previous issues with the REQUIRE_ESM errors.
Have so many feature ideas, will create a separate doc for them - 'FEATURE IDEAS.md'.

## 2025-01-10

Resumed working on the "Lock response" functionality. Thinking about more robust storage solution.
I think I would benefit from keeping entities separate - routes, responses, future settings. 
Now I can lock and edit response text. On unlock it resets to the original.

## 2025-01-19

Added "Server settings" - allows to work on `/` path for default project, set up "server name" instead of "domain" for proxying.

## 2025-01-22

Keep messing up serving frontend, need to come up with a better solution.
Decided to serve it under a different port.
