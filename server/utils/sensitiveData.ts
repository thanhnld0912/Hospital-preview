import { createCipheriv, createDecipheriv, createHmac, hkdfSync, randomBytes, timingSafeEqual } from 'node:crypto';
import { getDataEncryptionKey } from '../config/env.js';
import { AppError } from './errors.js';

// Mã hóa dữ liệu nhạy cảm ở tầng ứng dụng bằng Node.js crypto:
// - AES-256-GCM (authenticated encryption), IV 12 byte ngẫu nhiên mỗi lần, AAD = tên trường
//   (không hoán đổi được bản mã giữa các cột).
// - HMAC-SHA256 có khóa để so khớp (chống trùng / xác minh) mà không cần giải mã.
// Hai khóa con được dẫn xuất từ DATA_ENCRYPTION_KEY bằng HKDF-SHA256 (không dùng chung một khóa cho hai mục đích).
// Định dạng bản mã: "v1:" + base64(iv | authTag | ciphertext) — tiền tố phiên bản để xoay khóa về sau.

export type SensitiveField = 'phone' | 'citizen_id';

const VERSION = 'v1';
const IV_LENGTH = 12;
const TAG_LENGTH = 16;

interface DerivedKeys {
  encryption: Buffer;
  hmac: Buffer;
}
let derived: DerivedKeys | undefined;

function keys(): DerivedKeys {
  if (!derived) {
    const master = getDataEncryptionKey();
    if (!master) {
      // Không nêu giá trị biến môi trường
      throw new AppError(503, 'FEATURE_NOT_CONFIGURED', 'Chức năng đặt lịch chưa được cấu hình trên máy chủ');
    }
    const salt = Buffer.from('code-hospital/appointments');
    derived = {
      encryption: Buffer.from(hkdfSync('sha256', master, salt, 'aes-256-gcm/v1', 32)),
      hmac: Buffer.from(hkdfSync('sha256', master, salt, 'hmac-sha256/v1', 32)),
    };
  }
  return derived;
}

/** Gọi sớm để báo 503 trước khi xử lý request nếu chưa cấu hình khóa */
export function assertEncryptionConfigured(): void {
  keys();
}

export function encryptField(field: SensitiveField, plaintext: string): string {
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv('aes-256-gcm', keys().encryption, iv);
  cipher.setAAD(Buffer.from(field));
  const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  return `${VERSION}:${Buffer.concat([iv, cipher.getAuthTag(), ciphertext]).toString('base64')}`;
}

export function decryptField(field: SensitiveField, payload: string): string {
  const [version, body] = payload.split(':');
  if (version !== VERSION || !body) throw new Error('Định dạng bản mã không hợp lệ');
  const raw = Buffer.from(body, 'base64');
  const decipher = createDecipheriv('aes-256-gcm', keys().encryption, raw.subarray(0, IV_LENGTH));
  decipher.setAAD(Buffer.from(field));
  decipher.setAuthTag(raw.subarray(IV_LENGTH, IV_LENGTH + TAG_LENGTH));
  return Buffer.concat([decipher.update(raw.subarray(IV_LENGTH + TAG_LENGTH)), decipher.final()]).toString('utf8');
}

/** HMAC có khóa, theo từng trường (cùng giá trị ở hai trường khác nhau cho hash khác nhau) */
export function hashField(field: SensitiveField, normalized: string): string {
  return createHmac('sha256', keys().hmac).update(`${field}:${normalized}`).digest('hex');
}

export function hashEquals(a: string, b: string): boolean {
  const left = Buffer.from(a, 'hex');
  const right = Buffer.from(b, 'hex');
  return left.length === right.length && timingSafeEqual(left, right);
}

/** 0905123456 -> 09*****456 */
export function maskPhone(phone: string): string {
  return `${phone.slice(0, 2)}${'*'.repeat(Math.max(phone.length - 5, 0))}${phone.slice(-3)}`;
}

/** 001099001234 -> ********1234 */
export function maskCitizenId(citizenId: string): string {
  return `${'*'.repeat(Math.max(citizenId.length - 4, 0))}${citizenId.slice(-4)}`;
}
