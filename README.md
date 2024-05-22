[npm]: https://www.npmjs.com/package/google-fonts-file-loader
[google-fonts-api]: https://developers.google.com/fonts/docs/getting_started

[![npm verison](https://img.shields.io/npm/v/google-fonts-file-loader)][npm]
[![npm bundle size](https://img.shields.io/bundlephobia/min/google-fonts-file-loader)][npm]
[![npm downloads](https://img.shields.io/npm/dm/google-fonts-file-loader)][npm]

# google-fonts-file-loader

`google-fonts-file-loader` makes it easy to load binary file data for Google Fonts using the [Google Fonts API][google-fonts-api].

## Installation

```
npm install google-fonts-file-loader
```

## Usage

### Example: Vercel/Next Image Generation using Google Fonts

```tsx
import { ImageResponse } from "next/og";

import { loadGoogleFonts } from "google-fonts-file-loader";

export async function GET() {
  const text = "hello world";
  const fonts = await loadGoogleFonts({
    text,
    fonts: [
      { name: "Roboto" },
      { name: "Roboto Mono", weights: [400], styles: ["normal"] },
    ],
  });

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <h1
          style={{
            fontFamily: "Roboto",
            fontWeight: 800,
            fontStyle: "italic",
          }}
        >
          {text}
        </h1>
        <h1
          style={{
            fontFamily: "Roboto Mono",
            fontWeight: 400,
          }}
        >
          {text}
        </h1>
      </div>
    ),
    { fonts },
  );
}
```