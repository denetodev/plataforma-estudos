import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-empty-state',
  imports: [MatIconModule],
  template: `
    <div class="vazio">
      <span class="vazio__icone" aria-hidden="true"><mat-icon>{{ icone() }}</mat-icon></span>
      <h2>{{ titulo() }}</h2>
      @if (descricao()) {
        <p>{{ descricao() }}</p>
      }
      <div class="vazio__acao"><ng-content /></div>
    </div>
  `,
  styles: `
    .vazio {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      padding: 56px 24px;
      border: 2px dashed var(--app-borda);
      border-radius: 20px;
      background: var(--app-superficie);
    }
    .vazio__icone {
      display: grid;
      place-items: center;
      width: 64px;
      height: 64px;
      border-radius: 20px;
      color: var(--app-primaria);
      background: rgb(99 102 241 / 12%);

      mat-icon {
        width: 32px;
        height: 32px;
        font-size: 32px;
      }
    }
    h2 {
      margin: 18px 0 6px;
      font-size: 1.15rem;
    }
    p {
      margin: 0;
      max-width: 380px;
      color: var(--app-texto-suave);
      line-height: 1.5;
    }
    .vazio__acao {
      margin-top: 20px;
    }
    .vazio__acao:empty {
      display: none;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmptyStateComponent {
  readonly icone = input('inbox');
  readonly titulo = input.required<string>();
  readonly descricao = input('');
}
