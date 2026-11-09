import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { BLOG_POSTS } from '../data/academyData';
import { BlogPost } from '../types';
import { BookOpen, Clock, Calendar, ArrowRight, X } from 'lucide-react';

interface BlogPageProps {
  navigate: (route: string) => void;
}

export const BlogPage: React.FC<BlogPageProps> = ({ navigate }) => {
  const { t, language } = useLanguage();
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

  return (
    <div className="min-h-screen bg-[#FAF8F5] py-12">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="text-center max-w-3xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-[#D4AF37]">
            English Zone Faculty Insights
          </span>
          <h1 className="font-serif-luxury font-bold text-3xl sm:text-5xl text-[#0A192F] mt-2">
            {t.blog.title}
          </h1>
          <p className="text-base sm:text-lg text-gray-600 mt-4 leading-relaxed">
            {t.blog.subtitle}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {BLOG_POSTS.map((post) => (
            <article 
              key={post.id}
              className="bg-white rounded-3xl overflow-hidden border border-[#D4AF37]/30 shadow-md hover:border-[#D4AF37] transition-all flex flex-col justify-between"
            >
              <div>
                <div className="relative h-48 overflow-hidden bg-gray-100">
                  <img 
                    src={post.imageUrl} 
                    alt={post.titleEn}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <span className="absolute top-4 left-4 rtl:left-auto rtl:right-4 px-3 py-1 rounded-full bg-[#0A192F]/90 text-[#F3E5AB] text-[11px] font-bold">
                    {language === 'ar' ? post.categoryAr : post.categoryEn}
                  </span>
                </div>

                <div className="p-6">
                  <div className="flex items-center gap-4 text-xs text-gray-400 mb-3">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{post.publishDate}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{post.readTime}</span>
                    </span>
                  </div>

                  <h2 className="font-serif-luxury font-bold text-lg text-[#0A192F] line-clamp-2 mb-3">
                    {language === 'ar' ? post.titleAr : post.titleEn}
                  </h2>

                  <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">
                    {language === 'ar' ? post.excerptAr : post.excerptEn}
                  </p>
                </div>
              </div>

              <div className="p-6 pt-0 border-t border-gray-100">
                <button
                  onClick={() => setSelectedPost(post)}
                  className="w-full py-2.5 rounded-xl text-xs font-bold bg-[#FAF8F5] text-[#0A192F] hover:bg-[#0A192F] hover:text-[#F3E5AB] transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>{t.blog.readMore}</span>
                  <ArrowRight className={`w-3.5 h-3.5 ${language === 'ar' ? 'rotate-180' : ''}`} />
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Article Reading Modal */}
      {selectedPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={() => setSelectedPost(null)}
              className="absolute top-6 right-6 rtl:right-auto rtl:left-6 p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
            >
              <X className="w-5 h-5" />
            </button>

            <span className="text-xs font-bold text-[#AA820A] uppercase tracking-wider">
              {language === 'ar' ? selectedPost.categoryAr : selectedPost.categoryEn}
            </span>

            <h2 className="font-serif-luxury font-bold text-2xl text-[#0A192F] mt-2 mb-4">
              {language === 'ar' ? selectedPost.titleAr : selectedPost.titleEn}
            </h2>

            <div className="flex items-center gap-4 text-xs text-gray-400 mb-6 pb-4 border-b border-gray-100">
              <span>{selectedPost.publishDate}</span>
              <span>•</span>
              <span>{selectedPost.readTime}</span>
            </div>

            <div className="text-sm sm:text-base text-gray-700 leading-relaxed space-y-4">
              <p>{language === 'ar' ? selectedPost.contentAr : selectedPost.contentEn}</p>
              <p className="text-gray-500 italic text-xs pt-4 border-t border-gray-100">
                {language === 'ar' 
                  ? 'كتب هذا المقال بواسطة هيئة التدريس في أكاديمية English Zone الدولية.'
                  : 'Published by the Academic Faculty at English Zone International Academy.'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
