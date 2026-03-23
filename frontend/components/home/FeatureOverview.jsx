import { Truck, ShieldCheck, RotateCcw, Headphones } from 'lucide-react';

const features = [
  { icon: Truck, label: 'Free Delivery', sub: 'On orders over ₹999' },
  { icon: ShieldCheck, label: 'Secure Payments', sub: '100% protected' },
  { icon: RotateCcw, label: 'Easy Returns', sub: '7-day hassle-free' },
  { icon: Headphones, label: '24/7 Support', sub: 'Always here to help' },
];

export default function FeatureOverview() {
  return (
    <section className="container-custom relative z-10 -mt-8 md:-mt-12">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 bg-white/80 backdrop-blur-md p-4 md:p-6 rounded-2xl border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-slate-900/5">
        {features.map(({ icon: Icon, label, sub }) => (
          <div key={label} className="flex flex-col md:flex-row items-center md:items-start gap-4 p-4 rounded-xl hover:bg-slate-50/50 transition-colors group">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-50 to-indigo-50 rounded-full flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:shadow-sm transition-all duration-300">
              <Icon className="w-6 h-6 text-primary-600" />
            </div>
            <div className="text-center md:text-left">
              <h3 className="text-sm font-bold text-slate-900 mb-1">{label}</h3>
              <p className="text-xs text-slate-500 font-medium">{sub}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
