// ============================================================
//  auth-guard.js — Nhúng vào ĐẦU <body> của mọi trang cần bảo vệ
//  Nếu chưa đăng nhập → redirect về login.html
// ============================================================

(function() {
  function getCurrentUser() {
    var email = localStorage.getItem("current_user");
    if (!email) return null;
    var raw = localStorage.getItem("users_db");
    if (!raw) return null;
    try {
      var db = JSON.parse(raw);
      return db.users.find(function(u) { return u.email === email; }) || null;
    } catch(e) { return null; }
  }

  var user = getCurrentUser();
  if (!user) {
    window.location.href = "login.html";
  } else {
    // Gắn thông tin user vào window để các script khác dùng
    window.__currentUser = user;

    // Cập nhật navbar nếu có
    document.addEventListener("DOMContentLoaded", function() {
      var nameEl = document.getElementById("nav-name");
      if (nameEl) {
        nameEl.textContent = user.nickname || user.username;
      }

      var logoutBtn = document.getElementById("nav-logout");
      if (logoutBtn) {
        logoutBtn.addEventListener("click", function(e) {
          e.preventDefault();
          if (confirm("Bạn có chắc muốn đăng xuất?")) {
            localStorage.removeItem("current_user");
            window.location.href = "login.html";
          }
        });
      }
    });
  }
})();