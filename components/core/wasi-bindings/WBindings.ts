import { ptr } from "./types";


function unimplemented(a: string) {
    console.log(`${a} not implemented`);
    return 0;
}


//@ Supports only wasm32 
class WBindings {

    getWasi({
        args = [],
        memory
    }: {
        args: string[],
        memory: WebAssembly.Memory
    }
    ) {

        const encoder = new TextEncoder();
        const decoder = new TextDecoder();
        const dataView = new DataView(memory.buffer);
        const arrayView = new Uint8Array(memory.buffer);

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
            //binding for P1
            wasi_unstable: {
                args_sizes_get: (
                    argc: ptr<number>,
                    argv_buf_size: ptr<number>
                ) => {
                    dataView.setUint32(argc, args_enc.length, true);
                    dataView.setUint32(argv_buf_size, args_size, true);
                },
                args_get: (
                    argv: ptr<number>,
                    argv_buf: ptr<string>
                ) => {

                    args_enc.reduce((arg_p, argc, i) => {
                        arrayView.set(argc, arg_p);
                        dataView.setUint32(argv + i * 4, arg_p, true);
                        return arg_p + argc.length;
                    }, argv_buf.valueOf());

                },
                // @ts-ignore
                fd_fdstat_get: () => unimplemented("fd_fdstat_get"),
                fd_prestat_get: () => unimplemented("fd_prestat_get"),
                fd_prestat_dir_name: () => unimplemented("fd_prestat_dir_name"),

                // @ts-ignore
                path_open: (
                    // dirfd: fd_t,
                    // dirflags: number,
                    // path: ptr<string>,
                    // path_len: number,
                    // o_flags: OpenFlags,
                    // fs_rights_base: bigint,
                    // fs_rights_inheriting: bigint,
                    // fs_flags: FdFlags,
                    // fd_ptr: ptr<fd_t>
                ) => {

                    return 0;
                },
                environ_sizes_get: () => unimplemented("environ_sizes_get"),
                environ_get: () => unimplemented("environ_get"),
                fd_close: () => unimplemented("fd_close"),
                fd_read: () => unimplemented("fd_read"),
                fd_write: () => {

                },
                random_get: () => unimplemented("random_get"),
                path_create_directory: () => unimplemented("path_create_directory"),
                path_rename: () => unimplemented("path_rename"),
                path_remove_directory: () => unimplemented("path_remove_directory"),
                fd_readdir: () => unimplemented("fd_readdir"),
                path_readlink: () => unimplemented("path_readlink"),
                path_filestat_get: () => unimplemented("path_filestat_get"),
                proc_exit: () => unimplemented("proc_exit"),
                fd_seek: () => unimplemented("fd_seek"),
                clock_time_get: () => unimplemented("clock_time_get"),
                fd_filestat_get: () => unimplemented("fd_filestat_get"),
                poll_oneoff: () => unimplemented("poll_oneoff"),
                path_unlink_file: () => unimplemented("path_unlink_file"),
                path_symlink: () => unimplemented("path_symlink"),
                fd_fdstat_set_flags: () => unimplemented("path_symlink"),
            }
        }
    }
}


export default WBindings;