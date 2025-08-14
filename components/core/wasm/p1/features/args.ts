import { ptr, uint32_t } from '@/core/wasm/primitive_types';
import {errno_t} from "../types"

interface UseArgsParams {
    args: string[];
}

export function useArgs({
    args
}: UseArgsParams 
) {
    return (
        memoryView: () => DataView
    ): WebAssembly.ModuleImports => {

        const encoder = new TextEncoder();
        //Pre encode args
        const [args_size, args_enc] = args.reduce(
            ([size, collection], arg) => {
                const encoded = encoder.encode(`${arg}\0`);
                size += encoded.length;
                collection.push(encoded);
                return [size, collection];
            },
            [0, [] as Uint8Array[]]
        );

        return {
            args_sizes_get: (
                argc: ptr<uint32_t>,
                argv_buf_size: ptr<uint32_t>
            ) => {
                memoryView().setUint32(argc, args_enc.length, true);
                memoryView().setUint32(argv_buf_size, args_size, true);
                return errno_t.SUCCESS;
            },
            args_get: (
                argv: ptr<uint32_t>,
                argv_buf: ptr<string>
            ) => {
                args_enc.reduce((arg_p, argc, i) => {
                    new Uint8Array(memoryView().buffer).set(argc, arg_p); //write string
                    memoryView().setUint32(argv + i * 4, arg_p, true); //inc pointer
                    return arg_p + argc.length;
                }, argv_buf.valueOf());
                return errno_t.SUCCESS;
            },
        }
    }
}
