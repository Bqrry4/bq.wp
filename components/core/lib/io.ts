export interface Writable {
    write(data: Uint8Array): Promise<void>;
}

export interface Readable {
    read(count: number): Promise<Uint8Array>;
}
