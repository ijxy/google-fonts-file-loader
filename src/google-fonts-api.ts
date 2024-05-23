export type FontWeight = 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;

export type FontStyle = "normal" | "italic";

export type GoogleFontParams = {
  name: string;
  weights?: Array<FontWeight> | undefined;
  styles?: Array<FontStyle> | undefined;
};

export function constructGoogleFontsQueryUrl({
  text,
  fonts,
}: {
  fonts: Array<GoogleFontParams>;
  text?: string;
}): URL {
  const url = new URL(`https://fonts.googleapis.com/css`);

  if (fonts?.length) {
    url.searchParams.set("family", constructFontsQuery(fonts));
  }

  if (text) {
    url.searchParams.set("text", text);
  }

  return url;
}

function constructFontsQuery(fonts: Array<GoogleFontParams>) {
  return fonts.map(constructFontQuery).join("|");
}

const DEFAULT_WEIGHTS: Array<FontWeight> = [100, 200, 300, 400, 500, 600, 700, 800, 900];
const DEFAULT_STYLES: Array<FontStyle> = ["normal", "italic"];

function constructFontQuery(params: GoogleFontParams): string {
  const styles = params.styles?.length ? params.styles : DEFAULT_STYLES;
  const italic = !!styles.includes("italic");
  const normal = !!styles.includes("normal");

  const weights = params.weights?.length ? params.weights : DEFAULT_WEIGHTS;

  const selection = weights.reduce((ws, w) => {
    if (normal) {
      ws.push(`${w}`);
    }
    if (italic) {
      ws.push(`${w}i`);
    }
    return ws;
  }, [] as Array<string>);

  return `${params.name}:${selection.join(",")}`;
}
