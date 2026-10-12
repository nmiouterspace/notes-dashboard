# Notes

Ghi chú cá nhân và việc cần làm, có thể cài thành ứng dụng web. Giao diện xanh lá, tương thích điện thoại và máy tính.

- Việc bình thường: chữ xanh lá.
- Urgent: chữ đỏ đậm, được đưa lên trước.
- Đã xong: tích ô, chữ đỏ gạch ngang; có thể mở lại.
- Thêm và sửa việc hoặc ghi chú; tìm kiếm và xem các danh sách riêng.
- Lưu trên thiết bị, nhập/xuất JSON, đồng bộ riêng qua Google Drive.
- Vật tư: tên, số lượng tồn (cho phép số lẻ), đơn vị tính, chi tiết; số lượng 0 hiển thị Hết hàng. Mở Vật tư → Thêm vật tư; bấm bút để sửa số lượng rồi Đồng bộ.
- Các ô chọn danh sách được thu gọn thành 4 cột, kể cả trên điện thoại; ô thứ 5 xuống hàng tiếp theo.

Vật tư được lưu dưới dạng note có body bắt đầu bằng `notes:inventory:v1` và JSON quantity/unit/details, tương thích với endpoint Drive v1 hiện tại. App tách vật tư khỏi ghi chú và việc cần làm. Không cần triển khai lại Apps Script. Khi hai máy cùng sửa số lượng, bản có updatedAt mới hơn được giữ; đây là số lượng tồn hiện tại, không phải sổ lịch sử nhập/xuất.

Kho này chỉ chứa mã ứng dụng. Không đưa ghi chú thật, khóa đồng bộ hoặc bản sao JSON vào GitHub.

## Cài ứng dụng

Mở website bằng Chrome/Edge và chọn cài ứng dụng. Trên iPhone/iPad, mở bằng Safari → Chia sẻ → Thêm vào Màn hình chính. Sau lần tải đầu tiên, có thể đọc và sửa ghi chú offline; kết nối mạng và bấm Đồng bộ để chuyển dữ liệu sang thiết bị khác.

## Đồng bộ Google Drive

1. Tạo dự án Google Apps Script riêng tên **Notes Drive Sync**.
2. Dán nội dung `google-drive-sync/Code.gs` vào Code.gs và lưu.
3. Chạy `setupNotes`, cấp quyền Drive khi Google yêu cầu. Script tạo tệp dữ liệu Notes riêng và khóa ngẫu nhiên, không đụng tới dữ liệu Mandy.
4. Trong Project Settings → Script properties, lấy `NOTES_KEY`. Giữ khóa riêng tư.
5. Deploy → New deployment → Web app, Execute as: Me, Who has access: Anyone. Mọi lần đọc/ghi đều cần khóa; mở URL bằng GET chỉ trả trạng thái, không trả ghi chú.
6. Sao chép URL kết thúc bằng `/exec`, mở Notes → Dữ liệu & đồng bộ, nhập URL và khóa, bấm Kết nối & đồng bộ.
7. Trên thiết bị khác, dùng cùng URL và khóa. Chỉ chọn ghi nhớ khóa trên thiết bị cá nhân.

Đồng bộ là thao tác chủ động. App tải phiên bản mới nhất, hợp nhất theo từng mục và lưu lại với kiểm tra phiên bản. Nếu hai thiết bị cùng sửa một mục, bản có thời điểm sửa mới hơn được giữ; nên đồng bộ trước và sau khi làm việc. Khi ghi gặp xung đột phiên bản, dữ liệu trên máy được giữ nguyên để đồng bộ lại. Script giữ 5 bản sao gần nhất trên Drive.

Giờ nhắc trong Codex là lịch riêng, không phải push notification của PWA. App không tự báo lúc 8:00 khi đóng.

## GitHub Pages

Trong Settings → Pages, chọn Deploy from a branch → main → /(root). Không cần bước build. Các đường dẫn tương đối hỗ trợ thư mục `/notes-dashboard/`.

## Phát triển

Yêu cầu Node.js hiện đại. `npm test` kiểm tra hợp nhất dữ liệu, urgent, hoàn thành và kiểm tra bản sao. `npm start` mở server tại `http://127.0.0.1:8186`. Khi sửa app, tăng phiên bản cache trong `sw.js`. Chỉ cache app shell, không cache API đồng bộ hay khóa.
