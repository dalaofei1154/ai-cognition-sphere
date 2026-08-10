# Contributing

Thank you for helping improve AI Cognition Sphere. This is an authored work,
not a general-purpose AI encyclopedia, so different changes follow different
review paths.

## Changes welcome as pull requests

- reproducible bug fixes;
- accessibility, performance, and browser compatibility improvements;
- build, test, documentation, and deployment fixes;
- small corrections with a clear primary or authoritative source.

## Discuss before implementation

Open a content proposal before changing the eight-layer taxonomy, adding or
removing concepts, changing semantic relations, or altering the authored path.
These elements express the work’s editorial structure as well as factual
relationships.

Content proposals should state:

1. the precise problem;
2. the proposed change;
3. at least one reliable source;
4. whether the change concerns an established concept, an authorial
   interpretation, or a boundary question.

Bulk AI-generated concepts or relationships are not accepted without
line-by-line human review. Contributors may use AI tools, but remain
responsible for accuracy, licensing, testing, and disclosure of substantial
generated changes in the pull request.

## Development

Use Node.js 22.13 or a supported newer release from `package.json`.

```bash
npm ci
npm run dev
```

Before opening a pull request:

```bash
npm run verify
```

The project uses the MIT License for software and a separate CC BY 4.0 license
for original conceptual, textual, and visual content. By contributing, you
agree that your contribution may be distributed under the licenses applicable
to the files you change. Project names and marks remain subject to
[`TRADEMARKS.md`](TRADEMARKS.md).
