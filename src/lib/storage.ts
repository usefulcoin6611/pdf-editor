export interface PDFDraft {
  fileData: ArrayBufferLike;
  fileName: string;
  edits: Record<string, string>;
  lastModified: number;
}

const DB_NAME = "antigravity-pdf-forge";
const STORE_NAME = "drafts";
const EDITS_STORE = "edits_history";
const VERSION = 2; // Bump version for new store

export const pdfStorage = {
  async open(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
        if (!db.objectStoreNames.contains(EDITS_STORE)) {
          db.createObjectStore(EDITS_STORE);
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },

  async saveDraft(draft: PDFDraft): Promise<void> {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      tx.objectStore(STORE_NAME).put(draft, "active-draft");
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  },

  async saveEdits(fileName: string, edits: Record<string, string>): Promise<void> {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(EDITS_STORE, "readwrite");
      tx.objectStore(EDITS_STORE).put(edits, fileName);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  },

  async getEdits(fileName: string): Promise<Record<string, string> | null> {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(EDITS_STORE, "readonly");
      const request = tx.objectStore(EDITS_STORE).get(fileName);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  },

  async getDraft(): Promise<PDFDraft | null> {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const request = tx.objectStore(STORE_NAME).get("active-draft");
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  },

  async clearDraft(): Promise<void> {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      tx.objectStore(STORE_NAME).delete("active-draft");
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }
};
