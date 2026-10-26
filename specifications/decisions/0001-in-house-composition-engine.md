# 0001. Build the composition engine in-house

Date: 2026-10-26
Status: accepted

## Context

PRD Layers 2 to 4 describe a timeline resolver, a flat-layer compositor and advanced motion. Two existing systems already cover much of that ground for browser-authored content:

- HyperFrames (HeyGen) renders HTML to video by seeking a paused timeline, with tracks, sub-compositions, captions, audio mixing, a review loop and a component registry. It is installed on the primary machine with nine agent skills.
- Remotion renders React compositions frame by frame with a mature CLI and a commercial licence for companies above a size threshold.

Adopting either would reach a first finished video faster. Both are HTML-only renderers owned by third parties, so native output (Blender, Manim, FFmpeg filtergraphs) can only enter as pre-rendered assets, and the roadmap, plan limits and pricing are outside our control.

## Options considered

1. **HyperFrames as the first composition adapter.** Fastest to a first video. Lock-in to HeyGen plan limits; VCR's timing contract would be a wrapper around someone else's clock.
2. **Own schema and resolver, compile to FFmpeg then HyperFrames.** Control over the contract, engines replaceable. Still carries a HyperFrames dependency for browser scenes.
3. **Full in-house engine per the PRD.** Highest effort (resolver complexity 2, compositor 4, advanced motion 5 on our scale). Full control over time, alpha, colour and native integration. Slowest to a first video.

## Decision

Option 3. VCR owns its timeline, compositor and motion layers. HyperFrames and Remotion remain catalogued as references and inspiration with `adapter_maturity: none`; VCR takes no dependency on either. The PRD ordering stands: native examples and the browser-capture spike must work before the resolver is built.

## Consequences

- The browser-capture spike (Playwright seeking a paused GSAP timeline to alpha PNGs) is on the critical path and gates the Layer 2 child plan.
- The rational-time contract in PRD §9 is defined as types before any example depends on time.
- Studio-style preview and a component registry are deferred; early review uses contact sheets and native previews.
- Work decomposes into child specifications per layer, each opened by a spike with a written report.

## Revisit when

M3 (basic timeline) has not produced one complete short video within two sprints of starting, or a real production needs a capability the in-house compositor cannot deliver within a sprint.
