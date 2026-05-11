# Paper Metric: Normalized Pairwise Cosine Dispersion

The ICHMS2026 paper operationalizes semantic diversity as the breadth of ideas in a corpus slice, measured with article-level embeddings.

## Source Formulation

For institution `i` and year `t`, with article set `A_i,t`, each article `a` has an embedding vector `e(a)`. The paper defines semantic diversity as mean pairwise cosine distance:

```text
D_i,t = 2 / (|A_i,t| * (|A_i,t| - 1)) *
        sum over unordered article pairs a<b of
        (1 - cos(e(a), e(b)))
```

This is "normalized" by the number of unordered article pairs. It is not a convex hull volume and not a high-dimensional Euclidean volume.

## Interpretation

- Larger average pairwise cosine distance means articles cover more divergent subjects or meanings.
- Smaller average pairwise cosine distance means articles cover more similar semantic ground.
- A flat or declining time series indicates stable or contracting idea-space breadth under the same embedding model and preprocessing.

## Efficient Equivalent

After L2-normalizing all vectors to `u_i`, the mean unordered pairwise cosine similarity can be computed without materializing all pairs:

```text
mean_pairwise_cosine_similarity =
  (||sum_i u_i||^2 - n) / (n * (n - 1))

mean_pairwise_cosine_distance =
  1 - mean_pairwise_cosine_similarity
```

Use the direct pairwise formula for small audit samples if needed; use the efficient equivalent for production.

## Recommended Audit Outputs

For each group, report:

- group keys
- `n`
- `pair_count = n * (n - 1) / 2`
- embedding dimension
- raw idea volume index `D`
- optional unit-interval display score `D / 2`
- bootstrap confidence interval if used
- embedding model and preprocessing notes
