import { useArgs } from "@/core/wasm/p1/features/args";
import { useFd } from "@/core/wasm/p1/features/fd";
import * as Asyncify from "asyncify-wasm";
import WasiBindings from "./p1/WasiBindings";
import { IFileSystem } from "../filesystem/FileSystem";

export async function load_wasm(path: string, args: string[], fs: IFileSystem) {
    const mod = await WebAssembly.compileStreaming(fetch(path));

    const bindings = new WasiBindings({
        features: [
            useArgs({ args: args }),
            useFd({
                stdin: undefined,
                stdout: undefined,
                fs: fs,
            }),
        ],
    });

    const instance = await Asyncify.instantiate(mod, {
        wasi_snapshot_preview1: bindings.imports,
    });

    bindings.memory = instance.exports.memory as WebAssembly.Memory;
    return instance;
}
