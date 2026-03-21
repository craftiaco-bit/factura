import { Injectable, computed } from '@angular/core';
import { Product, ParsedDescription } from '../models';
import { PRODUCT_QUOTATION_DATA } from '../data/product-quotation-data';

function slugToName(slug: string): string {
  return slug
    .replace(/^honda-/, 'Honda ')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

const PRODUCT_IMAGES: Record<string, string> = {
  'honda-africa-twin': '/images/products/honda-africa-twin/1a30d440-996b-4f00-8c03-02c28f00c589.avif',
  'honda-cb-100': '/images/products/honda-cb-100/585380b3-f2d5-4d99-9796-b72561c6799a.avif',
  'honda-cb-190r': '/images/products/honda-cb-190r/4b235b21-716b-4525-a73b-f8c19fcb2737.avif',
  'honda-cb-300f': '/images/products/honda-cb-300f/df714c63-d52f-4ce5-a060-88f4f1b6a365-1.avif',
  'honda-cb-350d': '/images/products/honda-cb-350d/82e41a1f-f00a-41ec-ad32-b79ad4c5a043-1.avif',
  'honda-cbr-650r': '/images/products/honda-cbr-650r/ea82eeca-16c8-40a8-a5c3-2614ae074c97.avif',
  'honda-crf-450-rx': '/images/products/honda-crf-450-rx/9ea58797-b6f7-475b-9584-d140614bbff7.avif',
  'honda-dio-led-dlx': '/images/products/honda-dio-led-dlx/e9c7a1a5-a799-46f0-b828-77c111363e10-1.avif',
  'honda-navi': '/images/products/honda-navi/129d6e30-b505-41d9-902d-68ffa3a01f45.avif',
  'honda-navi-adventure': '/images/products/honda-navi-adventure/a6bfca93-1346-4d52-877e-4139e7e0757b.avif',
  'honda-navi-mix': '/images/products/honda-navi-mix/8f3f7f03-48a6-4d66-83f8-15950f48261d.avif',
  'honda-navi-mix-2': '/images/products/honda-navi-mix-2/441eb9f9-705b-4663-9be5-f1ad7bdd27af.avif',
  'honda-nx-190': '/images/products/honda-nx-190/42a75675-e2f0-40a8-a4d9-23d473f5c31c.avif',
  'honda-pcx-160-abs': '/images/products/honda-pcx-160-abs/4918a316-6fce-4dbd-874d-1d1b9b4e4aff.avif',
  'honda-wave-110': '/images/products/honda-wave-110/08bcea55-241d-44cf-bfce-70d9910f7ef7.avif',
  'honda-x-adv-750': '/images/products/honda-x-adv-750/17478839-7311-4aa0-9df1-18c3d99edd6f.avif',
  'honda-xblade-160': '/images/products/honda-xblade-160/0087810b-187f-41fb-b51c-a504b0ac1ab2.avif',
  'honda-xr190l-abs': '/images/products/honda-xr190l-abs/0b5943a9-8a26-4185-a30f-8ef53a0a44a2.avif',
  'honda-xr-300l': '/images/products/honda-xr-300l/954695f4-a594-4695-8dd6-9612b6006a7e.avif',
  'honda-xre-300-sahara': '/images/products/honda-xre-300-sahara/8140f68f-7772-4eb4-832c-24ebe396b044.avif',
};

const STATIC_PRODUCTS: Product[] = Object.keys(PRODUCT_QUOTATION_DATA).map(
  (slug, index) => ({
    id: index + 1,
    slug,
    name: slugToName(slug),
    description: '',
    images: PRODUCT_IMAGES[slug] ? [PRODUCT_IMAGES[slug]] : [],
    thumbnails: [],
    specifications: PRODUCT_QUOTATION_DATA[slug].specifications,
  })
);

@Injectable({ providedIn: 'root' })
export class ProductService {
  readonly products = computed(() => STATIC_PRODUCTS);

  getBySlug(slug: string) {
    return computed(() => this.products().find((p) => p.slug === slug) ?? null);
  }

  readonly featured = computed(() =>
    this.products().find((p) => p.slug === 'honda-nx-190') ?? this.products()[0] ?? null
  );

  getRelated(slug: string, limit = 4) {
    return computed(() =>
      this.products()
        .filter((p) => p.slug !== slug)
        .slice(0, limit)
    );
  }

  static parseDescription(raw: string): ParsedDescription {
    let text = raw;
    text = text.replace(/^Descripci[oó]n/, '');
    const cutIndex = text.indexOf('Asesor comercial');
    if (cutIndex > 0) {
      text = text.substring(0, cutIndex);
    }
    text = text.replace(/\u200B/g, '').replace(/\u00A0/g, ' ').trim();
    const boundaryMatch = text.match(/^(.*?[a-záéíóúñü0-9])([A-ZÁÉÍÓÚÑÜ])/);
    if (boundaryMatch && boundaryMatch[1].length < 120) {
      const subtitle = boundaryMatch[1].trim();
      const body = (boundaryMatch[2] + text.substring(boundaryMatch[0].length)).trim();
      return { subtitle, body };
    }
    return { subtitle: '', body: text.trim() };
  }
}
