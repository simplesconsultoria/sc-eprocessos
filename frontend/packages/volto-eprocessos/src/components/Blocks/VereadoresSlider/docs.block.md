---
block: vereadoresSlider
---

Shows the councilors of a council as a slider of cards, with an optional link to the full list.

The block stores none of the councilor details. When it renders, it requests the content item in `source` and shows the councilors listed in the `items` of that response, so to change the councilors, change the source content.

### Fields

- `source`: a list with at most one `{ "@id": path }` object, where `path` is the path or full URL of the councilors content item. Without a source, the block shows nothing on the public site.
- `allLink`: a list with at most one `{ "@id": url }` object for the link to the full list. The URL can be internal or external. Without it, the block shows no link.
- `allLinkLabel`: the text of the link. Without a value, the link reads "See all".
- `autoplay`: `true` rotates the councilors on its own. Without a value, or with `false`, the slider only changes when a user moves it.
- `autoplayIntervalSeconds`: the number of seconds between rotations, at least `1`. Without a value, the block uses `5`.

### Examples

A slider that shows the councilors of a content item, with no link and no rotation:

```json
{
  "@type": "vereadoresSlider",
  "source": [{ "@id": "/councilors" }]
}
```

A slider that rotates every ten seconds and links to the full list:

```json
{
  "@type": "vereadoresSlider",
  "source": [{ "@id": "/councilors" }],
  "allLink": [{ "@id": "/councilors/all" }],
  "allLinkLabel": "See all councilors",
  "autoplay": true,
  "autoplayIntervalSeconds": 10
}
```
