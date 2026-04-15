
Editor PDF Forge adalah editor PDF presisi tinggi yang memungkinkan modifikasi teks secara *native* tanpa merusak tata letak (*layout*) dokumen. Menggunakan arsitektur **Hybrid Logic**, aplikasi ini menggabungkan kekuatan rendering browser dengan mesin pemroses dokumen Python untuk hasil yang sempurna.

## 🚀 Fitur Utama
- **Layout Preservation:** Teks diedit tepat di atas koordinat aslinya.
- **Precision Engine:** Sinkronisasi biner antara PDF dan format Word (.docx).
- **Auto-Font Discovery:** Mendeteksi font asli dokumen secara otomatis.
- **Dual Export:** Unduh hasil dalam format PDF atau Word (.docx).
- **Local & Secure:** Semua pemrosesan dilakukan di mesin lokal Anda.

---

## 🛠️ Panduan Instalasi & Menjalankan Aplikasi

Ikuti langkah-langkah di bawah ini untuk menyiapkan lingkungan pengembangan di komputer Anda.

### Tahap 1: Setup Backend (Python Engine)
Backend berfungsi sebagai mesin "Precision" yang menangani konversi dan perakitan dokumen.

1. **Masuk ke direktori server:**
   ```bash
   cd server
   ```
2. **Setup Virtual Environment (Opsional tapi Direkomendasikan):**
   ```bash
   python -m venv venv
   source venv/bin/activate  # Untuk Windows: venv\Scripts\activate
   ```
3. **Instal dependensi:**
   ```bash
   pip install fastapi uvicorn python-docx pdf2docx docx2pdf
   ```
4. **Jalankan Server:**
   ```bash
   python main.py
   ```
   *Server akan berjalan di `http://localhost:8000`*

### Tahap 2: Setup Frontend (React Interface)
Frontend adalah antarmuka utama tempat Anda berinteraksi dengan dokumen.

1. **Kembali ke root project (direktori utama):**
   ```bash
   cd ..
   ```
2. **Instal dependensi Node.js:**
   ```bash
   npm install
   ```
3. **Jalankan Dashboard:**
   ```bash
   npm run dev
   ```
   *Aplikasi dapat diakses melalui browser di `http://localhost:5173`*

---

## 📖 Cara Menggunakan
1. **Unggah PDF:** Seret dan lepaskan file PDF Anda ke area unggah.
2. **Tunggu Inisialisasi:** Tunggu hingga *Precision Engine* selesai membedah struktur dokumen (cek di Loading Card).
3. **Klik & Edit:** Arahkan kursor ke teks mana pun di halaman PDF, klik, dan mulai mengetik.
4. **Unduh Hasil:** Pilih **"Export PDF"** untuk hasil instan, atau **"Download .docx"** jika Anda ingin mengedit lebih lanjut di MS Word.

---

## 🪜 Catatan Teknis
- **Font Fidelity:** Jika font dokumen tidak muncul dengan benar di MS Word, pastikan font tersebut sudah terinstall di sistem operasi Anda.
- **Browser:** Direkomendasikan menggunakan Google Chrome atau Microsoft Edge untuk rendering kanvas yang paling akurat.

---

Developed with ❤️ by **Pilatos**.
