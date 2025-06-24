/**
 * This file implements some basic and struct type that maps properties over a DataView.
 */

/**
 * Type descriptor
 */
interface p_type<T> {
    /** in bytes */
    size: number;
    /** prevents inference */
    __marker?: T;
}

export type ptr<T> = uint32_t & { target: T };

/**
 * Those types are just hints for readability and are not enforcing anything.
 */
export type uint8_t = number & {};
export type uint16_t = number & {};
export type uint32_t = number & {};
export type uint64_t = bigint & {};
export type int8_t = number & {};
export type int16_t = number & {};
export type int32_t = number & {};
export type int64_t = bigint & {};
/**
 * The actual values that are used to for serialization.
 */
export const uint8_t: p_type<uint8_t> = { size: 1 };
export const uint16_t: p_type<uint16_t> = { size: 2 };
export const uint32_t: p_type<uint32_t> = { size: 4 };
export const uint64_t: p_type<uint64_t> = { size: 8 };
export const int8_t: p_type<int8_t> = { size: 1 };
export const int16_t: p_type<int16_t> = { size: 2 };
export const int32_t: p_type<int32_t> = { size: 4 };
export const int64_t: p_type<int64_t> = { size: 8 };

/** Primitive types mappings over DataView's names */
const type_names = new Map<p_type<unknown>, string>([
    [uint8_t, "Uint8"],
    [uint16_t, "Uint16"],
    [uint32_t, "Uint32"],
    [uint64_t, "BigUint64"],
    [int8_t, "Int8"],
    [int16_t, "Int16"],
    [int32_t, "Int32"],
    [int64_t, "BigInt64"],
]);

/** Recursive so that struct can be nested */
type ExtractField<T> =
    T extends { props: Record<string, p_type<unknown>> } ?
    Struct<T["props"]> : T extends _struct ?
    T : T extends p_type<infer F> ?
    F : never;

/** The defined struct type */
export type Struct<T extends Record<string, p_type<unknown>>> = _struct & {
    [K in keyof T]: ExtractField<T[K]>;
};

/** Wrapper for properties hint */
function struct<T extends Record<string, p_type<unknown>>>(
    props: T,
    view: DataView,
    address: number
) {
    return new _struct(props, view, address) as Struct<T>;
}

/**
 * There is no alignment yet.
 */
class _struct implements p_type<_struct> {
    size: number;
    __marker?: _struct;

    constructor(
        props: Record<string, p_type<unknown>>,
        view: DataView,
        address: number
    ) {
        let offset = address;
        for (const name in props) {
            let type = props[name];
            
            let get: () => unknown;
            let set: (value: any) => void;

            // needed for closure
            let byteOffset = offset;

            switch (type) {
                case uint8_t:
                case uint16_t:
                case uint32_t:
                case uint64_t:
                case int8_t:
                case int16_t:
                case int32_t:
                case int64_t:
                    let type_s = type_names.get(type)!;
                    get = () => {
                        return (view[`get${type_s}` as keyof DataView] as Function)
                            .call(view, byteOffset, true);
                    };
                    set = (value: any) => {
                        (view[`set${type_s}` as keyof DataView] as Function)
                            .call(view, byteOffset, value, true);
                    };

                    break;
                default:
                    get = () => type;
                    set = (val) => { type = val };
            }

            Object.defineProperty(this, name, {
                get,
                set,
                enumerable: true,
                configurable: true,
            });

            offset += type.size;
        }

        this.size = offset - address;
    }

}

/**
 * *Deref* a struct from pointer.  
 * Same as struct() but gets a pointer  
 * Needs _props explicitly as the type T is erased
 * @type is actually props
 * @returns A representation of a struct over a buffer, not a copy, not an actual object
 */
export function deref<
    T extends Struct<R>,
    R extends Record<string, p_type<unknown>>
>(
    ptr: ptr<T>,
    type: R,
    view: DataView,
) : Struct<R> {
    return struct(type, view, ptr) as T;
}

/**
 * @returns a string value from buffer
 */
export const fromRefS = (() => {
    const decoder = new TextDecoder();

    return (
        view: DataView,
        ptr: ptr<string>,
        len: number
    ) => {
        const buffer = new Uint8Array(view.buffer, ptr, len);
        return decoder.decode(buffer);
    }
})();

/**
 * Write a string to buffer.
 * 
 */
export const toRefS = (() => {
    const encoder = new TextEncoder();

    return (
        view: DataView,
        ptr: ptr<string>,
        value: string
    ) => {
        const bytes = encoder.encode(value);
        const buffer = new Uint8Array(view.buffer, ptr, bytes.length);
        buffer.set(bytes);
        return bytes.length;
    }
})();
