export class Utils {

  public static randomize(name: string) {
    return `${name}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
  }
}