# 1. Shadow DOM for widget isolation

Date: 2026-06-28

## Status

Accepted

## Context

The Brainbox widget is embedded into arbitrary customer host apps via a
script-tag. Our UI (Tailwind 4, with `oklch` colors and a CSS reset) and the
host's CSS will collide in both directions: their styles leak into our widget,
ours leak into their app. We need isolation.

At the same time, the capture flow's core feature - letting the end-user
highlight a region of the host page and screenshot it via `modern-screenshot` -
requires **read access to the host DOM**.

Options considered:

- **iframe** - bulletproof style isolation, but an iframe cannot see the host
  DOM. That kills region-highlighting and host screenshotting outright.
- **Plain div with prefixed/namespaced classes** - simplest, but host styles
  will eventually break our UI; fragile and unbounded to maintain.
- **Shadow DOM** - we mount a host element, attach a shadow root, and inject our
  compiled Tailwind CSS *inside* it. Host styles can't reach in, ours can't leak
  out, and because the shadow root lives in the same document we retain full
  access to the host DOM for highlighting and screenshotting.

## Decision

Mount the widget's React 19 tree inside a **Shadow DOM** root. Compiled Tailwind
CSS is inlined into a `<style>` tag within the shadow root.

## Consequences

- We get UI isolation *and* host-DOM access - the only option that satisfies
  both, which is why iframe was rejected despite stronger isolation.
- Tailwind must target the shadow root, and any library assuming `document.head`
  (e.g. for style injection or portals) needs care to render within the shadow
  root instead.
- During screenshot capture we must hide our entire shadow-root UI so the widget
  chrome doesn't appear in the host screenshot.
