import urllib.parse
import hmac
import hashlib


class Vnpay:
    def __init__(self):
        self.requestData = {}

    def get_payment_url(self, vnp_payment_url, vnp_hash_secret_key):
        # Sắp xếp key theo thứ tự A-Z
        sorted_keys = sorted(self.requestData.keys())
        query = ""
        hash_data = ""

        for key in sorted_keys:
            value = self.requestData[key]
            if value is not None and value != "":
                query += f"{key}={urllib.parse.quote_plus(str(value))}&"
                hash_data += f"{key}={str(value)}&"

        # Bỏ dấu `&` cuối
        query = query.rstrip("&")
        hash_data = hash_data.rstrip("&")

        # Tạo chuỗi HMAC SHA512
        secure_hash = hmac.new(
            bytes(vnp_hash_secret_key, "utf-8"),
            bytes(hash_data, "utf-8"),
            hashlib.sha512
        ).hexdigest()

        # Gắn secure hash vào URL
        payment_url = f"{vnp_payment_url}?{query}&vnp_SecureHash={secure_hash}"
        return payment_url

    def validate_response(self, data, vnp_hash_secret_key):
        """Xác minh dữ liệu callback trả về từ VNPAY (vnpay-return)."""
        vnp_secure_hash = data.pop("vnp_SecureHash", None)
        if not vnp_secure_hash:
            return False

        # Sắp xếp và tạo lại hash để so sánh
        sorted_data = {k: data[k] for k in sorted(data)}
        hash_data = "&".join(f"{k}={v}" for k, v in sorted_data.items())

        generated_hash = hmac.new(
            bytes(vnp_hash_secret_key, "utf-8"),
            bytes(hash_data, "utf-8"),
            hashlib.sha512
        ).hexdigest()

        return generated_hash == vnp_secure_hash
