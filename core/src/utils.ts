// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
 * Utilities class used across the different resources
 */
export class Utils {

  /**
   * Sanitize a string by removing upper case and replacing special characters except underscore
   * @param {string} toSanitize the string to sanitize
   */
  public static stringSanitizer(toSanitize: string): string {
    return toSanitize.toLowerCase().replace(/[^\w\s]/gi, '');
  }

  /**
   * Create a random string to be used as a seed for IAM User password
   * @param {string} name the string to which to append a random string
   */
  public static randomize(name: string) {
    return `${name}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
  }
}
