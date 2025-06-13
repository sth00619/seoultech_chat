# University Regulation Chatbot Project

This repository contains a REST API for the SeoulTech Chat application.

## Running locally

Install dependencies and start the server:

```bash
npm install
npm start
```

## Running tests

```
npm test
```

The test suite spins up the Express app on a random port and checks the root, `/health` and 404 responses.

## Continuous Integration

A GitHub Actions workflow runs `npm test` on every push and pull request to `main`.

## Repository status

This repository is a fork and currently has no upstream remote configured. Check
for upstream updates manually before relying on CI results.
