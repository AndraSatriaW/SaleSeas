# ⚓ Sale Seas
**Jelajahi Pasar Digital dan Temukan Diskon Game Terbaik**

Sale Seas adalah aplikasi web interaktif yang dikembangkan untuk membantu gamer menemukan harga termurah dan diskon terbesar pada deretan game PC di berbagai toko digital ternama seperti Steam, Epic Games, GOG, Fanatical, dan banyak lagi.

Dokumen ini adalah **Panduan Utama (Ultimate Guide)** untuk memahami proyek Sale Seas secara keseluruhan. Baik Anda sedang mempelajari susunan kode, mengevaluasi proyek ini untuk presentasi universitas (UTS), maupun bersiap untuk berkontribusi, README ini akan menjelaskan secara mendetail *apa* yang kami bangun dan *mengapa* kami membangunnya.

---

## 1. Gambaran Proyek (Project Overview)

### Apa itu Sale Seas?
Sale Seas adalah aplikasi web yang cepat, solid, dan memiliki desain antarmuka yang sangat menarik, dibangun menggunakan kerangka kerja (framework) **Vue.js** untuk sisi antarmuka pengguna (Frontend) dan **Node.js/Express** untuk sisi server (Backend). Platform ini mengumpulkan data secara seketika (*real-time*) untuk menunjukkan di mana sebuah judul game sedang diskon termurah saat ini.

### Tujuan Proyek
Tujuan utama proyek ini adalah memberikan pengalaman pengguna yang sangat mulus dalam mencari dan menemukan promosi (sale) video game tanpa memaksa pengguna untuk membuka atau mengecek ketersediaan di puluhan situs web toko secara manual. Proyek ini menyatukan banyak platform penjualan game digital ke dalam satu panel yang nyaman dilihat.

### Masalah yang Diselesaikan
Pasar PC gaming sangat terpecah belah (terfragmentasi). Developer atau publisher menjual salinan gamenya (key/lisensi) di Steam, disaat yang bersamaan mereka bisa saja memberikan promosi khusus di Epic Games Store atau GreenManGaming. Seringkali, gamer melewatkan diskon besar (% off) yang terjadi karena mereka hanya mengecek satu platform langganannya (misal: Steam). Sale Seas memecahkan kerumitan ini dengan mengambil data harga terbaik dari seluruh penjuru internet secara simultan lalu menampilkannya dalam format grid (tabel visual) gabungan.

### Mengapa Menggunakan API CheapShark?
Sebagai layanan basis data, kami menggunakan **API CheapShark**. CheapShark merupakan penyedia layanan yang secara konstan memonitor harga game PC. Alasan pemilihannya:
1. Menggabungkan data dari sekitar 30 lebih etalase toko digital/aplikasi.
2. Memiliki catatan sejarah diskon ("lowest price ever") yang esensial.
3. Gratis, tersedia tanpa batas kuota yang ketat, serta mengembalikan data JSON yang rapi, sehingga sangat ideal untuk tugas akhir universitas maupun portofolio yang interaktif.

---

## 2. Penjelasan Arsitektur (Architecture)

Sale Seas dirancang dengan menggunakan fondasi **Microservices Architecture (Arsitektur Layanan Mikro)**.

### Apa itu Arsitektur Layanan Mikro?
Alih-alih mengumpulkan keseluruhan kode dan beban kerja server di satu "monolith" (satu aplikasi besar), kami memecah logika sisi-server (backend) ke dalam beberapa entitas aplikasi-aplikasi yang sangat kecil, masing-masing berjalan secara mandiri dan saling tak bergantung. Tiap layanan memiliki satu fokus (pekerjaan) saja dan menggunakan port jaringan yang berbeda.

### Mengapa Digunakan dalam Proyek ini?
- **Pemisahan Perhatian (Separation of Concerns):** Menjaga kode supaya tetap terorganisir. Jika suatu hari API pencarian bermasalah, aplikasi bagian tampilan *Feed Deals* tidak akan ikut rusak.
- **Kemudahan Eskalasi (Scalability):** Di kondisi dunia nyata, jika pengguna serentak memakai kotak pencarian, kita bisa meningkatkan spesifikasi komputasi khusus untuk *Search Service* tanpa menyentuh *Deals Service*.
- **Demonstrasi Pembelajaran:** Arsitektur ini merefleksikan standar industri modern dari perusahaan-perusahaan perangkat lunak besar. Penggunaan metode ini menunjukan penerapan dari prinsip *software engineering* tingkat mahir.

### Cara Antar-Layanan Berkomunikasi
Aplikasi *Frontend* tidak pernah "berbicara" langsung secara acak menargetkan tiap layanan mikro tunggal. *Frontend* mengirim seluruh permintaannya tepat ke satu titik, yaitu: **API Gateway**. Gateway ini bertindak layaknya "polisi lalu-lintas" (Traffic Cop), yang bertugas mem-forward atau meneruskan permintaan HTTP masuk menuju layanan internal spesifik yang dibutuhkan, menunggu respon, kemudian mengarahkannya balik menuju Frontend UI.

### Diagram Arsitektur Dasar

```text
                      [ Perangkat Klien / Web Browser ]
                             │
                             ▼
                    (Frontend - Vue.js)
                             │       (HTTP GET /api/deals)
                             ▼
                 [ API Gateway - Port 3000 ] -- (Sang Pengatur Lalu Lintas)
                             │
               ┌─────────────┴─────────────┐
               │                           │
               ▼                           ▼
[ Deals Service - Port 3001 ]   [ Search Service - Port 3002 ]
               │                           │
               └─────────────┬─────────────┘
                             ▼
                  ( Eksternal RESTful API )
                 [   API JSON CheapShark  ]
```

### Penjelasan Setiap Komponen
1. **API Gateway (Port 3000):** Mengonsolidasi berbagai permintaan multi-mikroservis jadi sebuah pintu satu atap (`/api/*`). Gateway ini juga menyelesaikan aturan CORS untuk keamanan klien/browser.
2. **Deals Service (Port 3001):** Didedikasikan mutlak untuk menangani pengambilan daftar deal diskon terkini dan informasi terkait toko.
3. **Search Service (Port 3002):** Didedikasikan mutlak untuk menangani pencarian dari input (teks) yang ditekan pengguna (misal: "Cyberpunk") dan pencarian bersyarat filter kompleks.
4. **Frontend (Vue.js melalui Vite - Port 5173):** Antarmuka pengguna. Berlokasi merender kerangka visual bagi pengguna dengan mengambil susunan komponen Vue.

---

## 3. Penjelasan Fitur (Sangat Detail)

### Fitur 1: Menampilkan Daftar Penawaran Diskon (Display Deals)
* **Deskripsi:** Menunjukkan ke layar sebuah deretan kotak permainan (grid) dari judul game populer yang sedang turun harga, biasanya diurutkan menurut rating penghematan (% diskon) tertinggi atau algoritma *Deal Rating*.
* **Alur Perputaran Sistem (Step-by-Step):**
  1. Saat situs web termuat, *Frontend (Vue)* mengeluarkan sinyal GET ke *Gateway* (URL: `/api/deals`).
  2. *Gateway* membaca rute URL, mengenali arah permintaanya, lalu melemparkan request tersebut ke *Deals Service* di rute internal (`/deals`).
  3. *Deals Service* melakukan komunikasi langsung ke Endpoint CheapShark, mendownload List Array JSON.
  4. Data tersebut kembali ke *Frontend*. Bagian layar depan akan mem-plot masing-masing elemen data tunggal (sebuah game) memalui komponen `DealCard.vue`, sehingga terciptalah grid katalog yang indah.
* **File Terlibat Utama:** `App.vue` (Pemantik eksekusi pengunduhan saat mount aplikasi), `frontend/src/api.js` (Alat perantara Axios), `DealCard.vue` (Bagian peraga UI tunggal).

### Fitur 2: Pencarian Game (Search Games)
* **Deskripsi:** Input text bar di mana pengguna mengetik, dan data game-game serumpun sesuai nama yang dicari akan segera muncul.
* **Alur Perputaran Sistem (Step-by-Step):**
  1. Pengguna mengetik nama game di bilah `SearchBar.vue`. Terjadi pencatatan keystroke (huruf demi huruf).
  2. Antarmuka menggunakan teknik peredaman (debounce) agar tidak mengirim API saat pengguna masih sibuk mengetik, menunggu hingga ada selang jeda dari tangan pengguna—atau saat mereka memencet tombol (Enter).
  3. Saat terkirim, parameter dimasukkan (ex: `/api/search?title=Elden`). API Gateway menerima rute ini dan mengalihkan ke *Search Service*.
  4. Komputasi *Search Service* menyaring dan mencocokkan hasil string term ke API CheapShark. Terjadilah update responsif di layar di mana grid diganti penuh hanya dengan hasil yang relevan.
* **File Terlibat Utama:** `SearchBar.vue`, `backend/services/search-service/index.js`.

### Fitur 3: Penjaringan Spesifik (Data Filtering)
* **Deskripsi:** Terdapat bilah di samping (Sidebar/FilterBar) agar pengguna membatasi rentang penawaran, seperti "Jangan tunjukkan game di atas $20", serta mode "Urutkan berdasarkan".
* **Alur Perputaran Sistem (Step-by-Step):**
  1. Pengguna mengutak-atik saklar *(slider/dropdown)* pada komponen `FilterBar.vue`.
  2. Begitu terdapat perubahan, elemen input otomatis melempar sinyal (emit) payload objek konfigurasi ke tingkat teratas hierarki komponen Vue (seperti: `{ upperPrice: 20, sortBy: 'Price' }`).
  3. Sistem bereaksi dengan melakukan panggilan ganda (re-fetch) memanggil rute Gateway terbaru sambil menyematkan query string parameter ini `/api/deals?upperPrice=20&sortBy=Price`.
* **File Terlibat Utama:** `FilterBar.vue`, `backend/api-gateway/index.js`.

---

## 4. Struktur Folder dan Penjelasan Lengkap (Folder Structure)

Struktur ini dibangun pada asas skalabilitas dan kerapian maksimal. Di bawah ini adalah pemaparannya.

```text
SaleSeas/
├── backend/
│   ├── api-gateway/         # -> Agen Lalu Lintas Terpusat
│   │   ├── index.js         # Inti penerima seluruh call Axios front end, mengatur penalian rute API port 3000 ke port microservice. (ALASAN: Meringankan konfigurasi alamat CORS di Frontend).
│   │   └── package.json     # Daftar referensi dependency gateway (express, cors, axios, dotenv).
│   ├── services/
│   │   ├── deals-service/   # -> Area Pengerjaan Spesifik Deals Diskom
│   │   │   └── index.js     # Server yang khusus "bicara" pada endpoint /deals dan /stores API Eksternal. Hanya memiliki tanggub jawab mengambil dan mengemas daftar permainan.
│   │   └── search-service/  # -> Area Pengerjaan Spesifik Input Pencarian
│   │       └── index.js     # Server khusus yang menerima query string (`?title=`) untuk dioperkan fungsinya menghasilkan kueri list filter game. 
│
├── frontend/
│   ├── src/                 
│   │   ├── api.js           # Berisi file krusial. Seluruh konfigurasi HTTP HTTP/Axios berpusat di sini agar komponen lain tidak perlu mengetik panjang lebar parameter URL. 
│   │   ├── App.vue          # Kerangka Vue Induk yang mencakup halaman root untuk meramu komponen anakan.
│   │   ├── main.js          # Skrip titik masukan (entry point) Vue yang menyuplai file instance (root injector).
│   │   ├── index.css        # Kamus gaya perwajahan dan variabel (palet warna CSS3 dan keyframes animasi dasar).
│   │   └── components/      # Folder blok LEGO interface yang akan dirangkai (Bisa didaur ulang/reusable)
│   │       ├── DealCard.vue # -> Mewakili SATU (1) biji kotak gambar game. Berisi logika kalkulasi diskon parsial, dan tombol redirect store (link).
│   │       ├── FilterBar.vue# -> Mewakili satu bongkah kolom sisi layar berisi slide bar range angka harga dan select option sortBy.
│   │       └── SearchBar.vue# -> Komponen input box estetik di bagian atas panel untuk memasukkan text keyword (Elden Ring, God of War).
│   ├── index.html           # Target render browser utama.
│   └── package.json         # Modul Node Frontend. Menampung Vite Build, Vue v3 runtime, dan Axios versi klien.
```

**Esensi dari Desain Susunan Ini:** Pemisahan super tegas (Strict Isolation). Seseorang *Frontend Engineer* bisa sepenuhnya bekerja dalam rumpun subdirektori `/frontend` dan mengembangkan estetikanya tanpa menyentuh logika Express sisi `/backend` sama sekali. Saat terjadi galat (error) di hasil pencarian, *Backend Engineer* tahu betul letak permasalahannya ada di `search-service` tanpa mengacak-ngacak `deals-service`.

---

## 5. Integrasi API (Data Flow)

### Metode Pemanggilan API CheapShark
Ekosistem backend kita merangkai ulang dan menangkap data dari server utama platform CheapShark melalui jembatan Restful JSON.
* **Endpoint Yang Disentuh (Diminta):**
  * `https://www.cheapshark.com/api/1.0/deals` (Endpoint raksasa untuk memuat game baru yang diobral, bisa dikemas dengan custom parameter pencarian limit, rentang bujet, dll)
  * `https://www.cheapshark.com/api/1.0/games?title=X` (Endpoint khusus kueri string nama game untuk pencarian spesifik/exact-string search)
  * `https://www.cheapshark.com/api/1.0/stores` (Endpoint ringan sebagai pangkalan referensi logo, ID, dan nama dari masing-masing storefront ex: ID `1` itu `Steam`)

### Arus Data dari Hulu ke Hilir
Data melintas di lintasan asinkron (Asynchronous pipeline) berikut:
1. **Frontend Request:** Melalui perantara pustaka Axios di port klien Vue `axios.get('http://localhost:3000/api/deals')`.
2. **Intersepsi API Gateway:** Gateway melihat request menuju jalur `/api/deals`, dan menggantinya/meng-oper (forward) menjad `axios.get('http://localhost:3001/deals')`.
3. **Trigger Level Backend Mikro (Deals Service):** `Deals Service` menerimanya, lalu kembali membungkusnya menjadi GET Request eksternal raksasa `axios.get('https://www.cheapshark.com/api/1.0/deals')` (Ke luar internet).
4. **Respon Balik:** JSON turun. Dari CheapShark -> Direspon Deals Service -> Direspon API Gateway -> Direspon Axios Frontend UI lalu muncul gambar game di depan layar user.

### Percontohan JSON Payload (Bentuk Mentah Data)
Ini adalah sampel data respon yang dikembalikan ke dalam Frontend, siap untuk diekstrak menjadi informasi visual:
```json
{
  "internalName": "CYBERPUNK2077",
  "title": "Cyberpunk 2077",
  "storeID": "1",    // 1 ini menunjukan Kode Sistem bahwa platform ini milik Steam
  "dealID": "X89b...==",
  "salePrice": "29.99",
  "normalPrice": "59.99",
  "savings": "50.008335", // Setengah harga - di frontend akan dirubah bulat jadi angka diskon "50%"
  "thumb": "https://cdn.cloudflare.steamstatic.com/..." // URL Cover Art Image
}
```

---

## 6. Penjelasan Kode Keseluruhan (MENDALAM - Penting)

Bagian ini membedah barisan-barisan kode kunci ("under the hood") di level sintaks, fungsi per fungsional komponen utama. Bagian ini penting bagi programmer junior yang ingin mereplikasi struktur serupa.

### A. Bagian Backend: Setup Express di Mikroservis
Pada setiap layanan mikro di backend, kita menyiapkan API perlakuan (Express Server). Ambil contoh di dalam **Deals Service**:

```javascript
// backend/services/deals-service/index.js
const express = require('express');
const axios = require('axios');
const app = express();

const CHEAPSHARK_API = 'https://www.cheapshark.com/api/1.0';

// Setup Route Handler bagi '/deals'
app.get('/deals', async (req, res) => {
  try {
    // 1. Memanggil Axios untuk mengambil URL Asli
    // 2. { params: req.query } adalah kunci emas. Kita mengirim keseluruhan request barisan parameter (query params) seperti "?upperPrice=20" kepunyaan Vue ke dalam panggilan ke CheapShark.
    const response = await axios.get(`${CHEAPSHARK_API}/deals`, {
      params: req.query 
    });
    
    // 3. Mengirim payload balikan JSON ke sang pemanggil (API Gateway)
    res.json(response.data);
  } catch (error) {
    // Memberikan Log Terminal Node agar Debugger Developer Menerti letak kesalahan
    console.error('Error fetching deals:', error.message);
    res.status(500).json({ error: 'Failed to fetch deals from CheapShark' });
  }
});
```
**Mengapa demikian?** Menulis objek parameter `params: req.query` adalah tindakan teknikal cerdas (pass-through). Dengan begitu, *Deals Service* tidak perlu membongkar ("destructure") setiap jenis filter (seperti hardcoding `if upperPrice then...`). Ia bertindak sebagai tabung dinamis. Jika *Frontend* menyematkan filter `sortBy=Rating`, *Deals Service* secara gaib melemparkannya langsung ke CheapShark. Cerdas dan tidak memboroskan jumlah baris kode!

### B. Bagian Penengah: API Gateway Proxy Logic
API Gateway mendayagunakan kemampuan manipulasi lintasan lokal dan pembelokan URL.

```javascript
// backend/api-gateway/index.js
const cors = require('cors');
app.use(cors()); // MENGHILANGKAN BLOKIR CORS

// Environment Variabel Pengepungan Sub Servis
const DEALS_SERVICE = 'http://localhost:3001';

app.get('/api/deals', async (req, res) => {
  try {
    // Proksi request ke Internal Microservice Deals
    const response = await axios.get(`${DEALS_SERVICE}/deals`, {
      params: req.query,
    });
    res.json(response.data);
  } catch(error) { 
    // Tangkap kode galat 502 Bad Gateway jika server Deals (misal) mati (down)
    res.status(502).json({ success: false, message: 'Deals service is unavailable' });
  }
});
```
**Penjelasan Logika:** Gateway ini menyelesaikan musuh tersulit programmer saat mulai bermain API, yaitu aturan **CORS** di browser. Karena port backend (3000, 3001) dan port Vite.js Frontend (5173) berbeda jauh, maka panggilan ke luar dianggap ancaman keamanan sekuritas/CORS error oleh Google Chrome. Tetapi karena file ini dipeluk oleh `app.use(cors())`, lalu API Gateway ini bertindak sebagai makelar (Middleman) transisi IP asalnya, browser mendikte transaksinya aman! Semua masalah tertangani hanya dalam 1 blok skrip ringkas.

### C. Bagian Frontend: Layanan Ekstrasi API (api.js)
File ini sentral pergerakan sisi UI. Ketimbang tiap komponen menginsialisasi URL, kita memusatkan pembuatan instansi `axios` pada berkas `frontend/src/api.js`.

```javascript
// frontend/src/api.js
import axios from 'axios';
const API_BASE = 'http://localhost:3000/api'; // Titik target tunggal!

// Membuat blueprint default Axios dengan timeout 10 detik pencegah endless loading
const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000, 
});

// Menyediakan Fungsi Export untuk dipanggil komponen DealFeed
export async function fetchDeals(params = {}) {
  const response = await api.get('/deals', { params });
  return response.data; // Hanya return Payload Utamanya! (mengurangi lapisan metadata HTTP Axios)
}

// Konversi statis perkiraan nilai tukar Rupiah dari USD 
export function convertToIDR(usdPrice) {
  const price = parseFloat(usdPrice);
  if (isNaN(price)) return 'Rp 0';
  const idr = Math.round(price * 15850);
  return `Rp ${idr.toLocaleString('id-ID')}`; // "Rp 150.000"
}
```

### D. Bagian Frontend: Perilaku Input Komponen Pencarian (SearchBar.vue)
Vue Component untuk `SearchBar` memakai mekanisme lemparan komunikasi antar struktur pohon DOM ("Emit Events") tanpa merusak hierarki, yang dikontrol dengan sangat ketat.

```vue
<!-- frontend/src/components/SearchBar.vue - Script Setup -->
<script setup>
import { ref, defineEmits } from 'vue'

// Kita mendaftarkan event kustom 'search' dan 'clear' untuk diikat ke App.vue (Parent Component)
const emit = defineEmits(['search', 'clear'])
const searchQuery = ref('') // Konsep Variabel Reaktif State Vue 3 (Two Way Data Binding)

// Ketika dipicu oleh tombol Enter atau klik mouse submit Button
function onSearch() {
  // Hanya melempar event apabila teksnya tidak kosong.
  // emit() melempar parameter string keyword nya ke atas ke Parent (Misal: 'Elden Ring')
  emit('search', searchQuery.value.trim())
}

// Digunakan seketika saar pengguna membersihkan papan ketik (Backspacing secara perlahan)
// Event 'input' langsung terdeteksi di DOM (onInput) secara instan per huruf
function onInput() {
  if (searchQuery.value.trim() === '') {
    emit('clear')   // Mereset layar kembali menampilkan data Deals Umum
  }
}
</script>
```
**Mengapa Menggunakan Ref & Emit?** Pada prinsip rancangan perangkat lunak modern (Vue 3 Composition API), komponen anak (Child/SearchBar) tidak dianjurkan menangani Panggilan Logika Fetch Axis sendiri (ini melanggar kaidah penempatan status/state/Single Source of Truth). Komponen cukup berteriak "Hei Bapak! (App.vue), pengguna sedang mencari 'Elden Ring' ini lhoo!!". Sang komponen Induk/Parent kemudian akan mengangkap eventnya `@search`, dan memanggil fungsi `api.js` untuk mendownload array baru yang diminta. Sangat kohesif!

### E. Bagian Frontend: Komponen Tampilan Utama Data (DealCard.vue)
Menyulap data "Jeje-sonan" yang sangat jelek tadi ke bentuk presentasi grafis pil berwana gradiasi premium.

```vue
<!-- frontend/src/components/DealCard.vue -->
<template>
  <div class="card-actions">
    <div class="card-cta-wrapper">
      <!-- Direct Store Link: Membuang Tautan Redireksi Cheapshark -->
      <a
        :href="storeSearchInfo.url"
        target="_blank"
        rel="noopener"
        class="card-cta-link"
        :title="'View this game on ' + storeSearchInfo.storeName"
      >
        Go to {{ storeSearchInfo.storeName }}
      </a>
      
      <!-- Tombol Copy Cepat ke Papan Klip -->
      <button @click.prevent="copyLink(storeSearchInfo.url)" class="copy-btn">
        <span v-if="copied">✅</span>
        <span v-else>📋</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, defineProps, ref } from 'vue'
import { getStoreSearchUrl } from '../api.js'

// Vue Props = Variabel parameter wajib turun-temurun
const props = defineProps({
  deal: { type: Object, required: true },
})

// Logika dinamis untuk Copy text di sistem Clipboard Windows/Mac
const copied = ref(false)
function copyLink(url) {
  navigator.clipboard.writeText(url)
  copied.value = true // Ubah indikator menjadi Contreng Hijau sementara
  setTimeout(() => { copied.value = false }, 2000) // Reset di 2 detik kemudian
}

// Computed Properties: Variabel bayangan reaktif yang selalu menghitung secara live
const storeSearchInfo = computed(() => {
  return getStoreSearchUrl(props.deal.storeID, props.deal.title)
})
</script>
```
**Evolusi Desain (Alasan Modifikasi Baris Ini):** Di iterasi model perancangan sebelumnya, link utama (href) menggunakan URL "redirect" yang disediakan oleh CheapShark. Hal itu menyebabkan peredaman ancaman keamanan di banyak aplikasi CloudFlare dan diblokir peramban karena di-cap membahayakan. Oleh karena itu, kita membedah file tersebut dan mendesain fungsi interpolasi manual internal kita `getStoreSearchUrl()`—fungsinya merangkum URL Direct/Langsung menuju domain resmi asal game tersebut diterbitkan (Ex: `https://store.steampowered.com/search/?term=judul`). Lebih cepat memuat halaman, UX meningkat, dan tidak dijebak ke anti-malware browser!

---

## 7. Cara Menjalankan Proyek di Lingkungan Lokal (Setup & Run)

Untuk dapat mensimulasikan keempat siklus *microservices* ini di komputer lokal secara utuh:

### Prasyarat:
- Komputer minimal harus sudah terinstal Node.js Runtime.
- Fasilitas command promt / Terminal terpisah (PowerShell, Bash, CMDer).

### Metode Pemasangan
Buka empat jendela layar terminal yang saling berdampingan dan ikuti instruksi secara konstan dan pararel di keempatnya.

1. **Hidupkan Deals Service (Port 3001)**
   ```bash
   cd backend/services/deals-service
   npm install        # Unduh bahan Modul
   npm run dev        # Masuk mode server yang dipantau (Nodemon)
   ```

2. **Hidupkan Search Service (Port 3002)**
   ```bash
   cd backend/services/search-service
   npm install
   npm run dev
   ```

3. **Hidupkan API Gateway Utama (Port 3000)**
   ```bash
   cd backend/api-gateway
   npm install
   npm run dev
   ```

4. **Kompilasi dan Hidupkan UI Vue Frontend (Port 5173)**
   ```bash
   cd frontend
   npm install
   npm run dev       # Engine VITE akan memuat portnya
   ```

**Sebagai Pemirsa Akhir (Viewing):** Silakan navigasikan bar peramban/browser modern Anda (Google Chrome/Brave) lalu buka secara teliti tautan `http://localhost:5173/`.

---

## 8. Contoh Alur Penggunaan Aplikasi (Use Case Flow)

Berikut perwujudan konkret kronologi pengguna sukses saat sedang menelusuri penawaran aplikasi kita:
1. **Pendaratan Awal (Landing):** Pengguna menekan *Enter* masuk. Detik pertama yang dirasakan Frontend adalah memplot dan memuntahkan kisi-kisi grafis jajaran obralan diskon terbaik secara urutan teratas seketika. (Contoh: "God of War Ragnarok diskon 50%", dll).
2. **Identifikasi Terfokus (Search):** Sang pengguna memiliki memori judul permainan lamanya. Misalnya ingin segera melihat status obralan seri "Dying Light". Ia bergerak menuju kolom kotak bilah paling atas (*SearchBar*). Ia mengetik dengan santai "Dying".
3. **Penyusutan Kriteria (Fine Tuning):** Daftar "Dying Light" keluar terlalu banyak (dlc paket kosmetik baju). Dengan menu samping `FilterBar` vertikal di sisi layar, *slider knob button limitasi* ditarik turun harga tertingginya mentok berhenti di batas batas "$15", dan mengubah status pilihan *Dropdown Sorting* ke "Lowest Prices Pertama".
4. **Beraksi Konversi (Call To Action Callout):** Saat telah menyadari kehebatan harganya, dengan antuasias, ujung titik tetikus mencicipi tombol "📋 (Copy)". Link dicopy untuk disebar ke temannya via pesan WA, kemudian ia lanjut menyentuh kotak besar "Go to Steam", lalu web kita memandunya lancar membuka etalasi lapak Steam berkat manipulasi Computed Component. Sebuah alur UI/UX pembelanjaan digital tanpa hambatan tercapai dengan sempurna!

---

## 9. Konsep Desain UI/UX (Aesthetics Strategy)

**Tema Induk Utama: Pelayaran Luapan Cuan dan Rampasan Harga Bajak Laut (Sale Seas)**
* **Dominasi Warna:** Kita berlabuh teguh memilih kedalaman dasar perairan berwarna biru tinta/kelabu *Navy & Neomorphic Slate* gelap (`#0f172a`, `#1e293b`). Palet ini mensimulasikan lingkungan ruang angkasa dalam "Dark Mode" yang disukai kalangan *target market* (Gaming Profile) guna mencegah mata penggunanya mudah kelelahan.
* **Corak Aksen Ajaib:** Kami menggunakan aksenbawaan khusus Hijau Esmeralda (`#10b95c`) dengan Emas Perhiasan Harta Karun (`#ffd700`) bertaburan. Gradasi hijau menjadi sakral melambangkan penekanan uang di dompet sang pembeli selamat / uang hijau. Kuning Keemasan/Gold mensertifikasi barang tersebut mendapatkan medali kasta berlevel emas legendaris. (Penghargaan visual dari Diskon > 90%).
* **Tipografi Bersih (Typescale):** Menggunakan set susunan font `sans-serif` bertubuh moderat tegak melurus untuk merepresentasikan rasa *Hi-Tech* mekanikal, angka rentang mata uang tergambar terbaca dengan amat presis di perangkat layar sekecil perangkat genggam. Semuanya sangat ringkas diamati.
* **Tampilan Sentuhan Eksterior (Glassmorphism & Micro Animation):** Segala elemen pelat perbatasan pinggir elemen, dikerubungi pendaran cahaya (*Glow-borders*). Jika disentuh kursor di PC (*Mouse Hover*), bayangan kotak pil bayangan pendar hijau merekah, tombol bergeser menyempit (TranslateY/Timbul Tenggelam ilusi magnetik) membangkitkan selera penegasan kemewahan UI AAA berskala elit premium super-interaktif. 

---

## 10. Tantangan Teratasi & Batas Sistem Tertentu (Challenges & Limitations)

- **Keamanan Web Sekuritas Peramban Agresif (Security Policies):** Web browser modern kini gila dalam mem-blok link/tautan paksaan secara ter-redireksi akibat rentan dibajak *Malware*. Tadinya API Endpoint API Redirect CheatShark merusak integrasi peluncuran akibat memarahi header sistem peramban/Cloudflare secara mentah-mentah. Pengatasan ini telah sukses kami putar memutar dengan membangun kerangka manual/hardcode template URL pencarian di file lokal dan tidak lagi merujuk redirect API.
- **Kesemrawutan Tumpukan Aplikasi Mikro (Microservices Orchestration Tangle):** Menyita banyak resiliensi dan emosional karena harus menyala/mematikan dan mengingat status kerosotan pada empat node proses port yang saling bertumpang tindih secara mendadak semrawut selama fase masa perancangan intensif (lokal).
- **Protokol *Throttling Limiter* Pihak Ketiga (Rate Limiting):** Sisi backend kita menempuk API Gratis tak berbayar dari platform *CheapShark Mainframe*. Bila seorang peragu mengetik tombol `backspace-delete` kata-kata bertubi-tubi kilat cepat pada bar pencarian akan menghasilkan pukulan gempuran badai trafik (*D-dos-like Spike Request*) sehingga server membatasai blok IP dan sistem error menabrak tembok 429 "Too Many Requests". Untunglah, ini ditanggulangi hebat (Terapkan `debounce delays Timeout` selama 500milidetik/setengah detik pada UI *Frontend*). Sangat cerdik!

---

## 11. Potensi Peningkatan di Eksekusi Masa Depan (Future Scope/Wishlist Upgrades)

Andaikan ada investasi pengalokasian jam terbang pemrograman di ranah depan, kita memiliki peta jangkauan eksponensial dalam menyempurnakan kualitas:
1. **Praktik Pembungkusan Menggunakan Docker (Dockerization Kontainer):** Meramu kemasan wadah tumpukan keempat mesin proses/folder Microservices bersatu padu dan disuntikkan parameter `docker-compose.yml`. Anggota tim penguji (Dosen penilai universitas/Kolaborator awam) kelak kini cuma cukup mendaratkan SATU (1) baris perintah terminal saja (`docker-compose up`) merajai total segalanya—menghemat durabilitas waktu!
2. **Authentikasi Profil Member (Session Auth & Database):** Menyuntikkan sistem *Login* otorisasi (Memakai sistem serifikat *JWT Access/Firebase*) berbarengan injeksi klaster database NoSQL/Relasional. Fungsinya untuk menyuplay mekanisme penyimpanan data lokal per pengguna agar ia punya kapabilitas fitur menyimpan riwayat katalog List Keingginan Impian (*Dream Wishlist Heart icon Database*).
3. **Akurasi Integrasi Nilai Tukar Nilai Dinamis IDR Rupiah Sejati (Real Time Currency Ticker API):** Kalkukasi angka estimasi matematis Statis `1 USD ≈ (Asli Rp15850)` dalam kode kita sejauh ini hanya kalkulator koding sederhana murni aproksimasi mentah. Mendepannya, kelak bisa dirakit API Eksternal Bursa Finansial (*Ex: Fixer.io/CurrencyAPI*) guna mengaliri urat nadi komputasi pertukarantengah mata pasar agar hitungan hargarupih jauh lebih empiris absolut sempurna secara detik detak waktu.
4. **Trigger Otomatis Alarm Turun Harga (Notification Alert Email Subservice):** Terobosan fungsi untuk meredam pemantauan kebosanan *Fear Of Missing Out (FOMO)*. Menerima langganan notif otomatis, sebuah mikro-servis pengiriman Surat-E (Nodemailer webhook) mengirim pesan ke inbok handphone pengguna jika suatu permainan sasarannya jatuh terhempas nominalnya di ambang diskon luar biasa "DI BAWAH Rp 10 Ribu Rupiah... Beli Segera!"
