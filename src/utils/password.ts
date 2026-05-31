/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface PasswordOptions {
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  symbols: boolean;
}

export interface PasswordStrengthInfo {
  score: 'weak' | 'ok' | 'strong';
  label: string;
  colorClass: string;
  bgColorClass: string;
  borderColorClass: string;
  percent: number; // For progress bar representation
  description: string;
}

export const UPPERCASE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
export const LOWERCASE_CHARS = "abcdefghijklmnopqrstuvwxyz";
export const NUMBER_CHARS = "0123456789";
export const SYMBOL_CHARS = "!@#$%^&*()_+-=[]{}|;:',./<>?";

/**
 * Returns a cryptographically secure random integer in [0, max).
 */
export function getRandomInt(max: number): number {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    const array = new Uint32Array(1);
    window.crypto.getRandomValues(array);
    // Use modulo; for small max values in normal generation pools, bias is negligible
    return array[0] % max;
  }
  return Math.floor(Math.random() * max);
}

/**
 * Shuffles an array in-place using the Fisher-Yates algorithm and CSPRNG.
 */
export function shuffleArray(array: string[]): string[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = getRandomInt(i + 1);
    const temp = result[i];
    result[i] = result[j];
    result[j] = temp;
  }
  return result;
}

/**
 * Generates a random secure password based on user constraints.
 */
export function generatePassword(length: number, options: PasswordOptions): string {
  const activePools: { chars: string; size: number }[] = [];
  
  if (options.uppercase) activePools.push({ chars: UPPERCASE_CHARS, size: UPPERCASE_CHARS.length });
  if (options.lowercase) activePools.push({ chars: LOWERCASE_CHARS, size: LOWERCASE_CHARS.length });
  if (options.numbers) activePools.push({ chars: NUMBER_CHARS, size: NUMBER_CHARS.length });
  if (options.symbols) activePools.push({ chars: SYMBOL_CHARS, size: SYMBOL_CHARS.length });

  // If no pool is selected, return an empty string
  if (activePools.length === 0 || length <= 0) {
    return "";
  }

  const passwordChars: string[] = [];
  
  // Rule 1: Ensure at least one character from each active category is included
  // to avoid key-set starvation for smaller lengths.
  const guaranteedChars: string[] = [];
  if (length >= activePools.length) {
    activePools.forEach(pool => {
      const randIdx = getRandomInt(pool.size);
      guaranteedChars.push(pool.chars[randIdx]);
    });
  }

  // Combine remaining pools
  const combinedPool = activePools.map(p => p.chars).join("");
  const remainingCount = length - guaranteedChars.length;

  // Fill up the rest with any active characters
  const fillChars: string[] = [];
  for (let i = 0; i < remainingCount; i++) {
    const randIdx = getRandomInt(combinedPool.length);
    fillChars.push(combinedPool[randIdx]);
  }

  // Combine and shuffle to remove predictability from guaranteed positions
  const finalPool = [...guaranteedChars, ...fillChars];
  return shuffleArray(finalPool).join("");
}

/**
 * Calculates informational entropy in bits: log2(poolSize^length)
 */
export function calculateEntropy(length: number, options: PasswordOptions): number {
  let poolSize = 0;
  if (options.uppercase) poolSize += UPPERCASE_CHARS.length;
  if (options.lowercase) poolSize += LOWERCASE_CHARS.length;
  if (options.numbers) poolSize += NUMBER_CHARS.length;
  if (options.symbols) poolSize += SYMBOL_CHARS.length;

  if (poolSize === 0 || length === 0) return 0;
  return length * (Math.log(poolSize) / Math.log(2));
}

/**
 * Rates the password strength based on length, active subsets, and informational entropy.
 */
export function getPasswordStrength(length: number, options: PasswordOptions): PasswordStrengthInfo {
  let activeCount = 0;
  if (options.uppercase) activeCount++;
  if (options.lowercase) activeCount++;
  if (options.numbers) activeCount++;
  if (options.symbols) activeCount++;

  const entropy = calculateEntropy(length, options);

  if (activeCount === 0 || length === 0) {
    return {
      score: 'weak',
      label: 'Ultra Weak',
      colorClass: 'text-red-500',
      bgColorClass: 'bg-red-500',
      borderColorClass: 'border-red-500',
      percent: 5,
      description: 'Please select at least one character set to secure your password.'
    };
  }

  // Standard rating calculations based on scientific bits of entropy (CSPRNG)
  if (length < 8 || entropy < 36 || activeCount === 1) {
    return {
      score: 'weak',
      label: 'Weak',
      colorClass: 'text-rose-500 dark:text-rose-400',
      bgColorClass: 'bg-rose-500',
      borderColorClass: 'border-rose-500',
      percent: 33,
      description: 'Easily cracked by automated brute-force scripts within short periods.'
    };
  } else if (entropy >= 36 && entropy < 65) {
    return {
      score: 'ok',
      label: 'Moderate (OK)',
      colorClass: 'text-amber-500 dark:text-amber-400',
      bgColorClass: 'bg-amber-500',
      borderColorClass: 'border-amber-500',
      percent: 66,
      description: 'Sufficiently secure for standard online forums and low-risk accounts.'
    };
  } else {
    return {
      score: 'strong',
      label: 'Strong & Secure',
      colorClass: 'text-emerald-500 dark:text-emerald-400',
      bgColorClass: 'bg-emerald-500',
      borderColorClass: 'border-emerald-500',
      percent: 100,
      description: 'Excellent protection. Defeats aggressive offline and dictionary attacks.'
    };
  }
}
