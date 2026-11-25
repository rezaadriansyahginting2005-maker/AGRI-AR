// AgriAR — katalog tepat 5 alat. File GLB berada di assets/models/.
const tools = [
  { code:"CANGKUL001", name:"Cangkul", emoji:"⛏️", model:"assets/models/cangkul.glb", func:"Menggemburkan tanah, membuat bedengan, dan membersihkan gulma.", usage:"Pegang gagang dengan kuat dan ayunkan mata cangkul secara terkontrol ke tanah." },
  { code:"ARIT002", name:"Arit", emoji:"🌾", model:"assets/models/arit.glb", func:"Memotong rumput atau tanaman berbatang kecil.", usage:"Pegang gagang dengan mantap, jaga jarak dari orang lain, dan arahkan mata arit menjauh dari tubuh." },
  { code:"SEKOP003", name:"Sekop", emoji:"🥄", model:"assets/models/sekop.glb", func:"Menggali, mengangkat, dan memindahkan tanah, pasir, kompos, atau bahan pertanian lainnya.", usage:"Pegang gagang dengan kedua tangan bila diperlukan. Tancapkan mata sekop ke material, lalu angkat dengan posisi tubuh stabil." },
  { code:"GARU004", name:"Garu", emoji:"🪴", model:"assets/models/garu.glb", func:"Meratakan permukaan tanah, memecah gumpalan tanah, dan mengumpulkan sisa tanaman atau gulma.", usage:"Pegang gagang dengan kuat lalu tarik atau dorong gigi garu secara terkontrol pada permukaan tanah." },
  { code:"KNAPSACK005", name:"Knapsack Sprayer", emoji:"💧", model:"assets/models/sprayer.glb", func:"Menyemprotkan air atau larutan pertanian ke tanaman menggunakan tangki yang dibawa di punggung.", usage:"Periksa tangki, selang, pompa, dan nozzle sebelum digunakan. Atur tekanan semprotan dan gunakan alat pelindung diri sesuai bahan yang disemprotkan." }
];
const $ = id => document.getElementById(id);
let scanner = null, isScanning = false;

function showTool(code) {
  const normalized = String(code || "").trim().toUpperCase();
  const item = tools.find(tool => tool.code === normalized);
  if (!item) {
    $("scan-message").textContent = `Kode "${code}" belum terdaftar. Gunakan salah satu kode QR AgriAR pada katalog.`;
    return;
  }
  $("scan-message").textContent = "";
  $("empty-state").hidden = true;
  $("tool-details").hidden = false;
  $("result-tag").textContent = "Alat ditemukan";
  $("tool-name").textContent = item.name;
  $("tool-code").textContent = item.code;
  $("tool-function").textContent = item.func;
  $("tool-usage").textContent = item.usage;
  const viewer = $("model-viewer");
  $("model-warning").textContent = "Memuat model 3D…";
  viewer.removeAttribute("src");
  viewer.setAttribute("alt", `Model 3D ${item.name}`);
  viewer.setAttribute("src", new URL(item.model, document.baseURI).href);
  $("result-panel").scrollIntoView({ behavior:"smooth", block:"start" });
}

function renderCatalog() {
  $("catalog-grid").innerHTML = tools.map(item => `
    <article class="catalog-card">
      <span class="catalog-icon">${item.emoji}</span>
      <div><h3>${item.name}</h3><p>${item.code}</p></div>
      <button type="button" data-code="${item.code}">Lihat 3D</button>
    </article>`).join("");
  $("catalog-grid").addEventListener("click", event => {
    const button = event.target.closest("button[data-code]");
    if (button) showTool(button.dataset.code);
  });
}

async function startScanner() {
  if (!window.Html5Qrcode) {
    $("scan-message").textContent = "Pemindai belum termuat. Periksa koneksi internet dan muat ulang halaman.";
    return;
  }
  if (isScanning) return;
  scanner = new Html5Qrcode("reader");
  try {
    await scanner.start({ facingMode:"environment" }, { fps:10, qrbox:{ width:240, height:200 }, formatsToSupport:[Html5QrcodeSupportedFormats.QR_CODE] }, async decodedText => {
      $("manual-code").value = decodedText.trim();
      showTool(decodedText);
      await stopScanner();
    }, () => {});
    isScanning = true;
    $("scan-status").textContent = "Kamera aktif";
    $("start-scan").disabled = true;
    $("stop-scan").disabled = false;
  } catch (error) {
    $("scan-message").textContent = "Kamera gagal dibuka. Izinkan akses kamera dan jalankan website melalui HTTPS atau localhost.";
    $("scan-status").textContent = "Kamera tidak aktif";
    try { await scanner.clear(); } catch (_) {}
    scanner = null;
  }
}
async function stopScanner() {
  if (scanner && isScanning) { try { await scanner.stop(); await scanner.clear(); } catch (_) {} }
  isScanning = false;
  $("scan-status").textContent = "Kamera belum aktif";
  $("start-scan").disabled = false;
  $("stop-scan").disabled = true;
}

document.addEventListener("DOMContentLoaded", () => {
  renderCatalog();
  const viewer = $("model-viewer");
  viewer.addEventListener("load", () => { $("model-warning").textContent = "Model 3D berhasil dimuat. Geser untuk memutar dan cubit untuk memperbesar."; });
  viewer.addEventListener("error", () => { $("model-warning").textContent = "Model gagal dimuat. Periksa file GLB, nama file, dan jalur assets/models."; });
  $("start-scan").addEventListener("click", startScanner);
  $("stop-scan").addEventListener("click", stopScanner);
  $("find-code").addEventListener("click", () => showTool($("manual-code").value));
  $("manual-code").addEventListener("keydown", event => { if (event.key === "Enter") showTool($("manual-code").value); });
  const initialCode = new URLSearchParams(location.search).get("tool");
  if (initialCode) showTool(initialCode);
});
