import React from 'react';
import { User } from '../types';

interface ContactButtonsProps {
  user: User;
  inquiryText?: string;
  size?: 'sm' | 'md';
  iconOnly?: boolean;
}

export const ContactButtons: React.FC<ContactButtonsProps> = ({
  user,
  inquiryText = 'Hello, I am inquiring about the luxury residence.',
  size = 'md',
  iconOnly = false,
}) => {
  const whatsappNumber = user.whatsapp || user.phone?.replace(/[^0-9]/g, '') || '';
  const telegramHandle = user.telegram || user.name.toLowerCase().replace(/[^a-z0-9]/g, '_');

  const encodedText = encodeURIComponent(inquiryText);
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedText}`;
  const telegramUrl = `https://t.me/${telegramHandle}`;

  const isSmall = size === 'sm';

  return (
    <div className="flex items-center space-x-1.5">
      {/* WhatsApp Button */}
      {whatsappNumber && (
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`flex items-center justify-center gap-1.5 rounded-lg font-medium text-white shadow-sm transition bg-[#25D366] hover:bg-[#20bd5a] active:scale-95 ${
            iconOnly
              ? isSmall
                ? 'w-7 h-7 p-1'
                : 'w-8 h-8 p-1.5'
              : isSmall
              ? 'px-2.5 py-1 text-[11px]'
              : 'px-3 py-1.5 text-xs'
          }`}
          title={`Open WhatsApp chat with ${user.name}`}
        >
          {/* WhatsApp SVG Icon */}
          <svg className={isSmall ? 'w-3.5 h-3.5' : 'w-4 h-4'} fill="currentColor" viewBox="0 0 24 24">
            <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.699c.971.53 1.936.814 2.796.814 3.18 0 5.767-2.586 5.767-5.766.001-3.18-2.585-5.766-5.767-5.766zm3.376 8.21c-.14.394-.712.753-1.023.79-.311.036-.677.164-2.194-.465-1.517-.629-2.533-2.164-2.61-2.267-.077-.103-.616-.821-.616-1.565 0-.745.388-1.111.526-1.264.138-.154.301-.192.403-.192.102 0 .204 0 .294.004.094.004.22.02.327.272.115.27.388.948.423 1.018.035.07.058.152.012.244-.047.092-.07.15-.14.233-.07.082-.148.183-.211.246-.07.07-.143.146-.062.285.082.14.364.6.782.972.539.479.993.627 1.133.697.14.07.222.059.304-.035.082-.094.351-.41.445-.551.094-.14.187-.117.316-.07.129.047.818.386.959.456.14.07.234.105.269.164.035.059.035.34-.105.734zM12 2C6.477 2 2 6.477 2 12c0 1.891.527 3.66 1.443 5.176L2 22l4.981-1.306C8.42 21.532 10.15 22 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18.2c-1.637 0-3.155-.495-4.426-1.347l-.317-.212-2.956.775.789-2.883-.232-.369C3.966 14.856 3.4 13.486 3.4 12c0-4.743 3.857-8.6 8.6-8.6s8.6 3.857 8.6 8.6-3.857 8.6-8.6 8.6z" />
          </svg>
          {!iconOnly && <span>WhatsApp</span>}
        </a>
      )}

      {/* Telegram Button */}
      {telegramHandle && (
        <a
          href={telegramUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`flex items-center justify-center gap-1.5 rounded-lg font-medium text-white shadow-sm transition bg-[#229ED9] hover:bg-[#1e8cc0] active:scale-95 ${
            iconOnly
              ? isSmall
                ? 'w-7 h-7 p-1'
                : 'w-8 h-8 p-1.5'
              : isSmall
              ? 'px-2.5 py-1 text-[11px]'
              : 'px-3 py-1.5 text-xs'
          }`}
          title={`Open Telegram chat with ${user.name}`}
        >
          {/* Telegram SVG Icon */}
          <svg className={isSmall ? 'w-3.5 h-3.5' : 'w-4 h-4'} fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
          </svg>
          {!iconOnly && <span>Telegram</span>}
        </a>
      )}
    </div>
  );
};
