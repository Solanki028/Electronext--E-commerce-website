import HeroBanner from '@/components/home/HeroBanner';
import FeatureOverview from '@/components/home/FeatureOverview';
import GridCollage from '@/components/home/GridCollage';
import CategoryGrid from '@/components/home/CategoryGrid';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import DealOfTheDay from '@/components/home/DealOfTheDay';
import ApplianceShowcase from '@/components/home/ApplianceShowcase';
import AnimatedShowcase from '@/components/home/AnimatedShowcase';

async function getHomepageData() {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
  try {
    const [bannersRes, categoriesRes, dealsRes, newArrivalsRes, featuredRes] = await Promise.all([
      fetch(`${baseUrl}/banners`, { next: { revalidate: 300 } }).then(r => r.json()).catch(() => null),
      fetch(`${baseUrl}/categories?limit=50`, { next: { revalidate: 3600 } }).then(r => r.json()).catch(() => null),
      fetch(`${baseUrl}/products?sort=-discountPercent&limit=4&minDiscount=20`, { next: { revalidate: 300 } }).then(r => r.json()).catch(() => null),
      fetch(`${baseUrl}/products?sort=-createdAt&limit=4`, { next: { revalidate: 300 } }).then(r => r.json()).catch(() => null),
      fetch(`${baseUrl}/products?isFeatured=true&limit=8`, { next: { revalidate: 300 } }).then(r => r.json()).catch(() => null)
    ]);
    return {
      banners: bannersRes?.data || [],
      categories: categoriesRes?.data || [],
      deals: dealsRes?.data?.products || [],
      newArrivals: newArrivalsRes?.data?.products || [],
      featured: featuredRes?.data?.products || []
    };
  } catch {
    return { banners: [], categories: [], deals: [], newArrivals: [], featured: [] };
  }
}

export default async function HomePage() {
  const { banners, categories, deals, newArrivals, featured } = await getHomepageData();

  return (
    <div className="bg-[#080808] min-h-screen pb-16 overflow-x-hidden w-full max-w-[100vw] relative">
      <HeroBanner initialBanners={banners} />
      <FeatureOverview />
      <GridCollage />

      <div className="space-y-20 mt-16">
        <CategoryGrid initialCategories={categories} />

        {/* New animated section for random products */}
        <AnimatedShowcase initialProducts={newArrivals} />
        <ApplianceShowcase initialCategories={categories} />
        <FeaturedProducts initialProducts={featured} />

        {/* New categories for appliances */}


        <DealOfTheDay initialDeals={deals} />
      </div>
    </div>
  );
}
