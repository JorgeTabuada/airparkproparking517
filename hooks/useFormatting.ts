import { LOCALE_CONFIG } from '../lib/theme';

export function useFormatting() {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(LOCALE_CONFIG.locale, {
      style: 'currency',
      currency: LOCALE_CONFIG.currency,
    }).format(value);
  };

  const formatDate = (date: string | Date, format: 'short' | 'long' | 'full' = 'short') => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    const options: Intl.DateTimeFormatOptions = {
      timeZone: LOCALE_CONFIG.timezone,
    };

    switch (format) {
      case 'short':
        options.day = '2-digit';
        options.month = '2-digit';
        options.year = 'numeric';
        break;
      case 'long':
        options.day = '2-digit';
        options.month = 'long';
        options.year = 'numeric';
        break;
      case 'full':
        options.day = '2-digit';
        options.month = 'long';
        options.year = 'numeric';
        options.hour = '2-digit';
        options.minute = '2-digit';
        break;
    }

    return new Intl.DateTimeFormat(LOCALE_CONFIG.locale, options).format(dateObj);
  };

  const formatDateTime = (date: string | Date) => {
    return formatDate(date, 'full');
  };

  const formatPhone = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 9) {
      return `+351 ${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
    }
    return phone;
  };

  return {
    formatCurrency,
    formatDate,
    formatDateTime,
    formatPhone,
  };
}