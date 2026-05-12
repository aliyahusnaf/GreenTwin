Berikut adalah file `plan.md` yang dirancang sebagai panduan komprehensif untuk pengembangan AI pada proyek **Urban Energy Digital Twin**. Dokumen ini mengintegrasikan visi produk dengan landasan matematis dari riset Profesor Duong Nguyen Vu.

---

# 📝 AI Development Plan: Urban Energy Digital Twin (SEA Edition)

## 1. 🏗️ Tech Stack Lengkap

Sistem ini menggunakan arsitektur hybrid yang menggabungkan visualisasi 3D real-time dengan mesin kecerdasan buatan multimodal.

| Komponen | Teknologi | Kegunaan |
| --- | --- | --- |
| **3D Engine** | Three.js / React-Three-Fiber (R3F) | Rendering isometrik kota dan heatmap surya. |
| **AI Orchestrator** | LangChain / Indexing Multimodal | Menghubungkan LLM dengan database eksternal (RAG). |
| **LLM Core** | GPT-4o atau Claude 3.5 Sonnet | Pemrosesan bahasa alami (Indonesia, Vietnam, Thai, dll). |
| **Vector Database** | Pinecone / Weaviate | Menyimpan dokumen regulasi (Decree 58, Permen ESDM) untuk RAG. |
| **Backend API** | FastAPI (Python) | Komputasi rumus antrean dan optimisasi rute. |
| **Data Sources** | NASA POWER API, OSM, Sensor AQI | Data solar irradiance, geometri gedung, dan kualitas udara. |

---

## 2. 🔢 Rumus & Logika Matematis Utama

AI harus mengimplementasikan rumus-rumus berikut untuk memastikan output yang akurat secara ilmiah:

### A. Estimasi Antrean SPKLU (Model M/M/s)

Digunakan untuk memprediksi waktu tunggu di stasiun pengisian secara real-time.

* **Probabilitas Sistem Kosong ($P_0$):**

$$P_0 = \left[ \sum_{n=0}^{s-1} \frac{(\lambda/\mu)^n}{n!} + \frac{(\lambda/\mu)^s}{s!(1-\rho)} \right]^{-1}$$


* **Kondisi Stabilitas:** $\rho = \frac{\lambda}{s\mu} < 1$
* *Variabel:* $\lambda$ = Laju kedatangan kendaraan; $\mu$ = Laju layanan (tergantung kW charger); $s$ = Jumlah unit charger.

### B. Slider "Uang vs Alam" (Skalarisasi Multi-Objektif)

Logika untuk menentukan rute atau SPKLU terbaik berdasarkan preferensi user.

* **Fungsi Tujuan:**

$$\min \sum ( \text{Biaya Listrik} + \lambda \times \text{Intensitas Karbon} )$$


* *Logika:* Jika slider ke arah "Alam", $\lambda$ diperbesar, sehingga AI akan memilih SPKLU dengan bauran energi surya tertinggi meskipun harganya sedikit lebih mahal.

### C. Analisis Solar Rooftop (Ray-Casting)

AI menghitung shading loss dengan menembakkan "sinar" virtual dari posisi matahari ke atap gedung pada model 3D untuk menentukan area merah (potensi tinggi) atau biru (rendah).

---

## 3. 🛠️ Penjelasan Fitur & Mekanisme AI

### Fitur 1: Solar Rooftop Heatmap

* **Mekanisme AI:** Multimodal RAG mengambil data solar global (NASA) dan digabungkan dengan konteks regulasi lokal (misal: kuota PLN di Indonesia).
* **Output:** Visualisasi warna pada atap 3D dan kalkulasi otomatis *payback period* dalam mata uang lokal.

### Fitur 2: EV & Emisi (Smart Charging)

* **Mekanisme AI:** Menggunakan **Enhanced Gray Wolf Algorithm (EGWA)** untuk perutean. AI mendeteksi SPKLU mana yang antreannya pendek (via rumus M/M/s) dan memiliki intensitas karbon rendah.
* **Analogi:** Menerjemahkan penghematan CO2 ke bahasa sehari-hari (misal: "Setara dengan menanam 5 pohon").

### Fitit 3: Chat AI Kota (Urban Health)

* **Mekanisme AI:** Mengintegrasikan sensor AQI real-time. AI tidak hanya memberi angka, tapi memberikan rekomendasi kesehatan via LLM.
* **Contoh:** "Udara di Jakarta Selatan sedang tidak sehat, sebaiknya hindari lari pagi di area Kuningan hari ini."

### Fitur 4: Policy Simulator

* **Mekanisme AI:** **Ontology Layer** menggunakan SWRL (Semantic Web Rule Language) untuk memastikan simulasi kebijakan (misal: jalur bus listrik baru) tidak melanggar batasan fisik atau hukum yang berlaku di negara tersebut.

---

## 4. 🎯 Expected Outcomes (Target Output)

AI diharapkan dapat bekerja dengan standar berikut:

1. **Explainable AI (XAI):** Saat AI menyarankan rute yang lebih mahal, ia harus bisa menjelaskan: *"Saya memilih Stasiun B karena 90% energinya sedang disuplai oleh tenaga surya lokal saat ini."*
2. **Kepatuhan Regulasi:** Di Indonesia, AI harus menyesuaikan hitungan ekonomi karena tidak adanya *net-metering* (Permen ESDM 2/2024), sedangkan di Vietnam AI akan lebih agresif menyarankan penjualan surplus listrik (Decree 58/2025).
3. **Akurasi Visual:** Sinkronisasi antara jawaban teks dengan highlight area pada peta 3D (misal: saat bertanya tentang polusi, zona merah langsung menyala di model kota).
4. **Efisiensi Sistem:** Pengurangan biaya komprehensif (waktu + uang + emisi) minimal sebesar 12% dibandingkan navigasi konvensional.

---

**Panduan Kerja AI:**

> *Gunakan data sensor real-time sebagai kebenaran utama (Ground Truth), gunakan RAG untuk konteks regulasi, dan gunakan Three.js sebagai kanvas komunikasi spasial.*