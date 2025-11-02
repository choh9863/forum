/**
 * Password Hashing Utilities
 * bcrypt를 사용한 비밀번호 해싱 및 검증
 */

import bcrypt from 'bcrypt';

// Salt rounds for bcrypt (10 is recommended for production)
const SALT_ROUNDS = 10;

/**
 * 비밀번호를 해싱합니다.
 *
 * @param password - 평문 비밀번호
 * @returns 해싱된 비밀번호
 *
 * @example
 * const hashedPassword = await hashPassword('myPassword123');
 */
export async function hashPassword(password: string): Promise<string> {
  try {
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
  } catch (error) {
    console.error('Error hashing password:', error);
    throw new Error('Failed to hash password');
  }
}

/**
 * 비밀번호를 검증합니다.
 *
 * @param password - 평문 비밀번호
 * @param hashedPassword - 해싱된 비밀번호
 * @returns 비밀번호가 일치하면 true, 아니면 false
 *
 * @example
 * const isValid = await comparePassword('myPassword123', hashedPassword);
 */
export async function comparePassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  try {
    const isMatch = await bcrypt.compare(password, hashedPassword);
    return isMatch;
  } catch (error) {
    console.error('Error comparing password:', error);
    throw new Error('Failed to compare password');
  }
}
