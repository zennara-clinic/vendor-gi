import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, ImagePlus, Plus, ShieldCheck, Trash2, X } from 'lucide-react';
import { panel } from '@/api/services';
import { cn, formatINR } from '@/lib/utils';
import { useDocumentTitle } from '@/hooks';
import { useAuth } from '@/store/auth';
import { useUI } from '@/store/ui';
import type { Product } from '@/types';
import { ProductStatusPill } from '@/components/common';
import { Button, Img, InlineBanner, Input, Select, Skeleton, Textarea } from '@/components/ui';

const CATEGORIES = ['Tea & Coffee', 'Sarees & Textiles', 'Spices & Condiments', 'Fruits & Grains', 'Handicrafts', 'Sweets & Snacks', 'Footwear & Leather', 'Home & Decor', 'Toys & Games', 'Wellness & Beauty'];
const schema = z.object({
  title: z.string().min(10, 'At least 10 characters').max(120, 'Keep it under 120 characters'), category: z.string().min(1, 'Select a category'), productClass: z.enum(['GI', 'HERITAGE', 'TRADITION']), giTag: z.string().optional(), certificateId: z.string().optional(),
  shortDescription: z.string().min(20, 'At least 20 characters').max(200, 'Under 200 characters'), description: z.string().min(50, 'Describe the product in at least 50 characters'), originStory: z.string().optional(),
  price: z.coerce.number().positive('Enter the selling price'), mrp: z.coerce.number().optional(), stock: z.coerce.number().int().min(0), sku: z.string().min(2, 'Enter a SKU'), hsn: z.string().regex(/^\d{4,8}$/, '4 to 8 digit HSN'), gstRate: z.coerce.number(), weightGrams: z.coerce.number().positive('Enter shipping weight'), lowStockAt: z.coerce.number().int().min(0),
  variants: z.array(z.object({ id: z.string(), title: z.string().min(1), sku: z.string().min(1), price: z.coerce.number().positive(), mrp: z.coerce.number().optional(), stock: z.coerce.number().int().min(0) })),
  highlights: z.array(z.object({ v: z.string() })),
}).refine((d) => !d.mrp || d.mrp >= d.price, { message: 'MRP must be at least the selling price', path: ['mrp'] })
  .refine((d) => d.productClass !== 'GI' || (d.giTag && d.certificateId), { message: 'Select the GI tag and the certificate that covers it', path: ['giTag'] });
type F = z.output<typeof schema>;
type FIn = z.input<typeof schema>;

export default function ProductFormPage() {
  const { id } = useParams();
  const isNew = !id;
  const navigate = useNavigate();
  const qc = useQueryClient();
  const toast = useUI((s) => s.toast);
  const vendor = useAuth((s) => s.vendor)!;
  const { data: existing, isLoading } = useQuery({ queryKey: ['product', id], queryFn: () => panel.product(id!), enabled: !isNew });
  useDocumentTitle(isNew ? 'Add product' : 'Edit product');
  const [images, setImages] = useState<string[]>([]);
  const form = useForm<FIn, unknown, F>({ resolver: zodResolver(schema), defaultValues: { productClass: vendor.productClasses[0] ?? 'GI', gstRate: 5, stock: 0, lowStockAt: 5, variants: [], highlights: [{ v: '' }] } });
  const { register, handleSubmit, control, watch, reset, formState: { errors } } = form;
  const variants = useFieldArray({ control, name: 'variants' });
  const highlights = useFieldArray({ control, name: 'highlights' });
  useEffect(() => { if (existing) { reset({ ...existing, highlights: existing.highlights.length ? existing.highlights.map((v) => ({ v })) : [{ v: '' }], mrp: existing.mrp ?? undefined }); setImages(existing.images); } }, [existing, reset]);
  const cls = watch('productClass'); const price = Number(watch('price') ?? 0); const mrp = Number(watch('mrp') ?? 0) || undefined;
  const locked = existing?.status === 'APPROVED';
  const save = useMutation({ mutationFn: ({ d, submit }: { d: F; submit: boolean }) => panel.saveProduct({ ...(existing ?? {}), ...d, id, images, highlights: d.highlights.map((h) => h.v).filter(Boolean) } as Partial<Product> & { id?: string }, submit), onSuccess: (p, { submit }) => { qc.invalidateQueries({ queryKey: ['products'] }); qc.setQueryData(['product', p.id], p); toast({ message: submit ? 'Submitted for review. Usually approved within 2 business days.' : 'Saved', kind: 'success' }); navigate('/products'); } });
  const addImage = (files: FileList | null) => { if (!files) return; Array.from(files).slice(0, 8 - images.length).forEach((f) => { const r = new FileReader(); r.onload = () => setImages((s) => [...s, String(r.result)]); r.readAsDataURL(f); }); };
  if (!isNew && isLoading) return <Skeleton className="h-96 rounded-lg" />;
  const certs = vendor.giCertificates.filter((c) => c.status === 'VERIFIED');
  const Section = ({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) => <section className="rounded-lg bg-white border border-border-strong p-4 md:p-6"><h2 className="text-h4 text-ink-900">{title}</h2>{sub && <p className="text-caption text-ink-500 mt-0.5 mb-4">{sub}</p>}{!sub && <div className="mb-4" />}{children}</section>;

  return (
    <form onSubmit={handleSubmit((d) => save.mutate({ d, submit: true }))}>
      <Link to="/products" className="inline-flex items-center gap-1.5 text-body-sm text-ink-500 hover:text-ink-900 mb-3"><ArrowLeft className="h-4 w-4" /> Products</Link>
      <div className="flex items-start justify-between gap-4 flex-wrap mb-5">
        <div className="flex items-center gap-3"><h1 className="font-display text-[26px] md:text-[30px] font-semibold text-ink-900">{isNew ? 'Add product' : 'Edit product'}</h1>{existing && <ProductStatusPill s={existing.status} />}</div>
        <div className="flex gap-2"><Button type="button" variant="outline" loading={save.isPending} onClick={handleSubmit((d) => save.mutate({ d, submit: false }))}>{locked ? 'Save changes' : 'Save draft'}</Button>{!locked && <Button type="submit" loading={save.isPending}>Submit for review</Button>}</div>
      </div>
      {existing?.reviewNote && <InlineBanner tone="warning" className="mb-4"><b>Reviewer note:</b> {existing.reviewNote}</InlineBanner>}
      {locked && <InlineBanner tone="info" className="mb-4">This listing is live. Price and stock update immediately; other changes go through a quick re-review.</InlineBanner>}
      <div className="grid lg:grid-cols-[1fr_340px] gap-4 items-start">
        <div className="space-y-4">
          <Section title="Basics">
            <div className="space-y-4">
              <Input label="Product title" required placeholder="e.g. Darjeeling First Flush 2026, Muscatel Black Tea, 100 g" {...register('title')} error={errors.title?.message} hint="Include the GI name, key attribute and size. Max 120 characters." />
              <div className="grid sm:grid-cols-2 gap-4">
                <Select label="Category" {...register('category')} error={errors.category?.message}><option value="">Select</option>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</Select>
                <Select label="Product class" {...register('productClass')}>{vendor.productClasses.map((c) => <option key={c} value={c}>{{ GI: 'GI-tagged', HERITAGE: 'Heritage, non-GI', TRADITION: 'Tradition-based' }[c]}</option>)}</Select>
              </div>
              <Input label="Short description" required placeholder="One or two lines shown on product cards" {...register('shortDescription')} error={errors.shortDescription?.message} />
              <Textarea label="Full description" required rows={6} placeholder="Materials, process, taste or feel, how to use or care" {...register('description')} error={errors.description?.message} />
            </div>
          </Section>
          {cls === 'GI' && (
            <Section title="GI claim" sub="Link this product to a verified certificate. The GI Verified badge appears after review.">
              {certs.length === 0 ? <InlineBanner tone="warning">You have no verified GI certificate yet. <Link to="/certificates" className="font-medium underline">Add one</Link> before listing GI products.</InlineBanner> : (
                <div className="grid sm:grid-cols-2 gap-4">
                  <Select label="GI tag" {...register('giTag')} error={errors.giTag?.message}><option value="">Select</option>{[...new Set(certs.map((c) => c.giTag))].map((g) => <option key={g}>{g}</option>)}</Select>
                  <Select label="Certificate" {...register('certificateId')}><option value="">Select</option>{certs.map((c) => <option key={c.id} value={c.id}>{c.certificateNumber}, valid to {c.expiresAt}</option>)}</Select>
                  <Textarea className="sm:col-span-2" label="Origin story (optional)" rows={3} placeholder="Where and how this is made, and why the GI matters" {...register('originStory')} />
                </div>
              )}
            </Section>
          )}
          <Section title="Pricing and tax">
            <div className="grid sm:grid-cols-3 gap-4">
              <Input label="Selling price" required type="number" min={1} leading={<span className="text-body font-medium text-ink-700">Rs</span>} {...register('price')} error={errors.price?.message} />
              <Input label="MRP (optional)" type="number" leading={<span className="text-body font-medium text-ink-700">Rs</span>} {...register('mrp')} error={errors.mrp?.message} hint={mrp && price && mrp > price ? `${Math.round(((mrp - price) / mrp) * 100)}% off shown` : 'Shown struck through'} />
              <Select label="GST rate" {...register('gstRate')}>{[0, 3, 5, 12, 18, 28].map((r) => <option key={r} value={r}>{r}%</option>)}</Select>
              <Input label="HSN code" required placeholder="e.g. 0902" {...register('hsn')} error={errors.hsn?.message} />
              <Input label="SKU" required placeholder="Your internal code" {...register('sku')} error={errors.sku?.message} />
              <Input label="Shipping weight (g)" required type="number" {...register('weightGrams')} error={errors.weightGrams?.message} />
            </div>
            {price > 0 && <p className="text-caption text-ink-500 mt-3">On a {formatINR(price)} sale you receive about <b className="text-ink-700">{formatINR(Math.round(price * (1 - vendor.commissionPct / 100)))}</b> after {vendor.commissionPct}% commission, before tax.</p>}
          </Section>
          <Section title="Variants" sub="Add sizes, weights or colours. Leave empty for a single-variant product.">
            {variants.fields.length > 0 && <div className="grid grid-cols-[1fr_1fr_90px_90px_70px_36px] gap-2 mb-2 text-caption text-ink-500"><span>Title</span><span>SKU</span><span>Price</span><span>MRP</span><span>Stock</span><span /></div>}
            <div className="space-y-2">{variants.fields.map((f, i) => <div key={f.id} className="grid grid-cols-[1fr_1fr_90px_90px_70px_36px] gap-2 items-start"><Input placeholder="250 g" {...register(`variants.${i}.title`)} error={errors.variants?.[i]?.title && 'Required'} /><Input placeholder="SKU" {...register(`variants.${i}.sku`)} /><Input type="number" {...register(`variants.${i}.price`)} /><Input type="number" {...register(`variants.${i}.mrp`)} /><Input type="number" {...register(`variants.${i}.stock`)} /><button type="button" onClick={() => variants.remove(i)} aria-label="Remove" className="h-11 w-9 inline-flex items-center justify-center rounded-md text-ink-400 hover:text-error-600"><Trash2 className="h-4 w-4" /></button></div>)}</div>
            <Button type="button" variant="ghost" size="sm" className="mt-2" onClick={() => variants.append({ id: `v-${Date.now()}`, title: '', sku: '', price: price || 0, mrp: mrp || undefined, stock: 0 })}><Plus className="h-4 w-4" /> Add variant</Button>
          </Section>
          <Section title="Highlights" sub="Short bullet points, up to 6.">
            <div className="space-y-2">{highlights.fields.map((f, i) => <div key={f.id} className="flex gap-2"><Input placeholder="e.g. Single-estate, hand-rolled" className="flex-1" {...register(`highlights.${i}.v`)} />{highlights.fields.length > 1 && <button type="button" onClick={() => highlights.remove(i)} aria-label="Remove" className="h-11 w-9 inline-flex items-center justify-center rounded-md text-ink-400 hover:text-error-600"><X className="h-4 w-4" /></button>}</div>)}</div>
            {highlights.fields.length < 6 && <Button type="button" variant="ghost" size="sm" className="mt-2" onClick={() => highlights.append({ v: '' })}><Plus className="h-4 w-4" /> Add highlight</Button>}
          </Section>
        </div>
        <div className="space-y-4">
          <Section title="Images" sub="Up to 8. First image is the cover. White background, at least 1000 px.">
            <div className="grid grid-cols-3 gap-2">
              {images.map((src, i) => <div key={i} className={cn('relative aspect-square rounded-md overflow-hidden border bg-white', i === 0 ? 'border-accent-600 col-span-3 aspect-[4/3]' : 'border-border-subtle')}><Img src={src} alt="" className="h-full w-full object-cover" />{i === 0 && <span className="absolute top-1.5 left-1.5 rounded-xs bg-accent-600 text-white text-micro px-1.5 py-0.5">Cover</span>}<button type="button" onClick={() => setImages((s) => s.filter((_, j) => j !== i))} aria-label="Remove image" className="absolute top-1.5 right-1.5 h-7 w-7 rounded-full bg-white/95 shadow-sm inline-flex items-center justify-center text-ink-700"><X className="h-3.5 w-3.5" /></button></div>)}
              {images.length < 8 && <label className={cn('aspect-square rounded-md border border-dashed border-border-input bg-cream-50 flex flex-col items-center justify-center gap-1 text-caption text-ink-500 cursor-pointer hover:bg-cream-100', images.length === 0 && 'col-span-3 aspect-[4/3]')}><ImagePlus className="h-6 w-6 text-ink-400" /> Add image<input type="file" accept="image/*" multiple className="sr-only" onChange={(e) => addImage(e.target.files)} /></label>}
            </div>
          </Section>
          <Section title="Inventory">
            <div className="grid grid-cols-2 gap-4"><Input label="Stock" type="number" min={0} {...register('stock')} error={errors.stock?.message} hint={variants.fields.length ? 'Sum of variants' : undefined} /><Input label="Low-stock alert at" type="number" min={0} {...register('lowStockAt')} /></div>
          </Section>
          {cls === 'GI' && <div className="rounded-lg bg-info-50 border border-info-600/20 p-4 text-body-sm text-ink-700 flex gap-2"><ShieldCheck className="h-5 w-5 text-info-600 shrink-0" /> Every unit of a GI product ships with an authenticity code. You can issue batch codes from the product page after approval.</div>}
        </div>
      </div>
    </form>
  );
}
