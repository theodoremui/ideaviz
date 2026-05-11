**Role**: You are an expert UI/UX designer specializing in visualization.

**Task**: You are to design a highly interactive visualization of embedding vectors that is highly intuitive, easy to use, and helps the viewer understand how the volume of the set of embedding vectors can span the geometric space. Rather than using multidimensional visualization, use a maximum three-dimensional visualization of the embedding vectors.

In terms of technologies, use modern TypeScript that is strongly typed, Next.js, Tailwind CSS, shadcn/ui UX components, and modern CI/CD techniques. 

## Output instructions

Use best website design best practices, output all code and artifacts in the folder "site".  For images and assets, use the appropriate subfolder conventions.

Follow our coding style skills and best practices in all of your coding.


---

For the visualization, enable an intuitive UI/UX experience for the user to maximize just the visualization without the controls and the text description around it. 

For illustrating how to use this idea volume visualization tool, autogenerate 3 sets of 50 text strings each whose embeddings are visualized.

- Set 1: a set of 50 texts that are similarly about AI. The visualization should show a tightly bound volume.
- Set 2: a set of 50 texts that are about two clusters of topics: 1. AI, 2. medicine
- Set 3: a set of 50 texts that are about 50 different topics

For the user controls, enable the user to toggle easily across these 3 sets of data to illustrate how the volume of ideas are being represented across these 3 distinct types. The volume for Set 1 should be the smallest, while the volume for Set 3 should be the largest. Ultrathink on an intuitive user interface to let the user understand how the volume is represented by normalized pairwise cosine distance among the embedding vectors for that set. 

## Measuring Volume of Ideas

We are using this measure for the span of the set of ideas representing in a set of embedding vectors:

"""
We operationalize semantic diversity as dispersion in embedding space. For institution $i$ and year $t$, with article set $A_{i, t}$, we define the primary metric as mean pairwise cosine distance:

normalized pairwise cosine distance among the embedding vectors = 
D_{i,t}
=
\frac{2}{|A_{i,t}| \left( |A_{i,t}| - 1 \right)}
\sum_{\substack{a,b \in A_{i,t} \\ a < b}}
\left( 1 - \cos\!\big( e(a), e(b) \big) \right)
"""

---
For the display of how volume is measured, the rendering
  of the pairwise cosine distance needs to be rendered as a
  well-formed math expression, and not as text, i.e. render
  the LaTeX expression:
 
  """
  D_{i,t}
  =
  \frac{2}{|A_{i,t}| \left( |A_{i,t}| - 1 \right)}
  \sum_{\substack{a,b \in A_{i,t} \\ a < b}}
  \left( 1 - \cos\!\big( e(a), e(b) \big) \right)
  """
 
  In the explanation, also explain that the number of pairs
  is equal to N choose 2, in fully rendered math
  expression. For each of the word vectors in the
  visualization, add a piece of text that explains what
  word or phrase the vector corresponds to.