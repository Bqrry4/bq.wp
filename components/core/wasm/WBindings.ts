import { deref, ptr, Struct, struct, uint32_t, uint64_t, uint8_t } from '@/core/wasm/types';



export const enum filetype_t {
    unknown,
    block_device,
    character_device,
    directory,
    regular_file,
    socket_dgram,
    socket_stream,
    symbolic_link
}


const size_t = uint32_t;

// type iovec_t = Struct<{
//     buf: typeof uint32_t,
//     buf_len: typeof size_t
// }>;

const iovec_t = {
    buf: uint32_t,
    buf_len: size_t
};

type iovec_t = Struct<typeof iovec_t>;


//ptr<type> = 


function unimplemented(a: string) {
    console.log(`${a} not implemented`);
    return 0;
}

//@ Supports only wasm32 
class WBindings {
    /**
     * @param args arguments of the entry point(if any)
     * @param memory a function that returns the memory to be used
     * @note memory is a function as the exported memory needs to be lazily accesed.
     * The reason being circular dependecy of bindings and exported memory.
     */
    getWasi({
        args = [],
        memory,
    }: {
        args: string[],
        memory: () => WebAssembly.Memory,
    }) {

        //! Some kind of memoization
        const dataView = (() => {
            let dataView: DataView | undefined;
            return () => {
                return dataView = (dataView) ? dataView : new DataView(memory().buffer);
            }
        })();
        const arrayView = (() => {
            let arrayView: Uint8Array | undefined;
            return () => {
                return arrayView = (arrayView) ? arrayView : new Uint8Array(memory().buffer);
            }
        })();

        const encoder = new TextEncoder();
        const decoder = new TextDecoder();
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
            //binding for P1
            wasi_unstable: {
                args_sizes_get: (
                    argc: ptr<number>,
                    argv_buf_size: ptr<number>
                ) => {
                    dataView().setUint32(argc, args_enc.length, true);
                    dataView().setUint32(argv_buf_size, args_size, true);
                    return 0;
                },
                args_get: (
                    argv: ptr<number>,
                    argv_buf: ptr<string>
                ) => {
                    args_enc.reduce((arg_p, argc, i) => {
                        arrayView().set(argc, arg_p); //write string
                        dataView().setUint32(argv + i * 4, arg_p, true); //inc pointer
                        return arg_p + argc.length;
                    }, argv_buf.valueOf());
                    return 0;
                },
                fd_fdstat_get: (
                    fd: number,
                    fdstat: ptr<number>
                ) => {

                    let filetype: filetype_t;
                    if (fd <= 2) {
                        filetype = filetype_t.character_device;
                    } else {
                        filetype = filetype_t.unknown;
                    }

                    dataView().setUint8(fdstat, filetype);
                    return 0;
                },
                fd_read: () => unimplemented("fd_read"),
                fd_write: (
                    fd: number,
                    iovs: ptr<iovec_t>,
                    iovs_len: number,
                    nwritten: ptr<number>
                ) => {
                    switch (fd) {
                        case 1:
                            let totalWritten = 0;
                            let bufPtr: ptr<iovec_t> = iovs;
                            for (let i = 0; i < iovs_len; i++) {
                                let iovs_d = deref(bufPtr, iovec_t, dataView()); 

                                console.log(decoder.decode(new Uint8Array(memory().buffer, iovs_d.buf, iovs_d.buf_len)));
                                totalWritten += iovs_d.buf_len;

                                bufPtr = (bufPtr + iovs_d.size) as ptr<iovec_t>;
                            }
                            dataView().setUint32(nwritten, totalWritten, true);
                    }
                    return 0;
                },
                // @ts-ignore
                fd_prestat_get: () => unimplemented("fd_prestat_get"),
                fd_datasync: () => unimplemented("fd_prestat_get"),
                fd_prestat_dir_name: () => unimplemented("fd_prestat_dir_name"),
                fd_filestat_set_size: () => unimplemented("fd_filestat_set_size"),
                fd_sync: () => unimplemented("fd_sync"),
                // @ts-ignore
                path_open: (
                ) => unimplemented("path_open"),
                path_link: (
                ) => unimplemented("path_link"),
                environ_sizes_get: () => unimplemented("environ_sizes_get"),
                environ_get: () => unimplemented("environ_get"),
                fd_close: () => unimplemented("fd_close"),
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