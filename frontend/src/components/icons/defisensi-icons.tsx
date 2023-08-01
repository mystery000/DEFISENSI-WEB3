import { FC } from "react";

interface ThumbDownProps {
  className?: string;
  fill?: string;
}

export const ThumbsDown: FC<ThumbDownProps> = ({ className }) => {
  return (
    <svg
      className={className}
      version='1.1'
      width='36'
      height='36'
      viewBox='0 0 36 36'
      preserveAspectRatio='xMidYMid meet'
      xmlns='http://www.w3.org/2000/svg'
      xmlnsXlink='http://www.w3.org/1999/xlink'
    >
      <title>thumbs-down-line</title>
      <path d='M12,10c2.92-1.82,7.3-4,9.37-4h6a16.68,16.68,0,0,1,3.31,6.08A26.71,26.71,0,0,1,32,20H23V30a2.05,2.05,0,0,1-1.26,1.69c-.77-2-2.62-6.57-4.23-8.72A11.39,11.39,0,0,0,12,19.09v2.13a9.13,9.13,0,0,1,3.91,3c1.88,2.51,4.29,9.11,4.31,9.17a1,1,0,0,0,1.19.63C22.75,33.62,25,32.4,25,30V22h8a1,1,0,0,0,1-1,29,29,0,0,0-1.4-9.62c-1.89-5.4-4.1-7.14-4.2-7.22A1,1,0,0,0,27.79,4H21.37C18.94,4,14.83,6,12,7.63Z' />
      <path d='M2,5H9a1,1,0,0,1,1,1V22a1,1,0,0,1-1,1H2ZM8,7H4V21H8Z' />
      <rect x='0' y='0' width='36' height='36' fill-opacity='0' />
    </svg>
  );
};

export const ThumbsDownSolid: FC<ThumbDownProps> = ({ className, fill }) => {
  return (
    <svg
      className={className}
      version='1.1'
      width='36'
      height='36'
      viewBox='0 0 36 36'
      preserveAspectRatio='xMidYMid meet'
      xmlns='http://www.w3.org/2000/svg'
      xmlnsXlink='http://www.w3.org/1999/xlink'
      fill={fill}
    >
      <title>thumbs-down-solid</title>
      <path d='M16.37,23.84c2.12,2.84,4.76,10.07,4.76,10.07S24,33.13,24,30.71V21h9.77a29.46,29.46,0,0,0-1.44-9.74C30.39,5.68,28.2,4,28.2,4H21.35C19.1,4,15,5.9,12,7.65v12.8A10.84,10.84,0,0,1,16.37,23.84Z' />
      <path d='M9,23a1,1,0,0,0,1-1V6A1,1,0,0,0,9,5H2V23Z' />
      <rect x='0' y='0' width='36' height='36' fill-opacity='0' />
    </svg>
  );
};

interface ThumbUpProps {
  className?: string;
  fill?: string;
}

export const ThumbsUp: FC<ThumbUpProps> = ({ className }) => {
  return (
    <svg
      className={className}
      version='1.1'
      width='36'
      height='36'
      viewBox='0 0 36 36'
      preserveAspectRatio='xMidYMid meet'
      xmlns='http://www.w3.org/2000/svg'
      xmlnsXlink='http://www.w3.org/1999/xlink'
    >
      <title>thumbs-up-line</title>
      <path d='M24,26c-2.92,1.82-7.3,4-9.37,4h-6a16.68,16.68,0,0,1-3.31-6.08A26.71,26.71,0,0,1,4,16h9V6a2.05,2.05,0,0,1,1.26-1.69c.77,2,2.62,6.57,4.23,8.72A11.39,11.39,0,0,0,24,16.91V14.78a9.13,9.13,0,0,1-3.91-3c-1.88-2.51-4.29-9.11-4.31-9.17A1,1,0,0,0,14.59,2C13.25,2.38,11,3.6,11,6v8H3a1,1,0,0,0-1,1,29,29,0,0,0,1.4,9.62c1.89,5.4,4.1,7.14,4.2,7.22a1,1,0,0,0,.61.21h6.42c2.43,0,6.55-2,9.37-3.63Z' />
      <path d='M34,31H27a1,1,0,0,1-1-1V14a1,1,0,0,1,1-1h7Zm-6-2h4V15H28Z' />
      <rect x='0' y='0' width='36' height='36' fill-opacity='0' />
    </svg>
  );
};

export const ThumbsUpSolid: FC<ThumbUpProps> = ({ className, fill }) => {
  return (
    <svg
      className={className}
      version='1.1'
      width='36'
      height='36'
      viewBox='0 0 36 36'
      preserveAspectRatio='xMidYMid meet'
      xmlns='http://www.w3.org/2000/svg'
      xmlnsXlink='http://www.w3.org/1999/xlink'
      fill={fill}
    >
      <title>thumbs-up-solid</title>
      <path d='M19.63,12.12C17.51,9.28,14.88,2,14.88,2S12,2.83,12,5.25V15H2.23a29.46,29.46,0,0,0,1.44,9.74C5.61,30.27,7.8,32,7.8,32h6.86C16.9,32,21,30.06,24,28.31V15.51A10.84,10.84,0,0,1,19.63,12.12Z' />
      <path d='M27,13a1,1,0,0,0-1,1V30a1,1,0,0,0,1,1h7V13Z' />
      <rect x='0' y='0' width='36' height='36' fill-opacity='0' />
    </svg>
  );
};
interface ChatBubbleProps {
  className?: string;
  fill?: string;
}

export const ChatBubble: FC<ChatBubbleProps> = ({ className }) => {
  return (
    <svg
      className={className}
      version='1.1'
      width='36'
      height='36'
      viewBox='0 0 36 36'
      preserveAspectRatio='xMidYMid meet'
      xmlns='http://www.w3.org/2000/svg'
      xmlnsXlink='http://www.w3.org/1999/xlink'
    >
      <title>chat-bubble-line</title>
      <path d='M18,2.5c-8.82,0-16,6.28-16,14s7.18,14,16,14a18,18,0,0,0,4.88-.68l5.53,3.52a1,1,0,0,0,1.54-.84l0-6.73a13,13,0,0,0,4-9.27C34,8.78,26.82,2.5,18,2.5ZM28.29,24.61a1,1,0,0,0-.32.73l0,5.34-4.38-2.79a1,1,0,0,0-.83-.11A16,16,0,0,1,18,28.5c-7.72,0-14-5.38-14-12s6.28-12,14-12,14,5.38,14,12A11.08,11.08,0,0,1,28.29,24.61Z' />
      <path d='M25,15.5H11a1,1,0,0,0,0,2H25a1,1,0,0,0,0-2Z' />
      <path d='M21.75,20.5h-7.5a1,1,0,0,0,0,2h7.5a1,1,0,0,0,0-2Z' />
      <path d='M11.28,12.5H24.72a1,1,0,0,0,0-2H11.28a1,1,0,0,0,0,2Z' />
      <rect x='0' y='0' width='36' height='36' fill-opacity='0' />
    </svg>
  );
};
export const ChatBubbleSolid: FC<ChatBubbleProps> = ({ className, fill }) => {
  return (
    <svg
      className={className}
      version='1.1'
      width='36'
      height='36'
      viewBox='0 0 36 36'
      preserveAspectRatio='xMidYMid meet'
      xmlns='http://www.w3.org/2000/svg'
      xmlnsXlink='http://www.w3.org/1999/xlink'
      fill={fill}
    >
      <title>chat-bubble-solid</title>
      <path d='M18,2.5c-8.82,0-16,6.28-16,14s7.18,14,16,14a18,18,0,0,0,4.88-.68l5.53,3.52a1,1,0,0,0,1.54-.84l0-6.73a13,13,0,0,0,4-9.27C34,8.78,26.82,2.5,18,2.5Zm8,14a1,1,0,0,1-1,1H11a1,1,0,0,1,0-2H25A1,1,0,0,1,26,16.5Zm-3.25,5a1,1,0,0,1-1,1h-7.5a1,1,0,0,1,0-2h7.5A1,1,0,0,1,22.75,21.5Zm-12.47-10a1,1,0,0,1,1-1H24.72a1,1,0,0,1,0,2H11.28A1,1,0,0,1,10.28,11.5Z' />
      <rect x='0' y='0' width='36' height='36' fill-opacity='0' />
    </svg>
  );
};
