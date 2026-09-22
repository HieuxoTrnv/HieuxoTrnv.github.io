# Hiếu Xoăn Trader - Web quay số

## Chạy trên máy
Mở `index.html` bằng trình duyệt.

## Đưa lên GitHub Pages
1. Tạo một repository trên GitHub.
2. Upload `index.html`, `style.css`, `script.js`.
3. Vào **Settings → Pages**.
4. Chọn **Deploy from a branch**, chọn branch `main` và thư mục `/root`.
5. Chờ GitHub Pages xuất bản website.

## Tính năng
- 100 mức tiền cố định, mỗi mức nằm trong khoảng 200.000đ–5.000.000đ.
- Bấm **QUAY SỐ** để chọn ngẫu nhiên.
- Sau khi có kết quả, website tạo VietQR động theo đúng số tiền.
- Techcombank, tài khoản 19034697615019, chủ tài khoản NGUYEN VAN HIEU.
- Có nút sao chép thông tin chuyển khoản.
- Có nút mở QR chuyển khoản.
- Có link YouTube Hiếu Xoăn Trader.
- Hiệu ứng âm thanh quay số chạy ngay bằng Web Audio, không cần tải file nhạc.

## Nếu muốn dùng nhạc xổ số miền Bắc
Website hiện dùng hiệu ứng âm thanh tự tạo để tránh phụ thuộc vào file nhạc bên ngoài.
Nếu bạn có file nhạc mà bạn có quyền sử dụng, có thể thêm `lottery.mp3` vào thư mục và thay phần âm thanh trong `script.js` bằng thẻ Audio.

## Lưu ý
QR động dùng Quick Link của VietQR. Khi triển khai thực tế, hãy kiểm tra lại tên người nhận, số tài khoản và số tiền trước khi giao dịch.
