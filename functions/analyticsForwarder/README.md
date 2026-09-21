# analyticsForwarder

Normalizes and forwards events to an analytics collector: timestamps to UTC
ISO-8601, nested properties flattened to dot-delimited keys.

This function needs no profile lookup, which makes it the useful reference point in
this repo — its deployed bundle contains no Profile API code at all, because the
bundler follows each function's own require graph.

## Settings

| Setting           | Required | Purpose                |
| ----------------- | -------- | ---------------------- |
| `collectorUrl`    | yes      | collector endpoint     |
| `collectorApiKey` | no       | collector bearer token |
