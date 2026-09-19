# EstudoPDF — Documentação Completa do Projeto Gráfico & UI System (MVP)

> **Versão:** 1.0.0 (MVP)  
> **Perfil de Produto:** Web App SaaS / Produtividade Acadêmica  
> **Design System:** *Scholar Script*  
> **Fontes Principais:** Source Serif 4 & Inter  
> **Status:** Especificação Aprovada & Telas Implementadas  

---

## 1. Visão Geral do Produto & Proposta de Valor

O **EstudoPDF** é uma ferramenta de produtividade acadêmica desenvolvida sob medida para estudantes, vestibulandos e pesquisadores responderem e anotarem diretamente sobre apostilas, listas de exercícios, simulados e provas em formato PDF, sem jamais alterar o arquivo original.

### Pilares de Design e Filosofia
1. **O Documento como Protagonista:** 
   - A página do documento (formato A4/proporcional) ocupa o centro visual com contraste agradável contra o fundo da mesa de estudos (`#f9f9ff`).
   - Evita-se sobrecarga cognitiva, menus corporativos pesados, excesso de barras ou poluição visual.
2. **Separação Arquitetural Estrita (PDF Original + Camada Vetorial):**
   - A interface comunica visualmente que o arquivo original está intacto.
   - Respostas do estudante operam como caixas de texto com alças de redimensionamento e micro-ações (`Mover`, `Tamanho`, `Excluir`), integrando-se tipograficamente à pauta do PDF ao finalizar.
3. **Ergonomia e Conforto para Longas Sessões de Estudo:**
   - Paleta suave com base em tons claros confortáveis, suporte a atalhos de teclado ágeis (`T`, `V`, `⌘O`, `⌘↵`, `Esc`) e feedback não-intrusivo.

---

## 2. Design System: *Scholar Script*

### 2.1. Tokens de Cores (Paleta Semântica)

```yaml
colors:
  # Superfícies & Backgrounds
  surface: '#f9f9ff'                    # Mesa de trabalho / Fundo neutro suave
  surface-dim: '#cfdaf2'                # Superfície secundária atenuada
  surface-bright: '#f9f9ff'             # Áreas de leitura em destaque
  surface-container-lowest: '#ffffff'   # Folha do PDF e modais
  surface-container-low: '#f0f3ff'      # Painéis secundários e sidebars sutis
  surface-container: '#e6ebfc'          # Cards e containers de apoio
  surface-container-high: '#dce4f8'     # Hover states e divisórias leves
  surface-container-highest: '#d0daf2'  # Bordas e separadores estruturais

  # Cores Primárias e de Destaque
  primary: '#4355b9'                    # Indigo acadêmico clássico (Ações primárias)
  primary-container: '#4f46e5'          # Indigo vibrante (Botões principais, atalhos)
  on-primary: '#ffffff'                 # Texto sobre cor primária
  primary-light: '#eef2ff'              # Fundo de tags ativas e seleções

  # Cores de Status e Ações Especiais
  state-saved: '#16a34a'                # Verde suave para confirmação de "Salvo"
  state-detection: '#d97706'            # Âmbar acadêmico para sugestões de campos
  state-detection-bg: '#fef3c7'         # Fundo de alerta para detecção automática
  accent-badge: '#2563eb'               # Azul de referência em exercícios e métricas

  # Textos e Tipografia
  text-primary: '#0f172a'               # Slate 900 (Títulos e enunciados)
  text-secondary: '#475569'             # Slate 600 (Instruções, legendas)
  text-muted: '#94a3b8'                 # Slate 400 (Metadados e atalhos inativos)
```

### 2.2. Tipografia

- **Títulos & Identidade Editorial:** `Source Serif 4`, serifada elegante, legível e acadêmica (evoca livros didáticos e publicações científicas).
- **Interface, Dados & Inputs:** `Inter` / System Sans-Serif, neutra, altamente legível em micro-tipografia, botões e valores numéricos.
- **Monospaçado / Fórmulas:** `JetBrains Mono` / `Fira Code` para constantes, equações rápidas e coordenadas.

| Nível | Família | Tamanho | Peso | Line-Height | Uso |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Display 1** | Source Serif 4 | 36px (2.25rem) | 700 / Italic | 1.2 | Título da Home ("Caderno de Estudos & *Preenchimento*") |
| **Heading 1** | Source Serif 4 | 22px (1.375rem) | 700 | 1.3 | Título de Documentos e Enunciados de Exercícios |
| **Heading 2** | Inter | 18px (1.125rem) | 600 | 1.4 | Título de Seções ("Continuar de onde parou", Modais) |
| **Body (PDF Input)** | Inter | 14px–15px | 500 / 600 | 1.5 | Resposta do aluno inserida sobre o PDF |
| **Caption / Meta** | Inter | 12px (0.75rem) | 500 | 1.4 | Status de salvamento, contagem de páginas, tags |
| **Shortcuts** | Inter | 11px (0.6875rem) | 600 | 1.0 | Badges de atalhos (`⌘O`, `⌘↵`, `T`, `V`) |

### 2.3. Sistema de Espaçamento e Formas
- **Grid Base:** 8pt (com sub-módulos de 4pt para alinhamento micro).
- **Arredondamento (*Roundness*):** `ROUND_FOUR` (4px–8px para inputs e caixas de seleção, 12px–16px para modais e cards flutuantes, 9999px para badges e pílulas).
- **Elevações & Sombras:**
  - `E1` (Cards e Dock): `0 1px 3px rgba(15, 23, 42, 0.08), 0 1px 2px rgba(15, 23, 42, 0.04)`
  - `E2` (Folha do PDF central): `0 10px 25px -5px rgba(15, 23, 42, 0.08), 0 8px 10px -6px rgba(15, 23, 42, 0.04)`
  - `E3` (Modais e Overlays): `0 20px 35px -10px rgba(15, 23, 42, 0.16)`

---

## 3. Telas do MVP e Especificações de Interface

### 3.1. Tela 1: Início & Recentes (Dashboard Acadêmico Focado)
- **Objetivo:** Permitir a importação imediata de apostilas ou retomada de estudos com 1 clique.
- **Componentes Principais:**
  1. **Top Bar:** Logotipo `EstudoPDF`, navegação estrutural e status de sincronização local/nuvem.
  2. **Área de Drag & Drop & Upload:** 
     - Ícone de documento com indicação limpa.
     - Chamada: *"Arraste e solte o PDF aqui"*.
     - Botão de destaque com atalho: `Abrir PDF do Computador [⌘O]`.
     - Aviso de segurança: *"Processamento 100% privado no navegador • O arquivo original nunca é alterado"*.
  3. **Grid de Documentos Recentes ("Continuar de onde parou"):**
     - Cards em grade de 4 colunas com thumbnail miniaturizada do PDF.
     - Indicador de progresso (ex: `Pág 3/12 - 4 respostas salvas`, `Pág 18/45 - 85% campos`).
     - Ações diretas: `Continuar Respondendo`, `Abrir Prova`, `Exportar PDF Preenchido`.
  4. **Rodapé de Atalhos e Princípios:**
     - Resumo didático dos 3 passos (Importe sem medo → Alinhamento Inteligente → Exportação Acadêmica).
     - Dicas rápidas de teclado (`Espaço`, `T`, `H`).

---

### 3.2. Tela 2: Editor de PDF (Área Central de Estudo)
- **Objetivo:** O ambiente principal de estudo sem distrações, onde o aluno preenche o documento.
- **Componentes Principais:**
  1. **Header do Documento:**
     - Botão voltar (`←`).
     - Título editável do arquivo (`Lista_04_Fisica_Mecanica.pdf`).
     - Metadados discretos (`12 páginas • 4.2 MB`).
     - Status instantâneo de salvamento: `● Salvo` (com suporte a Desfazer `⌘Z` e Refazer `⇧⌘Z`).
     - Ação primária destacada no topo direito: `Exportar [⌘E]`.
  2. **Sidebar Esquerda (Navegador de Miniaturas):**
     - Pré-visualização vertical de cada página do PDF.
     - Contadores contextuais (ex: `Pág 1: 3 resp.`, `Pág 2: 1 sugestão`, `Pág 3 (Atual)`).
     - Badge do modo foco: documento ativo e progresso global.
  3. **Área Central (Visualizador A4 do PDF):**
     - O PDF original permanece nítido com tipografia institucional de faculdade/concurso.
     - **Camada de Resposta Interativa:**
       - Caixa de texto ativa delimitada com borda azul e alças vetoriais de redimensionamento.
       - Barra de ferramentas acoplada ao campo: `Mover [::]`, `Alinhar Linha`, `Excluir [Lixeira]`.
       - Prévia imediata do texto digitado pelo aluno em destaque legível e contraste balanceado.
     - **Sistema de Detecção de Campos Inteligente:**
       - Quando campos de resposta são detectados sobre linhas de exercícios: exibição de barra âmbar suave com nível de precisão (`98% confiança`).
       - Opções explícitas de consentimento: `[✓ Aceitar]` ou `[✕ Rejeitar]`, evitando preenchimento forçado.
  4. **Dock Flutuante de Ferramentas (Base Central):**
     - Ferramentas essenciais do MVP:
       - `Cursor / Selecionar` (`V`)
       - `Texto` (`T`)
       - `Caneta` (Anotações leves)
       - `Detectar Campos` (Badge numérico de sugestões pendentes)
     - Controles integrados de visualização:
       - Paginação direta: `< Pág 3 / 12 >`
       - Zoom percentual com reset rápido (`100%`, `-`, `+`, `Ajustar à Tela`).

---

### 3.3. Tela 3: Modal de Confirmação de Exportação
- **Objetivo:** Proporcionar segurança e tranquilidade no momento da entrega do trabalho ou lista de exercícios.
- **Componentes Principais:**
  1. **Aviso de Integridade do Original:**
     - Card com selo de verificação azul: *"Seu PDF original não será alterado. Uma nova cópia com todas as suas respostas, anotações e preenchimentos em camada vetorial será gerada e baixada."*
  2. **Resumo da Sessão Acadêmica:**
     - Nome do arquivo de saída configurável (`Lista_04_Fisica_Mecanica_Preenchida.pdf`).
     - Métricas consolidadas: `Páginas (3 de 12)`, `Campos (4 respostas salvas)`, `Tamanho est. (~4.5 MB)`.
  3. **Seleção do Formato de Saída:**
     - **Opção 1 (Padrão):** *PDF Completo com Respostas* (12 páginas) — Ideal para entrega a professores, Google Classroom ou Moodle.
     - **Opção 2:** *Somente Páginas Respondidas* (3 páginas) — Ideal para impressão ou relatórios condensados.
  4. **Opções Avançadas de Compatibilidade:**
     - Checkbox ativado por padrão: `[✓] Aplainar campos de texto (flatten PDF)` para impossibilitar desconfigurações ou alterações acidentais na avaliação do professor.
  5. **Ações:**
     - `Cancelar` (`Esc`).
     - Botão primário com ícone de download e atalho de teclado: `Exportar PDF Preenchido [⌘↵]`.

---

## 4. Matriz de Estados da Aplicação (State Management UI)

| Estado | Tratamento Visual | Ação do Sistema / Usuário |
| :--- | :--- | :--- |
| **Vazio / Inicial** | Zona de Drag & Drop limpa com ilustração minimalista e recentes. | Clique para abrir arquivo ou arrastar `.pdf`. |
| **Carregando PDF** | Skeleton screen suave na folha central e barra de progresso linear. | Leitura do documento e contagem de páginas. |
| **PDF Carregado** | Folha centralizada, primeira página focada, dock flutuante pronto. | Navegação por scroll, teclado ou clique na sidebar. |
| **Edição Ativa** | Bounding box com alças azuis e cursor de digitação em foco imediato. | Digitação livre, arrasto por alça superior, redimensionamento lateral. |
| **Salvando / Salvo** | Micro-indicador no topo: `Salvando...` → `● Salvo` em verde sutil. | Persistência local contínua a cada caractere. |
| **Campos Detectados** | Pauta sublinhada com banner âmbar translúcido e botão `Aceitar`/`Rejeitar`. | Usuário escolhe se deseja converter em campo digitável. |
| **Exportando** | Botão primário exibe spinner sutil e percentual de renderização vetorial. | Geração de PDF aplainado e disparo de download no browser. |

---

## 5. Próximos Passos & Roadmap Pós-MVP

1. **V1.1:** Exportação de resumo condensado de respostas em formato Markdown/LaTeX para estudantes de exatas.
2. **V1.2:** Marcador de texto inteligente com alinhamento vetorial por linha de texto do PDF.
3. **V1.3:** Integração direta via OAuth com Google Drive, Moodle e Canvas LMS.
