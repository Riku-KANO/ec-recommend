'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className='sticky top-0 z-50 bg-white shadow-sm border-b'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex items-center justify-between h-16'>
          {/* Logo */}
          <div className='flex-shrink-0'>
            <Link href='/' className='text-xl font-bold text-gray-900'>
              ECレコメンド
            </Link>
          </div>

          {/* Search Bar */}
          <div className='flex-1 max-w-lg mx-8'>
            <div className='relative'>
              <input
                type='text'
                placeholder='商品を検索...'
                className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              />
              <button className='absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600'>
                <svg
                  className='w-5 h-5'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className='hidden md:flex items-center space-x-6'>
            <Link
              href='/categories'
              className='text-gray-700 hover:text-gray-900'
            >
              カテゴリ
            </Link>
            <Link
              href='/cart'
              className='relative text-gray-700 hover:text-gray-900'
            >
              <svg
                className='w-6 h-6'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m8.5-5a2 2 0 104 0 2 2 0 00-4 0zm-10 0a2 2 0 104 0 2 2 0 00-4 0z'
                />
              </svg>
              <span className='absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center'>
                0
              </span>
            </Link>
            <Link href='/profile' className='text-gray-700 hover:text-gray-900'>
              <svg
                className='w-6 h-6'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
                />
              </svg>
            </Link>
          </nav>

          {/* Mobile menu button */}
          <div className='md:hidden'>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className='text-gray-700 hover:text-gray-900'
            >
              <svg
                className='w-6 h-6'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M4 6h16M4 12h16M4 18h16'
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className='md:hidden py-4 border-t'>
            <div className='flex flex-col space-y-3'>
              <Link
                href='/categories'
                className='text-gray-700 hover:text-gray-900'
              >
                カテゴリ
              </Link>
              <Link href='/cart' className='text-gray-700 hover:text-gray-900'>
                カート
              </Link>
              <Link
                href='/profile'
                className='text-gray-700 hover:text-gray-900'
              >
                プロフィール
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
