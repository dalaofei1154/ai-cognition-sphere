# Third-party notices

This repository depends on open-source packages distributed through npm. No
dependency source is vendored into the repository. `package-lock.json` is the
authoritative list of exact packages and versions.

The principal runtime and build dependencies include:

| Project | Role | License |
| --- | --- | --- |
| React and React DOM | interface runtime | MIT |
| Next.js | application APIs and types | MIT |
| Three.js | 3D rendering | MIT |
| Vinext | Vite-compatible Next.js runtime | MIT |
| Vite and related plugins | build system | MIT |
| Cloudflare Vite plugin and Wrangler | Worker build and deployment | MIT / Apache-2.0 |
| Tailwind CSS | CSS toolchain | MIT |
| TypeScript | type system and compiler | Apache-2.0 |

The transitive dependency graph also contains components under MPL-2.0,
LGPL-3.0-or-later, CC-BY-4.0, BSD, ISC, Python-2.0, and other permissive or
weak-copyleft licenses. Notable examples include Lightning CSS (MPL-2.0),
optional Sharp/libvips packages (Apache-2.0 and/or LGPL-3.0-or-later), and
`caniuse-lite` data (CC-BY-4.0).

Each installed package includes or links to its own license terms. Anyone
redistributing a compiled bundle is responsible for preserving the notices
required by those licenses. This file is a practical index, not a replacement
for the license texts shipped by the dependency authors.
