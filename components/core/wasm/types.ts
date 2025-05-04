
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
 * Same as struct() but gets a pointer
 * Needs @props explicitly as the type T is erased
 * @type is actually props
 */
export function deref<
    T extends Struct<R>,
    R extends Record<string, p_type<any>>
>(
    ptr: ptr<T>,
    type: R,
    dataView: DataView,
) : Struct<R> {
    return struct(type, dataView, ptr) as T;
}

type uint8_t = number & {};
type uint16_t = number & {};
type uint32_t = number & {};
type uint64_t = bigint & {};
export const uint8_t: p_type<uint8_t> = { size: 1 };
export const uint16_t: p_type<uint16_t> = { size: 2 };
export const uint32_t: p_type<uint32_t> = { size: 4 };
export const uint64_t: p_type<uint64_t> = { size: 8 };

/** Primitive types mappings over DataView's names */
const type_names = new Map<p_type<any>, string>([
    [uint8_t, "Uint8"],
    [uint16_t, "Uint16"],
    [uint32_t, "Uint32"],
    [uint64_t, "BigUint64"],
]);

/** Recursive so that struct can be nested */
type ExtractField<T> =
    T extends { props: Record<string, p_type<any>> } ?
    Struct<T["props"]> : T extends _struct ?
    T : T extends p_type<infer F> ?
    F : never;

/** The defined struct type */
export type Struct<T extends Record<string, p_type<any>>> = _struct & {
    [K in keyof T]: ExtractField<T[K]>;
};

/** Wrapper for properties hint */
export function struct<T extends Record<string, p_type<any>>>(
    props: T,
    view: DataView,
    address: number
) {
    return new _struct(props, view, address) as Struct<T>;
}

class _struct implements p_type<_struct> {
    size: number;
    __marker?: _struct;

    constructor(
        props: Record<string, p_type<any>>,
        view: DataView,
        address: number
    ) {
        let offset = address;
        for (const name in props) {
            let type = props[name];
            
            let get: () => any;
            let set: (value: any) => void;

            // needed for closure
            let byteOffset = offset;;
            switch (type) {
                case uint8_t:
                case uint16_t:
                case uint32_t:
                case uint64_t:
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

            //function that creates an object for a primitive, use it to bind to property, or to return when doing deref at pointer
            //if(1undefined)

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