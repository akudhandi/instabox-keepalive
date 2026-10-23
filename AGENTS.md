# Proyek: instabox-keepalive

## Tujuan
Menjaga mesin Instabox tetap hidup untuk bot Telegram (dijalankan dengan PM2).
Mesin otomatis ter-pause oleh platform, dan hanya bisa dihidupkan lagi dari luar VM.
Solusi: GitHub Actions dengan cron yang mengecek state mesin lewat API Instabox
dan memanggil resume/start bila perlu.

## Fakta mesin
- Machine ID: m_agqwsusmr5naqzf6nztn6q5gyy
- Nama mesin: box-019fac
- Akun free, template agent-browser
- autoSuspendAfterSeconds = 1800 (idle 30 menit, tidak bisa diubah di akun ini)
- maxRunMinutes = 480 (batas mutlak 8 jam per sesi)
- processesPreserved = true (PM2 dan bot ikut tersimpan saat pause)
- cooldownUntil: field ada, perilaku saat cooldown belum diketahui

## API Instabox (ringkas, detail lengkap ada di folder docs/)
- Base URL: https://api.instabox.sh
- Auth: header `X-API-Key: $INSTABOX_API_KEY`
- Cek mesin: GET /v1/machines/{id}  -> field `state`
- State: creating, starting, running, stopping, stopped, suspending,
  suspended (paused), resuming, deleting, error
- Resume: POST /v1/machines/{id}/resume  (butuh header `Idempotency-Key: <uuid>`)
- Start:  POST /v1/machines/{id}/start   (butuh `Idempotency-Key`)
- Keduanya membalas 202 dengan operation; pantau lewat
  GET /v1/operations/{id}?wait=25s sampai state `succeeded` atau `failed`
- 409 operation_conflict = ada operasi lain berjalan, lewati saja
- 429 quota_exceeded = limit tercapai, jangan dianggap fatal
- Spesifikasi lengkap: https://api.instabox.sh/v1/openapi.json

## Yang harus dikerjakan
1. Gunakan `instabox-resume.yml` yang sudah ada sebagai dasar, simpan di
   `.github/workflows/instabox-resume.yml`.
2. Tangani HTTP 429 dan error cooldown dengan peringatan (warning), bukan gagal fatal.
3. Buat repo GitHub PUBLIC bernama `instabox-keepalive` (cron tiap 5 menit
   memakan banyak menit Actions, repo public tidak dibatasi).
4. Set secret repo lewat `gh secret set`:
   - INSTABOX_API_KEY  (diambil dari environment variable lokal, JANGAN dari file)
   - INSTABOX_MACHINE_ID (m_agqwsusmr5naqzf6nztn6q5gyy)
5. Jalankan workflow manual (`gh workflow run`) lalu periksa lognya (`gh run view --log`).
6. Laporkan hasilnya: state mesin saat dites dan apakah run berhasil.

## Aturan keras
- JANGAN PERNAH menulis API key ke file, commit, log, atau output apa pun.
  API key hanya boleh dibaca dari environment variable `INSTABOX_API_KEY`.
- Jangan commit file `.env`; pastikan ada di `.gitignore`.
- Jangan memanggil endpoint stop, suspend, atau delete. Hanya baca state,
  resume, dan start.
- Jangan menghapus atau mengubah mesin (PATCH/DELETE).
- Tanyakan dulu ke pemilik sebelum melakukan aksi yang tidak ada di daftar tugas.

## Cara memverifikasi
- Setelah workflow terpasang: jalankan manual, lalu cek log.
- Uji skenario sebenarnya: pause mesin lewat dashboard, tunggu maksimal 10 menit,
  pastikan mesin kembali `running` dan bot Telegram merespons.
- Batas 8 jam akan tercapai sekitar pukul 10:30 WIB (runStartedAt perlu dicek ulang
  lewat GET /v1/machines/{id}); pastikan workflow membangunkan mesin setelahnya.