import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'currencyCop' })
export class CurrencyCopPipe implements PipeTransform {
  transform(value: number | null | undefined): string {
    if (value == null) return 'Consultar precio';
    return `$ ${value.toLocaleString('es-CO')}`;
  }
}
