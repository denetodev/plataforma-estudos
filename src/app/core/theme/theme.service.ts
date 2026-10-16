import { Injectable, effect, signal } from '@angular/core';

export type PreferenciaTema = 'sistema' | 'claro' | 'escuro';

const CHAVE = 'tema';
const VALIDAS: PreferenciaTema[] = ['sistema', 'claro', 'escuro'];

/**
 * Tema claro/escuro. "sistema" segue `prefers-color-scheme`; as outras opções forçam
 * `color-scheme` via `data-tema` no <html> (ver styles.scss). O script inline do index.html
 * aplica a preferência salva antes do Angular subir, evitando o "flash" de tema errado.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly preferencia = signal<PreferenciaTema>(this.ler());

  constructor() {
    effect(() => {
      const preferencia = this.preferencia();
      const html = document.documentElement;
      if (preferencia === 'sistema') {
        html.removeAttribute('data-tema');
      } else {
        html.setAttribute('data-tema', preferencia === 'escuro' ? 'dark' : 'light');
      }
      try {
        localStorage.setItem(CHAVE, preferencia);
      } catch {
        // armazenamento indisponível (modo privado etc.): a escolha vale só nesta sessão
      }
    });
  }

  definir(preferencia: PreferenciaTema): void {
    this.preferencia.set(preferencia);
  }

  /** Alterna claro ↔ escuro com base no que está sendo exibido agora. */
  alternar(): void {
    const escuroAgora = this.estaEscuro();
    this.preferencia.set(escuroAgora ? 'claro' : 'escuro');
  }

  estaEscuro(): boolean {
    const p = this.preferencia();
    return p === 'escuro' || (p === 'sistema' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  }

  private ler(): PreferenciaTema {
    try {
      const salvo = localStorage.getItem(CHAVE) as PreferenciaTema | null;
      return salvo && VALIDAS.includes(salvo) ? salvo : 'sistema';
    } catch {
      return 'sistema';
    }
  }
}
