import { deref, ptr, Struct, struct, uint16_t, uint64_t, uint8_t } from '@/core/wasm/types';
import WBindings from '@/core/wasm/WBindings';
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

    const instance = new WebAssembly.Instance(mod, {
        wasi_snapshot_preview1: bindings.getWasi({
            args,
            memory: (): WebAssembly.Memory => instance.exports.memory as WebAssembly.Memory
        }).wasi_unstable
    });

    return instance;
}

test('wasi_main_a3', async () => {

    // const iovec = new struct({
    //     buf: uint8_t,
    //     buf_len: Number
    // },
    //     new DataView(new Uint8Array().buffer),
    //     32
    // );

    let dv = new DataView(new Uint8Array(9).buffer);

    const iovec_t = struct({
        buf: uint8_t,
        buf2: uint64_t,
    },
        dv,
        0);

    iovec_t.buf = 1;
    iovec_t.buf2 = BigInt(2);

    console.log(dv);
    console.log(iovec_t.buf);
    console.log(dv.getUint8(0));
    console.log(dv.getBigUint64(1, true));

});


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


