import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Product, ParsedDescription } from '../models';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly http = inject(HttpClient);

  private readonly rawProducts = toSignal(
    this.http.get<Product[]>('/api/products'),
    { initialValue: [] }
  );

  readonly products = computed(() =>
    this.rawProducts().map((p) => this.transformProduct(p))
  );

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

  private transformProduct(raw: Product): Product {
    const fullImages = raw.images.filter((img) => !img.includes('-100x100'));
    const thumbImages = raw.images.filter((img) => img.includes('-100x100'));

    return {
      ...raw,
      images: fullImages.map((img) => this.toLocalImagePath(raw.slug, img)),
      thumbnails: thumbImages.map((img) => this.toLocalImagePath(raw.slug, img)),
    };
  }

  private toLocalImagePath(slug: string, url: string): string {
    const filename = url.split('/').pop() ?? '';
    return `/images/products/${slug}/${filename}`;
  }

  static parseDescription(raw: string): ParsedDescription {
    let text = raw;

    // Remove "Descripción" prefix (may be glued to subtitle)
    text = text.replace(/^Descripci[oó]n/, '');

    // Remove "Asesor comercial..." suffix
    const cutIndex = text.indexOf('Asesor comercial');
    if (cutIndex > 0) {
      text = text.substring(0, cutIndex);
    }

    // Clean zero-width spaces and non-breaking spaces
    text = text.replace(/\u200B/g, '').replace(/\u00A0/g, ' ').trim();

    // The scraped data glues subtitle + body with no separator.
    // The boundary is a lowercase letter (or digit) immediately followed by uppercase.
    // e.g. "Potente motor 350 ccEl origen..." → split at "cc|El"
    // e.g. "Firme con tu bolsillo y su desempeñoLa Nueva..." → split at "ño|La"
    const boundaryMatch = text.match(/^(.*?[a-záéíóúñü0-9])([A-ZÁÉÍÓÚÑÜ])/);

    if (boundaryMatch && boundaryMatch[1].length < 120) {
      const subtitle = boundaryMatch[1].trim();
      const body = (boundaryMatch[2] + text.substring(boundaryMatch[0].length)).trim();
      return { subtitle, body };
    }

    return { subtitle: '', body: text.trim() };
  }
}
