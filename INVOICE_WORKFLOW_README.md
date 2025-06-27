# Hướng Dẫn Sử Dụng Luồng Thanh Toán Hóa Đơn

## Tổng Quan

Hệ thống quản lý khách sạn đã được cập nhật với luồng thanh toán hóa đơn mới, tích hợp cổng thanh toán MOMO. Luồng này cho phép nhân viên lễ tân xử lý thanh toán cho khách hàng đã nhận phòng một cách hiệu quả.

## Luồng Hoạt Động

### Bước 1: Trang Danh Sách Bookings

**Địa điểm:** `/dashboard/booking`

**Chức năng:**

- Hiển thị tất cả các đặt phòng
- Với booking có trạng thái **CHECK-IN** (đã nhận phòng):
  - Hiển thị nút **"Thanh Toán"** thay vì nút "Sửa"
  - Nút này sẽ chuyển hướng đến trang chi tiết hóa đơn
- Với booking đã thanh toán và trả phòng:
  - Hiển thị nút **"Xem Chi Tiết"** để xem lại hóa đơn

### Bước 2: Trang Chi Tiết Hóa Đơn

**Địa điểm:** `/invoices/{invoice_id}`

**Chức năng chính:**

- Hiển thị đầy đủ thông tin hóa đơn
- Thông tin khách hàng và phòng
- Chi tiết thanh toán (tiền phòng, VAT, tổng cộng)
- Các nút hành động:
  - **"Thanh toán"** (hiển thị modal với 3 lựa chọn: Tiền mặt, QR MOMO, Thẻ ATM)
  - **"In hóa đơn tạm tính"**
  - **"Thêm dịch vụ"** (tính năng sẽ phát triển sau)

### Bước 3: Tích Hợp MOMO

**Khi nhấn "Thanh toán":**

1. Hiển thị modal với 3 lựa chọn:
   - **Tiền mặt**: Cập nhật trạng thái ngay lập tức
   - **QR MOMO**: Tạo QR code thanh toán qua ví MOMO
   - **Thẻ ATM**: Thanh toán qua thẻ ATM/Internet Banking
2. Chuyển hướng đến cổng thanh toán MOMO (nếu chọn QR hoặc ATM)
3. Khách hàng thực hiện thanh toán trên MOMO

### Bước 4: Xử Lý Kết Quả Thanh Toán

**Trường hợp thành công:**

- MOMO trả về kết quả thành công
- Hệ thống tự động:
  - Cập nhật trạng thái hóa đơn thành **"ĐÃ THANH TOÁN"**
  - Cập nhật trạng thái booking thành **"ĐÃ TRẢ PHÒNG"**
  - Cập nhật trạng thái phòng thành **"AVAILABLE"**
- Chuyển hướng về trang chi tiết hóa đơn

**Trường hợp thất bại:**

- Hiển thị thông báo lỗi
- Giữ nguyên trạng thái booking và hóa đơn
- Người dùng có thể thử lại

## Các Trạng Thái Mới

### Booking Status

- `pending`: Chờ xác nhận
- `confirmed`: Đã xác nhận
- `checked_in`: **Đã nhận phòng** (có thể thanh toán)
- `checked_out`: **Đã trả phòng** (sau khi thanh toán)
- `cancelled`: Đã hủy

### Invoice Status

- `pending`: Chờ thanh toán
- `paid`: **Đã thanh toán**
- `cancelled`: Đã hủy

## Các File Đã Cập Nhật

### Frontend

1. **`frontend/src/pages/InvoiceDetailPage.jsx`** - Trang chi tiết hóa đơn mới
2. **`frontend/src/pages/BookingPage.jsx`** - Cập nhật hiển thị nút thanh toán
3. **`frontend/src/contexts/InvoiceDetailContext.jsx`** - Context quản lý dữ liệu hóa đơn
4. **`frontend/src/pages/InvoiceTemplate.jsx`** - Template in hóa đơn
5. **`frontend/src/pages/MomoReturn.jsx`** - Xử lý callback từ MOMO
6. **`frontend/src/components/Modals/PaymentModal.jsx`** - Modal chọn phương thức thanh toán
7. **`frontend/src/App.jsx`** - Thêm route cho trang hóa đơn
8. **`frontend/src/css/InvoiceDetailPage.css`** - CSS cho trang hóa đơn

### Backend

1. **`bookings/views.py`** - Cập nhật logic thanh toán MOMO
2. **`invoices/serializers.py`** - Thêm InvoiceBasicSerializer
3. **`utils/momo.py`** - Tích hợp MOMO payment
4. **`hotel_management/settings.py`** - Cấu hình MOMO

## Cấu Hình MOMO

Đảm bảo các biến môi trường sau đã được cấu hình trong `.env`:

```env
MOMO_RETURN_URL=http://localhost:5173/momo-return
MOMO_NOTIFY_URL=http://localhost:8000/bookings/momo/verify-return/
MOMO_VERIFY_URL=https://test-payment.momo.vn/v2/gateway/api/queryStatus
MOMO_PARTNER_CODE=MOMO
MOMO_ACCESS_KEY=F8BBA842ECF85
MOMO_SECRET_KEY=K951B6PE1waDMi640xX08PD3vg6EkVlz
```

## Hướng Dẫn Sử Dụng

### Cho Nhân Viên Lễ Tân

1. **Khi khách nhận phòng:**

   - Cập nhật trạng thái booking thành "checked_in"
   - Hệ thống tự động tạo hóa đơn

2. **Khi khách trả phòng:**

   - Vào trang danh sách bookings
   - Tìm booking có trạng thái "ĐÃ NHẬN PHÒNG"
   - Nhấn nút "Thanh Toán"
   - Kiểm tra thông tin hóa đơn
   - Nhấn "Thanh toán" và chọn phương thức:
     - **Tiền mặt**: Xác nhận ngay
     - **QR MOMO**: Quét mã QR
     - **Thẻ ATM**: Chuyển đến trang thanh toán

3. **Sau khi thanh toán:**
   - Hệ thống tự động cập nhật trạng thái
   - Có thể in hóa đơn cho khách
   - Booking chuyển sang trạng thái "ĐÃ TRẢ PHÒNG"

### Cho Quản Lý

1. **Theo dõi thanh toán:**

   - Xem danh sách bookings để theo dõi trạng thái
   - Vào trang chi tiết hóa đơn để xem thông tin đầy đủ

2. **In hóa đơn:**
   - Sử dụng nút "In hóa đơn tạm tính" trong trang chi tiết
   - Hóa đơn được format đẹp, phù hợp để in

## Lưu Ý Kỹ Thuật

1. **Bảo mật:** Tất cả giao dịch MOMO đều được mã hóa và xác thực
2. **Logging:** Hệ thống ghi log đầy đủ các giao dịch thanh toán
3. **Error Handling:** Xử lý lỗi gracefully với thông báo rõ ràng
4. **Responsive:** Giao diện tương thích với mobile và desktop

## Troubleshooting

### Lỗi thường gặp:

1. **"Không thể tạo giao dịch thanh toán"**

   - Kiểm tra booking có đúng trạng thái "checked_in" không
   - Kiểm tra hóa đơn đã tồn tại chưa
   - Kiểm tra cấu hình MOMO

2. **"Thanh toán thất bại"**

   - Kiểm tra kết nối internet
   - Kiểm tra thông tin thẻ của khách
   - Thử lại giao dịch

3. **"Không tìm thấy hóa đơn"**
   - Kiểm tra URL có đúng không
   - Kiểm tra quyền truy cập
   - Liên hệ admin nếu cần

## Phát Triển Tương Lai

1. **Thêm dịch vụ:** Tính năng thêm các dịch vụ phụ vào hóa đơn
2. **Báo cáo:** Báo cáo doanh thu và thống kê thanh toán
3. **Email:** Gửi hóa đơn qua email
4. **QR Code:** Tích hợp QR code cho thanh toán nhanh
