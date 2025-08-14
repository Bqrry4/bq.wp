import {
    ptr,
    Struct,
    uint8_t,
    uint32_t,
    uint64_t,
} from "@/core/wasm/primitive_types";

/** Types needed for p1 */

export const enum errno_t {
    SUCCESS = 0,
    /* Bad file descriptor */
    BADF = 8,
    /* Is a directory */
    ISDIR = 31,
    /* Function not supported */
    NOSYS = 52,
    /* Not a directory or a symbolic link to a directory */
    NOTDIR = 54,
}

export const enum filetype_t {
    Unknown,
    Block_device,
    Character_device,
    Directory,
    Regular_file,
    Socket_dgram,
    Socket_stream,
    Symbolic_link,
}

export const enum preopentype_t {
    Dir,
}

export const enum oflags_t {
    Create = 1 << 0,
    Directory = 1 << 1,
    Exclusive = 1 << 2,
    Truncate = 1 << 3,
}

export const enum fdflags_t {
    Append = 1 << 0,
    DSync = 1 << 1,
    NonBlock = 1 << 2,
    RSync = 1 << 3,
    Sync = 1 << 4,
}

export const enum lookupflags_t {
    Symlink_follow = 1 << 0,
}

export const size_t = uint32_t;
export type size_t = uint32_t;

export const iovec_t = {
    buf_ptr: uint32_t,
    buf_len: size_t,
};
export type iovec_t = Struct<typeof iovec_t>;

export const prestat_t = {
    type: uint8_t,
    pr_name_len: size_t,
};
export type prestat_t = Struct<typeof prestat_t>;

export const dirent_t = {
    d_next: uint64_t,
    d_ino: uint64_t,
    d_namlen: uint32_t,
    /* Represents filetype_t */
    d_type: uint8_t,
};
export type dirent_t = Struct<typeof dirent_t>;
