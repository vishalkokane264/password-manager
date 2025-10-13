import CryptoJS from "crypto-js";

export class EncryptionService {
  private static generateKey(password: string, salt: string): string {
    return CryptoJS.PBKDF2(password, salt, {
      keySize: 256 / 32,
      iterations: 10000, // Higher iterations = more secure
    }).toString();
  }

  static encrypt(data: string, salt: string): string {
    const key = this.generateKey(salt, salt); // Use salt for key derivation
    const encrypted = CryptoJS.AES.encrypt(data, key).toString();
    console.log("Encrypting Data:", { data, salt, encrypted });
    return encrypted;
  }

  static decrypt(encryptedData: string, salt: string): string {
    const key = this.generateKey(salt, salt);
    const bytes = CryptoJS.AES.decrypt(encryptedData, key);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    console.log("Decrypting Data:", { encryptedData, salt, decrypted });
    return decrypted;
  }

  static generatePassword(
    length: number = 16,
    includeSymbols: boolean = true,
    includeNumbers: boolean = true,
    includeUppercase: boolean = true,
    includeLowercase: boolean = true
  ): string {
    let charset = "";
    if (includeLowercase) charset += "abcdefghijklmnopqrstuvwxyz";
    if (includeUppercase) charset += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    if (includeNumbers) charset += "0123456789";
    if (includeSymbols) charset += "!@#$%^&*()_+-=[]{}|;:,.<>?";

    if (charset === "") {
      charset =
        "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    }

    let password = "";
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);

    for (let i = 0; i < length; i++) {
      password += charset.charAt(array[i] % charset.length);
    }

    return password;
  }

  static checkPasswordStrength(password: string): {
    score: number;
    feedback: string[];
  } {
    let score = 0;
    const feedback: string[] = [];

    if (password.length >= 12) score++;
    else feedback.push("Password is too short");

    if (/[a-z]/.test(password)) score++;
    else feedback.push("Add lowercase letters");

    if (/[A-Z]/.test(password)) score++;
    else feedback.push("Add uppercase letters");

    if (/[0-9]/.test(password)) score++;
    else feedback.push("Add numbers");

    if (/[^A-Za-z0-9]/.test(password)) score++;
    else feedback.push("Add symbols");

    return { score, feedback };
  }
}
