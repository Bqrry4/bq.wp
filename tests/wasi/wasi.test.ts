import { BrowserFS } from '@/core/filesystem/FileSystem';
import { deref, ptr, Struct, uint16_t, uint64_t, uint8_t } from '@/core/wasm/primitive_types';
import WasiBindings from '@/core/wasm/p1/WasiBindings';
import { test, expect } from '@playwright/test';
import { PathLike } from 'fs';
import { readFile } from "fs/promises"
import { useArgs } from '@/core/wasm/p1/features/args';

async function load_local_wasm(
    path: PathLike,
    args: string[]
) {

    const mod = new WebAssembly.Module(
        await readFile(path)
    );

    // const fs = new BrowserFS();
    // await fs.init();

    const bindings = new WasiBindings({
        features: [
            useArgs({args: args})
        ]
    });

    // const instance = new WebAssembly.Instance(mod, {
    //     wasi_snapshot_preview1: bindings.getWasi({
    //         args,
    //         fs
    //     }).wasi_unstable
    // });

    const instance = new WebAssembly.Instance(mod, {
        wasi_snapshot_preview1: bindings.imports
    });

    bindings.memory = instance.exports.memory as WebAssembly.Memory;

    return instance;
}

// test('wasi_main_a3', async () => {

//     // const iovec = new struct({
//     //     buf: uint8_t,
//     //     buf_len: Number
//     // },
//     //     new DataView(new Uint8Array().buffer),
//     //     32
//     // );

//     let dv = new DataView(new Uint8Array(9).buffer);

//     const iovec_t = struct({
//         buf: uint8_t,
//         buf2: uint64_t,
//     },
//         dv,
//         0
//     );

//     const iovec_t2 = struct({
//         buf: uint8_t,
//         buf2: iovec_t,
//     },
//         dv,
//         0
//     );

//     iovec_t2.buf2.buf = 1;
//     iovec_t2.buf2.buf2 = BigInt(2);

//     console.log(dv);
//     console.log(iovec_t2.buf2.buf);
//     console.log(dv.getUint8(0));
//     console.log(dv.getBigUint64(1, true));

// });


test.describe('wasi tests', () => {
    test('wasi_args', async () => {
        const wasm = await load_local_wasm(
            `${__dirname}/wasm/args.wasm`,
            ["Hello wasi !!"]
        );
        const fun = wasm.exports._start as Function;
        fun();
    });

    // test('wasi_exit', async () => {
    //     const wasm = await load_local_wasm(
    //         `${__dirname}/wasm/exit.wasm`,
    //         []
    //     );
    //     const fun = wasm.exports._start as Function;
    //     fun();
    // });

    // test('wasi_read_file', async () => {
    //     const wasm = await load_local_wasm(
    //         `${__dirname}/wasm/read_file.wasm`,
    //         ["read_file", "/usr/file.c"]
    //     );
    //     const fun = wasm.exports._start as Function;
    //     fun();
    // });

});


