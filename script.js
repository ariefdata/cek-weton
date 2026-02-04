const inputTanggal = document.getElementById("tanggal");
const tombol = document.getElementById("hitung");
const hasilCard = document.getElementById("hasil");
const themeButtons = document.querySelectorAll(".theme-btn");

themeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const theme = button.dataset.theme;
    document.body.dataset.theme = theme;

    themeButtons.forEach((btn) => btn.classList.remove("is-active"));
    button.classList.add("is-active");
  });
});

tombol.addEventListener("click", () => {
  const value = inputTanggal.value;

  if (!value) {
    console.log("Tanggal belum dipilih");
    return;
  }

  // Parsing aman: paksa jam 12 siang
  const tanggal = new Date(value + "T12:00:00");

  console.log("Input string :", value);
  console.log("Date object  :", tanggal);
  console.log("Tahun        :", tanggal.getFullYear());
  console.log("Bulan        :", tanggal.getMonth() + 1);
  console.log("Tanggal      :", tanggal.getDate());
  console.log("Hari (0-6)   :", tanggal.getDay());
});

// === ACUAN HISTORIS (FINAL) ===
const ACUAN = {
  date: new Date("1970-01-01T12:00:00"),
  hari: 4, // Kamis
  pasaran: 3, // Wage
};

// Wuku berganti setiap hari Minggu.
// Wuku Tolu berlaku 28 Des 1969 s.d. 3 Jan 1970.
const WUKU_ACUAN = {
  date: new Date("1969-12-28T12:00:00"), // Minggu
  wuku: 4, // Tolu
};

const MS_PER_DAY = 24 * 60 * 60 * 1000;

const HARI = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
const HARI_NEPTU = [5, 4, 3, 7, 8, 6, 9];

const PASARAN = ["Legi", "Pahing", "Pon", "Wage", "Kliwon"];
const PASARAN_NEPTU = [5, 9, 7, 4, 8];

const WUKU = [
  "Sinta",
  "Landep",
  "Wukir",
  "Kurantil",
  "Tolu",
  "Gumbreg",
  "Warigalit",
  "Warigagung",
  "Julungwangi",
  "Sungsang",
  "Galungan",
  "Kuningan",
  "Langkir",
  "Mandasiya",
  "Julungpujut",
  "Pahang",
  "Kuruwelut",
  "Marakeh",
  "Tambir",
  "Medangkungan",
  "Maktal",
  "Wuye",
  "Manahil",
  "Prangbakat",
  "Bala",
  "Wugu",
  "Wayang",
  "Kulawu",
  "Dukut",
  "Watugunung",
];

const hasilHari = document.getElementById("hasil-hari");
const hasilPasaran = document.getElementById("hasil-pasaran");
const hasilWuku = document.getElementById("hasil-wuku");
const hasilNeptu = document.getElementById("hasil-neptu");
const descHari = document.getElementById("desc-hari");
const descPasaran = document.getElementById("desc-pasaran");
const descWuku = document.getElementById("desc-wuku");
const descNeptu = document.getElementById("desc-neptu");
const interpretasiSection = document.getElementById("interpretasi");
const interpretHint = interpretasiSection.querySelector(".hint");
const ringkas = document.getElementById("ringkas");
const hariIniTanggal = document.querySelector(".tanggal-hari-ini");
const hariIniHari = document.getElementById("hari-ini-hari");
const hariIniPasaran = document.getElementById("hari-ini-pasaran");
const hariIniWuku = document.getElementById("hari-ini-wuku");
const hariIniNeptu = document.getElementById("hari-ini-neptu");
const hariIniRingkas = document.getElementById("hari-ini-ringkas");

const mod = (value, base) => ((value % base) + base) % base;

let interpretasiData = null;
let interpretasiLoading = true;
let interpretasiError = false;

fetch("./data/interpretasi.json")
  .then((response) => {
    if (!response.ok) throw new Error("Gagal memuat interpretasi");
    return response.json();
  })
  .then((data) => {
    interpretasiData = data;
    interpretasiLoading = false;
    interpretHint.textContent = "Pilih tanggal untuk melihat penafsiran.";
    renderHariIni();
  })
  .catch((error) => {
    console.error(error);
    interpretasiLoading = false;
    interpretasiError = true;
    interpretHint.textContent =
      "Interpretasi belum tersedia. Coba muat ulang halaman.";
    renderHariIni();
  });

const formatTanggalIndonesia = (date) =>
  date.toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

const hitungWeton = (targetDate) => {
  const selisihMs = targetDate - ACUAN.date;
  const selisihHari = Math.floor(selisihMs / MS_PER_DAY);
  const hariIndex = mod(ACUAN.hari + selisihHari, 7);
  const pasaranIndex = mod(ACUAN.pasaran + selisihHari, 5);

  const wukuSelisihMs = targetDate - WUKU_ACUAN.date;
  const wukuSelisihHari = Math.floor(wukuSelisihMs / MS_PER_DAY);
  const wukuShift = Math.floor(wukuSelisihHari / 7);
  const wukuIndex = mod(WUKU_ACUAN.wuku + wukuShift, 30);

  const neptu = HARI_NEPTU[hariIndex] + PASARAN_NEPTU[pasaranIndex];

  return {
    hariIndex,
    pasaranIndex,
    wukuIndex,
    neptu,
  };
};

const renderInterpretasi = (hariIndex, pasaranIndex, wukuIndex, neptu) => {
  if (interpretasiLoading) {
    interpretHint.textContent = "Memuat interpretasi...";
  }

  if (interpretasiData) {
    const hariKey = HARI[hariIndex];
    const pasaranKey = PASARAN[pasaranIndex];
    const wukuKey = WUKU[wukuIndex];
    const neptuKey = String(neptu);

    const hariDesc = interpretasiData.hari?.[hariKey] || "-";
    const pasaranDesc = interpretasiData.pasaran?.[pasaranKey] || "-";
    const wukuDesc = interpretasiData.wuku?.[wukuKey] || "-";
    const neptuDesc = interpretasiData.neptu?.[neptuKey] || "-";

    descHari.textContent = hariDesc;
    descPasaran.textContent = pasaranDesc;
    descWuku.textContent = wukuDesc;
    descNeptu.textContent = neptuDesc;
    interpretHint.style.display = "none";

    ringkas.textContent = `${hariDesc} ${pasaranDesc} ${wukuDesc} Neptu ${neptu}: ${neptuDesc}`;
    ringkas.classList.add("ringkas-ready");
  } else {
    descHari.textContent = "-";
    descPasaran.textContent = "-";
    descWuku.textContent = "-";
    descNeptu.textContent = "-";

    if (!interpretasiError) {
      interpretHint.style.display = "block";
    }
    ringkas.textContent =
      "Ringkasan belum tersedia karena interpretasi belum dimuat.";
    ringkas.classList.remove("ringkas-ready");
  }
};

const renderHariIni = () => {
  const now = new Date();
  const today = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    12,
    0,
    0
  );
  const { hariIndex, pasaranIndex, wukuIndex, neptu } = hitungWeton(today);

  hariIniTanggal.textContent = formatTanggalIndonesia(today);
  hariIniHari.textContent = HARI[hariIndex];
  hariIniPasaran.textContent = PASARAN[pasaranIndex];
  hariIniWuku.textContent = WUKU[wukuIndex];
  hariIniNeptu.textContent = neptu;

  if (interpretasiData) {
    const hariKey = HARI[hariIndex];
    const pasaranKey = PASARAN[pasaranIndex];
    const wukuKey = WUKU[wukuIndex];
    const neptuKey = String(neptu);

    const hariDesc = interpretasiData.hari?.[hariKey] || "-";
    const pasaranDesc = interpretasiData.pasaran?.[pasaranKey] || "-";
    const wukuDesc = interpretasiData.wuku?.[wukuKey] || "-";
    const neptuDesc = interpretasiData.neptu?.[neptuKey] || "-";

    hariIniRingkas.textContent = `${hariDesc} ${pasaranDesc} ${wukuDesc} Neptu ${neptu}: ${neptuDesc}`;
    hariIniRingkas.classList.add("ringkas-ready");
  } else if (interpretasiLoading) {
    hariIniRingkas.textContent = "Memuat interpretasi...";
  } else {
    hariIniRingkas.textContent =
      "Ringkasan hari ini belum tersedia karena interpretasi belum dimuat.";
    hariIniRingkas.classList.remove("ringkas-ready");
  }
};

tombol.addEventListener("click", () => {
  const value = inputTanggal.value;
  if (!value) return;

  const targetDate = new Date(value + "T12:00:00");

  const { hariIndex, pasaranIndex, wukuIndex, neptu } =
    hitungWeton(targetDate);

  hasilHari.textContent = HARI[hariIndex];
  hasilPasaran.textContent = PASARAN[pasaranIndex];
  hasilWuku.textContent = WUKU[wukuIndex];
  hasilNeptu.textContent = neptu;

  renderInterpretasi(hariIndex, pasaranIndex, wukuIndex, neptu);

  // Trigger reveal animation
  hasilCard.classList.remove("reveal");
  void hasilCard.offsetWidth;
  hasilCard.classList.add("reveal");
});

renderHariIni();
