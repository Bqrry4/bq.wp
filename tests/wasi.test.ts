import { BrowserFS } from "@/core/filesystem/FileSystem";
import {
    deref,
    ptr,
    Struct,
    uint16_t,
    uint64_t,
    uint8_t,
} from "@/core/wasm/primitive_types";
import WasiBindings from "@/core/wasm/p1/WasiBindings";
import { test, expect } from "@playwright/test";
import { PathLike } from "fs";
import { readFile } from "fs/promises";
import { useArgs } from "@/core/wasm/p1/features/args";
import { useFd } from "@/core/wasm/p1/features/fd";
import { instantiate } from "asyncify-wasm";
import { load_wasm } from "@/core/wasm/load_wasm";

let __dirname = import.meta.dirname;
let cwd = process.cwd();

async function load_local_wasm(path: PathLike, args: string[]) {
    const mod = new WebAssembly.Module(new Uint8Array(await readFile(path)));

    const bindings = new WasiBindings({
        features: [
            useArgs({ args: args }),
            useFd({
                stdin: undefined,
                stdout: undefined,
                fs: undefined,
            }),
        ],
    });

    const instance = await instantiate(mod, {
        wasi_snapshot_preview1: bindings.imports,
    });

    bindings.memory = instance.exports.memory as WebAssembly.Memory;

    return instance;
}

test.describe("wasi tests", () => {
    test("wasi_args", async () => {
        const wasm = await load_local_wasm(
            `${__dirname}/static/wasi/wasm_p1/args.wasm`,
            ["Hello wasi !!"],
        );

        const fun = wasm.exports._start as Function;
        await fun();
    });

    test("wasi_read_file", async ({ page, baseURL }) => {
        await page.goto(`/browser_env/test.html`);
        page.on("console", (msg) => {
            console.log(
                `[browser ${msg.type()}]`,
                ...msg.args().map((a) => a.toString()),
            );
        });
        await page.evaluate(async () => {
            const fs = new test.BrowserFS();
            await fs.init();

            const wasm = await test.load_wasm(
                `/wasi/wasm_p1/read_file.wasm`,
                ["read_file", "/usr/file.c"],
                fs,
            );

            const fun = wasm.exports._start as Function;
            await fun();
        });
    });
    // test('wasi_exit', async () => {
    //     const wasm = await load_local_wasm(
    //         `${__dirname}/wasm/exit.wasm`,
    //         []
    //     );
    //     const fun = wasm.exports._start as Function;
    //     fun();
    // });
});
