type Result<T, E> = Ok<T, E> | Err<T, E>;

const Result = {
    Ok<T>(value: T): Result<T, never> {
        return new Ok(value);
    },
    Err<E>(error: E): Result<never, E> {
        return new Err(error);
    },
};

abstract class ResultBase<T, E> {
    protected abstract readonly kind: "ok" | "err";

    isOk(): this is Ok<T, E> {
        return this.kind === "ok";
    }
    isErr(): this is Err<T, E> {
        return this.kind === "err";
    }

    match<TR, ER>(cases: {
        ok?: (val: T) => TR;
        err?: (err: E) => ER;
    }): TR | ER | undefined {
        if (this.isOk()) return cases.ok?.(this.value);
        if (this.isErr()) return cases.err?.(this.error);
    }
}

class Ok<T, E = never> extends ResultBase<T, E> {
    protected readonly kind = "ok" as const;
    constructor(public readonly value: T) {
        super();
    }
}

class Err<T = never, E = unknown> extends ResultBase<T, E> {
    protected readonly kind = "err" as const;
    constructor(public readonly error: E) {
        super();
    }
}
export { Result };
