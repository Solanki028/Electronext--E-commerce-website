'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';

export default function Pagination({ currentPage, totalPages, onPageChange, className }) {
  const pathname = usePathname() || '';
  const isLight = pathname.startsWith('/admin');

  if (totalPages <= 1) return null;

  const pages = [];
  const maxVisible = 5;
  let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  let end = Math.min(totalPages, start + maxVisible - 1);
  if (end - start < maxVisible - 1) start = Math.max(1, end - maxVisible + 1);

  for (let i = start; i <= end; i++) pages.push(i);

  const GOLD = '#b8976a';

  const baseStyle = {
    width: '38px', 
    height: '38px',
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center',
    fontFamily: "'Montserrat', sans-serif",
    fontSize: '0.8rem',
    fontWeight: 600,
    border: `1px solid ${isLight ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.08)'}`,
    background: 'transparent',
    color: isLight ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.5)',
    transition: 'all 0.3s ease',
    cursor: 'pointer'
  };

  const activeStyle = {
    ...baseStyle,
    background: GOLD,
    borderColor: GOLD,
    color: '#000'
  };

  const disabledStyle = {
    ...baseStyle,
    opacity: 0.3,
    cursor: 'not-allowed'
  };

  return (
    <div className={cn('flex items-center justify-center gap-2', className)}>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        style={currentPage === 1 ? disabledStyle : baseStyle}
        className={currentPage !== 1 ? "hover:border-[#b8976a] hover:text-[#b8976a]" : ""}
      >
        <ChevronLeft style={{ width: '16px', height: '16px' }} />
      </button>

      {start > 1 && (
        <>
          <button style={baseStyle} className="hover:border-[#b8976a] hover:text-[#b8976a]" onClick={() => onPageChange(1)}>1</button>
          {start > 2 && <span style={{ color: isLight ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.3)', padding: '0 4px', letterSpacing: '2px' }}>...</span>}
        </>
      )}

      {pages.map((page) => (
        <button
          key={page}
          style={page === currentPage ? activeStyle : baseStyle}
          className={page !== currentPage ? "hover:border-[#b8976a] hover:text-white" : ""}
          onClick={() => onPageChange(page)}
        >
          {page}
        </button>
      ))}

      {end < totalPages && (
        <>
          {end < totalPages - 1 && <span style={{ color: isLight ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.3)', padding: '0 4px', letterSpacing: '2px' }}>...</span>}
          <button style={baseStyle} className="hover:border-[#b8976a] hover:text-[#b8976a]" onClick={() => onPageChange(totalPages)}>
            {totalPages}
          </button>
        </>
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        style={currentPage === totalPages ? disabledStyle : baseStyle}
        className={currentPage !== totalPages ? "hover:border-[#b8976a] hover:text-[#b8976a]" : ""}
      >
        <ChevronRight style={{ width: '16px', height: '16px' }} />
      </button>
    </div>
  );
}
