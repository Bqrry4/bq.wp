import WBindings from '@/core/wasi-bindings/WBindings';
import { test, expect } from '@playwright/test';
import { PathLike } from 'fs';
import { readFile } from "fs/promises"

async function load_static_wasm(
    path: PathLike,
    args: string[]
) {

    const mod = new WebAssembly.Module(
        await readFile(path)
    );

    const bindings = new WBindings();
    const memory = new WebAssembly.Memory({
        initial: 1,
    });

    const instance = new WebAssembly.Instance(mod, {
        js: { mem: memory },
        wasi_snapshot_preview1: bindings.getWasi({
            args,
            memory
        }).wasi_unstable
    });

    return instance;
}

test.describe('wasi tests', () => {
    test('wasi_main_args', async () => {
        const wasm = await load_static_wasm(
            `${__dirname}/wasm/args.wasm`,
            ["Hello wasi !!"]
        );
        const fun = wasm.exports._start as Function;
        fun();
    });
});
