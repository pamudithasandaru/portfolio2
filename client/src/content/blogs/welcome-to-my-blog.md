---
title: Welcome to my blog
date: 2026-11-01
summary: What I'll write about here, and a quick guide to how posts on this site are written (delete or edit this file when you publish your first real post).
tags: [Meta, Markdown, AI]
---

Hi, I'm Sandaru. This is where I write about **machine learning**, software engineering and whatever I'm learning along the way. You can rate any post and leave a comment at the bottom, and I read all of them.

## How posts are written

Every post is a single Markdown file in `client/src/content/blogs/`. The file name becomes the address, so `welcome-to-my-blog.md` lives at `/blogs/welcome-to-my-blog`.

The block at the very top of the file (between the `---` lines) holds the details shown on the blog list:

| Field | Required | What it does |
| --- | --- | --- |
| `title` | yes | Post title |
| `date` | yes | Publish date, `YYYY-MM-DD`. Newest posts appear first |
| `summary` | recommended | The short text on the blog card |
| `tags` | optional | Shown as chips and used by the tag filter, e.g. `[AI, Python]` |
| `cover` | optional | Cover image: shown on the blog list and as a soft backdrop behind the post title, e.g. `/blog-images/my-cover.png` |
| `video` | optional | YouTube link shown at the top of the post, under the title |
| `draft` | optional | `draft: true` hides the post from the published site |

## Images

Put every image in one shared folder, `client/public/blog-images/`, and refer to it with an absolute path. The text inside the square brackets becomes the caption:

![A small neural network: three inputs, four hidden neurons and two outputs](/blog-images/neural-network.svg)

After adding PNG or JPG images, run `npm run optimize-images` in the `client` folder to create fast WebP versions automatically.

## Code

Fenced code blocks are highlighted:

```python
import numpy as np

def sigmoid(x):
    return 1 / (1 + np.exp(-x))

# a single neuron: weighted sum of the inputs, squashed by the activation
inputs = np.array([0.5, 0.1, 0.9])
weights = np.array([0.4, -0.2, 0.7])
print(sigmoid(inputs @ weights))
```

Inline code such as `model.fit(X, y)` works too.

## Other things Markdown can do

> Quotes look like this. Handy for definitions or for citing a paper.

- Bullet lists
- **Bold**, *italic* and [links](https://github.com/pamudithasandaru)
- Tables, as shown above

1. Numbered lists
2. Work the same way

That's everything you need. Happy writing!
