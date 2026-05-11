#!/usr/bin/env python3
"""Compute idea-space breadth from grouped embeddings.

The primary metric is mean unordered pairwise cosine distance, normalized by
the number of pairs. Inputs must already contain embeddings.
"""

from __future__ import annotations

import argparse
import csv
import json
import math
import random
from collections import defaultdict
from pathlib import Path
from typing import Any, Iterable

Row = dict[str, Any]
Vector = list[float]


def parse_embedding(value: Any) -> Vector:
    if isinstance(value, list):
        return [float(item) for item in value]
    if not isinstance(value, str):
        raise ValueError(f"Unsupported embedding value: {value!r}")

    text = value.strip()
    if not text:
        raise ValueError("Empty embedding")
    if text.startswith("["):
        parsed = json.loads(text)
        if not isinstance(parsed, list):
            raise ValueError("Embedding JSON must be a list")
        return [float(item) for item in parsed]

    separator = "," if "," in text else None
    return [float(part) for part in text.split(separator) if part.strip()]


def normalize(vector: Vector) -> Vector:
    norm = math.sqrt(sum(item * item for item in vector))
    if norm == 0:
        raise ValueError("Zero-length embedding cannot be cosine-normalized")
    return [item / norm for item in vector]


def squared_norm(vector: Vector) -> float:
    return sum(item * item for item in vector)


def idea_volume(vectors: list[Vector], unit_interval: bool = False) -> tuple[float, float]:
    """Return mean pairwise cosine distance and mean pairwise similarity."""
    n = len(vectors)
    if n < 2:
        raise ValueError("At least two vectors are required")

    dim = len(vectors[0])
    summed = [0.0] * dim
    for vector in vectors:
        if len(vector) != dim:
            raise ValueError("All embeddings in a group must have the same dimension")
        unit = normalize(vector)
        for index, value in enumerate(unit):
            summed[index] += value

    mean_similarity = (squared_norm(summed) - n) / (n * (n - 1))
    mean_similarity = max(-1.0, min(1.0, mean_similarity))
    distance = 1.0 - mean_similarity
    if unit_interval:
        distance /= 2.0
    return distance, mean_similarity


def bootstrap_ci(
    vectors: list[Vector],
    iterations: int,
    seed: int,
    unit_interval: bool,
) -> tuple[float, float] | tuple[None, None]:
    if iterations <= 0 or len(vectors) < 3:
        return None, None

    rng = random.Random(seed)
    values: list[float] = []
    for _ in range(iterations):
        sample = [vectors[rng.randrange(len(vectors))] for _ in range(len(vectors))]
        value, _ = idea_volume(sample, unit_interval=unit_interval)
        values.append(value)

    values.sort()
    lower_index = max(0, math.floor(0.025 * (len(values) - 1)))
    upper_index = min(len(values) - 1, math.ceil(0.975 * (len(values) - 1)))
    return values[lower_index], values[upper_index]


def read_rows(path: Path, file_format: str) -> Iterable[Row]:
    if file_format == "jsonl":
        with path.open("r", encoding="utf-8") as handle:
            for line in handle:
                if line.strip():
                    parsed = json.loads(line)
                    if not isinstance(parsed, dict):
                        raise ValueError("Each JSONL line must be an object")
                    yield parsed
        return

    with path.open("r", encoding="utf-8", newline="") as handle:
        yield from csv.DictReader(handle)


def format_float(value: float | None) -> str:
    return "" if value is None else f"{value:.10g}"


def main() -> None:
    parser = argparse.ArgumentParser(description="Measure idea volume from grouped embeddings.")
    parser.add_argument("input", type=Path, help="CSV or JSONL file containing embeddings")
    parser.add_argument("--format", choices=["csv", "jsonl"], default="csv")
    parser.add_argument("--embedding-column", default="embedding")
    parser.add_argument("--group-columns", nargs="+", required=True)
    parser.add_argument("--output", type=Path, default=Path("idea_volume.csv"))
    parser.add_argument("--bootstrap", type=int, default=0, help="Bootstrap iterations for 95% CI")
    parser.add_argument("--seed", type=int, default=7)
    parser.add_argument(
        "--unit-interval",
        action="store_true",
        help="Report distance divided by 2. Leave off to reproduce the paper metric.",
    )
    args = parser.parse_args()

    groups: dict[tuple[str, ...], list[Vector]] = defaultdict(list)
    for row in read_rows(args.input, args.format):
        key = tuple(str(row[column]) for column in args.group_columns)
        groups[key].append(parse_embedding(row[args.embedding_column]))

    fieldnames = [
        *args.group_columns,
        "n",
        "pair_count",
        "dimension",
        "idea_volume_index",
        "mean_pairwise_cosine_similarity",
        "ci95_low",
        "ci95_high",
        "unit_interval",
    ]

    with args.output.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=fieldnames)
        writer.writeheader()
        for key, vectors in sorted(groups.items()):
            n = len(vectors)
            row: dict[str, str | int | bool] = dict(zip(args.group_columns, key))
            row["n"] = n
            row["pair_count"] = n * (n - 1) // 2
            row["dimension"] = len(vectors[0]) if vectors else 0
            row["unit_interval"] = args.unit_interval

            if n < 2:
                row["idea_volume_index"] = ""
                row["mean_pairwise_cosine_similarity"] = ""
                row["ci95_low"] = ""
                row["ci95_high"] = ""
            else:
                value, similarity = idea_volume(vectors, unit_interval=args.unit_interval)
                ci_low, ci_high = bootstrap_ci(vectors, args.bootstrap, args.seed, args.unit_interval)
                row["idea_volume_index"] = format_float(value)
                row["mean_pairwise_cosine_similarity"] = format_float(similarity)
                row["ci95_low"] = format_float(ci_low)
                row["ci95_high"] = format_float(ci_high)

            writer.writerow(row)


if __name__ == "__main__":
    main()
