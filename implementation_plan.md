# Implementation Plan: Antigravity PDF Forge (Local-Only Production Grade)

## Goal
Membangun editor PDF "sempurna" yang berjalan secara lokal di browser dengan fitur manipulasi teks tingkat tinggi tanpa merusak layout asli. Tanpa perlu Authentication atau Cloud (Personal Use Only).

## User Review Required
> [!IMPORTANT]
> **Font Store**: Untuk hasil editing yang sempurna, saya akan mengimplementasikan logic untuk memuat font standar (Arial, Times New Roman, Courier) secara lokal dari folder assets. Apakah ada font khusus lain yang sering Anda gunakan?

## Proposed Changes

### Phase 1: Environment & UI Setup
- Setup **Vite + React + TypeScript**.
- Integrasi **Tailwind CSS & Shadcn UI**.
- Membangun Dashboard Utama dengan area **Drag & Drop** premium.

### Phase 2: Core PDF Engine
- Integrasi `pdf.js` dengan **Web Worker** untuk rendering paralel.
- Implementasi `pdf-lib` untuk penulisan ulang biner PDF.
- **Font Matcher Service**: Script untuk mencocokkan font PDF dengan `Font Store`.

### Phase 3: Interactive Layer & Editing
- **Interactive Canvas**: Layer transparan untuk mendeteksi klik pada koordinat teks.
- **Non-Destructive Masking**: Fungsi untuk menambal teks lama dengan warna background yang dideteksi secara dinamis.
- **In-place Editing**: Input field yang muncul tepat di atas teks asli.

### Phase 4: Production-Ready Features (Local)
- **State History Manager**: Sistem Undo/Redo menggunakan stack state.
- **Persistent Cache**: Menggunakan `IndexedDB` untuk menyimpan progres draft PDF agar tidak hilang saat browser ditutup.
- **Performance Virtualization**: Optimasi rendering hanya untuk halaman yang aktif.

## Open Questions
- Fokus utama saat ini adalah **Teks**. Apakah Anda ingin saya menyertakan fitur manipulasi gambar (Resize/Replace) di fase akhir?

## Verification Plan

### Automated Tests
- Script untuk validasi perubahan teks tidak menggeser koordinat elemen sekitarnya.
- Checksum validation hasil export PDF.

### Manual Verification
1. Upload PDF dengan font beragam secara lokal.
2. Lakukan edit pada beberapa halaman sekaligus.
3. Test fitur Undo hingga kembali ke state awal.
4. Export dan verifikasi di PDF Reader eksternal.
