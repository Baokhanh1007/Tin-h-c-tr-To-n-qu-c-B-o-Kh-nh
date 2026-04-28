// ============================================================
// lienhe.js — Xử lý form liên hệ + EmailJS
// ============================================================

document.addEventListener("DOMContentLoaded", () => {

  const form       = document.getElementById("feedbackForm");
  const submitBtn  = document.getElementById("submitBtn");
  const btnText    = submitBtn.querySelector(".btn-text");
  const btnLoading = submitBtn.querySelector(".btn-loading");
  const msgBox     = document.getElementById("formMessage");

  // ── Validation helpers ──────────────────────────────────
  function showError(inputEl, msg) {
    inputEl.classList.add("is-invalid");
    let err = inputEl.parentElement.querySelector(".lh-err");
    if (!err) {
      err = document.createElement("div");
      err.className = "lh-err";
      err.style.cssText = "color:#dc3545;font-size:.8rem;margin-top:4px;";
      inputEl.parentElement.appendChild(err);
    }
    err.textContent = msg;
  }

  function clearError(inputEl) {
    inputEl.classList.remove("is-invalid");
    const err = inputEl.parentElement.querySelector(".lh-err");
    if (err) err.remove();
  }

  function validateForm() {
    let valid = true;

    const name  = document.getElementById("userName");
    const email = document.getElementById("userEmail");

    // Họ tên
    if (!name.value.trim()) {
      showError(name, "Vui lòng nhập họ và tên.");
      valid = false;
    } else { clearError(name); }

    // Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.value.trim()) {
      showError(email, "Vui lòng nhập email.");
      valid = false;
    } else if (!emailRegex.test(email.value.trim())) {
      showError(email, "Email không hợp lệ.");
      valid = false;
    } else { clearError(email); }

    return valid;
  }

  // ── Clear errors on input ───────────────────────────────
  ["userName", "userEmail"].forEach(id => {
    document.getElementById(id)?.addEventListener("input", function () {
      clearError(this);
    });
  });

  // ── Collect checked issues ──────────────────────────────
  function getCheckedIssues() {
    const checked = [...document.querySelectorAll(".lh-checkbox-grid input[type=checkbox]:checked")];
    return checked.map(c => c.value).join(", ") || "Không chọn vấn đề cụ thể";
  }

  // ── Show message ────────────────────────────────────────
  function showMsg(text, type) {
    msgBox.textContent = text;
    msgBox.className   = "lh-form-msg " + type;
    msgBox.style.display = "block";
    msgBox.scrollIntoView({ behavior: "smooth", block: "nearest" });
    if (type === "success") setTimeout(() => { msgBox.style.display = "none"; }, 6000);
  }

  // ── Loading state ───────────────────────────────────────
  function setLoading(on) {
    submitBtn.disabled    = on;
    btnText.style.display    = on ? "none"  : "inline";
    btnLoading.style.display = on ? "inline" : "none";
  }

  // ── Submit ──────────────────────────────────────────────
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    msgBox.style.display = "none";

    const templateParams = {
      user_name   : document.getElementById("userName").value.trim(),
      user_email  : document.getElementById("userEmail").value.trim(),
      user_phone  : document.getElementById("userPhone").value.trim() || "Không cung cấp",
      user_class  : document.getElementById("userClass").value.trim() || "Không cung cấp",
      issues      : getCheckedIssues(),
      message     : document.getElementById("userMessage").value.trim() || "Không có nội dung bổ sung.",
    };

    try {
      await emailjs.send("service_esiphne", "template_jok3mvf", templateParams);

      showMsg("✅ Gửi thành công! Chúng tớ sẽ phản hồi bạn sớm nhất có thể.", "success");
      form.reset();

    } catch (err) {
      console.error("EmailJS error:", err);
      showMsg("❌ Gửi thất bại. Vui lòng thử lại hoặc liên hệ trực tiếp.", "error");
    } finally {
      setLoading(false);
    }
  });

});