import { describe } from "node:test";

export type ptr<T> = number & { targetType: T };

describe