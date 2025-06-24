/** Types needed for  */

const enum filetype_t {
    Unknown,
    Block_device,
    Character_device,
    Directory,
    Regular_file,
    Socket_dgram,
    Socket_stream,
    Symbolic_link
}

const enum preopentype_t {
    Dir
}

const enum oflags_t {
    Create = 1 << 0,
    Directory = 1 << 1,
    Exclusive = 1 << 2,
    Truncate = 1 << 3
}

const enum fdflags_t {
    Append = 1 << 0,
    DSync = 1 << 1,
    NonBlock = 1 << 2,
    RSync = 1 << 3,
    Sync = 1 << 4
}

const enum lookupflags_t {
    symlink_follow = 1 << 0,
}

