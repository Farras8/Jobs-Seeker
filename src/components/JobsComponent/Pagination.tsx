import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const pageNumbers = [];
  const maxPagesToShow = 5; // Max page numbers to show directly (e.g., 1 ... 4 5 6 ... 10)
  
  let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
  let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

  if (endPage - startPage + 1 < maxPagesToShow) {
    startPage = Math.max(1, endPage - maxPagesToShow + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  const renderPageButton = (page: number | string, isActive: boolean, isDisabled: boolean, key: string | number) => (
    <button
      key={key}
      onClick={() => typeof page === 'number' && onPageChange(page)}
      disabled={isDisabled || typeof page !== 'number'}
      className={`mx-1 px-3 py-2 min-w-[36px] text-sm font-medium rounded-md transition-colors
        ${isActive ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'}
        ${isDisabled || typeof page !== 'number' ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      {page}
    </button>
  );

  return (
    <nav className="mt-10 flex flex-col sm:flex-row justify-between items-center" aria-label="Paginasi">
      <p className="text-sm text-gray-600 mb-3 sm:mb-0">
        Halaman <span className="font-semibold">{currentPage}</span> dari <span className="font-semibold">{totalPages}</span>
      </p>
      <div className="flex items-center">
        {currentPage > 1 && (
            <>
            <button
                onClick={() => onPageChange(1)}
                disabled={currentPage === 1}
                className="p-2 rounded-md text-gray-500 hover:bg-gray-100 hover:text-blue-600 disabled:opacity-50 transition-colors"
                title="Halaman Pertama"
            >
                <ChevronsLeft size={20} />
            </button>
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-md text-gray-500 hover:bg-gray-100 hover:text-blue-600 disabled:opacity-50 transition-colors"
                title="Halaman Sebelumnya"
            >
                <ChevronLeft size={20} />
            </button>
            </>
        )}

        {startPage > 1 && renderPageButton(1, false, false, 'first')}
        {startPage > 2 && <span className="px-2 py-1 text-gray-500">...</span>}

        {pageNumbers.map(number => renderPageButton(number, currentPage === number, false, number))}

        {endPage < totalPages -1 && <span className="px-2 py-1 text-gray-500">...</span>}
        {endPage < totalPages && renderPageButton(totalPages, false, false, 'last')}
        
        {currentPage < totalPages && (
            <>
            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-md text-gray-500 hover:bg-gray-100 hover:text-blue-600 disabled:opacity-50 transition-colors"
                title="Halaman Berikutnya"
            >
                <ChevronRight size={20} />
            </button>
            <button
                onClick={() => onPageChange(totalPages)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-md text-gray-500 hover:bg-gray-100 hover:text-blue-600 disabled:opacity-50 transition-colors"
                title="Halaman Terakhir"
            >
                <ChevronsRight size={20} />
            </button>
            </>
        )}
      </div>
    </nav>
  );
};

export default Pagination;
