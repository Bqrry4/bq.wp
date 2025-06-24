import { deref, ptr, Struct, uint32_t, uint64_t, uint8_t } from '@/core/wasm/primitive_types';
import { BrowserFS } from '../../filesystem/FileSystem';

const PREVIEW01_IMPORTS = [
    "args_get",
    "args_sizes_get",

    "fd_advise",
    "fd_allocate",
    "fd_close",
    "fd_datasync",
    "fd_fdstat_get",
    "fd_fdstat_set_flags",
    "fd_fdstat_set_rights",
    "fd_filestat_get",
    "fd_filestat_set_size",
    "fd_filestat_set_times",
    "fd_pread",
    "fd_prestat_dir_name",
    "fd_prestat_get",
    "fd_pwrite",
    "fd_read",
    "fd_readdir",
    "fd_renumber",
    "fd_seek",
    "fd_sync",
    "fd_tell",
    "fd_write",

    "path_create_directory",
    "path_filestat_get",
    "path_filestat_set_times",
    "path_link",
    "path_open",
    "path_readlink",
    "path_remove_directory",
    "path_rename",
    "path_symlink",
    "path_unlink_file",
    "poll_oneoff",

    "proc_exit",
    "proc_raise",

    "clock_res_get",
    "clock_time_get",

    "environ_get",
    "environ_sizes_get",

    "random_get",

    "sched_yield",

    "sock_accept",
    "sock_recv",
    "sock_send",
    "sock_shutdown",
  ];

const size_t = uint32_t;
type size_t = uint32_t;

const iovec_t = {
    buf_ptr: uint32_t,
    buf_len: size_t
};
type iovec_t = Struct<typeof iovec_t>;


const prestat_t = {
    type: uint8_t,
    pr_name_len: size_t
};

type prestat_t = Struct<typeof prestat_t>;


function unimplemented(a: string) {
    console.log(`${a} not implemented`);
    return 0;
}



export type WASIFeature = (
    memoryView: () => DataView,
) => WebAssembly.ModuleImports;


interface ConstructorParams {
    features: WASIFeature[];
}

class WasiBindings {
    readonly imports: WebAssembly.ModuleImports = {};
    memory!: WebAssembly.Memory

    constructor({
        features
    }: ConstructorParams
    ){
        for (const useFeature of features) {
            const imports = useFeature(
                () => this.dataView
            );

            this.imports = { ...this.imports, ...imports };
        }

        for (const key of PREVIEW01_IMPORTS) {
            if (!(key in this.imports)) {
              this.imports[key] = () => {
                return 52;
              };
            }
        }
    }

    
    /**
     * Memoization on object with recreation when buffer is getting detached.
     */
    private _dataView!: DataView;
    get dataView(): DataView {
        return this._dataView = (this._dataView && this._dataView.buffer.byteLength)
            ? this._dataView : new DataView(this.memory.buffer)
    }

    private _arrayView!: Uint8Array;
    get arrayView(): Uint8Array {
        return this._arrayView = (this._arrayView && this._arrayView.buffer.byteLength)
            ? this._arrayView : new Uint8Array(this.memory.buffer)
    }



    /**
     * @param args arguments of the entry point(if any)
     */
    getWasi({
        args = [],
        fs
    }: {
        args: string[],
        fs: BrowserFS
    }) {

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
                    this.dataView.setUint32(argc, args_enc.length, true);
                    this.dataView.setUint32(argv_buf_size, args_size, true);
                    return 0;
                },
                args_get: (
                    argv: ptr<number>,
                    argv_buf: ptr<string>
                ) => {
                    args_enc.reduce((arg_p, argc, i) => {
                        this.arrayView.set(argc, arg_p); //write string
                        this.dataView.setUint32(argv + i * 4, arg_p, true); //inc pointer
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
                        filetype = filetype_t.Character_device;
                    } else {
                        filetype = filetype_t.Unknown;
                    }

                    this.dataView.setUint8(fdstat, filetype);
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
                            {
                                let totalWritten = 0;
                                let bufPtr: ptr<iovec_t> = iovs;
                                for (let i = 0; i < iovs_len; i++) {
                                    let iovs_d = deref(bufPtr, iovec_t, this.dataView);

                                    //! Temprary, write to a stream
                                    console.log(decoder.decode(new Uint8Array(this.memory.buffer, iovs_d.buf_ptr, iovs_d.buf_len)));
                                    totalWritten += iovs_d.buf_len;

                                    bufPtr = (bufPtr + iovs_d.size) as ptr<iovec_t>;
                                }
                                this.dataView.setUint32(nwritten, totalWritten, true);
                            }
                            break;
                        case 2:
                            {
                                let totalWritten = 0;
                                let bufPtr: ptr<iovec_t> = iovs;
                                for (let i = 0; i < iovs_len; i++) {
                                    let iovs_d = deref(bufPtr, iovec_t, this.dataView);

                                    //! Temporary, write to a stream
                                    console.log(decoder.decode(new Uint8Array(this.memory.buffer, iovs_d.buf_ptr, iovs_d.buf_len)));
                                    totalWritten += iovs_d.buf_len;

                                    bufPtr = (bufPtr + iovs_d.size) as ptr<iovec_t>;
                                }
                                this.dataView.setUint32(nwritten, totalWritten, true);
                            }
                    }
                    return 0;
                },
                // @ts-ignore
                fd_prestat_get: (
                    fd: number,
                    prestat: ptr<prestat_t>
                ) => {

                    let a = fs
                    let prestat_d = deref(prestat, prestat_t, this.dataView);

                    prestat_d.type = preopentype_t.Dir;
                    prestat_d.pr_name_len = 8;

                    return 0;
                },
                fd_prestat_dir_name: (
                    fd: number,
                    path: ptr<string>,
                    path_len: size_t
                ) => {
                    console.log(fd);

                    // if(!this.arrayView.buffer.byteLength)
                    // console.log(this.arrayView.buffer.byteLength);
                    const encoded = encoder.encode(`/usr\0`)
                    this.arrayView.set(encoded, path); //write string

                    return 0;
                },
                path_open: (
                    dirfd: number,
                    dirflags: lookupflags_t,
                    path: ptr<string>,
                    pathLen: number,
                    o_flags: oflags_t,
                    fs_rights_base: uint64_t,
                    fs_rights_inheriting: uint64_t,
                    fs_flags: fdflags_t,
                    fd: ptr<number>
                ) => {
                    
                },

                fd_datasync: () => unimplemented("fd_prestat_get"),
                fd_filestat_set_size: () => unimplemented("fd_filestat_set_size"),
                fd_sync: () => unimplemented("fd_sync"),
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
                fd_seek: () => unimplemented("fd_seek"),
                clock_time_get: () => unimplemented("clock_time_get"),
                fd_filestat_get: () => unimplemented("fd_filestat_get"),
                poll_oneoff: () => unimplemented("poll_oneoff"),
                path_unlink_file: () => unimplemented("path_unlink_file"),
                path_symlink: () => unimplemented("path_symlink"),
                fd_fdstat_set_flags: () => unimplemented("path_symlink"),
                proc_exit: (code: number) => {
                    console.error(code);
                },
            }
        }
    }
}


export default WasiBindings;