export function randomSafeClick(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }
export function pickRandomCells(arr: number[], count: number): number[] {
    const shuffled = arr.slice().sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }

export const MULTIPLIER = [
    1.01,
    1.05,
    1.10,
    1.15,
    1.21,
    1.27,
    1.34,
    1.42,
    1.51,
    1.61,
    1.73,
    1.86,
    2.02,
    2.20,
    2.42,
    2.69,
    3.03,
    3.46,
    4.04,
    4.85
]