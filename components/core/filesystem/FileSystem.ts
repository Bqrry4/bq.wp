"use client";

import { FileHandle } from "fs/promises";
import { Readable, Writable } from "../lib/io";
import { fdflags_t, oflags_t } from "../wasm/p1/types";
import { Result } from "../lib/monads/result";

/* Reusing those as new type for easier decoupling, when there will be the need */
export const OpenFlags = oflags_t;
export type OpenFlags = oflags_t;

export enum FsNodeType {
    Directory,
    File,
}

interface FsNode {
    readonly type: FsNodeType;
}

export interface DirectoryNode extends FsNode {
    readonly type: FsNodeType.Directory;
    getEntries(): void;
    getChild(name: string): Promise<FsNode>;
}

export interface FileNode extends FsNode, Writable, Readable {
    readonly type: FsNodeType.File;
}

interface OpenFD {
    node: FsNode;
    readonly path: string;
}

/* https://developer.mozilla.org/en-US/docs/Web/API/File_System_API/Origin_private_file_system */
class OPFsFileNode implements FileNode {
    readonly type = FsNodeType.File;
    position = 0;

    constructor(public handle: FileSystemFileHandle) {}

    async write(data: Uint8Array) {
        let writer = await this.handle.createWritable({
            keepExistingData: true,
        });
        await writer.write({
            type: "write",
            position: this.position,
            data: new Uint8Array(data),
        });
        this.position += data.length;
    }
    async read(count: number): Promise<Uint8Array> {
        let file = await this.handle.getFile();
        let buffer = await file
            .slice(this.position, this.position + count)
            .arrayBuffer();
        this.position += buffer.byteLength;
        return new Uint8Array(buffer);
    }
}
class OPFsDirNode implements DirectoryNode {
    readonly type = FsNodeType.Directory;

    constructor(public handle: FileSystemDirectoryHandle) {}
    getChild(name: string): Promise<FsNode> {
        throw new Error("Method not implemented.");
    }
    getEntries(): void {
        throw new Error("Method not implemented.");
    }
}
// /* Nodes as buffers */
// class MemFileNode implements FileNode {
//     readonly type = FsNodeType.File;

//     constructor(public buffer: Uint8Array) {}
//     write(): void {
//         throw new Error("Method not implemented.");
//     }
//     read(): void {
//         throw new Error("Method not implemented.");
//     }
// }
// class MemDirNode implements DirectoryNode {
//     readonly type = FsNodeType.Directory;

//     constructor(public entries: Record<string, MemFileNode>) {}
//     getEntries(): void {
//         throw new Error("Method not implemented.");
//     }
// }

//2 types of nodes, in memory and browser handles
export interface IFileSystem {
    open(
        dir: DirectoryNode,
        path: string,
        flags: OpenFlags,
    ): Promise<Result<number, string>>;
    close(fd: number): void;
    resolve(): void;
    getByFD(fd: number): OpenFD | undefined;
    getPreopen(fd: number): OpenFD | undefined;
}

const FS_HIERARCHY = ["wapm", "usr"];

export class BrowserFS {
    private preopens: Array<string> = [];
    private openFDs = new Map<number, OpenFD>();

    //This might be delegated to a fd table if there will be a need
    nextFD = 3;

    private allocFD(): number {
        return this.nextFD++;
    }

    async init() {
        const root = await navigator.storage.getDirectory();
        for (const dirName of FS_HIERARCHY) {
            await root.getDirectoryHandle(dirName, { create: true });
        }

        this.preopens.push("/");
        this.openFDs.set(this.nextFD++, {
            node: new OPFsDirNode(root),
            path: "/",
        });
    }

    getByFD(fd: number): OpenFD | undefined {
        return this.openFDs.get(fd);
    }
    getPreopen(fd: number): OpenFD | undefined {
        let openfd = this.getByFD(fd);
        if (openfd && this.preopens.includes(openfd.path)) {
            return openfd;
        }
        return undefined;
    }

    async open(
        dir: DirectoryNode,
        path: string,
        flags: OpenFlags,
    ): Promise<Result<number, string>> {
        //strip last node from path, with fallback to dir for immediate nodes
        path = path.replace(/\/?[^/]+$/, "") || ".";

        let fsNode = await this.resolve(dir, path);
        if (!fsNode) return Result.Err("path invalid?");
        if (fsNode.type != FsNodeType.Directory) return Result.Err("not a dir");
        if (flags & OpenFlags.Directory) {
            //mkdir
        } else {
        }

        //check for dir flags

        let fd = this.allocFD();

        return Result.Ok(fd);
    }

    //!This need testing
    private async resolve(
        dir: DirectoryNode,
        path: string,
    ): Promise<FsNode | undefined> {
        const nodes = path.split("/");

        let parts = [];
        for (let n of nodes) {
            if (n === ".") continue;
            if (n === "..") parts.pop();

            parts.push(n);
        }

        let child: FsNode = dir;
        for (let part of parts) {
            child = await dir.getChild(part);
            if (!child) return undefined;
        }

        return child;
    }

    // async open(path: string) {
    //     const handle = resolve(path);

    //     this.openFds.push(handle);
    // }
}

// export async function close()
// {

// }

// export async function write(fd: number, bytes: Uint8Array) {
// //    const stream = (await (await resolve(path)).createWritable());
// //    stream.write(bytes);
// }

// export async function read(fd: number) {
//     //const stream = ((await (await resolve(path)).getFile()).stream());
//     // let a = await stream;
//  }
