// ============================================================
//  AI STUDY HUB — Auth System (Mock JSON Storage)
//  Dữ liệu lưu dạng JSON chuẩn trong localStorage key "users_db"
//  Format: { "users": [ { username, nickname, email, phone, password, createdAt } ] }
// ============================================================

// ── Helpers ──────────────────────────────────────────────────
function getDB() {
  var raw = localStorage.getItem("users_db");
  if (!raw) return { users: [] };
  try { return JSON.parse(raw); } catch(e) { return { users: [] }; }
}

function saveDB(db) {
  localStorage.setItem("users_db", JSON.stringify(db, null, 2));
}

function getCurrentUser() {
  var email = localStorage.getItem("current_user");
  if (!email) return null;
  var db = getDB();
  return db.users.find(function(u) { return u.email === email; }) || null;
}

function setCurrentUser(email) {
  localStorage.setItem("current_user", email);
}

function clearCurrentUser() {
  localStorage.removeItem("current_user");
}

// ── Toggle forms ──────────────────────────────────────────────
document.getElementById("show-register").onclick = function() {
  document.getElementById("login-form").style.display = "none";
  document.getElementById("register-form").style.display = "block";
};

document.getElementById("show-login").onclick = function() {
  document.getElementById("register-form").style.display = "none";
  document.getElementById("login-form").style.display = "block";
};

// ── Đăng ký ──────────────────────────────────────────────────
document.getElementById("register").addEventListener("submit", function(e) {
  e.preventDefault();

  var username  = document.getElementById("register-username").value.trim();
  var nickname  = document.getElementById("nickname").value.trim();
  var email     = document.getElementById("register-email").value.trim();
  var phone     = document.getElementById("phone").value.trim();
  var password  = document.getElementById("register-password").value;
  var cfpassword = document.getElementById("confirm-password").value;

  // Validate
  if (!username || !email || !password) {
    alert("Vui lòng điền đầy đủ thông tin bắt buộc!");
    return;
  }
  if (isNaN(phone)) {
    alert("Số điện thoại phải là số!");
    return;
  }
  if (password !== cfpassword) {
    alert("Mật khẩu không khớp!");
    return;
  }
  if (password.length < 6) {
    alert("Mật khẩu phải có ít nhất 6 ký tự!");
    return;
  }

  var db = getDB();

  // Kiểm tra email trùng
  var exists = db.users.find(function(u) { return u.email === email; });
  if (exists) {
    alert("Email này đã được đăng ký!");
    return;
  }

  // Tạo user mới
  var newUser = {
    username:  username,
    nickname:  nickname || username,
    email:     email,
    phone:     phone,
    password:  password,
    createdAt: new Date().toISOString()
  };

  db.users.push(newUser);
  saveDB(db);

  alert("Đăng ký thành công! Vui lòng đăng nhập.");

  // Chuyển sang form đăng nhập
  document.getElementById("register-form").style.display = "none";
  document.getElementById("login-form").style.display = "block";
  document.getElementById("login-email").value = email;
});

// ── Đăng nhập ────────────────────────────────────────────────
document.getElementById("login").addEventListener("submit", function(e) {
  e.preventDefault();

  var email    = document.getElementById("login-email").value.trim();
  var password = document.getElementById("login-password").value;

  var db   = getDB();
  var user = db.users.find(function(u) {
    return u.email === email && u.password === password;
  });

  if (user) {
    setCurrentUser(email);
    window.location.href = "index.html";
  } else {
    alert("Sai email hoặc mật khẩu!");
  }
});

// ── Nếu đã đăng nhập rồi thì redirect thẳng vào index ───────
(function() {
  if (getCurrentUser()) {
    window.location.href = "index.html";
  }
})();