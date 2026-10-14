import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-progress-bar',
  template: `
    <div
      class="trilho"
      role="progressbar"
      aria-valuemin="0"
      aria-valuemax="100"
      [attr.aria-valuenow]="valorLimitado()"
      [attr.aria-label]="rotulo()"
    >
      <div class="preenchimento" [style.width.%]="valorLimitado()" [style.background]="cor()"></div>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
    .trilho {
      height: 8px;
      border-radius: 999px;
      background: var(--app-borda);
      overflow: hidden;
    }
    .preenchimento {
      height: 100%;
      border-radius: inherit;
      transition: width 0.4s ease;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgressBarComponent {
  /** Percentual de 0 a 100. */
  readonly valor = input.required<number>();
  readonly cor = input('var(--app-primaria)');
  readonly rotulo = input('Progresso');

  protected readonly valorLimitado = computed(() => Math.min(100, Math.max(0, this.valor())));
}
