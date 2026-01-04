export function formatMessageTime(date) {
    const d = date ? new Date(date) : null;
    if (!d || isNaN(d.getTime())) return '';
    return d.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    });
}