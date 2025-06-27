# Hotel Management System

## 1. Yêu cầu hệ thống
- Python >= 3.8
- Node.js >= 16
- PostgreSQL (hoặc SQLite cho phát triển)
- pip, venv
+ Git (để clone project)
+ npm hoặc yarn (để cài frontend)

## 2. Cài đặt backend (Django)

### Bước 1: Clone project
```bash
# Clone về máy
$ git clone <repo-url>
$ cd hotel-management
```

### Bước 2: Tạo và kích hoạt môi trường ảo Python
```bash
# Tạo môi trường ảo
$ python -m venv venv
# Kích hoạt (Windows)
$ venv\\Scripts\\activate
# Kích hoạt (Linux/Mac)
$ source venv/bin/activate
```
- Trường hợp lỗi không thể tạo venv hãy chạy lệnh `pip install venv`

### Bước 3: Cài đặt các thư viện backend
```bash
$ pip install -r requirements.txt
```
+ **Lưu ý:** Nếu chưa có hoặc không tìm thấy file requirements.txt, hãy tạo file này với nội dung:
``` bash
asgiref==3.8.1
certifi==2025.6.15
charset-normalizer==3.4.2
Django==5.2.2
django-cors-headers==4.7.0
djangorestframework==3.16.0
djangorestframework_simplejwt==5.5.0
idna==3.10
psycopg2-binary==2.9.10
PyJWT==2.9.0
python-decouple==3.8
python-dotenv==1.1.0
requests==2.32.4
sqlparse==0.5.3
tzdata==2025.2
urllib3==2.5.0
```

### Bước 4: Cấu hình database
- Mặc định dùng SQLite, muốn dùng PostgreSQL thì sửa `hotel_management/settings.py`.
- Biến DATABASES và cấu hình thành PostgreSQL (tạo database trong PostgreSQL trước khi cấu hình)
- Trong file đang có file .env nên hãy cấu hình lại theo cá nhân trước để tránh lỗi
+ **Cấu hình file .env:**
+ # Tạo file .env trong thư mục gốc(ngang hàng với`manage.py`)

+ # Chỉnh sửa các biến môi trường trong file .env (nếu không chỉnh sẽ không thể chạy vì file settings.py không đọc được)

### Bước 5: Khởi tạo database
```bash
# Lệnh này để tạo các migrations( giống như tạo các tables trong các models)
$ python manage.py makemigrations
# Lệnh này chạy các migrations
$ python manage.py migrate
# Lệnh này để tạo user admin
$ python manage.py createsuperuser
```

### Bước 6: Import database có sẵn
- Nếu bạn đã có file database SQL (ví dụ: `hotel-management.sql`):
  - **Với SQLite:**
    - Đổi tên file SQL thành `db.sqlite3` và đặt vào thư mục gốc dự án (nếu file là dạng SQLite binary).
    - Nếu là file dump SQL, dùng lệnh:
      ```bash
      $ sqlite3 db.sqlite3 < hotel-management.sql
      ```
  - **Với PostgreSQL:**
    - Đảm bảo đã tạo database trống và cấu hình đúng trong `settings.py`.
    - Import bằng lệnh:
      ```bash
      $ psql -U <db_user> (mặc định trong PostgresSQL là postgres) -d <db_name> -f hotel_management.sql
      ```
    - Thay `<db_user>` và `<db_name>` bằng thông tin của bạn.

### Bước 7: Chạy server backend
```bash
# lệnh này để chạy server
$ python manage.py runserver
```

## 3. Cài đặt frontend (React)

### Bước 1: Cài thư viện frontend
```bash
# Chạy vào đúng thư mục của frontend
$ cd frontend
# Lệnh này để cài các thư viện
$ npm install
```

### Bước 2: Chạy frontend
```bash
$ npm run dev
```
- Mặc định truy cập: http://localhost:5173

### Bước 3: Cấu hình kết nối với Backend
- Trong project này đã cấu hình sẵn CORS-HEADERS trong file setting và các ALLOWED_HOST nên có thể cấu hình lại nếu xài React thuần (cổng 3000 thay vì 5173 của Vite)

## 4. Các thư viện chính sử dụng
- **Backend:** Django, Django REST Framework, SimpleJWT, psycopg2, python-decouple, django-cors-headers
- **Frontend:** React, Ant Design, Axios, React Router DOM, Recharts

## 5. Phân quyền hệ thống
- **Admin:**
  - Toàn quyền quản lý user, vai trò, phòng, hóa đơn, báo cáo, ...
  - Truy cập và thao tác mọi chức năng.
- **Manager (Quản lý):**
  - Quản lý phòng, hóa đơn, booking, xem báo cáo.
  - Không quản lý vai trò admin.
- **User (Khách):**
  - Đặt phòng, sửa trạng thái phòng, xem hóa đơn của mình.
  - Không truy cập được trang quản trị, doanh thu.

## 6. Thanh toán
### 6.1 Thanh toán MOMO
- **Tích hợp thanh toán bằng MOMO QR (chỉ test vì không có tài khoản test UAT)**
- **Tích hợp thanh toán bằng thẻ ATM qua MOMO (Đã test thành công)**
- **Tài khoản test MOMO:**
  - *Trường hợp thành công:*
    ```bash
    + SỐ THẺ: 9704 0000 0000 0018
    + CHỦ TÀI KHOẢN: NGUYEN VAN A
    + HẠN GHI TRÊN THẺ: 03/07
    + SỐ ĐIỆN THOẠI: Để trống
    + OTP: OTP
    ```
  - *Trường hợp thẻ bị khóa:*
    ```bash
    + SỐ THẺ: 9704 0000 0000 0026
    + CHỦ TÀI KHOẢN: NGUYEN VAN A
    + HẠN GHI TRÊN THẺ: 03/07
    + SỐ ĐIỆN THOẠI: Để trống
    + OTP: OTP
    ```
  - *Trường hợp thẻ không đủ tiền:*
    ```bash
    + SỐ THẺ: 9704 0000 0000 0034
    + CHỦ TÀI KHOẢN: NGUYEN VAN A
    + HẠN GHI TRÊN THẺ: 03/07
    + SỐ ĐIỆN THOẠI: Để trống
    + OTP: OTP
    ```
  - *Trường hợp hạn mức thẻ:*
   ```bash
    + SỐ THẺ: 9704 0000 0000 0042
    + CHỦ TÀI KHOẢN: NGUYEN VAN A
    + HẠN GHI TRÊN THẺ: 03/07
    + SỐ ĐIỆN THOẠI: Để trống
    + OTP: OTP
    ```
### 6.2 Thanh toán tiền mặt
- Click thanh toán bằng tiền mặt sẽ tự động mặc định là thanh toán thành công 

## 7. Đổi mật khẩu cho user
- Chỉ admin mới đổi được mật khẩu user khác qua trang quản lý user.

## 8. API Endpoints chính
- **Authentication:** `/api/token/`, `/api/token/refresh/`, `/api/token/verify`
- **Users:** `/api/users/` , `/api/users/${id}/set-password/`
- **Rooms:** `/api/rooms/`, `/api/room-types/`
- **Bookings:** `/api/bookings/`
- **Invoices:** `/api/invoices/`
- **Revenue Report:** `/api/invoices/revenue-report/`

## 9. Xử lý lỗi thường gặp
### Lỗi CORS
- Kiểm tra cấu hình CORS trong settings.py
- Đảm bảo frontend và backend chạy đúng port
### Lỗi Database
- Kiểm tra kết nối database
- Chạy `python manage.py migrate` nếu có lỗi migration
### Lỗi Frontend
- Xóa node_modules và package-lock.json, chạy lại `npm install`
- **Lưu ý:** trỏ vào đúng thư mục frontend, ví dụ
``` bash
DISK:\\hotel-management\\frontend>
```
## 10. Development
### Chạy tests
```bash
$ python manage.py test
```
### Tạo migration mới
```bash
# Lệnh này chạy đơn lẻ app thay vì chạy toàn bộ tương tự với migrate
$ python manage.py makemigrations <app_name>
$ python manage.py migrate <app_name>
```
### Backup database
```bash
$ python manage.py dumpdata > backup.json
```

## 11. Đây là sản phẩm còn rất nhiều thiếu xót, mọi người có thể liên hệ góp ý để hoàn thiện hơn ạ
- Gmail: lehuuthong2004@gmail.com
- Gmail: ngthminhduyen04@gmail.com

Chúng em xin chân thành cảm ơn mọi người góp ý và xem!