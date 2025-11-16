
export class DateUtils {
  static isValidISODate(dateString: string): boolean {
    const date = new Date(dateString);
    return date.toString() !== 'Invalid Date' && !isNaN(date.getTime());
  }

  static addDays(dateString: string, days: number): string {
    const date = new Date(dateString);
    date.setDate(date.getDate() + days);
    return date.toISOString();
  }

  static getCurrentISODate(): string {
    return new Date().toISOString();
  }
}
