# Integração de widgets nativos

Este documento descreve a segunda etapa. O PWA hospedado na Vercel não instala widgets nativos e o código atual não tenta simular esse recurso.

## Contrato disponível

`WidgetSummaryService` gera e salva `foco:widget-summary:v1` com:

- `environmentId`: identificador estável do ambiente.
- `objectiveName`: nome exibido do objetivo.
- `realizedPercentage`: percentual realizado no período.
- `expectedPercentage`: percentual esperado até a atualização.
- `state`: `on-track`, `attention`, `behind` ou `neutral`.
- `currentStreak`: sequência atual de dias.
- `updatedAt`: data e hora ISO da geração.

O contrato é uma camada de apresentação. Android e iOS não devem recalcular as regras de negócio; devem apenas ler esse resumo e desenhar a interface.

## Capacitor

1. Adicionar `@capacitor/core`, `@capacitor/cli`, `@capacitor/android` e, quando necessário, `@capacitor/ios`.
2. Configurar o contêiner para carregar o deploy HTTPS da Vercel ou uma exportação web compatível com a estratégia de autenticação.
3. Criar um plugin Capacitor próprio, por exemplo `WidgetBridge`, com um método `writeSummary(payload)`.
4. Após `WidgetSummaryService.writeCache`, enviar o mesmo payload ao plugin quando a plataforma nativa estiver disponível.
5. No Android, persistir o JSON em `SharedPreferences` ou DataStore acessível ao widget.
6. No iOS, persistir o JSON em `UserDefaults` de um App Group compartilhado.
7. Solicitar uma atualização de timeline sem criar ciclos frequentes ou polling.

O aplicativo web continua na Vercel. Cada contêiner nativo exige build assinado, pipeline e distribuição próprios nas lojas.

## Android

### Opção recomendada

Usar Kotlin e Jetpack Glance. `GlanceAppWidget` lê o cache compartilhado, escolhe o layout pelo tamanho e renderiza os dados. Um `GlanceAppWidgetReceiver` registra o widget no manifesto.

`AppWidgetProvider` com RemoteViews continua válido quando a equipe precisar suportar versões ou componentes não cobertos pelo Glance.

### Atualização

- Atualizar após um novo check-in recebido pela bridge.
- Usar WorkManager apenas para sincronizações justificadas e sujeitas às políticas do sistema.
- Não contar com intervalos exatos: economia de bateria, Doze e limites do fabricante podem adiar tarefas.
- Exibir sempre `updatedAt`, mantendo o último cache legível quando não houver rede.

## iOS

Usar WidgetKit com SwiftUI e uma extensão de widget no projeto Xcode. Aplicativo e extensão precisam do mesmo App Group e dos respectivos entitlements/provisioning profiles.

O app grava o resumo em `UserDefaults(suiteName:)` e chama `WidgetCenter.shared.reloadTimelines(ofKind:)` quando houver uma mudança relevante. O iOS decide quando a timeline será efetivamente atualizada; atualizações contínuas ou em tempo real não são garantidas.

Requisitos adicionais:

- Conta Apple Developer e identificadores para app, extensão e App Group.
- Certificados, perfis e assinatura da extensão.
- Build e distribuição pelo Xcode/App Store Connect.
- Política de privacidade coerente com os dados sincronizados.

## Tamanhos planejados

### Pequeno

- Progresso semanal em destaque.
- Percentual e estado atual.
- Uma mensagem curta, como “Bom ritmo” ou “Um passo de cada vez”.

### Médio

- Progresso geral.
- Até três objetivos prioritários.
- Indicadores compactos de realizado versus esperado.

### Grande

- Lista de objetivos.
- Quantidade de metas pendentes.
- Sequência atual e resumo semanal.

Todos os tamanhos devem usar verde para no ritmo, amarelo para atenção, vermelho para atraso e cinza para ausência de dados. Cor nunca deve ser o único indicador: cada estado também precisa de texto ou ícone.

## Limites e segurança

- Widgets leem um snapshot, não o banco completo.
- O snapshot deve permanecer útil offline e ser substituído de forma atômica.
- Nenhum segredo ou token de sessão deve entrar no cache compartilhado.
- O sistema operacional controla a frequência final de atualização.
- Atualizações de layout nativo exigem uma nova versão nas lojas; um deploy na Vercel não altera a extensão instalada.
