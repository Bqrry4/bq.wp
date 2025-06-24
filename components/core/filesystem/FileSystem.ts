'use client'

import { FileHandle } from "fs/promises";

const FIRST_FD = 3;
const FS_HIERARCHY = ['wapm', 'usr'];

export class BrowserFS {

    preopens: Record<string, FileSystemDirectoryHandle> = {};
    openFds = [];


    async init()
    {
        const root = await navigator.storage.getDirectory();
        for (const dirName of FS_HIERARCHY) {
            await root.getDirectoryHandle(dirName, { create: true });
        }

        this.preopens['/'] = root;
    }


    private async resolve(path: string) {
        const nodes = path.split('/');
        
        let parts = [];
        for (let n of nodes)
        {
            if(n === '.') continue;
            if(n === '..') parts.pop();
    
            parts.push(n);
        }
    
        // let handle = root;
        // for (let n of parts) {
        //   handle = await handle.getDirectoryHandle(n);
        // }
    
        // return handle;
    
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