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

