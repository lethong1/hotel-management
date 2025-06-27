# import urllib.parse
# import hmac
# import hashlib


# class Vnpay:
#     def __init__(self):
#         self.requestData = {}

#     def get_payment_url(self, vnp_payment_url, vnp_hash_secret_key, skip_hash=False):
#         # 1. Lọc dữ liệu hợp lệ
#         filtered = {
#             k: str(v)
#             for k, v in self.requestData.items()
#             if v is not None and v != ""
#         }

#         # 2. Sắp xếp theo key
#         sorted_data = dict(sorted(filtered.items()))

#         # 3. Tạo query string cho URL
#         query_string = urllib.parse.urlencode(sorted_data, quote_via=urllib.parse.quote_plus)
        
#         if skip_hash:
#             payment_url = f"{vnp_payment_url}?{query_string}"
#         else:
#             # 4. Tạo hash_data - loại bỏ vnp_SecureHashType khỏi hash
#             hash_data_dict = {k: v for k, v in sorted_data.items() if k != 'vnp_SecureHashType'}
            
#             hash_pairs = []
#             for k, v in hash_data_dict.items():
#                 # URL encode từng value
#                 encoded_value = urllib.parse.quote(str(v), safe='')
#                 hash_pairs.append(f"{k}={encoded_value}")
            
#             hash_data = "&".join(hash_pairs)
            
#             print(f"🔍 Hash data (excluding vnp_SecureHashType): {hash_data}")
            
#             # 5. Tạo secure hash
#             secure_hash = hmac.new(
#                 bytes(vnp_hash_secret_key, "utf-8"),
#                 bytes(hash_data, "utf-8"),
#                 hashlib.sha512
#             ).hexdigest()
            
#             payment_url = f"{vnp_payment_url}?{query_string}&vnp_SecureHash={secure_hash}"
            
#         print(f"🔍 Hash data for signature: {hash_data}")
#         print(f"🔍 Secure hash: {secure_hash}")
        
#         return payment_url

#     def validate_response(self, data, vnp_hash_secret_key):
#         """Xác minh dữ liệu callback trả về từ VNPAY (vnpay-return)."""
#         # Tạo bản copy để không thay đổi dữ liệu gốc
#         data_copy = data.copy()
#         vnp_secure_hash = data_copy.pop("vnp_SecureHash", None)
        
#         if not vnp_secure_hash:
#             return False

#         # Lọc và sắp xếp dữ liệu
#         filtered_data = {
#             k: str(v) 
#             for k, v in data_copy.items() 
#             if v is not None and v != ""
#         }
#         sorted_data = dict(sorted(filtered_data.items()))

#         # Tạo hash_data KHÔNG encode (raw data)
#         hash_data = "&".join(f"{k}={v}" for k, v in sorted_data.items())

#         # Tạo hash để so sánh
#         generated_hash = hmac.new(
#             bytes(vnp_hash_secret_key, "utf-8"),
#             bytes(hash_data, "utf-8"),
#             hashlib.sha512
#         ).hexdigest()

#         print(f"🔍 Raw hash data for validation: {hash_data}")
#         print(f"🔍 Generated hash: {generated_hash}")
#         print(f"🔍 Received hash: {vnp_secure_hash}")
        
#         return generated_hash == vnp_secure_hash

import hmac
import hashlib
import requests
import json
from datetime import datetime
import uuid

def create_momo_payment(booking, redirect_url, ipn_url, payment_type="qr"):
    endpoint = "https://test-payment.momo.vn/v2/gateway/api/create"
    partnerCode = "MOMO"
    accessKey = "F8BBA842ECF85"
    secretKey = "K951B6PE1waDMi640xX08PD3vg6EkVlz"

    orderInfo = f"Thanh toán đơn booking #{booking.id}"
    amount = str(int(booking.total_price))
    orderId = f"{booking.id}-{uuid.uuid4().hex[:8]}"
    requestId = f"{booking.id}-{uuid.uuid4().hex[:8]}"
    extraData = ""

    # Xác định requestType và orderType dựa trên payment_type
    if payment_type == "bank":
        requestType = "payWithATM"  # Thanh toán qua thẻ ATM/Internet Banking
        orderType = "momo_wallet"   # Loại giao dịch ví điện tử
    else:
        requestType = "captureWallet"  # Thanh toán qua ví MOMO (QR)
        orderType = "other"           # Loại giao dịch khác

    raw_signature = f"accessKey={accessKey}&amount={amount}&extraData={extraData}&ipnUrl={ipn_url}&orderId={orderId}&orderInfo={orderInfo}&partnerCode={partnerCode}&redirectUrl={redirect_url}&requestId={requestId}&requestType={requestType}"

    signature = hmac.new(
        secretKey.encode('utf-8'),
        raw_signature.encode('utf-8'),
        hashlib.sha256
    ).hexdigest()

    data = {
        "partnerCode": partnerCode,
        "accessKey": accessKey,
        "requestId": requestId,
        "amount": amount,
        "orderId": orderId,
        "orderInfo": orderInfo,
        "redirectUrl": redirect_url,
        "ipnUrl": ipn_url,
        "extraData": extraData,
        "requestType": requestType,
        "signature": signature,
        "lang": "vi"
    }

    headers = {'Content-Type': 'application/json'}
    response = requests.post(endpoint, json=data, headers=headers)
    return response.json()
