#!/usr/bin/env python
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hotel_management.settings')
django.setup()

from invoices.models import Invoice
from django.db import transaction

def fix_invoice_created_by():
    """Fix created_by cho các invoice hiện có"""
    with transaction.atomic():
        fixed_count = 0
        invoices_without_created_by = Invoice.objects.filter(created_by__isnull=True)
        
        print(f"Tìm thấy {invoices_without_created_by.count()} invoice không có created_by")
        
        for invoice in invoices_without_created_by:
            if invoice.booking.created_by:
                print(f"Fixing invoice {invoice.id} - Booking created by: {invoice.booking.created_by.full_name}")
                invoice.created_by = invoice.booking.created_by
                invoice.save(update_fields=['created_by'])
                fixed_count += 1
            else:
                print(f"Invoice {invoice.id} - Booking không có created_by")
        
        print(f"Đã fix {fixed_count} invoice")
        return fixed_count

if __name__ == "__main__":
    fix_invoice_created_by() 