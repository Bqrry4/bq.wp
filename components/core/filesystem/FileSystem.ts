'use client'

const root = await navigator.storage.getDirectory();;
export async function initFs()
{
    //Make the fs hierarchy
    await root.getDirectoryHandle("wapm", { create: true });
    await root.getDirectoryHandle("usr", { create: true });
}


export async function writeFile(path: string, bytes: Uint8Array)
{
    //resolve path

    //write
    
} 