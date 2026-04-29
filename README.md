# 🎓 AI Study Hub – Website Học Tập Tích Hợp AI

**Tác giả:** Nguyễn Văn Bảo Khánh  
**Công nghệ:** HTML • CSS • JavaScript • LocalStorage (JSON format)

> Website hỗ trợ học sinh Việt học tập thông minh hơn với AI — giao diện trực quan, chạy hoàn toàn trên trình duyệt, không cần backend.

---

## 🌟 Tính năng chính

### 🔐 1. Hệ thống tài khoản
- Đăng ký / Đăng nhập với form riêng biệt (`login.html`)
- Dữ liệu lưu theo chuẩn **JSON** trong `localStorage` (key: `users_db`)
- Hỗ trợ nhiều tài khoản trên cùng một thiết bị
- **Auth Guard** (`auth-guard.js`) — tự động chuyển về trang đăng nhập nếu chưa đăng nhập
- Trang **Thông tin tài khoản** (`taikhoan.html`) — xem, chỉnh sửa thông tin và xuất file `users.json`

### 🏠 2. Trang chủ (`index.html`)
- Video nền động (YouTube embed hoặc file local `AI.mp4`)
- Giới thiệu về AI, các ứng dụng thực tế, đạo đức AI
- Navbar hiển thị tên người dùng sau khi đăng nhập
- Hiệu ứng scroll reveal khi cuộn trang

### 🤖 3. AI trong các môn học
- **AI trong Toán** (`ai-toan.html`) — gợi ý công cụ AI hỗ trợ giải toán
- **AI trong Tiếng Anh** (`ai-tienganh.html`) — luyện nghe, nói, viết với AI
- **AI trong Vật lý** (`ai-vatly.html`) — mô phỏng, giải thích khái niệm

### 📚 4. Thư viện tài liệu (`thuvien.html`)
- Upload tài liệu (PDF / hình ảnh / text)
- Lưu trữ bằng **LocalStorage** — không cần backend
- Tìm kiếm tài liệu theo tên
- Hiển thị danh sách dạng lưới

### 🤖 5. Chatbot AI (Botpress)
- Chatbox tích hợp hỗ trợ học tập
- Powered by **Botpress Webchat** (`web.js`)
- Xuất hiện dạng popup ở góc màn hình

### ✉️ 6. Liên hệ (`lienhe.html`)
- Form gửi thông tin: tên – email – nội dung
- Validate cơ bản bằng JavaScript
- Giao diện đồng bộ với toàn bộ website

---

## 🛠️ Công nghệ sử dụng

| Công nghệ | Vai trò |
|---|---|
| HTML5 | Cấu trúc trang web |
| CSS3 | Giao diện, bố cục, responsive, animation |
| JavaScript (ES6) | Xử lý chức năng, auth, chatbot |
| Bootstrap 5.3 | UI components, grid layout |
| Bootstrap Icons | Icon bộ |
| LocalStorage (JSON) | Lưu trữ dữ liệu người dùng |
| Botpress Webchat | Chatbot AI tích hợp |
| Google Fonts | Be Vietnam Pro, Playfair Display |

---

## 📁 Cấu trúc file

```
project/
├── index.html          ← Trang chủ (cần đăng nhập)
├── style.css           ← CSS chính cho trang chủ
├── login.html          ← Trang đăng nhập / đăng ký
├── login.css           ← CSS trang đăng nhập
├── login.js            ← Logic xác thực, lưu JSON
├── auth-guard.js       ← Bảo vệ trang, redirect nếu chưa login
├── taikhoan.html       ← Trang thông tin tài khoản
├── lienhe.html         ← Trang liên hệ
├── lienhe.css          ← CSS trang liên hệ
├── thuvien.html        ← Thư viện tài liệu
├── ai-toan.html        ← AI trong Toán
├── ai-toan.css
├── ai-tienganh.html    ← AI trong Tiếng Anh
├── ai-tienganh.css
├── ai-vatly.html       ← AI trong Vật lý
├── ai-vatly.css
├── web.js              ← Cấu hình Botpress chatbot
├── AI.mp4              ← Video nền trang chủ (xem hướng dẫn bên dưới)
└── README.md
```

---

## 🚀 Cách cài đặt & chạy

### Bước 1 — Tải project về
```bash
git clone https://github.com/Backhanh1007/Tin-h-c-tr-To-n-qu-c-B-o-Kh-nh
cd project
```

### Bước 2 — Tải video nền ⬇️

Video nền (`AI.mp4`) không được lưu trong repo vì dung lượng lớn. Cậu cần tải thủ công:

1. Truy cập **[ytsave.to/vi2](https://ytsave.to/vi2/)**
2. Dán link video sau vào ô tìm kiếm:
   ```
   https://www.youtube.com/watch?v=nhI5g2hRVKA&t=5s
   ```
3. Chọn chất lượng **720p hoặc 1080p** → nhấn tải
4. Đổi tên file vừa tải thành **`AI.mp4`**
5. Đặt file vào **cùng thư mục** với `index.html`

```
project/
├── index.html
├── AI.mp4       ← đặt ở đây
└── ...
```

### Bước 3 — Mở project
Chỉ cần mở `login.html` bằng trình duyệt là chạy được — **không cần server, không cần cài thêm gì**.

> ⚠️ Lưu ý: Mở `index.html` trực tiếp sẽ bị chuyển về `login.html` nếu chưa có tài khoản. Hãy **đăng ký tài khoản trước** rồi mới vào trang chủ.

---

## 🧪 Hướng dẫn sử dụng

### 🔐 Tài khoản
1. Mở `login.html` → chọn **Đăng ký**
2. Điền đầy đủ thông tin → nhấn Đăng ký
3. Chuyển sang **Đăng nhập** → nhập email + mật khẩu
4. Vào trang chủ thành công — tên bạn hiện trên navbar

### 📁 Thư viện tài liệu
- Vào **Thư viện** → upload file
- Tìm kiếm tài liệu theo tên
- Dữ liệu lưu trong `localStorage`, tắt mở trình duyệt vẫn còn

### 🤖 Chatbot
- Nhấn vào icon chat góc phải màn hình
- Nhập câu hỏi và nhận hỗ trợ từ bot

### 👤 Thông tin tài khoản
- Nhấn tên trên navbar → **Thông tin tài khoản**
- Chỉnh sửa username, biệt danh, số điện thoại
- Nhấn **Xuất users.json** để tải dữ liệu về máy

---

## 💡 Hướng phát triển trong tương lai

- [ ] Kết nối API AI thật (OpenAI / Gemini)
- [ ] Lưu tài liệu lên cloud (Firebase / Supabase)
- [ ] Gửi email thật từ form liên hệ (EmailJS)
- [ ] Tối ưu UI/UX cho mobile
- [ ] Thêm môn học: Hóa học, Lịch sử, Địa lý
- [ ] Hệ thống điểm số & tiến độ học tập

---

## 📜 License

Project thuộc quyền sở hữu học sinh **Nguyễn Văn Bảo Khánh** — dùng cho mục đích học tập.
