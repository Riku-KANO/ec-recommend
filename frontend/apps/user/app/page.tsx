import Link from 'next/link';

export default function Home() {
  return (
    <div className='bg-gray-50'>
      {/* Hero Section */}
      <section className='bg-white'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20'>
          <div className='text-center'>
            <h1 className='text-4xl md:text-6xl font-bold text-gray-900 mb-6'>
              あなたにぴったりの商品を
              <span className='text-blue-600 block'>見つけよう</span>
            </h1>
            <p className='text-xl text-gray-600 mb-8 max-w-3xl mx-auto'>
              AIが学習するあなたの好みに基づいて、パーソナライズされたショッピング体験をお届けします
            </p>
            <div className='flex flex-col sm:flex-row gap-4 justify-center'>
              <Link
                href='/search'
                className='bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors'
              >
                商品を探す
              </Link>
              <Link
                href='/categories'
                className='border border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors'
              >
                カテゴリを見る
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className='py-16'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <h2 className='text-3xl font-bold text-gray-900 text-center mb-12'>
            人気カテゴリ
          </h2>
          <div className='grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6'>
            {[
              { name: 'ファッション', icon: '👗', color: 'bg-pink-100' },
              { name: '家電・デジタル', icon: '📱', color: 'bg-blue-100' },
              { name: 'ホーム・キッチン', icon: '🏠', color: 'bg-green-100' },
              { name: '本・メディア', icon: '📚', color: 'bg-purple-100' },
              { name: 'スポーツ', icon: '⚽', color: 'bg-orange-100' },
              { name: 'ビューティー', icon: '💄', color: 'bg-rose-100' },
            ].map(category => (
              <Link
                key={category.name}
                href={`/categories/${category.name}`}
                className={`${category.color} p-6 rounded-lg text-center hover:shadow-md transition-shadow`}
              >
                <div className='text-4xl mb-3'>{category.icon}</div>
                <h3 className='font-medium text-gray-900'>{category.name}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className='bg-white py-16'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <h2 className='text-3xl font-bold text-gray-900 text-center mb-12'>
            ECレコメンドの特徴
          </h2>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
            <div className='text-center'>
              <div className='w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                <svg
                  className='w-8 h-8 text-blue-600'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z'
                  />
                </svg>
              </div>
              <h3 className='text-xl font-semibold text-gray-900 mb-2'>
                AIレコメンド
              </h3>
              <p className='text-gray-600'>
                あなたの購買履歴や閲覧履歴を分析し、最適な商品をおすすめします
              </p>
            </div>
            <div className='text-center'>
              <div className='w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                <svg
                  className='w-8 h-8 text-green-600'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z'
                  />
                </svg>
              </div>
              <h3 className='text-xl font-semibold text-gray-900 mb-2'>
                安全な決済
              </h3>
              <p className='text-gray-600'>
                最新のセキュリティ技術で、お客様の決済情報を安全に保護します
              </p>
            </div>
            <div className='text-center'>
              <div className='w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                <svg
                  className='w-8 h-8 text-purple-600'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M13 10V3L4 14h7v7l9-11h-7z'
                  />
                </svg>
              </div>
              <h3 className='text-xl font-semibold text-gray-900 mb-2'>
                高速配送
              </h3>
              <p className='text-gray-600'>
                全国どこでも迅速にお届け。お急ぎの場合は当日配送も可能です
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Recommended Products Placeholder */}
      <section className='py-16'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <h2 className='text-3xl font-bold text-gray-900 text-center mb-12'>
            あなたへのおすすめ
          </h2>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'>
            {[1, 2, 3, 4].map(i => (
              <div
                key={i}
                className='bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden'
              >
                <div className='w-full h-48 bg-gray-200 flex items-center justify-center'>
                  <span className='text-gray-400'>商品画像</span>
                </div>
                <div className='p-4'>
                  <h3 className='font-medium text-gray-900 mb-2'>商品名 {i}</h3>
                  <p className='text-gray-600 text-sm mb-2'>
                    商品の説明文がここに入ります
                  </p>
                  <div className='flex items-center justify-between'>
                    <span className='text-lg font-bold text-gray-900'>
                      ¥{(1000 * i).toLocaleString()}
                    </span>
                    <button className='bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors'>
                      詳細を見る
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className='text-center mt-8'>
            <Link
              href='/search'
              className='inline-block bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors'
            >
              もっと見る
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
