Về bản chất lưu trữ bằng gì?
Vẫn là localStorage — nhưng khác cách tổ chức dữ liệu.
Trước đây (cách cũ):
localStorage:
  "username"  → "khanh"
  "nickname"  → "Bảo Khánh"
  "email"     → "khanh@gmail.com"
  "phone"     → "0909..."
  "password"  → "123456"
Mỗi thứ lưu 1 key riêng lẻ → chỉ lưu được 1 người duy nhất, người sau đăng ký sẽ ghi đè người trước.
Bây giờ (cách mới):
localStorage:
  "users_db"      → '{ "users": [ {...}, {...}, {...} ] }'   ← toàn bộ danh sách users, dạng JSON string
  "current_user"  → "khanh@gmail.com"                        ← email của người đang đăng nhập
Tất cả users gom vào 1 key duy nhất dạng JSON → lưu được nhiều tài khoản, không bị ghi đè.

Vì vậy gọi là "Mock JSON" — format thì đúng chuẩn JSON thật, nhưng nơi lưu vẫn là localStorage của trình duyệt, không phải file .json trên server.