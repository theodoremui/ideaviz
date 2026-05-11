# Embedding Volume Visualizer User Guide

This guide explains how to install, run, and use the interactive visualization app in `site/`.

## What the App Shows

The app visualizes embedding vectors in a maximum three-dimensional projection. Each point is a vector endpoint, each ray starts at the origin, and the translucent hull shows the geometric volume occupied by the vector set.

Use it to answer questions such as:

- Are vectors clustered tightly or spread across space?
- Do topic groups occupy separate regions or bridge into each other?
- How does changing the 3D projection basis alter the visible span?
- Which vectors extend the hull and increase the occupied volume?

## Prerequisites

Install these before running the app:

- Node.js 22 or newer
- npm 10 or newer
- A modern browser with WebGL enabled

Check your local versions:

```bash
node --version
npm --version
```

## Install the App

From the repository root:

```bash
cd site
npm install
```

The install creates `site/node_modules/` and uses `site/package-lock.json` for reproducible dependency versions.

## Run Locally

Start the Next.js development server:

```bash
cd site
npm run dev
```

Open the local URL printed by Next.js, usually:

```text
http://localhost:3000
```

If port `3000` is busy, Next.js will offer another port such as `3001`.

## Build for Production

Run the validation commands before deploying:

```bash
cd site
npm run typecheck
npm run build
```

Start the production build locally:

```bash
npm run start
```

## Main Tutorial: Read the Visualization

1. Open the app.
2. Drag the 3D scene to rotate the vector space.
3. Scroll or pinch to zoom.
4. Look at the colored vector endpoints. Each color represents a topic group.
5. Look at the rays from the origin. Longer rays indicate larger vector magnitude in the current 3D projection.
6. Look at the translucent hull. This is the visible occupied volume of the set.
7. Compare the metric cards:
   - `Span volume`: bounding volume occupied by the projected vectors.
   - `Outer radius`: farthest vector endpoint from the origin.
   - `Density`: number of vectors per unit of occupied volume.
   - `Anisotropy`: how stretched the span is along one axis versus another.

## Tutorial: Compare Projection Bases

1. In `Projection basis`, select `Semantic`.
2. Rotate the scene and note how the topic groups separate.
3. Select `PCA-like`.
4. Watch the same vectors rotate into a basis that emphasizes broad variance.
5. Select `Contrast`.
6. Compare the hull shape and topic overlap.

The data remains deterministic, but the projection basis changes the 3D view. This is useful when explaining that an embedding can have many latent dimensions, while the app intentionally shows only a readable 3D projection.

## Tutorial: Expand and Contract the Space

1. Set `Cluster spread` near the minimum.
2. Notice that each topic forms a compact group and the hull shrinks.
3. Increase `Cluster spread`.
4. Watch endpoints move outward and the hull occupy more space.
5. Track `Span volume` and `Density`.

Interpretation: higher spread means the vector set covers more of the projected geometric space. Density may drop when volume grows faster than vector count.

## Tutorial: Add Bridge Vectors

1. Turn on `Nearest links`.
2. Set `Bridge vectors` to `0%`.
3. Notice that topic groups are more isolated.
4. Increase `Bridge vectors` toward `100%`.
5. Watch interpolated vectors fill the gaps between topic groups.

Bridge vectors demonstrate how semantic neighborhoods can connect. They help viewers see that embedding space is not only a set of clusters; it can include continuous transitions between concepts.

## Tutorial: Use the Slice Plane

1. Turn on `Slice plane`.
2. Move `Slice height` down and up.
3. Rotate the scene so the orange plane is visible.
4. Observe which vectors sit above, below, or near the plane.

Use this to explain cross-sections through the vector set. A slice makes the 3D volume easier to inspect when the hull is dense.

## Tutorial: Inspect Individual Vectors

1. Move the pointer over a vector endpoint.
2. Read the `Inspection` panel.
3. Compare the vector coordinates and magnitude.
4. Rotate the scene and hover the same region again.

This connects visual position to numeric coordinates without requiring the viewer to parse a high-dimensional embedding directly.

## Recommended Presentation Flow

Use this sequence when teaching or demoing:

1. Start with `Compact clusters`.
2. Explain points, rays, origin, topic colors, and hull.
3. Switch to `Wide span`.
4. Increase and decrease `Cluster spread`.
5. Switch to `Connected topics`.
6. Turn `Nearest links` on and increase `Bridge vectors`.
7. Move the `Slice plane` to show cross-sections.
8. Finish by changing `Projection basis` to clarify that the app is a 3D projection of richer embedding behavior.

## CI/CD

The app includes a GitHub Actions workflow at `site/.github/workflows/ci.yml`.

The workflow runs on pushes and pull requests to `main`:

```text
npm ci
npm run typecheck
npm run build
```

For a monorepo, move or copy the workflow to the repository-level `.github/workflows/` directory if your CI provider does not discover workflows nested under `site/`.

## Troubleshooting

If dependencies fail to install:

```bash
cd site
rm -rf node_modules package-lock.json
npm install
```

If the scene is blank:

- Confirm the browser supports WebGL.
- Try another browser.
- Check the developer console for WebGL or module-loading errors.

If the build fails due to stale generated files:

```bash
cd site
rm -rf .next
npm run build
```

If the app starts on a different port, use the URL printed in the terminal.
