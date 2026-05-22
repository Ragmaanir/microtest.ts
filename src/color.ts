export class RGB {
  constructor(
    readonly r: number,
    readonly g: number,
    readonly b: number,
  ) {}

  colorize(text: string, enabled = true): string {
    if (!enabled) {
      return text
    }

    return `\u001b[38;2;${this.r};${this.g};${this.b}m${text}\u001b[0m`
  }
}

export const GREEN = new RGB(80, 220, 120)
export const RED = new RGB(240, 80, 80)
export const YELLOW = new RGB(230, 190, 80)
export const GRAY = new RGB(140, 140, 140)
