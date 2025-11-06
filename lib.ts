interface Helper<T> {
    readonly flat: unknown
    map<U>(fn: (arg: T) => U): Result<U>
    log(): Result<T>
    log(end: number): Result<T>
    log(start: number, end: number): Result<T>
    slice(): string
    slice(end: number): string
    slice(start: number, end: number): string
}

interface OkResult<T> extends Helper<T> {
    readonly ok: true
    readonly invert: null
    readonly value: T
}

interface ErrResult<T> extends Helper<T> {
    readonly ok: false
    readonly invert: true
    readonly error: Error
}

type Result<T> = OkResult<T> | ErrResult<T>

export function Ok<T>(value: T): Result<T> {
    return {
        ok: true as const,
        invert: null,
        value,
        flat: value,
        map<U>(fn: (arg: T) => U) {
            try {
                const temp = fn(this.value)
                return Ok(temp)
            } catch (e) {
                return Err(e instanceof Error ? e : new Error(String(e)))
            }
        },
        log(start?: number, end?: number) {
            console.log(String(this.flat).slice(start, end))
            return this
        },
        slice(start?: number, end?: number) {
            return String(this.flat).slice(start, end)
        },
    }
}

export function Err(error: Error | string): Result<never> {
    const err = error instanceof Error ? error : new Error(error)
    const uni = error instanceof Error ? error.message : error
    return {
        ok: false as const,
        invert: true as const,
        error: err,
        flat: uni,
        map<U>() {
            return this as Result<U>
        },
        log(start?: number, end?: number) {
            console.log(String(this.flat).slice(start, end))
            return this
        },
        slice(start?: number, end?: number) {
            return String(this.flat).slice(start, end)
        },
    }
}

export function safeCall<TArgs extends unknown[], TReturn>(
    fn: (...args: TArgs) => Promise<TReturn>,
    ...args: TArgs
): Promise<Result<Awaited<TReturn>>>

export function safeCall<TArgs extends unknown[], TReturn>(
    fn: (...args: TArgs) => TReturn,
    ...args: TArgs
): Result<TReturn>

export function safeCall<TArgs extends unknown[], TReturn>(
    fn: (...args: TArgs) => TReturn | Promise<TReturn>,
    ...args: TArgs
) {
    try {
        const out = fn(...args)
        if (out instanceof Promise) {
            return out
                .then((v) => Ok(v))
                .catch((e) =>
                    Err(e instanceof Error ? e : new Error(String(e)))
                )
        }
        return Ok(out)
    } catch (e) {
        return Err(e instanceof Error ? e : new Error(String(e)))
    }
}

export function wrap<TArgs extends unknown[], TReturn>(
    fn: (...args: TArgs) => Promise<TReturn>
): (...args: TArgs) => Promise<Result<Awaited<TReturn>>>

export function wrap<TArgs extends unknown[], TReturn>(
    fn: (...args: TArgs) => TReturn
): (...args: TArgs) => Result<TReturn>

export function wrap<TArgs extends unknown[], TReturn>(
    fn: (...args: TArgs) => TReturn | Promise<TReturn>
) {
    return ((...args: TArgs) => {
        try {
            const out = fn(...args)
            if (out instanceof Promise) {
                return out
                    .then((v) => Ok(v))
                    .catch((e) =>
                        Err(e instanceof Error ? e : new Error(String(e)))
                    )
            }
            return Ok(out)
        } catch (e) {
            return Err(e instanceof Error ? e : new Error(String(e)))
        }
    }) as unknown as
        | ((...args: TArgs) => Result<TReturn>)
        | ((...args: TArgs) => Promise<Result<Awaited<TReturn>>>)
}


export type { Result }