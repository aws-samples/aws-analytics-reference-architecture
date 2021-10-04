export function stringSanitizer (toSanitize: string ): string {

  return toSanitize.toLowerCase().replace(/[^\w\s]/gi, '');
}
