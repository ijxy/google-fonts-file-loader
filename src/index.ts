import { CssDeclarationAST, CssFontFaceAST, CssTypes, parse as parseCss } from "@adobe/css-tools";

import {
  FontStyle,
  FontWeight,
  GoogleFontParams,
  constructGoogleFontsQueryUrl,
} from "./google-fonts-api";

export type LoadGoogleFontsInput = {
  fonts: Array<GoogleFontParams>;
  text?: string;
};

export type Font = {
  name: string;
  style: FontStyle;
  weight: FontWeight;
  data: ArrayBuffer;
};

export async function loadGoogleFonts({ fonts, text }: LoadGoogleFontsInput): Promise<Array<Font>> {
  const fontFaces = await getFontFaces({ fonts, text });
  const results = await Promise.allSettled(fontFaces.map(toFont));
  return results
    .map((r) => (r.status === "fulfilled" ? r.value : null))
    .filter((v): v is NonNullable<typeof v> => !!v);
}

type FontFace = {
  name: string;
  style: FontStyle;
  weight: FontWeight;
  url: URL;
  format: string;
};

async function toFont(f: FontFace): Promise<Font> {
  const response = await fetch(f.url);
  if (!response.ok) {
    throw new Error(response.statusText);
  }
  const data = await response.arrayBuffer();
  return {
    name: f.name,
    weight: f.weight,
    style: f.style,
    data,
  };
}

async function getFontFaces({
  fonts,
  text,
}: {
  fonts: Array<GoogleFontParams>;
  text: string | undefined;
}): Promise<Array<FontFace>> {
  const url = constructGoogleFontsQueryUrl({ fonts, text });

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(response.statusText);
  }

  const stylesheet = await response.text();

  return parseCss(stylesheet)
    .stylesheet.rules.filter((r): r is CssFontFaceAST => r.type === CssTypes.fontFace)
    .map(toFontFace);
}

function toFontFace(ff: CssFontFaceAST): FontFace {
  const parsedEntries = ff.declarations
    .filter((d): d is CssDeclarationAST => d.type === CssTypes.declaration)
    .map((d) => [d.property, d.value]);

  const parsed = Object.fromEntries(parsedEntries) as {
    "font-family": `'${string}'`;
    "font-style": "normal" | "italic";
    "font-weight": `${FontWeight}`;
    src: `url(${string}) format('${string}')`;
  };

  const [srcUrl = "", srcFormat = ""] = parsed.src.split(" ");

  return {
    name: parsed["font-family"].slice("'".length, -"'".length), // strip '...'
    style: parsed["font-style"],
    weight: Number(parsed["font-weight"]) as FontWeight,
    url: new URL(srcUrl.slice("url(".length, -")".length)), // strip url(...)
    format: srcFormat.slice("format('".length, -"')".length), // strip format('...')
  };
}
