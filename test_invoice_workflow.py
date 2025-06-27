#!/usr/bin/env python3
"""
Test script để kiểm tra luồng thanh toán hóa đơn
Chạy script này để test các chức năng chính của hệ thống
"""

import requests
import json
import time
from datetime import datetime, timedelta

# Cấu hình
BASE_URL = "http://localhost:8000"
API_BASE = f"{BASE_URL}/api"

def test_login():
    """Test đăng nhập và lấy token"""
    print("🔐 Testing login...")
    
    login_data = {
        "username": "admin",  # Thay đổi theo user thực tế
        "password": "admin123"  # Thay đổi theo password thực tế
    }
    
    response = requests.post(f"{API_BASE}/auth/login/", json=login_data)
    
    if response.status_code == 200:
        token = response.json().get('access')
        print("✅ Login successful")
        return token
    else:
        print(f"❌ Login failed: {response.status_code}")
        print(response.text)
        return None

def test_get_bookings(token):
    """Test lấy danh sách bookings"""
    print("\n📋 Testing get bookings...")
    
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{API_BASE}/bookings/", headers=headers)
    
    if response.status_code == 200:
        bookings = response.json()
        print(f"✅ Found {len(bookings)} bookings")
        
        # Tìm booking có trạng thái checked_in
        checked_in_bookings = [b for b in bookings if b['status'] == 'checked_in']
        if checked_in_bookings:
            print(f"✅ Found {len(checked_in_bookings)} checked-in bookings")
            return checked_in_bookings[0]
        else:
            print("⚠️ No checked-in bookings found")
            return None
    else:
        print(f"❌ Get bookings failed: {response.status_code}")
        return None

def test_get_invoice(token, booking_id):
    """Test lấy thông tin hóa đơn"""
    print(f"\n🧾 Testing get invoice for booking {booking_id}...")
    
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{API_BASE}/invoices/", headers=headers)
    
    if response.status_code == 200:
        invoices = response.json()
        # Tìm invoice cho booking này
        invoice = next((inv for inv in invoices if inv['booking']['id'] == booking_id), None)
        
        if invoice:
            print(f"✅ Found invoice: {invoice['invoice_number']}")
            print(f"   Status: {invoice['status']}")
            print(f"   Amount: {invoice['total_amount']}")
            return invoice
        else:
            print("❌ No invoice found for this booking")
            return None
    else:
        print(f"❌ Get invoices failed: {response.status_code}")
        return None

def test_create_momo_payment(token, booking_id):
    """Test tạo URL thanh toán MOMO"""
    print(f"\n💳 Testing create MOMO payment for booking {booking_id}...")
    
    headers = {"Authorization": f"Bearer {token}"}
    payment_data = {"payment_type": "qr"}
    
    response = requests.post(
        f"{API_BASE}/bookings/{booking_id}/momo/create-payment/", 
        json=payment_data, 
        headers=headers
    )
    
    if response.status_code == 200:
        result = response.json()
        momo_url = result.get('pay_url')
        print(f"✅ MOMO URL created: {momo_url[:100]}...")
        return momo_url
    else:
        print(f"❌ Create MOMO payment failed: {response.status_code}")
        print(response.text)
        return None

def test_update_booking_status(token, booking_id, new_status):
    """Test cập nhật trạng thái booking"""
    print(f"\n🔄 Testing update booking {booking_id} status to {new_status}...")
    
    headers = {"Authorization": f"Bearer {token}"}
    update_data = {"status": new_status}
    
    response = requests.patch(
        f"{API_BASE}/bookings/{booking_id}/", 
        json=update_data, 
        headers=headers
    )
    
    if response.status_code == 200:
        print(f"✅ Booking status updated to {new_status}")
        return True
    else:
        print(f"❌ Update booking status failed: {response.status_code}")
        print(response.text)
        return False

def test_invoice_workflow():
    """Test toàn bộ luồng thanh toán hóa đơn"""
    print("🚀 Starting Invoice Workflow Test")
    print("=" * 50)
    
    # Bước 1: Đăng nhập
    token = test_login()
    if not token:
        print("❌ Cannot proceed without authentication")
        return
    
    # Bước 2: Lấy danh sách bookings
    booking = test_get_bookings(token)
    if not booking:
        print("❌ No suitable booking found for testing")
        return
    
    booking_id = booking['id']
    print(f"📝 Using booking ID: {booking_id}")
    
    # Bước 3: Lấy thông tin hóa đơn
    invoice = test_get_invoice(token, booking_id)
    if not invoice:
        print("❌ No invoice found for testing")
        return
    
    invoice_id = invoice['id']
    print(f"🧾 Using invoice ID: {invoice_id}")
    
    # Bước 4: Test tạo URL thanh toán MOMO
    momo_url = test_create_momo_payment(token, booking_id)
    if not momo_url:
        print("❌ Cannot create MOMO payment URL")
        return
    
    # Bước 5: Test cập nhật trạng thái (giả lập thanh toán thành công)
    print(f"\n🎭 Simulating successful payment...")
    
    # Cập nhật trạng thái hóa đơn thành paid
    headers = {"Authorization": f"Bearer {token}"}
    invoice_update_data = {"status": "paid"}
    
    response = requests.patch(
        f"{API_BASE}/invoices/{invoice_id}/", 
        json=invoice_update_data, 
        headers=headers
    )
    
    if response.status_code == 200:
        print("✅ Invoice status updated to paid")
        
        # Cập nhật trạng thái booking thành checked_out
        if test_update_booking_status(token, booking_id, "checked_out"):
            print("✅ Booking status updated to checked_out")
        else:
            print("❌ Failed to update booking status")
    else:
        print(f"❌ Failed to update invoice status: {response.status_code}")
    
    # Bước 6: Kiểm tra kết quả cuối cùng
    print(f"\n🔍 Final status check...")
    
    # Kiểm tra booking
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{API_BASE}/bookings/{booking_id}/", headers=headers)
    if response.status_code == 200:
        final_booking = response.json()
        print(f"📋 Booking status: {final_booking['status']}")
    
    # Kiểm tra invoice
    response = requests.get(f"{API_BASE}/invoices/{invoice_id}/", headers=headers)
    if response.status_code == 200:
        final_invoice = response.json()
        print(f"🧾 Invoice status: {final_invoice['status']}")
    
    print("\n✅ Invoice workflow test completed!")

def test_frontend_urls():
    """Test các URL frontend"""
    print("\n🌐 Testing Frontend URLs")
    print("=" * 30)
    
    urls_to_test = [
        "/dashboard/booking",
        "/invoices/1",  # Thay đổi ID theo thực tế
        "/momo-return"
    ]
    
    for url in urls_to_test:
        full_url = f"{BASE_URL}{url}"
        try:
            response = requests.get(full_url, timeout=5)
            if response.status_code == 200:
                print(f"✅ {url} - OK")
            else:
                print(f"⚠️ {url} - Status: {response.status_code}")
        except requests.exceptions.RequestException as e:
            print(f"❌ {url} - Error: {e}")

if __name__ == "__main__":
    print("🧪 Invoice Workflow Test Suite")
    print("=" * 50)
    
    # Test backend workflow
    test_invoice_workflow()
    
    # Test frontend URLs
    test_frontend_urls()
    
    print("\n🎉 All tests completed!")
    print("\n📖 Check INVOICE_WORKFLOW_README.md for detailed usage instructions") 