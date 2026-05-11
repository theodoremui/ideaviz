---
name: measure-idea-volume
description: Compute and explain idea-space volume, semantic diversity, or embedding dispersion from text/article embeddings using normalized pairwise cosine distance. Use when Codex needs to quantify breadth of ideas, compare discourse diversity across groups or time periods, reproduce the ICHMS2026 paper metric, bootstrap confidence intervals, or avoid misleading multidimensional/hypervolume interpretations of embedding sets.
---

# Measure Idea Volume

## Core Definition

Represent "volume of ideas" as a dispersion proxy: the mean unordered pairwise cosine distance among embeddings in a corpus slice.

For a group `G` with `n` items and embeddings `e_i`, L2-normalize each vector to `u_i`, then compute:

```text
D_G = 2 / (n * (n - 1)) * sum_{i<j} (1 - dot(u_i, u_j))
```

Interpret `D_G` as the normalized pairwise cosine dispersion index:

- Higher `D_G`: vectors are farther apart on average; the group spans a broader idea region.
- Lower `D_G`: vectors are closer together; the group is semantically convergent.
- `D_G` is normalized by the number of unordered pairs, so groups with different article counts can be compared more fairly.
- Do not call this a literal Euclidean hypervolume. It is a stable scalar proxy for idea-space breadth.

If a unit-interval score is required for UI display, report `D_G / 2` as a separate display normalization. Preserve raw `D_G` for analysis to match the paper.

## Workflow

1. Confirm the analysis unit: article, paragraph, document, idea card, or other text item.
2. Confirm the grouping columns: common groups are `institution`, `year`, `topic`, `author cohort`, or `time window`.
3. Use embeddings from one consistent model and preprocessing pipeline across every group being compared.
4. L2-normalize vectors before cosine calculations, even if the provider says embeddings are normalized.
5. Compute `D_G` for each group with the formula above.
6. Include `n`, `pair_count`, embedding dimension, and any confidence intervals with the result.
7. Compare trajectories using raw `D_G`, percent change from a baseline year, or regression slopes. Avoid comparing values across runs that use different embedding models.

## Script

Use `scripts/measure_idea_volume.py` for deterministic computation from CSV or JSONL files that already contain embeddings.

CSV example:

```bash
python skills/measure-idea-volume/scripts/measure_idea_volume.py \
  articles.csv \
  --embedding-column embedding \
  --group-columns institution year \
  --bootstrap 100 \
  --output idea_volume.csv
```

JSONL example:

```bash
python skills/measure-idea-volume/scripts/measure_idea_volume.py \
  embeddings.jsonl \
  --format jsonl \
  --embedding-column embedding \
  --group-columns institution year \
  --unit-interval \
  --output idea_volume.csv
```

Accepted embedding formats:

- JSON list: `[0.12, -0.03, ...]`
- Comma-separated string: `0.12,-0.03,...`
- Whitespace-separated string: `0.12 -0.03 ...`

## Reporting Pattern

When presenting results, use this structure:

```text
Group: Stanford 2024
n: 138 articles
pair_count: 9,453
idea_volume_index: 0.214
95% bootstrap CI: [0.199, 0.228]
Interpretation: article embeddings are closer together than the 2012 baseline, indicating a narrower idea-space breadth in this projection/model.
```

Always state the embedding model, preprocessing, grouping, and whether scores are raw `D_G` or unit-interval `D_G / 2`.

## Validation And Caveats

- Require `n >= 2`; flag smaller groups as insufficient.
- Use bootstrap resampling when yearly article counts vary or when trends will support decisions.
- Inspect outlier-driving documents or clusters before drawing sociotechnical conclusions.
- Treat model changes, corpus composition shifts, publication volume, and topical shocks as confounders.
- Use aggregated outputs. Do not create individual-level "idea diversity" or risk scores.

## Reference

Read `references/paper-metric.md` when reproducing or explaining the paper-specific formulation.
