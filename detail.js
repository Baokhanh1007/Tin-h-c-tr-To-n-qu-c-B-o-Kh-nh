// ============================================================
// detail.js — Trang chi tiết tài liệu PDF (hiển thị thông tin, đọc, tải về)
// ============================================================

// Key lưu metadata (giống file thuvien.js)
const STORAGE_KEY = "thuvien_documents";

// ---------- HÀM LẤY DỮ LIỆU TỪ LOCALSTORAGE ----------
// Lấy danh sách metadata (thông tin tài liệu)
function getDocs() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch { return []; }
}

// Lấy nội dung file PDF (base64) đã lưu riêng với key "file_<id>"
function getFileData(id) {
  return localStorage.getItem("file_" + id) || null;
}

// ---------- LẤY ID TỪ URL ----------
// URL có dạng: detail.html?id=doc-123456
// Hàm này đọc tham số "id" từ query string
function getIdFromUrl() {
  return new URLSearchParams(window.location.search).get("id");
}

// ---------- CHUYỂN TAB (XEM PDF / XEM ẢNH BÌA) ----------
// Khi người dùng click vào tab "Xem PDF" hoặc "Xem bìa", hàm này được gọi
// tab: 'iframe' hoặc 'cover'
// btnEl: phần tử nút được click (để thêm class active)
function switchTab(tab, btnEl) {
  // Bỏ active tất cả các tab
  document.querySelectorAll("#viewerTabs .nav-link").forEach(b => b.classList.remove("active"));
  // Thêm active cho tab vừa click
  btnEl.classList.add("active");

  // Hiển thị nội dung tương ứng: khối iframe (chứa PDF) hoặc khối ảnh bìa
  document.getElementById("tabIframe").style.display = tab === "iframe" ? "block" : "none";
  document.getElementById("tabCover").style.display  = tab === "cover"  ? "block" : "none";
}

// ---------- TÍNH ĐIỂM LIÊN QUAN GIỮA HAI TÀI LIỆU ----------
// Dùng để đề xuất các tài liệu tương tự (dựa trên môn học và từ khoá trong tên)
// doc: tài liệu đang xét (tài liệu khác)
// current: tài liệu hiện tại (đang xem)
function relevanceScore(doc, current) {
  let score = 0;
  // Nếu cùng môn học: cộng 3 điểm
  if (doc.subject === current.subject) score += 3;

  // Tách tên tài liệu hiện tại thành các từ (loại bỏ từ ngắn <=2 ký tự)
  const words = current.name.toLowerCase().split(/\s+/).filter(w => w.length > 2);
  // Mỗi từ xuất hiện trong tên của tài liệu khác thì cộng 1 điểm
  words.forEach(w => {
    if (doc.name.toLowerCase().includes(w)) score += 1;
  });
  return score;
}

// ---------- RENDER DANH SÁCH TÀI LIỆU LIÊN QUAN ----------
// current: tài liệu hiện tại
// allDocs: tất cả tài liệu trong localStorage
function renderRelated(current, allDocs) {
  // Lọc các tài liệu khác (khác id), tính điểm, lọc chỉ lấy điểm >0, sắp xếp giảm dần, lấy tối đa 4 cái
  const others = allDocs
    .filter(d => d.id !== current.id)               // bỏ chính nó
    .map(d => ({ ...d, _score: relevanceScore(d, current) })) // thêm điểm tạm thời
    .filter(d => d._score > 0)                       // chỉ giữ lại có liên quan
    .sort((a, b) => b._score - a._score)             // sắp xếp điểm cao nhất lên đầu
    .slice(0, 4);                                     // lấy tối đa 4

  const section = document.getElementById("relatedSection");
  const list    = document.getElementById("relatedList");

  // Nếu không có tài liệu liên quan thì ẩn cả section
  if (!others.length) { section.style.display = "none"; return; }

  // Hiện section
  section.style.display = "block";

  // Tạo HTML cho từng thẻ liên quan
  list.innerHTML = others.map(doc => `
    <div class="col-6 col-md-3">
      <div class="related-card" onclick="window.location.href='detail.html?id=${doc.id}'">
        <img src="${doc.cover}" alt="${escHtml(doc.name)}" class="related-cover"/>
        <div class="p-2">
          <span class="badge bg-secondary mb-1" style="font-size:.7rem;">${escHtml(doc.subject)}</span>
          <p class="related-title mb-0">${escHtml(doc.name)}</p>
          <small class="text-muted">${doc.totalPages} trang</small>
        </div>
      </div>
    </div>`).join("");
}

// ---------- HÀM ESCAPE HTML (CHỐNG XSS) ----------
function escHtml(s = "") {
  return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}

// ---------- KHỞI TẠO TRANG ----------
document.addEventListener("DOMContentLoaded", () => {
  // Lấy id từ URL
  const id   = getIdFromUrl();
  // Lấy toàn bộ danh sách tài liệu
  const docs = getDocs();
  // Tìm tài liệu có id trùng
  const doc  = docs.find(d => d.id === id);

  // Ẩn trạng thái loading (nếu có)
  document.getElementById("loadingState").style.display = "none";

  // Nếu không tìm thấy tài liệu, hiển thị thông báo lỗi và dừng
  if (!doc) {
    document.getElementById("notFound").style.display = "block";
    return;
  }

  // Nếu tìm thấy, hiển thị phần nội dung chính
  document.getElementById("mainContent").style.display = "block";

  // ---------- ĐIỀN THÔNG TIN VÀO CÁC PHẦN TỬ HTML ----------
  // Tiêu đề trang (tab)
  document.title = `${doc.name} — Thư viện AI`;

  // Breadcrumb (đường dẫn)
  document.getElementById("bcTitle").textContent      = doc.name;

  // Tiêu đề chính
  document.getElementById("docTitle").textContent     = doc.name;

  // Badge môn học
  document.getElementById("subjectBadge").textContent = doc.subject;

  // Dòng metadata (số trang, ngày tải)
  document.getElementById("docMeta").textContent      = `${doc.totalPages} trang · Ngày tải: ${doc.date}`;

  // Tóm tắt
  document.getElementById("summaryText").textContent  = doc.summary;

  // Các thông tin bổ sung (ở phần info)
  document.getElementById("pageCount").textContent    = `${doc.totalPages} trang`;
  document.getElementById("infoSubject").textContent  = doc.subject;
  document.getElementById("infoPages").textContent    = doc.totalPages + " trang";
  document.getElementById("infoDate").textContent     = doc.date;

  // Ảnh bìa (cả hai kích thước)
  document.getElementById("coverImg").src   = doc.cover;   // ảnh nhỏ trong info
  document.getElementById("coverLarge").src = doc.cover;   // ảnh lớn trong tab "Xem bìa"

  // ---------- XỬ LÝ FILE PDF (TẢI VỀ VÀ XEM) ----------
  // Lấy dữ liệu file từ localStorage riêng
  const fileData = getFileData(doc.id);
  const dlBtn = document.getElementById("downloadBtn");

  if (fileData) {
    // Nếu có file, gán href cho nút tải (base64) và thuộc tính download (đặt tên file)
    dlBtn.href     = fileData;
    dlBtn.download = doc.name + ".pdf";  // tên file khi tải về

    // Gán src cho iframe để hiển thị PDF (trình duyệt hỗ trợ base64 trong iframe)
    document.getElementById("pdfIframe").src = fileData;
  } else {
    // Nếu không tìm thấy file (có thể bị xoá khỏi localStorage), vô hiệu hoá nút tải
    dlBtn.classList.add("disabled");
    dlBtn.textContent = "Không tìm thấy file";

    // Hiển thị thông báo lỗi trong tab iframe
    document.getElementById("tabIframe").innerHTML =
      `<div class="p-4 text-center text-muted">Không tải được file PDF (có thể đã bị xoá khỏi bộ nhớ trình duyệt).</div>`;
  }

  // ---------- HIỂN THỊ TÀI LIỆU LIÊN QUAN ----------
  renderRelated(doc, docs);
});

// Giải thích tổng quan
// Lấy ID từ URL: Khi người dùng click vào thẻ tài liệu ở trang thư viện, họ được chuyển đến detail.html?id=.... Hàm getIdFromUrl() đọc tham số này.

// Tìm tài liệu trong localStorage: Dùng getDocs() lấy toàn bộ metadata, sau đó tìm phần tử có id trùng. Nếu không có, hiển thị thông báo lỗi.

// Hiển thị thông tin: Điền các trường như tên, môn học, số trang, ngày tải, tóm tắt, ảnh bìa vào các thẻ HTML đã định sẵn.

// Xử lý file PDF:

// Gọi getFileData(id) để lấy nội dung base64 của file PDF đã lưu riêng.

// Nếu có, gán vào href của nút tải và src của iframe (cho phép xem trực tiếp).

// Nếu không (do hết hạn hoặc bị xoá), vô hiệu hoá nút tải và hiển thị thông báo trong tab iframe.

// Chuyển tab: Sử dụng hàm switchTab để ẩn/hiện iframe và ảnh bìa khi người dùng click vào các nút "Xem PDF" / "Xem bìa".

// Tài liệu liên quan:

// Tính điểm liên quan dựa trên cùng môn học (3 điểm) và sự xuất hiện của các từ chung trong tên (mỗi từ 1 điểm).

// Lọc tối đa 4 tài liệu có điểm cao nhất.

// Render thành các thẻ nhỏ, khi click vào cũng chuyển đến trang chi tiết tương ứng.

// Chống XSS: Hàm escHtml được dùng khi chèn nội dung do người dùng nhập (tên, môn học) vào HTML để tránh lỗ hổng bảo mật.