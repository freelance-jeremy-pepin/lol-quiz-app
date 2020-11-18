export function random(min: number, max: number): number {
    // eslint-disable-next-line @typescript-eslint/no-var-requires,global-require
    const randomNumberJs = require('@aspiesoft/random-number-js');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    return parseInt(randomNumberJs(min, max), 10);
}
