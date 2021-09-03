import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import babel from "@rollup/plugin-babel";

const extensions = [".js", ".jsx", ".ts", ".tsx"];

export default {
  input: "index.ts",
  external: [],
  plugins: [
    resolve({ extensions }),
    commonjs(),
    babel({ extensions, babelHelpers: "runtime", include: ["src/**/*"] }),
  ],
  output: [
    {
      file: "dist/webfunding-iife.js",
      format: "iife",
      name: "webfunding",
    },
    {
      file: "dist/webfunding-cjs.js",
      format: "cjs",
    },
    {
      file: "dist/webfunding.mjs",
      format: "es",
    },
    {
      file: "dist/webfunding-amd.js",
      format: "amd",
    },
  ],
};
