'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Image from 'next/image';
import { MapPin, CreditCard, ChevronRight, Loader2, Shield, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { addressSchema } from '@/lib/validators';
import { formatPrice } from '@/lib/formatters';
import { orderService } from '@/services/orderService';
import useCart from '@/hooks/useCart';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '@/store/slices/authSlice';
import { toast } from 'sonner';

const STEPS = ['Address', 'Review', 'Payment'];
const GOLD = '#b8976a';

export default function CheckoutPage() {
  const router = useRouter();
  const user = useSelector(selectCurrentUser);
  const { items, subtotal, total, couponDiscount, fetchCart } = useCart();
  const [step, setStep] = useState(0);
  const [shippingAddress, setShippingAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [placing, setPlacing] = useState(false);

  useEffect(() => { fetchCart(); }, [fetchCart]);
  useEffect(() => { if (items.length === 0 && !placing) router.push('/cart'); }, [items, placing, router]);

  const defaultAddr = user?.addresses?.find(a => a.isDefault) || user?.addresses?.[0];

  const { register, handleSubmit, formState: { errors }, setValue } = useForm({
    resolver: zodResolver(addressSchema),
    defaultValues: defaultAddr || {
      fullName: user?.name || '',
      phone: user?.phone || '',
      country: 'India',
    }
  });

  const onAddressSubmit = (data) => {
    setShippingAddress(data);
    setStep(1);
  };

  const handlePlaceOrder = async () => {
    setPlacing(true);
    try {
      const result = await orderService.createOrder(shippingAddress, paymentMethod);
      toast.success('Order placed securely.', { style: { background: '#111', color: GOLD, border: `1px solid ${GOLD}` }});
      router.push(`/orders/${result.data._id}`);
    } catch (err) {
      const errorMsg = err?.response?.data?.errors?.[0] ? `${err.response.data.errors[0].field}: ${err.response.data.errors[0].message}` : (err?.response?.data?.message || 'Failed to process order');
      toast.error(errorMsg, { style: { background: '#111', color: '#ff4d4f', border: '1px solid #ff4d4f' }});
      setPlacing(false);
    }
  };

  const shippingCost = subtotal >= 999 ? 0 : 49;
  const tax = Math.round(total * 0.18 * 100) / 100;
  const grandTotal = Math.round((total + shippingCost + tax) * 100) / 100;

  return (
    <div style={{ background: '#080808', minHeight: '100vh', paddingTop: '1px' }}>
      <div className="container-custom py-12 max-w-6xl">
        <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', fontWeight: 300, color: 'white', lineHeight: 1, letterSpacing: '-0.02em', marginBottom: '2rem' }}>
          Secure Checkout
        </h1>

        {/* Premium Step Indicator */}
        <div className="flex items-center gap-2 mb-12">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center group">
              <div 
                className="flex items-center justify-center transition-all duration-300"
                style={{ 
                  width: '32px', height: '32px', borderRadius: '50%',
                  fontFamily: "'Montserrat', sans-serif", fontSize: '0.75rem', fontWeight: 600,
                  background: i === step ? GOLD : i < step ? 'rgba(184,151,106,0.1)' : 'transparent',
                  color: i === step ? '#000' : i < step ? GOLD : 'rgba(255,255,255,0.3)',
                  border: `1px solid ${i <= step ? GOLD : 'rgba(255,255,255,0.1)'}` 
                }}
              >
                {i + 1}
              </div>
              <span 
                className="ml-3 transition-colors duration-300"
                style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: i <= step ? 'white' : 'rgba(255,255,255,0.3)', fontWeight: i === step ? 600 : 400 }}
              >
                {s}
              </span>
              {i < STEPS.length - 1 && <ChevronRight style={{ width: '16px', height: '16px', color: 'rgba(255,255,255,0.1)', margin: '0 1rem' }} />}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-8">
            
            {/* Step 0: Address */}
            {step === 0 && (
              <div style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.05)', padding: '2.5rem' }}>
                <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.8rem', color: 'white', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '2rem' }}>
                  <MapPin style={{ width: '20px', height: '20px', color: GOLD }} /> 
                  Delivery Details
                </h2>

                {user?.addresses?.length > 0 && (
                  <div className="mb-8">
                    <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '0.65rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '1rem' }}>Saved Profiles</p>
                    <div className="space-y-3">
                      {user.addresses.map((addr, i) => (
                        <button 
                          key={i} type="button"
                          onClick={() => { Object.entries(addr).forEach(([k,v]) => setValue(k, v)); }}
                          className="w-full text-left p-4 transition-all duration-300 group"
                          style={{ border: '1px solid rgba(255,255,255,0.05)', background: 'transparent' }}
                        >
                          <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '0.85rem', color: 'white', fontWeight: 500, marginBottom: '4px' }}>{addr.fullName}</p>
                          <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.6 }}>{addr.street}, {addr.city}, {addr.state} {addr.zipCode}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit(onAddressSubmit)} className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {[
                    { name: 'fullName', label: 'Full Name', span: false },
                    { name: 'phone', label: 'Phone Number', span: false },
                    { name: 'street', label: 'Street Address', span: true },
                    { name: 'city', label: 'City', span: false },
                    { name: 'state', label: 'State', span: false },
                    { name: 'zipCode', label: 'Postal Code', span: false },
                    { name: 'country', label: 'Country', span: false },
                  ].map(({ name, label, span }) => (
                    <div key={name} className={span ? 'sm:col-span-2' : ''}>
                      <Label htmlFor={name} style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '0.65rem', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{label}</Label>
                      <Input 
                        id={name} {...register(name)} 
                        className="mt-2 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0" 
                        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', height: '48px', fontFamily: "'Montserrat', sans-serif", borderColor: errors[name] ? '#ff4d4f' : 'rgba(255,255,255,0.1)' }} 
                      />
                      {errors[name] && <p className="text-xs text-red-500 mt-1" style={{ fontFamily: "'Montserrat', sans-serif" }}>{errors[name].message}</p>}
                    </div>
                  ))}
                  <div className="sm:col-span-2 pt-4">
                    <Button 
                      type="submit" 
                      className="w-full rounded-none hover:opacity-90"
                      style={{ background: GOLD, color: '#000', fontFamily: "'Montserrat', sans-serif", fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', height: '56px' }}
                    >
                      Proceed to Review
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {/* Step 1: Review */}
            {step === 1 && (
              <div style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.05)', padding: '2.5rem' }}>
                <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.8rem', color: 'white', marginBottom: '1.5rem' }}>Collection Review</h2>
                <div className="space-y-4 max-h-96 overflow-y-auto pr-2 scrollbar-hide">
                  {items.map((item, i) => {
                    const p = (typeof item.product === 'object' && item.product !== null) ? item.product : item;
                    const name = p.name || item.name || 'Unknown Item';
                    const image = p.images?.[0]?.url || p.image?.url || item.image?.url || item.image || '/placeholder-product.jpg';
                    const originalPrice = p.price || p.mrp || item.price || 0;
                    const salePrice = p.salePrice || item.discountedPrice || (originalPrice * (1 - ((p.discountPercent || 0)/100)));
                    
                    return (
                      <div key={i} className="flex gap-4 p-4" style={{ border: '1px solid rgba(255,255,255,0.03)', background: '#0d0d0d' }}>
                        <div className="w-20 h-20 bg-[#111] relative overflow-hidden shrink-0 flex items-center justify-center">
                          <Image src={image} alt={name} fill className="object-contain p-2 mix-blend-screen" />
                        </div>
                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.2rem', color: 'white', lineHeight: 1.2 }}>{name}</p>
                            <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '4px' }}>Qty: {item.quantity}</p>
                          </div>
                          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.3rem', color: GOLD, fontWeight: 600 }}>{formatPrice(salePrice * item.quantity)}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                <div className="my-8" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }} />
                
                <div className="space-y-3 mb-8" style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '0.8rem' }}>
                  <div className="flex justify-between">
                    <span style={{ color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.65rem' }}>Delivering to</span>
                    <span style={{ color: 'white', fontWeight: 500, textAlign: 'right', maxWidth: '250px' }}>{shippingAddress?.fullName}, {shippingAddress?.city}</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.65rem' }}>Contact</span>
                    <span style={{ color: 'white' }}>{shippingAddress?.phone}</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    variant="outline" onClick={() => setStep(0)} 
                    className="flex-1 rounded-none transition-all hover:bg-white/5 hover:text-white"
                    style={{ background: 'transparent', borderColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', fontFamily: "'Montserrat', sans-serif", fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', height: '48px' }}
                  >
                    Edit Destination
                  </Button>
                  <Button 
                    onClick={() => setStep(2)} 
                    className="flex-1 rounded-none hover:opacity-90"
                    style={{ background: GOLD, color: '#000', fontFamily: "'Montserrat', sans-serif", fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', height: '48px' }}
                  >
                    Select Payment
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: Payment */}
            {step === 2 && (
              <div style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.05)', padding: '2.5rem' }}>
                <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.8rem', color: 'white', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '2rem' }}>
                  <CreditCard style={{ width: '20px', height: '20px', color: GOLD }} /> 
                  Payment Method
                </h2>
                
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-4">
                  {[
                    { value: 'cod', label: 'Cash on Delivery', sub: 'Pay securely upon arrival' }, 
                    { value: 'online', label: 'Online Payment', sub: 'Credit Card, UPI, Net Banking' }
                  ].map(opt => (
                    <label 
                      key={opt.value} 
                      className="flex items-center gap-4 p-5 cursor-pointer transition-all duration-300 relative overflow-hidden group"
                      style={{ 
                        border: `1px solid ${paymentMethod === opt.value ? GOLD : 'rgba(255,255,255,0.05)'}`, 
                        background: paymentMethod === opt.value ? 'rgba(184,151,106,0.05)' : '#0d0d0d' 
                      }}
                    >
                      <RadioGroupItem value={opt.value} className="text-[#b8976a] border-[rgba(255,255,255,0.3)] data-[state=checked]:border-[#b8976a] data-[state=checked]:text-[#b8976a]" />
                      <div>
                        <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '0.85rem', color: 'white', fontWeight: 500, marginBottom: '2px' }}>{opt.label}</p>
                        <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.02em' }}>{opt.sub}</p>
                      </div>
                    </label>
                  ))}
                </RadioGroup>
                
                <div className="flex flex-col sm:flex-row gap-4 mt-8">
                  <Button 
                    variant="outline" onClick={() => setStep(1)} 
                    className="flex-1 rounded-none transition-all hover:bg-white/5 hover:text-white"
                    style={{ background: 'transparent', borderColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', fontFamily: "'Montserrat', sans-serif", fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', height: '56px' }}
                  >
                    Back to Review
                  </Button>
                  <Button 
                    onClick={handlePlaceOrder} disabled={placing} 
                    className="flex-1 rounded-none hover:opacity-90 gap-3"
                    style={{ background: GOLD, color: '#000', fontFamily: "'Montserrat', sans-serif", fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', height: '56px' }}
                  >
                    {placing && <Loader2 className="w-4 h-4 animate-spin text-[#000]" />}
                    {placing ? 'Processing...' : `Confirm — ${formatPrice(grandTotal)}`}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div 
              className="sticky top-24 p-8"
              style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.05)' }}
            >
              <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.6rem', color: 'white', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1rem' }}>
                Order Summary
              </h3>
              
              <div className="space-y-4" style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '0.75rem' }}>
                <div className="flex justify-between items-center">
                  <span style={{ color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.65rem' }}>
                    Subtotal ({items.length} pieces)
                  </span>
                  <span style={{ color: 'white', fontWeight: 500 }}>{formatPrice(subtotal)}</span>
                </div>
                
                {couponDiscount > 0 && (
                  <div className="flex justify-between items-center">
                    <span style={{ color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.65rem' }}>Discount</span>
                    <span style={{ color: '#4ade80' }}>-{formatPrice(couponDiscount)}</span>
                  </div>
                )}
                
                <div className="flex justify-between items-center">
                  <span style={{ color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.65rem' }}>Shipping</span>
                  <span style={{ color: shippingCost === 0 ? '#b8976a' : 'white', fontWeight: 500 }}>
                    {shippingCost === 0 ? 'Complimentary' : formatPrice(shippingCost)}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span style={{ color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.65rem' }}>GST (18%)</span>
                  <span style={{ color: 'white', fontWeight: 500 }}>{formatPrice(tax)}</span>
                </div>
              </div>
              
              <div style={{ padding: '1.5rem 0', margin: '1.5rem 0', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="flex justify-between items-end">
                  <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Grand Total</span>
                  <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '2.4rem', color: GOLD, fontWeight: 600, lineHeight: 1 }}>{formatPrice(grandTotal)}</span>
                </div>
              </div>
              
              <div className="flex flex-col gap-3">
                {[{ icon: Shield, text: '256-bit Secure Encryption' }, { icon: Truck, text: 'Insured Delivery' }].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-3">
                    <Icon style={{ width: '14px', height: '14px', color: 'rgba(255,255,255,0.3)' }} />
                    <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
