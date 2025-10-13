import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { db, auth } from "../config/firebase";
import {
  Credential,
  CredentialCategory,
  PasswordHistory,
} from "../types/credential";
import { EncryptionService } from "./encryptionService";

export class CredentialService {
  private static readonly COLLECTION_NAME = "credentials";
  private static readonly MAX_PASSWORD_HISTORY = 3;

  static async saveCredential(
    credential: Omit<
      Credential,
      | "id"
      | "userId"
      | "createdAt"
      | "updatedAt"
      | "password"
      | "passwordHistory"
      | "lastPasswordChange"
      | "passwordChangeReminder"
    >,
    masterPassword: string
  ): Promise<string> {
    if (!auth.currentUser) throw new Error("User not authenticated");

    const encryptedPassword = EncryptionService.encrypt(
      credential.encryptedPassword,
      masterPassword
    );
    const now = new Date();
    const reminderDate = new Date(now);
    reminderDate.setMonth(reminderDate.getMonth() + 1); // 1 month from now
    const newCredential: any = {
      ...credential,
      userId: auth.currentUser.uid,
      encryptedPassword,
      passwordHistory: [],
      lastPasswordChange: Timestamp.fromDate(now),
      passwordChangeReminder: Timestamp.fromDate(reminderDate),
      createdAt: Timestamp.fromDate(now),
      updatedAt: Timestamp.fromDate(now),
    };
    newCredential["password"] = "";
    console.log("newCredential", newCredential);

    const docRef = await addDoc(
      collection(db, this.COLLECTION_NAME),
      newCredential
    );
    return docRef.id;
  }

  static async getCredentials(masterPassword: string): Promise<Credential[]> {
    if (!auth.currentUser) throw new Error("User not authenticated");
    console.log("im getting creds data");

    const q = query(
      collection(db, this.COLLECTION_NAME),
      where("userId", "==", auth.currentUser.uid),
      orderBy("updatedAt", "desc")
    );

    const querySnapshot = await getDocs(q);
    const credentials: Credential[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      try {
        const decryptedPassword = EncryptionService.decrypt(
          data.encryptedPassword,
          masterPassword
        );

        // Decrypt password history
        const decryptedHistory =
          data.passwordHistory?.map((hist: any) => ({
            id: hist.id,
            encryptedPassword: EncryptionService.decrypt(
              hist.encryptedPassword,
              masterPassword
            ),
            createdAt: hist.createdAt.toDate(),
          })) || [];

        credentials.push({
          id: doc.id,
          ...data,
          encryptedPassword: decryptedPassword,
          passwordHistory: decryptedHistory,
          lastPasswordChange: data.lastPasswordChange.toDate(),
          passwordChangeReminder: data.passwordChangeReminder.toDate(),
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
          lastAccessed: data.lastAccessed?.toDate(),
        } as Credential);
      } catch (error) {
        console.error("Failed to decrypt credential:", error);
      }
    });

    return credentials;
  }

  static async updateCredential(
    credentialId: string,
    updates: Partial<Credential>,
    masterPassword: string
  ): Promise<void> {
    if (!auth.currentUser) throw new Error("User not authenticated");

    const docRef = doc(db, this.COLLECTION_NAME, credentialId);

    // If password is being updated, handle password history
    if (updates.encryptedPassword) {
      // Get current credential to add old password to history
      const credentials = await this.getCredentials(masterPassword);
      const currentCredential = credentials.find((c) => c.id === credentialId);

      if (currentCredential) {
        const newHistoryEntry: PasswordHistory = {
          id: Date.now().toString(),
          encryptedPassword: EncryptionService.encrypt(
            currentCredential.encryptedPassword,
            masterPassword
          ),
          createdAt: new Date(),
        };

        // Keep only last 3 passwords in history
        const updatedHistory = [
          newHistoryEntry,
          ...currentCredential.passwordHistory,
        ].slice(0, this.MAX_PASSWORD_HISTORY);

        updates.passwordHistory = updatedHistory.map((hist) => ({
          ...hist,
          createdAt: Timestamp.fromDate(hist.createdAt),
        })) as any;

        updates.lastPasswordChange = Timestamp.fromDate(new Date()) as any;

        // Set next reminder (1 month from now)
        const reminderDate = new Date();
        reminderDate.setMonth(reminderDate.getMonth() + 1);
        updates.passwordChangeReminder = Timestamp.fromDate(
          reminderDate
        ) as any;
      }

      updates.encryptedPassword = EncryptionService.encrypt(
        updates.encryptedPassword,
        masterPassword
      );
    }

    updates.updatedAt = Timestamp.fromDate(new Date()) as any;
    updates["password"] = "";

    await updateDoc(docRef, updates);
  }

  static async deleteCredential(credentialId: string): Promise<void> {
    const docRef = doc(db, this.COLLECTION_NAME, credentialId);
    await deleteDoc(docRef);
  }

  static async markAsAccessed(credentialId: string): Promise<void> {
    const docRef = doc(db, this.COLLECTION_NAME, credentialId);
    await updateDoc(docRef, {
      lastAccessed: Timestamp.fromDate(new Date()),
    });
  }

  static async getCredentialsNeedingPasswordChange(): Promise<Credential[]> {
    if (!auth.currentUser) throw new Error("User not authenticated");

    const q = query(
      collection(db, this.COLLECTION_NAME),
      where("userId", "==", auth.currentUser.uid),
      where("passwordChangeReminder", "<=", Timestamp.fromDate(new Date()))
    );

    const querySnapshot = await getDocs(q);
    const credentials: Credential[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      credentials.push({
        id: doc.id,
        ...data,
        lastPasswordChange: data.lastPasswordChange.toDate(),
        passwordChangeReminder: data.passwordChangeReminder.toDate(),
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
        lastAccessed: data.lastAccessed?.toDate(),
      } as Credential);
    });

    return credentials;
  }

  static async snoozePasswordReminder(
    credentialId: string,
    days: number = 7
  ): Promise<void> {
    const docRef = doc(db, this.COLLECTION_NAME, credentialId);
    const newReminderDate = new Date();
    newReminderDate.setDate(newReminderDate.getDate() + days);

    await updateDoc(docRef, {
      passwordChangeReminder: Timestamp.fromDate(newReminderDate),
    });
  }
}
