export const formatAmount = (amount: number): string => {
    if (amount >= 10000000) {
        const value = amount / 10000000;
        return `${value % 1 === 0 ? value.toFixed(0) : value.toFixed(1)} Cr`;
    } else if (amount >= 100000) {
        const value = amount / 100000;
        return `${value % 1 === 0 ? value.toFixed(0) : value.toFixed(1)} Lac`;
    } else if (amount >= 1000) {
        const value = amount / 1000;
        return `${value % 1 === 0 ? value.toFixed(0) : value.toFixed(1)} K`;
    } else {
        return amount.toString();
    }
};

export const formatIndianCurrency = (amount: string | number): string => {
    const formatter = new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    });
    return formatter.format(Number(amount)).replace("₹ ", "₹ ");
};