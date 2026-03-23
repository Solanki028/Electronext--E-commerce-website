import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export default function GridCollage() {
  return (
    <section className="container-custom py-16">
      <div className="flex flex-col md:flex-row justify-between items-end mb-10">
        <div className="max-w-xl">
          <h2 className="text-3xl md:text-5xl font-black mb-4 tracking-tight text-white">Curated For You</h2>
          <p className="text-slate-400 text-sm md:text-lg">
            Experience the perfect blend of innovation and aesthetics with our top peripheral lines.
          </p>
        </div>
        <Button variant="ghost" className="mt-4 md:mt-0 text-primary-600 hover:text-primary-800 hover:bg-primary-50">
          <Link href="/products" className="flex items-center gap-2">
            Explore Collection <ArrowRight className="w-4 h-4" />
          </Link>
        </Button>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-12 gap-3 md:gap-6 auto-rows-[clamp(180px,40vw,300px)]">
        
        {/* Large Main Feature */}
        <div className="col-span-8 relative rounded-2xl md:rounded-3xl overflow-hidden group">
          <Image 
            src="/images/mockups/collage_laptop_1773930224756.png" 
            alt="Premium Workspace" 
            fill 
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8 md:p-12">
            <span className="bg-amber-500 text-slate-900 text-[9px] md:text-xs font-bold px-2 py-1 md:px-3 rounded-full w-fit mb-2 md:mb-4">Laptops</span>
            <h3 className="text-lg md:text-3xl lg:text-4xl font-bold text-white mb-1 md:mb-3 leading-tight">Power Meets<br className="block sm:hidden"/> Elegance</h3>
            <p className="text-slate-300 max-w-md hidden sm:block text-xs md:text-sm">
              Discover unparalleled performance encased in ultra-thin, premium aluminum bodies.
            </p>
          </div>
        </div>

        {/* Secondary Feature 1 */}
        <div className="col-span-4 relative rounded-2xl md:rounded-3xl overflow-hidden group">
          <Image 
            src="/images/mockups/collage_headphones_1773930206052.png" 
            alt="Audio Serenity" 
            fill 
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4 md:p-8 text-white">
            <h3 className="text-sm md:text-2xl font-bold mb-1 md:mb-2 leading-tight">Sonic<br className="block sm:hidden"/> Perfection</h3>
            <p className="text-slate-300 text-[10px] md:text-sm">Immerse yourself.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
