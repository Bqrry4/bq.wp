'use client'

const root = await navigator.storage.getDirectory();
export async function initFs() {
    //Make the fs hierarchy
    await root.getDirectoryHandle("wapm", { create: true });
    await root.getDirectoryHandle("usr", { create: true });
    //temp
    //mnt?
}

async function resolve(path: string) {
    //! resolve naively for now
    const nodes = path.split('/');
    const fileName = nodes.pop();

    if (!fileName)
        throw new Error("Not a file");

    return await root.getFileHandle("");
}

export async function writeFile(path: string, bytes: Uint8Array) {
   const stream = (await (await resolve(path)).createWritable());
   stream.write(bytes);
} 

export async function readFile(path: string) {
    const stream = ((await (await resolve(path)).getFile()).stream());
    // let a = await stream;
 } 