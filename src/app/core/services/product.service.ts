import { Injectable, computed } from '@angular/core';
import { Product, ParsedDescription } from '../models';
import { PRODUCT_QUOTATION_DATA } from '../data/product-quotation-data';

function slugToName(slug: string): string {
  return slug
    .replace(/^honda-/, 'Honda ')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

const STATIC_PRODUCTS: Product[] = Object.keys(PRODUCT_QUOTATION_DATA).map(
  (slug, index) => ({
    id: index + 1,
    slug,
    name: slugToName(slug),
    description: '',
    images: [],
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
