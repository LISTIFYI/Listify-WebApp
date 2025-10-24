export const formatTime = (isoTime: string) => {
    if (!isoTime) return "";

    const date = new Date(isoTime);
    return date.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
        timeZone: "Asia/Kolkata",
    });
};
