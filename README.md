# Foco

PWA mobile-first para acompanhar objetivos, metas, check-ins e progresso semanal sem depender de conexão constante.

## Recursos operacionais

- Instalação PWA no Android quando o navegador disponibiliza `beforeinstallprompt`.
- Orientação correta de instalação no Safari do iOS.
- Manifesto com ícones próprios, variantes maskable e modo standalone.
- Service worker com shell offline e atualização confirmada pelo usuário.
- Painel semanal responsivo com progresso realizado e esperado.
- Estados no ritmo, atenção, atrasado e neutro calculados pelo calendário da meta.
- Dados, check-ins e resumo para widgets persistidos no `localStorage`.

## Desenvolvimento

```bash
npm install
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

## Validação

```bash
npm run lint
npm run build
npm start
```

O deploy web pode ser feito diretamente na Vercel. HTTPS é fornecido pela plataforma e é obrigatório para service workers fora de `localhost`.

## Dados locais

O domínio é salvo em `foco:data:v1`. O cache compacto para uma futura bridge nativa fica em `foco:widget-summary:v1`. As chaves são versionadas para permitir migrações futuras sem apagar dados existentes.

## Widgets nativos

Widgets de tela inicial não podem ser implementados por Next.js ou service worker. A arquitetura e a segunda etapa estão documentadas em [`docs/NATIVE_WIDGETS.md`](docs/NATIVE_WIDGETS.md).
