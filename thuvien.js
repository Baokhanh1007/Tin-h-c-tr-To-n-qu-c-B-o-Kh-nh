// ============================================================
// thuvien.js — Quản lý thư viện tài liệu PDF (Upload, xem, tìm kiếm, xoá)
// Toàn bộ dữ liệu được lưu trong trình duyệt (LocalStorage) không cần server
// ============================================================

// -------------------- KHAI BÁO HẰNG SỐ --------------------
const STORAGE_KEY  = "thuvien_documents";
const PDFJS_CDN    = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
const PDFJS_WORKER = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

// Danh sách khối lớp hợp lệ (dùng chung toàn file)
const GRADE_OPTIONS = ["Lớp 10", "Lớp 11", "Lớp 12", "Khác"];

// Màu badge tương ứng cho từng khối lớp
const GRADE_COLORS = {
  "Lớp 10": "bg-info",
  "Lớp 11": "bg-success",
  "Lớp 12": "bg-danger",
  "Khác":   "bg-secondary",
};

// Dữ liệu tài liệu mẫu (tĩnh) — thêm trường `grade`
const staticDocs = [
  { id:"s1", name:"Đề thi THPT",       subject:"Tổng hợp",  grade:"Lớp 12", desc:"Kho đề thi thử THPT Quốc gia các năm",   icon:"bi-file-earmark-text", color:"text-primary" },
  { id:"s2", name:"Sách bài tập",      subject:"Tổng hợp",  grade:"Khác",   desc:"Tài liệu học tập và bài tập nâng cao",    icon:"bi-book",              color:"text-success" },
  { id:"s3", name:"Tài liệu mới nhất", subject:"Tổng hợp",  grade:"Khác",   desc:"Các bài giảng, đề thi mới nhất",          icon:"bi-lightning-charge",  color:"text-danger"  },
  { id:"s4", name:"Toán học",          subject:"Toán",      grade:"Lớp 12", desc:"Tài liệu và đề thi môn Toán",             icon:"bi-calculator",        color:"text-warning" },
  { id:"s5", name:"Tiếng Anh",         subject:"Tiếng Anh", grade:"Lớp 11", desc:"Ngữ pháp, đề thi và tài liệu luyện thi", icon:"bi-translate",         color:"text-info"    },
  { id:"s6", name:"Vật lý",            subject:"Vật lý",    grade:"Lớp 10", desc:"Tài liệu, bài tập và đề thi môn Vật lý", icon:"bi-lightning-charge",  color:"text-warning" },
];

// ---------- CÁC HÀM LÀM VIỆC VỚI LOCALSTORAGE ----------
function getDocs() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch { return []; }
}

function saveDocs(docs) {
  const meta = docs.map(({ fileData, ...rest }) => rest);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(meta));
  } catch (e) {
    console.error("localStorage full (metadata):", e);
    throw new Error("Bộ nhớ đầy! Hãy xoá bớt tài liệu cũ.");
  }
}

function saveFileData(id, data) {
  try {
    localStorage.setItem("file_" + id, data);
  } catch (e) {
    console.error("localStorage full (fileData):", e);
    throw new Error("File quá lớn, không đủ bộ nhớ trình duyệt!");
  }
}

function getFileData(id) { return localStorage.getItem("file_" + id) || null; }
function removeFileData(id) { localStorage.removeItem("file_" + id); }

// ---------- TẢI THƯ VIỆN pdf.js ----------
function loadPdfJs() {
  return new Promise(resolve => {
    if (window.pdfjsLib) return resolve(window.pdfjsLib);
    const s = document.createElement("script");
    s.src = PDFJS_CDN;
    s.onload = () => {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER;
      resolve(window.pdfjsLib);
    };
    document.head.appendChild(s);
  });
}

// ---------- TRÍCH XUẤT ẢNH BÌA + TÓM TẮT ----------
async function extractCoverAndSummary(arrayBuffer) {
  const lib  = await loadPdfJs();
  const pdf  = await lib.getDocument({ data: arrayBuffer }).promise;
  const page = await pdf.getPage(1);

  const vp     = page.getViewport({ scale: 1.5 });
  const canvas = document.createElement("canvas");
  canvas.width  = vp.width;
  canvas.height = vp.height;
  await page.render({ canvasContext: canvas.getContext("2d"), viewport: vp }).promise;
  const cover = canvas.toDataURL("image/jpeg", 0.75);

  const txt     = await page.getTextContent();
  const raw     = txt.items.map(i => i.str).join(" ").replace(/\s+/g, " ").trim();
  const summary = raw.length > 350 ? raw.slice(0, 350) + "…" : raw || "Không trích được nội dung trang đầu.";

  return { cover, summary, totalPages: pdf.numPages };
}

// ---------- XỬ LÝ UPLOAD FILE PDF ----------
async function handleUpload() {
  const fileEl    = document.getElementById("fileInput");
  const subjectEl = document.getElementById("subjectInput");
  const titleEl   = document.getElementById("titleInput");
  const gradeEl   = document.getElementById("gradeInput");   // ← select khối lớp
  const btn       = document.getElementById("uploadBtn");

  const file    = fileEl?.files[0];
  const subject = subjectEl?.value.trim();
  const title   = titleEl?.value.trim() || file?.name?.replace(/\.pdf$/i, "") || "Tài liệu";
  const grade   = gradeEl?.value || "Khác";                  // ← lấy giá trị khối lớp

  if (!file)    return showToast("Vui lòng chọn file PDF!", "warning");
  if (!subject) return showToast("Vui lòng nhập môn học!", "warning");
  if (!file.name.toLowerCase().endsWith(".pdf")) return showToast("Chỉ hỗ trợ file PDF!", "warning");
  if (file.size > 20 * 1024 * 1024) return showToast("File quá lớn (tối đa 20MB)!", "warning");

  btn.disabled = true;
  btn.innerHTML = `<span class="spinner-border spinner-border-sm me-1"></span>Đang xử lý…`;

  try {
    const buf = await file.arrayBuffer();
    const { cover, summary, totalPages } = await extractCoverAndSummary(buf);

    const fileData = await new Promise((res, rej) => {
      const r = new FileReader(); r.onload = e => res(e.target.result); r.onerror = rej;
      r.readAsDataURL(file);
    });

    const id   = "doc-" + Date.now();
    const docs = getDocs();
    docs.unshift({
      id,
      name: title,
      subject,
      grade,                                      // ← lưu khối lớp
      cover,
      summary,
      totalPages,
      date: new Date().toLocaleDateString("vi-VN")
    });

    saveFileData(id, fileData);
    saveDocs(docs);
    renderUploadedDocs();
    showToast("Tải lên thành công! 🎉", "success");

    fileEl.value = ""; subjectEl.value = ""; titleEl.value = "";
    if (gradeEl) gradeEl.value = "Lớp 12";       // reset về giá trị mặc định
    bootstrap.Modal.getInstance(document.getElementById("uploadModal"))?.hide();
  } catch (err) {
    console.error(err);
    showToast("Lỗi xử lý PDF, thử lại!", "danger");
  } finally {
    btn.disabled = false;
    btn.innerHTML = `<i class="bi bi-upload me-1"></i>Tải lên`;
  }
}

// ---------- RENDER DANH SÁCH TÀI LIỆU ĐÃ UPLOAD ----------
// filter    : từ khoá tìm kiếm text
// gradeFilter: khối lớp cần lọc ("" = tất cả)
function renderUploadedDocs(filter = "", gradeFilter = "") {
  const list    = document.getElementById("uploadedList");
  const section = document.getElementById("uploadedSection");
  if (!list || !section) return;

  const docs = getDocs();
  const kw   = filter.toLowerCase().trim();
  const gf   = gradeFilter.trim();

  // Lọc theo text VÀ khối lớp
  const filtered = docs.filter(d => {
    const matchText  = !kw || d.name.toLowerCase().includes(kw) || d.subject.toLowerCase().includes(kw);
    const matchGrade = !gf || d.grade === gf;
    return matchText && matchGrade;
  });

  section.style.display = docs.length === 0 ? "none" : "block";

  if (filtered.length === 0) {
    list.innerHTML = `<div class="col-12 text-center text-muted py-3">Không tìm thấy tài liệu phù hợp.</div>`;
    return;
  }

  list.innerHTML = filtered.map(doc => {
    const gradeBadgeClass = GRADE_COLORS[doc.grade] || "bg-secondary";
    const gradeBadge = doc.grade
      ? `<span class="badge ${gradeBadgeClass} ms-1">${escHtml(doc.grade)}</span>`
      : "";
    return `
    <div class="col-lg-3 col-md-4 col-sm-6">
      <div class="doc-card" onclick="window.location.href='detail.html?id=${doc.id}'">
        <div class="doc-cover-wrap">
          <img src="${doc.cover}" alt="${escHtml(doc.name)}" class="doc-cover"/>
          <div class="doc-overlay"><i class="bi bi-eye-fill fs-3"></i></div>
        </div>
        <div class="doc-info">
          <div class="mb-1">
            <span class="badge bg-primary">${escHtml(doc.subject)}</span>${gradeBadge}
          </div>
          <h6 class="doc-title">${escHtml(doc.name)}</h6>
          <small class="text-muted">${doc.totalPages} trang · ${doc.date}</small>
        </div>
        <button class="doc-delete" onclick="event.stopPropagation();deleteDoc('${doc.id}')" title="Xoá">
          <i class="bi bi-trash"></i>
        </button>
      </div>
    </div>`;
  }).join("");
}

// ---------- XOÁ TÀI LIỆU ----------
function deleteDoc(id) {
  if (!confirm("Xoá tài liệu này?")) return;
  saveDocs(getDocs().filter(d => d.id !== id));
  removeFileData(id);
  renderUploadedDocs(
    document.getElementById("searchInput")?.value || "",
    getCurrentGradeFilter()
  );
  showToast("Đã xoá tài liệu.", "danger");
}

// ---------- LẤY GIÁ TRỊ BỘ LỌC KHỐI LỚP ĐANG CHỌN ----------
// Đọc từ các nút filter-grade đang active (nếu có trong HTML)
function getCurrentGradeFilter() {
  const active = document.querySelector(".grade-filter-btn.active");
  return active ? active.dataset.grade : "";
}

// ---------- TÌM KIẾM ----------
function handleSearch() {
  const kw = (document.getElementById("searchInput")?.value || "").toLowerCase().trim();
  const gf = getCurrentGradeFilter();

  // Lọc tài liệu tĩnh
  let vis = 0;
  document.querySelectorAll("#staticSection .col-md-4").forEach((card, i) => {
    const d = staticDocs[i];
    const matchText  = !kw || [d.name, d.subject, d.desc].some(t => t.toLowerCase().includes(kw));
    const matchGrade = !gf || d.grade === gf;
    const match = matchText && matchGrade;
    card.style.display = match ? "" : "none";
    if (match) vis++;
  });
  const noSt = document.getElementById("noStaticResult");
  if (noSt) noSt.style.display = vis === 0 ? "block" : "none";

  // Lọc tài liệu upload
  renderUploadedDocs(kw, gf);
}

// ---------- XỬ LÝ CÁC NÚT LỌC KHỐI LỚP ----------
// Gắn sự kiện cho các nút .grade-filter-btn trong HTML
function initGradeFilters() {
  document.querySelectorAll(".grade-filter-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      // Nếu đang active thì bỏ chọn (toggle), ngược lại chọn nút này
      const isActive = btn.classList.contains("active");
      document.querySelectorAll(".grade-filter-btn").forEach(b => b.classList.remove("active"));
      if (!isActive) btn.classList.add("active");
      handleSearch();
    });
  });
}

// ---------- TẠO DROPDOWN KHỐI LỚP TRONG MODAL UPLOAD ----------
// Gọi hàm này để tự động tạo thẻ <select id="gradeInput"> nếu chưa có trong HTML
// (Nếu HTML đã có sẵn <select id="gradeInput"> thì không cần gọi hàm này)
function ensureGradeSelect() {
  if (document.getElementById("gradeInput")) return; // Đã có, bỏ qua

  // Tìm vị trí chèn: ngay sau subjectInput (hoặc trước uploadBtn)
  const ref = document.getElementById("subjectInput")?.closest(".mb-3") ||
              document.getElementById("uploadBtn")?.closest(".mb-3");
  if (!ref) return;

  const wrapper = document.createElement("div");
  wrapper.className = "mb-3";
  wrapper.innerHTML = `
    <label for="gradeInput" class="form-label">Khối lớp</label>
    <select id="gradeInput" class="form-select">
      ${GRADE_OPTIONS.map(g => `<option value="${g}"${g === "Lớp 12" ? " selected" : ""}>${g}</option>`).join("")}
    </select>`;
  ref.insertAdjacentElement("afterend", wrapper);
}

// ---------- HIỂN THỊ THÔNG BÁO TOAST ----------
function showToast(msg, type = "success") {
  const c = document.getElementById("toastContainer");
  if (!c) return;
  const id  = "t" + Date.now();
  const cls = { success:"bg-success", warning:"bg-warning text-dark", danger:"bg-danger" }[type] || "bg-secondary";
  c.insertAdjacentHTML("beforeend", `
    <div id="${id}" class="toast align-items-center text-white ${cls} border-0 show">
      <div class="d-flex">
        <div class="toast-body">${msg}</div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
      </div>
    </div>`);
  setTimeout(() => document.getElementById(id)?.remove(), 3500);
}

function escHtml(s = "") {
  return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}

// ---------- KHỞI TẠO TRANG ----------
document.addEventListener("DOMContentLoaded", () => {
  // Tự động thêm select khối lớp vào modal upload (nếu HTML chưa có)
  ensureGradeSelect();

  // Gắn sự kiện tìm kiếm
  document.getElementById("searchBtn")?.addEventListener("click", handleSearch);
  document.getElementById("searchInput")?.addEventListener("keydown", e => { if (e.key === "Enter") handleSearch(); });
  document.getElementById("searchInput")?.addEventListener("input", e => { if (!e.target.value) handleSearch(); });

  // Gắn sự kiện upload
  document.getElementById("uploadBtn")?.addEventListener("click", handleUpload);

  // Khởi tạo các nút lọc khối lớp
  initGradeFilters();

  // Render danh sách ban đầu
  renderUploadedDocs();
});