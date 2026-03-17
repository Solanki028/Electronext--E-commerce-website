'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Image from 'next/image';
import { MapPin, CreditCard, ChevronRight, Loader2 } from 'lucide-react';
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
      toast.success('Order placed successfully! 🎉');
      router.push(`/orders/${result.data._id}`);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to place order');
      setPlacing(false);
    }
  };

  const shippingCost = subtotal >= 999 ? 0 : 49;
  const tax = Math.round(total * 0.18 * 100) / 100;
  const grandTotal = Math.round((total + shippingCost + tax) * 100) / 100;

  return (
    <div className="container-custom py-10 max-w-5xl">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Checkout</h1>

      {/* Step indicator */}
      <div className="flex items-center gap-0 mb-8">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold transition-colors ${i <= step ? 'bg-primary-700 text-white' : 'bg-slate-200 text-slate-500'}`}>
              {i + 1}
            </div>
            <span className={`ml-2 text-sm font-medium ${i === step ? 'text-primary-700' : 'text-slate-400'}`}>{s}</span>
            {i < STEPS.length - 1 && <ChevronRight className="w-4 h-4 text-slate-300 mx-2" />}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* Step 0: Address */}
          {step === 0 && (
            <div className="bg-white rounded-xl border p-6">
              <h2 className="font-bold text-slate-900 flex items-center gap-2 mb-5"><MapPin className="w-5 h-5 text-primary-700" /> Shipping Address</h2>

              {/* Saved addresses */}
              {user?.addresses?.length > 0 && (
                <div className="mb-5 space-y-2">
                  <p className="text-sm font-medium text-slate-600 mb-2">Saved Addresses</p>
                  {user.addresses.map((addr, i) => (
                    <button key={i} type="button"
                      onClick={() => { Object.entries(addr).forEach(([k,v]) => setValue(k, v)); }}
                      className="w-full text-left border rounded-lg p-3 text-sm hover:border-primary-300 transition-colors">
                      <p className="font-medium">{addr.fullName}</p>
                      <p className="text-slate-500">{addr.street}, {addr.city}, {addr.state} {addr.zipCode}</p>
                    </button>
                  ))}
                  <Separator className="my-3" />
                </div>
              )}

              <form onSubmit={handleSubmit(onAddressSubmit)} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { name: 'fullName', label: 'Full Name', span: false },
                  { name: 'phone', label: 'Phone Number', span: false },
                  { name: 'street', label: 'Street Address', span: true },
                  { name: 'city', label: 'City', span: false },
                  { name: 'state', label: 'State', span: false },
                  { name: 'zipCode', label: 'ZIP Code', span: false },
                  { name: 'country', label: 'Country', span: false },
                ].map(({ name, label, span }) => (
                  <div key={name} className={span ? 'sm:col-span-2' : ''}>
                    <Label htmlFor={name}>{label}</Label>
                    <Input id={name} {...register(name)} className={`mt-1 ${errors[name] ? 'border-red-400' : ''}`} />
                    {errors[name] && <p className="text-xs text-red-500 mt-0.5">{errors[name].message}</p>}
                  </div>
                ))}
                <div className="sm:col-span-2">
                  <Button type="submit" size="lg" className="w-full">Continue to Review</Button>
                </div>
              </form>
            </div>
          )}

          {/* Step 1: Review */}
          {step === 1 && (
            <div className="bg-white rounded-xl border p-6 space-y-4">
              <h2 className="font-bold text-slate-900 mb-4">Order Review</h2>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {items.map((item, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="w-14 h-14 bg-slate-50 rounded-lg relative overflow-hidden shrink-0">
                      <Image src={item.image || '/placeholder-product.jpg'} alt={item.name} fill className="object-cover" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium line-clamp-1">{item.name}</p>
                      <p className="text-xs text-slate-400">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-bold text-primary-700">{formatPrice((item.discountedPrice || item.price) * item.quantity)}</p>
                  </div>
                ))}
              </div>
              <Separator />
              <div className="space-y-1 text-sm">
                <div className="flex justify-between"><span className="text-slate-500">Delivery to:</span><span className="font-medium text-right max-w-xs truncate">{shippingAddress?.fullName}, {shippingAddress?.city}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Phone:</span><span>{shippingAddress?.phone}</span></div>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(0)} className="flex-1">Edit Address</Button>
                <Button onClick={() => setStep(2)} className="flex-1">Select Payment</Button>
              </div>
            </div>
          )}

          {/* Step 2: Payment */}
          {step === 2 && (
            <div className="bg-white rounded-xl border p-6">
              <h2 className="font-bold text-slate-900 flex items-center gap-2 mb-5"><CreditCard className="w-5 h-5 text-primary-700" /> Payment Method</h2>
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-3">
                {[{ value: 'cod', label: 'Cash on Delivery', sub: 'Pay when your order arrives' }, { value: 'online', label: 'Online Payment', sub: 'UPI, Cards, Net Banking' }].map(opt => (
                  <label key={opt.value} className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === opt.value ? 'border-primary-700 bg-primary-50' : 'hover:border-slate-300'}`}>
                    <RadioGroupItem value={opt.value} />
                    <div>
                      <p className="font-medium text-sm">{opt.label}</p>
                      <p className="text-xs text-slate-400">{opt.sub}</p>
                    </div>
                  </label>
                ))}
              </RadioGroup>
              <div className="flex gap-3 mt-6">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1">Back</Button>
                <Button onClick={handlePlaceOrder} disabled={placing} className="flex-1 gap-2">
                  {placing && <Loader2 className="w-4 h-4 animate-spin" />}
                  {placing ? 'Placing Order...' : `Place Order — ${formatPrice(grandTotal)}`}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Order summary sidebar */}
        <div className="bg-white rounded-xl border p-5 space-y-3 h-fit sticky top-20">
          <h3 className="font-bold text-slate-900">Summary</h3>
          <Separator />
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-slate-500">Subtotal ({items.length} items)</span><span>{formatPrice(subtotal)}</span></div>
            {couponDiscount > 0 && <div className="flex justify-between text-green-600"><span>Coupon</span><span>-{formatPrice(couponDiscount)}</span></div>}
            <div className="flex justify-between"><span className="text-slate-500">Shipping</span><span className={shippingCost === 0 ? 'text-green-600' : ''}>{shippingCost === 0 ? 'Free' : formatPrice(shippingCost)}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">GST (18%)</span><span>{formatPrice(tax)}</span></div>
          </div>
          <Separator />
          <div className="flex justify-between font-black text-lg"><span>Total</span><span className="text-primary-700">{formatPrice(grandTotal)}</span></div>
        </div>
      </div>
    </div>
  );
}
