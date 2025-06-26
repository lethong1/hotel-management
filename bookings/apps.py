from django.apps import AppConfig


class BookingsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'bookings'
    def ready(self):
        """
        Phương thức này sẽ được gọi khi Django khởi động.
        Đây là nơi tốt nhất để import các signal.
        """
        import bookings.signals 