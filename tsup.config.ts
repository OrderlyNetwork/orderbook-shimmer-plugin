import { defineConfig } from "tsup";

export default defineConfig((options) => ({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  target: "es2020",
  // Library packages: keep output smaller by avoiding sourcemaps and bundling
  // large peer runtime deps.
  minify: !options.watch,
  splitting: true,
  sourcemap: false,
  treeshake: true,
  clean: !options.watch,
  dts: true,
  // Externalize runtime deps so tsup doesn't bundle large Orderly packages.
  external: ["react", "react-dom", /\.css$/],
  esbuildOptions(esOptions, context) {
    if (!options.watch) {
      esOptions.drop = ["console", "debugger"];
    }
  },
}));
