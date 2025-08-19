import {
    ptr,
    toRefString,
    deref,
    uint8_t,
    uint32_t,
    uint64_t,
    fromRefString,
} from "@/core/wasm/primitive_types";
import {
    prestat_t,
    filetype_t,
    preopentype_t,
    size_t,
    iovec_t,
    errno_t,
    dirent_t,
    lookupflags_t,
    oflags_t,
    fdflags_t,
} from "../types";
import {
    BrowserFS,
    FsNodeType,
    FileNode,
    IFileSystem,
    DirectoryNode,
} from "@/core/filesystem/FileSystem";
import { Writable } from "@/core/lib/io";
import { Ok, Result } from "@/core/lib/monads/result";

interface UseFdParams {
    stdin?: string;
    stdout?: string;
    fs?: IFileSystem;
}

export function useFd({ stdin, stdout, fs }: UseFdParams) {
    return (memoryView: () => DataView): WebAssembly.ModuleImports => {
        return {
            fd_prestat_get: (fd: size_t, prestat: ptr<prestat_t>) => {
                console.log("fd_prestat_get");
                if (!fs) return errno_t.NOSYS;

                let prestat_d = deref(prestat, prestat_t, memoryView());

                let preopenfd = fs.getPreopen(fd);
                if (!preopenfd) return errno_t.BADF;

                prestat_d.type = preopentype_t.Dir;
                prestat_d.pr_name_len = preopenfd.path.length;

                return errno_t.SUCCESS;
            },
            fd_prestat_dir_name: (
                fd: size_t,
                path: ptr<string>,
                path_len: size_t,
            ) => {
                console.log("fd_prestat_dir_name");
                if (!fs) return errno_t.NOSYS;

                let preopenfd = fs.getPreopen(fd);
                if (!preopenfd) return errno_t.BADF;

                toRefString(memoryView(), path, preopenfd.path);
                return errno_t.SUCCESS;
            },
            fd_fdstat_get: (fd: size_t, fdstat: ptr<filetype_t>) => {
                console.log("fd_fdstat_get");

                if (fd <= 2) {
                    memoryView().setUint8(fdstat, filetype_t.Character_device);
                    return errno_t.SUCCESS;
                }

                if (!fs) return errno_t.BADF;
                let openfd = fs.getByFD(fd);

                //! Support for only Character, file and dir fds.
                if (!openfd) return errno_t.BADF;

                let filetype: filetype_t;
                switch (openfd.node.type) {
                    case FsNodeType.File:
                        filetype = filetype_t.Regular_file;
                        break;
                    case FsNodeType.Directory:
                        filetype = filetype_t.Directory;
                        break;
                }

                memoryView().setUint8(fdstat, filetype);
                return errno_t.SUCCESS;
            },
            path_open: async (
                dirfd: size_t,
                dirflags: lookupflags_t,
                path: ptr<string>,
                path_len: size_t,
                oflags: oflags_t,
                /* Ignored */
                _fs_rights_base: uint64_t,
                _fs_rights_inheriting: uint64_t,
                /* ... */
                fdflags: fdflags_t,
                openedfd: ptr<size_t>,
            ) => {
                if (!fs) return errno_t.NOSYS;
                let dir = fs.getByFD(dirfd);
                if (!dir) return errno_t.BADF;
                if (dir.node.type !== FsNodeType.Directory)
                    return errno_t.NOTDIR;

                let path_d = fromRefString(memoryView(), path, path_len);
                let fd = await fs.open(
                    dir.node as DirectoryNode,
                    path_d,
                    oflags,
                );

                if (fd.isErr()) {
                    switch (fd.error) {
                        case "a":
                            return errno_t.NOTDIR;
                        case "b":
                            return errno_t.NOENT;
                    }
                    return -1;
                }

                //FIX this
                if (!fd) return errno_t.ISDIR;

                memoryView().setUint32(openedfd, fd.value, true);
                return errno_t.SUCCESS;
            },
            fd_write: async (
                fd: size_t,
                iovs: ptr<iovec_t>,
                iovs_len: size_t,
                nwritten: ptr<size_t>,
            ) => {
                console.log("fd_write");

                let writable: Writable;
                if (fd <= 2) {
                    writable = {
                        async write(data) {
                            console.log(data.length);
                        },
                    };
                } else {
                    if (!fs) return errno_t.BADF;
                    let openfd = fs.getByFD(fd);
                    if (!openfd) return errno_t.BADF;
                    if (openfd.node.type === FsNodeType.Directory)
                        return errno_t.ISDIR;

                    writable = openfd.node as FileNode;
                }

                let totalWritten = 0;
                let bufPtr: ptr<iovec_t> = iovs;

                for (let i = 0; i < iovs_len; i++) {
                    let iovs_d = deref(bufPtr, iovec_t, memoryView());

                    await writable.write(
                        new Uint8Array(
                            memoryView().buffer,
                            iovs_d.buf_ptr,
                            iovs_d.buf_len,
                        ),
                    );
                    totalWritten += iovs_d.buf_len;
                    bufPtr = (bufPtr + iovs_d.size) as ptr<iovec_t>;
                }

                memoryView().setUint32(nwritten, totalWritten, true);
                return errno_t.SUCCESS;
            },
            fd_read: async (
                fd: size_t,
                iovs: ptr<iovec_t>,
                iovs_len: size_t,
                nread: ptr<size_t>,
            ) => {
                if (!fs) return errno_t.BADF;
                let openfd = fs.getByFD(fd);
                if (!openfd) return errno_t.BADF;
                if (openfd.node.type === FsNodeType.Directory)
                    return errno_t.ISDIR;

                let file = openfd.node as FileNode;

                let totalRead = 0;
                let bufPtr: ptr<iovec_t> = iovs;
                for (let i = 0; i < iovs_len; i++) {
                    let iovs_d = deref(bufPtr, iovec_t, memoryView());

                    let chunk = await file.read(iovs_d.buf_len);
                    new Uint8Array(
                        memoryView().buffer,
                        iovs_d.buf_ptr,
                        iovs_d.buf_len,
                    ).set(chunk);

                    totalRead += chunk.length;
                    bufPtr = (bufPtr + iovs_d.size) as ptr<iovec_t>;
                }

                memoryView().setUint32(nread, totalRead, true);
                return errno_t.SUCCESS;
            },
            fd_readdir: (
                fd: size_t,
                buf: ptr<dirent_t>,
                buf_len: size_t,
                cookie: uint64_t,
                bufused: ptr<uint32_t>,
            ) => {
                let buff = deref(buf, dirent_t, memoryView());
                buff.d_type = filetype_t.Block_device;
            },
        };
    };
}
