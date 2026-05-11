"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  BrainCircuit,
  Box,
  Eye,
  Info,
  Layers3,
  Maximize2,
  Minimize2,
  Network,
  RotateCcw,
  ScanLine,
  Shuffle,
  Stethoscope,
} from "lucide-react";
import katex from "katex";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { ConvexGeometry } from "three/examples/jsm/geometries/ConvexGeometry.js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { SegmentedTabs } from "@/components/ui/tabs";
import {
  type DatasetId,
  type EmbeddingVector,
  createEmbeddingVectors,
  datasetForId,
  getSpanMetrics,
  ideaDatasets,
  topicForId,
  topics,
} from "@/lib/embedding-data";
import { cn } from "@/lib/utils";

type SceneOptions = {
  showHull: boolean;
  showLinks: boolean;
  showSlice: boolean;
  slice: number;
  vectorScale: number;
};

type HoverPoint = {
  x: number;
  y: number;
};

const datasetOptions = ideaDatasets.map((dataset) => ({ value: dataset.id, label: dataset.shortLabel }));

const datasetIcons: Record<DatasetId, IconComponent> = {
  "ai-tight": BrainCircuit,
  "ai-medicine": Stethoscope,
  "wide-topics": Shuffle,
};

function formatMetric(value: number, digits = 2): string {
  return Number.isFinite(value) ? value.toFixed(digits) : "0.00";
}

function vectorToThree(vector: readonly [number, number, number], scale: number): THREE.Vector3 {
  return new THREE.Vector3(vector[0] * scale, vector[1] * scale, vector[2] * scale);
}

function makeTextSprite(
  text: string,
  color: string,
  options: { width?: number; height?: number; fontSize?: number; scaleX?: number; scaleY?: number; opacity?: number } = {},
): THREE.Sprite {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  const width = options.width ?? 320;
  const height = options.height ?? 88;
  canvas.width = width;
  canvas.height = height;

  if (context) {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = `rgba(255,255,255,${options.opacity ?? 0.88})`;
    context.strokeStyle = "rgba(24,35,48,0.16)";
    context.lineWidth = 2;
    context.roundRect(8, 8, width - 16, height - 24, 10);
    context.fill();
    context.stroke();
    context.fillStyle = color;
    context.font = `600 ${options.fontSize ?? 26}px Arial`;
    context.textBaseline = "middle";
    context.fillText(text, 22, (height - 16) / 2);
  }

  const texture = new THREE.CanvasTexture(canvas);
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(options.scaleX ?? 1.35, options.scaleY ?? 0.38, 1);
  return sprite;
}

function connectNearestNeighbors(scene: THREE.Scene, vectors: readonly EmbeddingVector[], scale: number): void {
  const material = new THREE.LineBasicMaterial({ color: "#334155", transparent: true, opacity: 0.22 });

  vectors.forEach((source) => {
    const nearest = vectors
      .filter((target) => target.id !== source.id)
      .map((target) => ({
        target,
        distance: Math.hypot(
          source.vector[0] - target.vector[0],
          source.vector[1] - target.vector[1],
          source.vector[2] - target.vector[2],
        ),
      }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 1);

    nearest.forEach(({ target }) => {
      const geometry = new THREE.BufferGeometry().setFromPoints([
        vectorToThree(source.vector, scale),
        vectorToThree(target.vector, scale),
      ]);
      scene.add(new THREE.Line(geometry, material));
    });
  });
}

function addAxes(scene: THREE.Scene, scale: number): void {
  const axisData: readonly { label: string; color: string; end: THREE.Vector3 }[] = [
    { label: "x", color: "#0f766e", end: new THREE.Vector3(scale * 1.75, 0, 0) },
    { label: "y", color: "#c2410c", end: new THREE.Vector3(0, scale * 1.75, 0) },
    { label: "z", color: "#4f46e5", end: new THREE.Vector3(0, 0, scale * 1.75) },
  ];

  axisData.forEach((axis) => {
    const arrow = new THREE.ArrowHelper(axis.end.clone().normalize(), new THREE.Vector3(0, 0, 0), axis.end.length(), axis.color, 0.18, 0.09);
    scene.add(arrow);
    const label = makeTextSprite(axis.label, axis.color);
    label.position.copy(axis.end.multiplyScalar(1.06));
    scene.add(label);
  });
}

function addSpanHull(scene: THREE.Scene, vectors: readonly EmbeddingVector[], scale: number): void {
  const points = vectors.map((item) => vectorToThree(item.vector, scale));
  const geometry = new ConvexGeometry(points);
  const material = new THREE.MeshStandardMaterial({
    color: "#5eead4",
    transparent: true,
    opacity: 0.18,
    roughness: 0.8,
    metalness: 0,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  const edgeGeometry = new THREE.EdgesGeometry(geometry, 18);
  const edgeMaterial = new THREE.LineBasicMaterial({ color: "#0f766e", transparent: true, opacity: 0.34 });
  scene.add(new THREE.LineSegments(edgeGeometry, edgeMaterial));
}

function addSlicePlane(scene: THREE.Scene, slice: number, scale: number): void {
  const geometry = new THREE.PlaneGeometry(scale * 3.6, scale * 3.6, 1, 1);
  const material = new THREE.MeshBasicMaterial({
    color: "#f97316",
    transparent: true,
    opacity: 0.12,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const plane = new THREE.Mesh(geometry, material);
  plane.rotation.x = Math.PI / 2;
  plane.position.y = slice * scale;
  scene.add(plane);

  const grid = new THREE.GridHelper(scale * 3.6, 12, "#f97316", "#f97316");
  const gridMaterial = grid.material;
  if (Array.isArray(gridMaterial)) {
    gridMaterial.forEach((item) => {
      item.transparent = true;
      item.opacity = 0.22;
    });
  } else {
    gridMaterial.transparent = true;
    gridMaterial.opacity = 0.22;
  }
  grid.position.y = slice * scale + 0.01;
  scene.add(grid);
}

function addVectors(
  scene: THREE.Scene,
  vectors: readonly EmbeddingVector[],
  scale: number,
  vectorScale: number,
): THREE.Object3D[] {
  const pickable: THREE.Object3D[] = [];
  const sphereGeometry = new THREE.SphereGeometry(0.055, 20, 20);
  const hitGeometry = new THREE.SphereGeometry(0.16, 16, 16);
  const hitMaterial = new THREE.MeshBasicMaterial({
    transparent: true,
    opacity: 0,
    depthWrite: false,
  });

  vectors.forEach((item) => {
    const topic = topicForId(item.topic);
    const end = vectorToThree(item.vector, scale);
    const material = new THREE.MeshStandardMaterial({ color: topic.color, roughness: 0.48, metalness: 0.04 });
    const sphere = new THREE.Mesh(sphereGeometry, material);
    sphere.position.copy(end);
    sphere.userData = { id: item.id };
    scene.add(sphere);

    const hitTarget = new THREE.Mesh(hitGeometry, hitMaterial);
    hitTarget.position.copy(end);
    hitTarget.userData = { id: item.id };
    scene.add(hitTarget);
    pickable.push(hitTarget);

    const direction = end.clone().normalize();
    const length = Math.max(0.08, end.length() * vectorScale);
    const arrow = new THREE.ArrowHelper(direction, new THREE.Vector3(0, 0, 0), length, topic.color, 0.08, 0.035);
    const lineMaterial = arrow.line.material;
    if (lineMaterial instanceof THREE.LineBasicMaterial) {
      lineMaterial.transparent = true;
      lineMaterial.opacity = 0.28;
    }
    scene.add(arrow);
  });

  return pickable;
}

function useEmbeddingScene(
  containerRef: React.RefObject<HTMLDivElement | null>,
  vectors: readonly EmbeddingVector[],
  options: SceneOptions,
  onHover: (vector: EmbeddingVector | null, point: HoverPoint | null) => void,
): void {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const width = container.clientWidth;
    const height = container.clientHeight;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#f7f4ed");
    scene.fog = new THREE.Fog("#f7f4ed", 5.8, 10);

    const camera = new THREE.PerspectiveCamera(45, width / Math.max(1, height), 0.1, 100);
    camera.position.set(4.5, 3.3, 5.4);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.domElement.style.cursor = "grab";
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minDistance = 3;
    controls.maxDistance = 9;

    scene.add(new THREE.HemisphereLight("#ffffff", "#d6cec0", 2.4));
    const keyLight = new THREE.DirectionalLight("#ffffff", 2.2);
    keyLight.position.set(4, 6, 3);
    scene.add(keyLight);

    const scale = 1.5;
    addAxes(scene, scale);

    if (options.showLinks) {
      connectNearestNeighbors(scene, vectors, scale);
    }

    if (options.showHull && vectors.length >= 4) {
      addSpanHull(scene, vectors, scale);
    }

    if (options.showSlice) {
      addSlicePlane(scene, options.slice, scale);
    }

    const pickable = addVectors(scene, vectors, scale, options.vectorScale);
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let frameId = 0;

    const handlePointerMove = (event: PointerEvent): void => {
      const bounds = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
      pointer.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const [hit] = raycaster.intersectObjects(pickable, false);
      const id = hit?.object.userData.id as string | undefined;
      const vector = vectors.find((item) => item.id === id) ?? null;
      renderer.domElement.style.cursor = vector ? "pointer" : "grab";
      onHover(
        vector,
        vector
          ? {
              x: event.clientX - bounds.left,
              y: event.clientY - bounds.top,
            }
          : null,
      );
    };

    const handlePointerLeave = (): void => {
      renderer.domElement.style.cursor = "grab";
      onHover(null, null);
    };

    const handleResize = (): void => {
      const nextWidth = container.clientWidth;
      const nextHeight = container.clientHeight;
      camera.aspect = nextWidth / Math.max(1, nextHeight);
      camera.updateProjectionMatrix();
      renderer.setSize(nextWidth, nextHeight);
    };

    const animate = (): void => {
      controls.update();
      renderer.render(scene, camera);
      frameId = window.requestAnimationFrame(animate);
    };

    renderer.domElement.addEventListener("pointermove", handlePointerMove);
    renderer.domElement.addEventListener("pointerleave", handlePointerLeave);
    window.addEventListener("resize", handleResize);
    animate();

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("resize", handleResize);
      renderer.domElement.removeEventListener("pointermove", handlePointerMove);
      renderer.domElement.removeEventListener("pointerleave", handlePointerLeave);
      controls.dispose();
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh || object instanceof THREE.Line || object instanceof THREE.LineSegments || object instanceof THREE.Sprite) {
          if ("geometry" in object) {
            object.geometry.dispose();
          }
          if (object instanceof THREE.Sprite && object.material.map) {
            object.material.map.dispose();
          }
          const material = object.material;
          if (Array.isArray(material)) {
            material.forEach((item) => item.dispose());
          } else {
            material.dispose();
          }
        }
      });
      renderer.dispose();
      container.removeChild(renderer.domElement);
    };
  }, [containerRef, onHover, options.showHull, options.showLinks, options.showSlice, options.slice, options.vectorScale, vectors]);
}

function MathExpression({ expression, display = false }: { expression: string; display?: boolean }): React.ReactElement {
  const html = useMemo(
    () => katex.renderToString(expression, { displayMode: display, throwOnError: false, strict: "ignore" }),
    [display, expression],
  );

  return display ? (
    <div
      className="overflow-x-auto py-1 text-[0.92rem]"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  ) : (
    <span
      className="inline-block align-middle"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

function FormulaPanel(): React.ReactElement {
  return (
    <div className="grid gap-3">
      <div className="rounded-md border bg-muted/80 p-3 text-foreground">
        <div className="mb-2 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">Metric</div>
        <div className="[&_.katex-display]:my-0 [&_.katex]:text-[0.82rem]">
          <MathExpression
            display
            expression={String.raw`\begin{aligned}
D_{i,t}
&=
\frac{2}{|A_{i,t}|\left(|A_{i,t}|-1\right)}
\\
&\quad\cdot
\sum_{\substack{a,b\in A_{i,t}\\a<b}}
\left(1-\cos\!\big(e(a),e(b)\big)\right)
\end{aligned}`}
          />
        </div>
      </div>

      <div className="grid gap-2 rounded-md border bg-card p-3">
        <div className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">Pair count</div>
        <div className="[&_.katex]:text-[0.95rem]">
          <MathExpression expression={String.raw`N = |A_{i,t}|`} />{" "}
          <span className="text-muted-foreground">vectors create</span>{" "}
          <MathExpression expression={String.raw`\binom{N}{2} = \frac{N(N-1)}{2}`} />{" "}
          <span className="text-muted-foreground">unique pairs.</span>
        </div>
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 text-center text-xs text-muted-foreground">
        <div className="rounded-md bg-muted px-2 py-2">compute every pair distance</div>
        <div aria-hidden="true" className="font-semibold text-primary">→</div>
        <div className="rounded-md bg-muted px-2 py-2">average the distances</div>
      </div>
    </div>
  );
}

export function EmbeddingExplorer(): React.ReactElement {
  const [datasetId, setDatasetId] = useState<DatasetId>("ai-medicine");
  const [sceneOptions, setSceneOptions] = useState<SceneOptions>({
    showHull: true,
    showLinks: true,
    showSlice: true,
    slice: 0.18,
    vectorScale: 0.96,
  });
  const [hovered, setHovered] = useState<EmbeddingVector | null>(null);
  const [hoverPoint, setHoverPoint] = useState<HoverPoint | null>(null);
  const [focusMode, setFocusMode] = useState(false);
  const sceneRef = useRef<HTMLDivElement>(null);
  const vectors = useMemo(() => createEmbeddingVectors(datasetId), [datasetId]);
  const dataset = useMemo(() => datasetForId(datasetId), [datasetId]);
  const metrics = useMemo(() => getSpanMetrics(vectors), [vectors]);

  const handleVectorHover = useCallback((vector: EmbeddingVector | null, point: HoverPoint | null) => {
    setHovered(vector);
    setHoverPoint(point);
  }, []);

  useEmbeddingScene(sceneRef, vectors, sceneOptions, handleVectorHover);

  const resetView = (): void => {
    setDatasetId("ai-medicine");
    setSceneOptions({
      showHull: true,
      showLinks: true,
      showSlice: true,
      slice: 0.18,
      vectorScale: 0.96,
    });
  };

  return (
    <main className="min-h-screen overflow-hidden">
      <div className={cn("grid min-h-screen grid-cols-1", focusMode ? "lg:grid-cols-1" : "lg:grid-cols-[minmax(0,1fr)_400px]")}>
        <section className={cn("relative lg:min-h-screen", focusMode ? "min-h-screen" : "min-h-[62vh]")}>
          <div ref={sceneRef} className="absolute inset-0" aria-label="Interactive 3D embedding vector field" />

          {hovered && hoverPoint ? (
            <div
              className="pointer-events-none absolute z-10 max-w-[min(320px,calc(100%-2rem))] rounded-md border bg-white/94 p-3 text-sm shadow-lg backdrop-blur"
              style={{
                left: `clamp(1rem, ${hoverPoint.x + 18}px, calc(100% - 21rem))`,
                top: `clamp(1rem, ${hoverPoint.y + 18}px, calc(100% - 10rem))`,
              }}
            >
              <div className="mb-1 flex items-center gap-2 font-semibold text-foreground">
                <span className="size-2.5 rounded-full" style={{ backgroundColor: topicForId(hovered.topic).color }} />
                {hovered.label}
              </div>
              <p className="leading-5 text-muted-foreground">{hovered.text}</p>
            </div>
          ) : null}

          <div className="absolute right-4 top-4 flex gap-2">
            {!focusMode ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="bg-white/88 backdrop-blur"
                onClick={() => setFocusMode(true)}
              >
                <Maximize2 />
                Focus
              </Button>
            ) : (
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="bg-white/88 backdrop-blur"
                aria-label="Exit visualization focus mode"
                title="Exit focus"
                onClick={() => setFocusMode(false)}
              >
                <Minimize2 />
              </Button>
            )}
          </div>

          {!focusMode ? (
            <>
              <div className="pointer-events-none absolute left-4 top-4 max-w-[min(680px,calc(100%-2rem))]">
                <div className="rounded-lg border bg-white/84 p-4 shadow-sm backdrop-blur">
                  <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                    <Activity className="size-4" />
                    Embedding Volume Visualizer
                  </div>
                  <h1 className="max-w-3xl text-3xl font-semibold leading-tight text-foreground md:text-5xl">
                    Semantic volume is average pairwise distance.
                  </h1>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground md:text-base">
                    Each point is one text string. Hover a point to reveal its text without cluttering the shape. The translucent hull is the visual envelope; the primary metric is the normalized mean of every pairwise cosine distance.
                  </p>
                </div>
              </div>

              <div className="pointer-events-none absolute bottom-4 left-4 right-4 grid gap-3 md:grid-cols-4">
                <MetricCard icon={Maximize2} label="Idea volume" value={formatMetric(metrics.meanPairwiseCosineDistance, 3)} />
                <MetricCard icon={Network} label="Pair distances" value={`${metrics.pairCount}`} />
                <MetricCard icon={Box} label="Visual hull" value={formatMetric(metrics.hullVolume)} />
                <MetricCard icon={ScanLine} label="Anisotropy" value={`${formatMetric(metrics.anisotropy, 1)}x`} />
              </div>
            </>
          ) : null}
        </section>

        <aside className={cn("border-l bg-background/96 p-4 shadow-[-10px_0_40px_rgba(15,23,42,0.08)] lg:max-h-screen lg:overflow-y-auto", focusMode && "hidden")}>
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold">Idea volume controls</h2>
              <p className="mt-1 text-sm text-muted-foreground">Switch datasets to see how semantic dispersion changes with topic breadth.</p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Reset visualization"
              title="Reset"
              onClick={resetView}
            >
              <RotateCcw />
            </Button>
          </div>

          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Demo data</CardTitle>
              <CardDescription>Each set contains exactly 50 generated text strings.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              <SegmentedTabs
                ariaLabel="Demo dataset"
                className="grid-cols-3"
                value={datasetId}
                options={datasetOptions}
                onValueChange={setDatasetId}
              />
              <div className="rounded-md border bg-card p-3">
                <div className="mb-2 flex items-center gap-2 font-medium">
                  {(() => {
                    const DatasetIcon = datasetIcons[dataset.id];
                    return <DatasetIcon className="size-4 text-primary" />;
                  })()}
                  {dataset.label}
                </div>
                <p className="text-sm leading-6 text-muted-foreground">{dataset.description}</p>
                <div className="mt-3 flex items-center justify-between gap-3 rounded-md bg-muted px-3 py-2 text-sm">
                  <span className="text-muted-foreground">Expected relative volume</span>
                  <span className="font-semibold">{dataset.expectedVolume}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-4">
            <CardHeader>
              <CardTitle>How volume is measured</CardTitle>
              <CardDescription>The displayed score is the paper metric: normalized pairwise cosine dispersion.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              <FormulaPanel />
              <p className="text-sm leading-6 text-muted-foreground">
                The summation visits each unordered article pair once. The leading factor divides by{" "}
                <MathExpression expression={String.raw`\binom{N}{2}`} />, converting the total pairwise cosine distance into an average.
              </p>
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-md border bg-card p-3">
                  <div className="text-xs text-muted-foreground">Current D</div>
                  <div className="mt-1 text-2xl font-semibold tabular-nums">{formatMetric(metrics.meanPairwiseCosineDistance, 3)}</div>
                </div>
                <div className="rounded-md border bg-card p-3">
                  <div className="text-xs text-muted-foreground">Pairs</div>
                  <div className="mt-1 text-2xl font-semibold tabular-nums">{metrics.pairCount}</div>
                </div>
              </div>
              <p className="text-sm leading-6 text-muted-foreground">
                Lower scores mean the texts are close in embedding space. Higher scores mean the set spans more distinct ideas.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Scene layers</CardTitle>
              <CardDescription>Use the hull for shape, links for local neighborhoods, and the slice plane for depth.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <ToggleRow
                icon={Box}
                label="Span hull"
                checked={sceneOptions.showHull}
                onCheckedChange={(showHull) => setSceneOptions((current) => ({ ...current, showHull }))}
              />
              <ToggleRow
                icon={Network}
                label="Nearest links"
                checked={sceneOptions.showLinks}
                onCheckedChange={(showLinks) => setSceneOptions((current) => ({ ...current, showLinks }))}
              />
              <ToggleRow
                icon={Layers3}
                label="Slice plane"
                checked={sceneOptions.showSlice}
                onCheckedChange={(showSlice) => setSceneOptions((current) => ({ ...current, showSlice }))}
              />
              <SliderControl
                label="Slice height"
                value={sceneOptions.slice}
                min={-0.9}
                max={0.9}
                step={0.03}
                display={formatMetric(sceneOptions.slice)}
                onChange={(slice) => setSceneOptions((current) => ({ ...current, slice }))}
              />
              <SliderControl
                label="Vector ray length"
                value={sceneOptions.vectorScale}
                min={0.35}
                max={1}
                step={0.05}
                display={`${Math.round(sceneOptions.vectorScale * 100)}%`}
                onChange={(vectorScale) => setSceneOptions((current) => ({ ...current, vectorScale }))}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Inspection</CardTitle>
              <CardDescription>Hover a point to inspect the generated text and embedding projection.</CardDescription>
            </CardHeader>
            <CardContent>
              {hovered ? (
                <div className="grid gap-3">
                  <div className="flex items-center gap-3">
                    <span className="size-3 rounded-full" style={{ backgroundColor: topicForId(hovered.topic).color }} />
                    <div>
                      <div className="font-medium">{hovered.label}</div>
                      <div className="text-sm text-muted-foreground">{topicForId(hovered.topic).name}</div>
                    </div>
                  </div>
                  <code className="block rounded-md bg-muted p-3 text-xs leading-5 text-foreground">
                    [{hovered.vector.map((item) => formatMetric(item)).join(", ")}]
                  </code>
                  <p className="text-sm text-muted-foreground">
                    {hovered.text}
                  </p>
                </div>
              ) : (
                <div className="flex items-center gap-3 rounded-md bg-muted p-3 text-sm text-muted-foreground">
                  <Eye className="size-4 shrink-0" />
                  Move over any point in the scene.
                </div>
              )}
            </CardContent>
          </Card>

          <div className="mt-4 grid grid-cols-2 gap-2">
            {topics.map((topic) => (
              <div key={topic.id} className="rounded-md border bg-card p-3">
                <div className="mb-1 flex items-center gap-2 text-sm font-medium">
                  <span className="size-2.5 rounded-full" style={{ backgroundColor: topic.color }} />
                  {topic.name}
                </div>
                <p className="text-xs leading-5 text-muted-foreground">{topic.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-start gap-2 rounded-md bg-muted p-3 text-xs leading-5 text-muted-foreground">
            <Info className="mt-0.5 size-4 shrink-0" />
            The 3D view is a projection for intuition; the volume score uses the underlying normalized embedding vectors.
          </div>
        </aside>
      </div>
    </main>
  );
}

type IconComponent = React.ComponentType<{ className?: string }>;

function MetricCard({ icon: Icon, label, value }: { icon: IconComponent; label: string; value: string }): React.ReactElement {
  return (
    <div className="rounded-lg border bg-white/86 p-3 shadow-sm backdrop-blur">
      <div className="mb-1 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
        <Icon className="size-3.5" />
        {label}
      </div>
      <div className="text-2xl font-semibold tabular-nums">{value}</div>
    </div>
  );
}

function SliderControl({
  label,
  value,
  min,
  max,
  step,
  display,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  display: string;
  onChange: (value: number) => void;
}): React.ReactElement {
  const id = label.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between gap-3">
        <Label htmlFor={id}>{label}</Label>
        <span className="rounded-sm bg-muted px-2 py-1 text-xs font-medium tabular-nums text-muted-foreground">{display}</span>
      </div>
      <Slider id={id} min={min} max={max} step={step} value={[value]} onValueChange={([next]) => onChange(next ?? value)} />
    </div>
  );
}

function ToggleRow({
  icon: Icon,
  label,
  checked,
  onCheckedChange,
}: {
  icon: IconComponent;
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}): React.ReactElement {
  const id = label.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex items-center justify-between gap-3">
      <Label htmlFor={id} className="flex items-center gap-2">
        <Icon className={cn("size-4", checked ? "text-primary" : "text-muted-foreground")} />
        {label}
      </Label>
      <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}
