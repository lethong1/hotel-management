export const formatVNDateTime = (isoString) => {
    // Trả về chuỗi rỗng nếu đầu vào không hợp lệ
    if (!isoString) return "";

    const date = new Date(isoString);

    // Kiểm tra xem date có hợp lệ không
    if (isNaN(date.getTime())) {
        return "Ngày không hợp lệ";
    }

    const options = {
        timeZone: 'Asia/Ho_Chi_Minh', // Luôn hiển thị theo giờ Việt Nam
        weekday: 'long', 
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    };

    const formatter = new Intl.DateTimeFormat('vi-VN', options);

    const parts = formatter.formatToParts(date);
    const partValue = (type) => parts.find(part => part.type === type)?.value || '';

    // Sắp xếp lại thành chuỗi "HH:mm, Thứ X, ngày dd/MM/yyyy"
    return `${partValue('day')}/${partValue('month')}/${partValue('year')}`;
};

// Bạn có thể thêm các hàm định dạng khác ở đây, ví dụ định dạng tiền tệ
export const formatCurrency = (amount) => {
    if (typeof amount !== 'number') return "";
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};