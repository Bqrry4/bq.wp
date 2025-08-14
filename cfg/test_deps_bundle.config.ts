import esbuild from "esbuild";

/* Deps needed to be tested in browser. */
esbuild
    .build({
        // entryPoints: [
        //     "components/core/filesystem/FileSystem.ts",
        //     "components/core/wasm/load_wasm.ts",
        // ],
        stdin: {
            contents: `
            export * from "@/core/filesystem/FileSystem";
            export * from "@/core/wasm/load_wasm";
          `,
            resolveDir: ".",
            sourcefile: "entry.ts",
        },
        bundle: true,
        outfile: "tests/static/browser_env/test_bundle.js",
        minify: false,
        format: "iife",
        platform: "browser",
        globalName: "test",
    })
    .catch(() => process.exit(1));
