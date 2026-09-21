# Destination Function Monorepo Example

> A worked example of housing several Segment destination functions in one repo
> and sharing helper code between them.

This repo is generated from
[`destination-function-template`](https://github.com/segment-services-eng/destination-function-template)
and exists to demonstrate one thing concretely: **how shared code survives the
trip into Segment's function runtime.**

Start a real project from the template, not from this repo. This one is a
reference you can read.

## The problem it demonstrates

Segment runs a destination function as a **single standalone script with no module
system**. A function cannot `require` anything at runtime. That is why helpers get
copy-pasted between function repos — `queryProfileAPI`, the Profile API lookup in
[`lib/queryProfileAPI.js`](lib/queryProfileAPI.js), exists in at least five repos
in this org, each copy free to drift.

So sharing code is a **build** problem, not a layout problem. At deploy time
[`scripts/bundle.js`](scripts/bundle.js) uses esbuild to inline each function's
require graph into one file, then generates top-level handler declarations — the
shape the runtime looks for, and the shape a human hand-writes in the Segment UI:

```js
var __handlers = (() => {
  /* lib/queryProfileAPI.js and lib/postJson.js inlined here */
})();

async function onTrack(event, settings) {
  return __handlers.onTrack(event, settings);
}
```

Sandbox globals (`fetch`, `btoa`, `_`, `moment`, `RetryError`) are left alone as
free identifiers. An import that cannot be resolved from the repo — an npm package
— fails the build rather than shipping something the sandbox cannot run.

## The four functions

Each is a realistic Segment workspace use case. All four share `lib/`.

| Function                                                     | Handlers                | Shared code it uses                                                   |
| ------------------------------------------------------------ | ----------------------- | --------------------------------------------------------------------- |
| [`profileEnrichedWebhook`](functions/profileEnrichedWebhook) | `onTrack`               | `profileTraits` → `queryProfileAPI`, `flattenProperties`, `postJson`  |
| [`engageAudienceCrmSync`](functions/engageAudienceCrmSync)   | `onTrack`, `onIdentify` | `profileTraits` → `queryProfileAPI`, `audienceMembership`, `postJson` |
| [`triggeredEmailSend`](functions/triggeredEmailSend)         | `onTrack`               | `queryProfileAPI`, `requireTraits`, `postJson`                        |
| [`analyticsForwarder`](functions/analyticsForwarder)         | `onTrack`, `onPage`     | `flattenProperties`, `toIsoTimestamp`, `postJson`                     |

Lib modules compose: [`lib/profileTraits.js`](lib/profileTraits.js) requires
`lib/queryProfileAPI.js`, and the bundler inlines that chain transitively.

`analyticsForwarder` needs no profile lookup, and that is the point of including
it: **each bundle carries only the lib modules its own function reaches.**

```
$ for f in $(node scripts/listFunctions.js); do npm run -s bundle -- $f | ...; done

analyticsForwarder       3863 B   flattenProperties, toIsoTimestamp, postJson
profileEnrichedWebhook   5942 B   profileTraits, queryProfileAPI, flattenProperties, postJson
triggeredEmailSend       6127 B   queryProfileAPI, requireTraits, postJson
engageAudienceCrmSync    6756 B   profileTraits, queryProfileAPI, audienceMembership, postJson
```

`analyticsForwarder`'s deployed code contains no Profile API code at all.

## Try it

```sh
nvm use
npm install
npm test                          # 79 tests, 100% coverage of functions/ and lib/
node scripts/listFunctions.js     # the four functions, discovered from disk
npm run bundle -- analyticsForwarder   # exactly what a deploy would upload
```

Adding a fifth function takes one command and no config edits anywhere:

```sh
npm run new:function -- sendToSlack
```

Discovery is a directory scan, so tests, coverage, the GitHub Actions deploy
matrix and the Buildkite steps all pick it up automatically.

## How it is tested

- Every handler and every `lib/` helper has co-located tests and must keep 100%
  coverage.
- [`scripts/bundle.test.js`](scripts/bundle.test.js) is the cross-function gate. For
  **every** discovered function it bundles the function, asserts the output is valid
  standalone script syntax with no module system left in it, evaluates it with the
  sandbox globals, checks every exported handler is reachable as a top-level
  function, and invokes those handlers against a fixture event. New functions join
  that net automatically.

## Note on CI

The [GitHub Actions workflow](.github/workflows/deployDestinationFunction.yml) and
[Buildkite pipeline](.buildkite/pipeline.yml) are committed so you can read how the
per-function, per-environment fan-out works — Actions is the path to follow;
Buildkite is the Twilio-internal option.

They are **illustrative only here**: the function IDs in each `function.json` are
placeholders and no `PUBLIC_API_TOKEN` secret is configured, so nothing deploys
anywhere. `npm test` is the runnable proof in this repo.

In a real repo, the function ID for each environment is committed in
`functions/<name>/function.json` — an ID is an identifier, not a credential, and it
does nothing without the API token — which leaves `PUBLIC_API_TOKEN` as the only
secret and means adding a function needs no secret management at all.
