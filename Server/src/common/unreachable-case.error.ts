export class UnreachableCaseError extends Error {
    constructor(val: never, message?: string) {
        super(message || `Unreachable case: ${val}`);
    }
}
