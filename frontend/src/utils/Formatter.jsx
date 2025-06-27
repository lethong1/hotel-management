export const formatVNDateTime = (isoString) => {
    // Trả về chuỗi rỗng nếu đầu vào không hợp lệ
    if (!isoString) return "";

    const date = new Date(isoString);

    if (isNaN(date.getTime())) {
        return "Ngày không hợp lệ";
    }

    const options = {
        timeZone: 'Asia/Ho_Chi_Minh', 
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

    return `${partValue('day')}/${partValue('month')}/${partValue('year')}`;
};

export const formatCurrency = (amount) => {
    if (amount === null || amount === undefined || amount === "") return "0 ₫";
    
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    
    if (isNaN(numAmount)) return "0 ₫";
    
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(numAmount);
};