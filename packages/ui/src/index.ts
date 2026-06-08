import StacklineMultiSelect from "@stackline/multiselect";

export interface StacklineAIStudioMessage {
  role: "user" | "assistant";
  content: string;
  metadata?: Record<string, unknown>;
}

export interface StacklineAIStudioModel {
  id: string;
  name?: string;
  provider?: string;
}

interface StacklineAIStudioModelOption {
  id: string;
  itemName: string;
  provider?: string;
}

export type StacklineAIStudioLanguage = "en" | "pt" | "fr" | "es";

export interface StacklineAIStudioTranslations {
  title: string;
  subtitle: string;
  placeholder: string;
  clear: string;
  clearConversationAriaLabel: string;
  empty: string;
  send: string;
  sending: string;
  messageAriaLabel: string;
  modelSelectText: string;
  modelSearchPlaceholder: string;
  modelNoDataLabel: string;
  modelAriaLabel: string;
  modelListboxAriaLabel: string;
  languageSelectText: string;
  languageNoDataLabel: string;
  languageAriaLabel: string;
  languageListboxAriaLabel: string;
  requestFailed: string;
  httpError: string;
  noAssistantContent: string;
  ragResultsTitle: string;
  ragMatchingSourcesFoundOne: string;
  ragMatchingSourcesFoundMany: string;
  ragSourcesFoundOne: string;
  ragSourcesFoundMany: string;
  ragSourceFallback: string;
  ragSourceHeading: string;
  ragSourceLabel: string;
  ragArtistColumn: string;
  ragTitleColumn: string;
  ragSourceColumn: string;
  ragSourcesUsedOne: string;
  ragSourcesUsedMany: string;
  scoreLabel: string;
}

interface StacklineAIStudioLanguageOption {
  id: StacklineAIStudioLanguage;
  itemName: string;
  nativeName: string;
}

interface StacklineRagSource {
  source?: string;
  score?: number;
  excerpt?: string;
  metadata?: Record<string, unknown>;
}

interface StacklineRagEvidence {
  enabled?: boolean;
  contextCount?: number;
  sources?: StacklineRagSource[];
}

export interface StacklineAIStudioElement extends HTMLElement {
  send(message?: string): Promise<void>;
  setModel(modelId: string): void;
  setLanguage(language: string): void;
  setTranslations(translations: Partial<StacklineAIStudioTranslations> | null): void;
  clear(): void;
  focusComposer(): void;
}

export const stacklineAIStudioTagName = "stackline-ai-studio";
const STORAGE_VERSION = 1;
const DEFAULT_HISTORY_LIMIT = 50;
const DEFAULT_STORAGE_MAX_BYTES = 512 * 1024;

export interface StacklineAIStudioStoredState {
  version: number;
  messages: StacklineAIStudioMessage[];
  selectedModelId?: string;
  selectedLanguage?: StacklineAIStudioLanguage;
  updatedAt: string;
}

const DEFAULT_LANGUAGE: StacklineAIStudioLanguage = "en";
const LANGUAGE_OPTIONS: StacklineAIStudioLanguageOption[] = [
  { id: "en", itemName: "EN", nativeName: "English" },
  { id: "pt", itemName: "PT", nativeName: "Português" },
  { id: "fr", itemName: "FR", nativeName: "Français" },
  { id: "es", itemName: "ES", nativeName: "Español" },
];

const DEFAULT_TRANSLATIONS: Record<StacklineAIStudioLanguage, StacklineAIStudioTranslations> = {
  en: {
    title: "Stackline AI Studio",
    subtitle: "Provider-safe chat, ready for RAG and memory.",
    placeholder: "Ask Stackline AI...",
    clear: "Clear",
    clearConversationAriaLabel: "Clear conversation",
    empty: "Start a secure AI conversation.",
    send: "Send",
    sending: "Sending",
    messageAriaLabel: "Message",
    modelSelectText: "Select model",
    modelSearchPlaceholder: "Search models",
    modelNoDataLabel: "No models found",
    modelAriaLabel: "AI model selector",
    modelListboxAriaLabel: "Available AI models",
    languageSelectText: "Language",
    languageNoDataLabel: "No languages found",
    languageAriaLabel: "Language selector",
    languageListboxAriaLabel: "Available languages",
    requestFailed: "Stackline AI request failed.",
    httpError: "Stackline AI returned HTTP {status}.",
    noAssistantContent: "No assistant content returned.",
    ragResultsTitle: "RAG results",
    ragMatchingSourcesFoundOne: "{count} matching source found.",
    ragMatchingSourcesFoundMany: "{count} matching sources found.",
    ragSourcesFoundOne: "{count} source found.",
    ragSourcesFoundMany: "{count} sources found.",
    ragSourceFallback: "RAG source",
    ragSourceHeading: "Source {index}",
    ragSourceLabel: "Source",
    ragArtistColumn: "Artist",
    ragTitleColumn: "Title",
    ragSourceColumn: "Source",
    ragSourcesUsedOne: "{count} source used",
    ragSourcesUsedMany: "{count} sources used",
    scoreLabel: "score",
  },
  pt: {
    title: "Stackline AI Studio",
    subtitle: "Chat seguro por provedor, pronto para RAG e memória.",
    placeholder: "Pergunte ao Stackline AI...",
    clear: "Limpar",
    clearConversationAriaLabel: "Limpar conversa",
    empty: "Comece uma conversa segura com IA.",
    send: "Enviar",
    sending: "Enviando",
    messageAriaLabel: "Mensagem",
    modelSelectText: "Selecionar modelo",
    modelSearchPlaceholder: "Buscar modelos",
    modelNoDataLabel: "Nenhum modelo encontrado",
    modelAriaLabel: "Seletor de modelo de IA",
    modelListboxAriaLabel: "Modelos de IA disponíveis",
    languageSelectText: "Idioma",
    languageNoDataLabel: "Nenhum idioma encontrado",
    languageAriaLabel: "Seletor de idioma",
    languageListboxAriaLabel: "Idiomas disponíveis",
    requestFailed: "A solicitação do Stackline AI falhou.",
    httpError: "Stackline AI retornou HTTP {status}.",
    noAssistantContent: "Nenhum conteúdo do assistente foi retornado.",
    ragResultsTitle: "Resultados RAG",
    ragMatchingSourcesFoundOne: "{count} fonte correspondente encontrada.",
    ragMatchingSourcesFoundMany: "{count} fontes correspondentes encontradas.",
    ragSourcesFoundOne: "{count} fonte encontrada.",
    ragSourcesFoundMany: "{count} fontes encontradas.",
    ragSourceFallback: "Fonte RAG",
    ragSourceHeading: "Fonte {index}",
    ragSourceLabel: "Fonte",
    ragArtistColumn: "Artista",
    ragTitleColumn: "Título",
    ragSourceColumn: "Fonte",
    ragSourcesUsedOne: "{count} fonte usada",
    ragSourcesUsedMany: "{count} fontes usadas",
    scoreLabel: "pontuação",
  },
  fr: {
    title: "Stackline AI Studio",
    subtitle: "Chat sécurisé par fournisseur, prêt pour le RAG et la mémoire.",
    placeholder: "Demandez à Stackline AI...",
    clear: "Effacer",
    clearConversationAriaLabel: "Effacer la conversation",
    empty: "Commencez une conversation IA sécurisée.",
    send: "Envoyer",
    sending: "Envoi",
    messageAriaLabel: "Message",
    modelSelectText: "Sélectionner un modèle",
    modelSearchPlaceholder: "Rechercher des modèles",
    modelNoDataLabel: "Aucun modèle trouvé",
    modelAriaLabel: "Sélecteur de modèle IA",
    modelListboxAriaLabel: "Modèles IA disponibles",
    languageSelectText: "Langue",
    languageNoDataLabel: "Aucune langue trouvée",
    languageAriaLabel: "Sélecteur de langue",
    languageListboxAriaLabel: "Langues disponibles",
    requestFailed: "La requête Stackline AI a échoué.",
    httpError: "Stackline AI a retourné HTTP {status}.",
    noAssistantContent: "Aucun contenu assistant retourné.",
    ragResultsTitle: "Résultats RAG",
    ragMatchingSourcesFoundOne: "{count} source correspondante trouvée.",
    ragMatchingSourcesFoundMany: "{count} sources correspondantes trouvées.",
    ragSourcesFoundOne: "{count} source trouvée.",
    ragSourcesFoundMany: "{count} sources trouvées.",
    ragSourceFallback: "Source RAG",
    ragSourceHeading: "Source {index}",
    ragSourceLabel: "Source",
    ragArtistColumn: "Artiste",
    ragTitleColumn: "Titre",
    ragSourceColumn: "Source",
    ragSourcesUsedOne: "{count} source utilisée",
    ragSourcesUsedMany: "{count} sources utilisées",
    scoreLabel: "score",
  },
  es: {
    title: "Stackline AI Studio",
    subtitle: "Chat seguro por proveedor, listo para RAG y memoria.",
    placeholder: "Pregunta a Stackline AI...",
    clear: "Limpiar",
    clearConversationAriaLabel: "Limpiar conversación",
    empty: "Inicia una conversación segura con IA.",
    send: "Enviar",
    sending: "Enviando",
    messageAriaLabel: "Mensaje",
    modelSelectText: "Seleccionar modelo",
    modelSearchPlaceholder: "Buscar modelos",
    modelNoDataLabel: "No se encontraron modelos",
    modelAriaLabel: "Selector de modelo de IA",
    modelListboxAriaLabel: "Modelos de IA disponibles",
    languageSelectText: "Idioma",
    languageNoDataLabel: "No se encontraron idiomas",
    languageAriaLabel: "Selector de idioma",
    languageListboxAriaLabel: "Idiomas disponibles",
    requestFailed: "La solicitud de Stackline AI falló.",
    httpError: "Stackline AI devolvió HTTP {status}.",
    noAssistantContent: "No se devolvió contenido del asistente.",
    ragResultsTitle: "Resultados RAG",
    ragMatchingSourcesFoundOne: "{count} fuente coincidente encontrada.",
    ragMatchingSourcesFoundMany: "{count} fuentes coincidentes encontradas.",
    ragSourcesFoundOne: "{count} fuente encontrada.",
    ragSourcesFoundMany: "{count} fuentes encontradas.",
    ragSourceFallback: "Fuente RAG",
    ragSourceHeading: "Fuente {index}",
    ragSourceLabel: "Fuente",
    ragArtistColumn: "Artista",
    ragTitleColumn: "Título",
    ragSourceColumn: "Fuente",
    ragSourcesUsedOne: "{count} fuente usada",
    ragSourcesUsedMany: "{count} fuentes usadas",
    scoreLabel: "puntuación",
  },
};

function normalizeLanguage(value: string | null | undefined): StacklineAIStudioLanguage {
  const normalized = (value || DEFAULT_LANGUAGE).trim().toLowerCase();
  const shortCode = normalized.slice(0, 2);
  if (shortCode === "pt" || shortCode === "fr" || shortCode === "es") return shortCode;
  return DEFAULT_LANGUAGE;
}

function interpolateLabel(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(values[key] ?? ""));
}

function pluralLabel(
  labels: StacklineAIStudioTranslations,
  oneKey: keyof StacklineAIStudioTranslations,
  manyKey: keyof StacklineAIStudioTranslations,
  count: number,
): string {
  const template = count === 1 ? labels[oneKey] : labels[manyKey];
  return interpolateLabel(String(template), { count });
}

function parseTranslationOverrides(value: string | null): Partial<StacklineAIStudioTranslations> {
  if (!value) return {};
  try {
    const parsed = JSON.parse(value) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    return Object.fromEntries(
      Object.entries(parsed).filter(([, item]) => typeof item === "string"),
    ) as Partial<StacklineAIStudioTranslations>;
  } catch {
    return {};
  }
}

export function resolveStacklineAIStudioTranslations(
  language: string | null | undefined = DEFAULT_LANGUAGE,
  overrides: Partial<StacklineAIStudioTranslations> = {},
): StacklineAIStudioTranslations {
  return {
    ...DEFAULT_TRANSLATIONS[normalizeLanguage(language)],
    ...overrides,
  };
}

const styles = /* css */ `
:host {
  --sai-bg: #f6f8fb;
  --sai-surface: #ffffff;
  --sai-surface-soft: #eef3f8;
  --sai-text: #17202a;
  --sai-muted: #65758b;
  --sai-border: #d9e2ec;
  --sai-accent: #0f8f7e;
  --sai-accent-strong: #0a6d60;
  --sai-user: #0f8f7e;
  --sai-assistant: #243447;
  --sai-danger: #b3261e;
  display: block;
  min-height: 520px;
  min-width: 0;
  color: var(--sai-text);
  font-family: Inter, Roboto, "Helvetica Neue", Arial, sans-serif;
  box-sizing: border-box;
}

*,
*::before,
*::after {
  box-sizing: border-box;
}

:host([theme="dark"]) {
  --sai-bg: #101418;
  --sai-surface: #171d23;
  --sai-surface-soft: #202832;
  --sai-text: #eef3f8;
  --sai-muted: #a9b6c8;
  --sai-border: #344253;
  --sai-accent: #35c4ac;
  --sai-accent-strong: #5ddac7;
  --sai-user: #35c4ac;
  --sai-assistant: #dce6f1;
}

:host([theme="brand"]) {
  --sai-accent: #4557c9;
  --sai-accent-strong: #3343a6;
  --sai-user: #4557c9;
}

.studio {
  min-height: inherit;
  height: 100%;
  min-width: 0;
  display: grid;
  grid-template-rows: auto 1fr auto;
  overflow: hidden;
  border: 1px solid var(--sai-border);
  border-radius: 18px;
  background: var(--sai-bg);
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 18px 20px;
  border-bottom: 1px solid var(--sai-border);
  background: var(--sai-surface);
}

.title {
  margin: 0;
  font-size: 1rem;
  font-weight: 750;
}

.subtitle {
  margin: 4px 0 0;
  color: var(--sai-muted);
  font-size: .875rem;
}

.header-actions {
  display: flex;
  min-width: min(450px, 48vw);
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
}

.studio-picker {
  --ms-primary: var(--sai-accent);
  --ms-primary-soft: color-mix(in srgb, var(--sai-accent) 12%, transparent);
  --ms-surface: var(--sai-surface);
  --ms-surface-soft: var(--sai-surface-soft);
  --ms-surface-muted: color-mix(in srgb, var(--sai-muted) 14%, var(--sai-surface));
  --ms-outline: var(--sai-border);
  --ms-outline-strong: var(--sai-accent);
  --ms-on-surface: var(--sai-text);
  --ms-on-surface-muted: var(--sai-muted);
  --ms-chip-bg: color-mix(in srgb, var(--sai-accent) 12%, var(--sai-surface));
  --ms-chip-text: var(--sai-accent-strong);
  --ms-chip-remove: var(--sai-accent-strong);
  --ms-shadow-soft: none;
  --ms-shadow: 0 18px 44px rgba(23, 32, 42, 0.16);
}

.model-picker {
  width: min(360px, 36vw);
}

.language-picker {
  width: 72px;
  flex: 0 0 72px;
}

.language-picker .c-btn {
  min-height: 34px;
  padding: 6px 26px 6px 10px;
  border-radius: 9px;
}

.language-picker .c-single-value {
  font-size: .78rem;
  font-weight: 800;
  letter-spacing: 0;
}

.language-picker .c-arrow-toggle {
  width: 24px;
}

.language-picker c-icon,
.language-picker c-icon svg {
  width: 12px;
  height: 12px;
}

.studio-picker .stackline-dropdown {
  position: relative;
  display: block;
  width: 100%;
}

.studio-picker .selected-list {
  width: 100%;
}

.studio-picker .c-btn {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  min-height: 38px;
  box-sizing: border-box;
  padding: 7px 36px 7px 12px;
  border: 1px solid var(--ms-outline);
  border-radius: 10px;
  background: var(--ms-surface);
  color: var(--ms-on-surface);
  cursor: pointer;
  line-height: 1.3;
}

.studio-picker .c-btn:hover,
.studio-picker .c-btn.is-active {
  border-color: var(--ms-outline-strong);
}

.studio-picker .c-btn:focus-visible,
.studio-picker .pure-checkbox:focus-visible,
.studio-picker .list-filter input:focus-visible,
.studio-picker .c-arrow-toggle:focus-visible {
  outline: 3px solid color-mix(in srgb, var(--sai-accent) 28%, transparent);
  outline-offset: 2px;
}

.studio-picker .c-placeholder,
.studio-picker .c-single-value {
  min-width: 0;
  max-width: 100%;
  overflow: hidden;
  color: var(--ms-on-surface);
  font-size: .88rem;
  font-weight: 650;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.studio-picker .c-arrow-toggle {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  display: inline-flex;
  width: 32px;
  height: auto;
  min-width: 0;
  min-height: 0;
  align-items: center;
  justify-content: center;
  border: 0;
  padding: 0;
  transform: none;
  background: transparent;
  color: var(--ms-on-surface-muted);
  cursor: pointer;
}

.studio-picker c-icon,
.studio-picker c-icon svg {
  display: inline-flex;
  width: 14px;
  height: 14px;
  fill: currentColor;
}

.studio-picker .dropdown-list {
  position: absolute;
  right: 0;
  left: 0;
  box-sizing: border-box;
  width: auto;
  min-width: 0;
  max-width: 100%;
  padding-top: 8px;
  z-index: 100000;
}

.studio-picker .dropdown-list[hidden] {
  display: none !important;
}

.studio-picker .dropdown-list.is-open {
  position: absolute;
  right: 0;
  left: 0;
  max-width: 100%;
}

.studio-picker .list-area {
  overflow: hidden;
  border: 1px solid var(--ms-outline);
  border-radius: 12px;
  background: var(--ms-surface);
  box-shadow: var(--ms-shadow);
}

.studio-picker .list-filter {
  position: relative;
  display: block;
  padding: 10px;
  border-bottom: 1px solid var(--ms-outline);
  background: var(--ms-surface);
}

.studio-picker .list-filter input {
  width: 100%;
  min-height: 38px;
  box-sizing: border-box;
  border: 1px solid var(--ms-outline);
  border-radius: 10px;
  padding: 0 12px;
  background: var(--ms-surface-soft);
  color: var(--ms-on-surface);
  font: inherit;
}

.studio-picker .c-search,
.studio-picker .c-clear,
.studio-picker .select-all {
  display: none;
}

.studio-picker .lazyContainer {
  display: block;
  margin: 0;
  padding: 6px;
  overflow: auto;
  list-style: none;
}

.studio-picker .pure-checkbox {
  display: block;
  margin: 0;
  padding: 10px 12px;
  border-radius: 10px;
  color: var(--ms-on-surface);
  cursor: pointer;
  line-height: 1.3;
}

.studio-picker .pure-checkbox:hover,
.studio-picker .pure-checkbox.active {
  background: var(--ms-primary-soft);
}

.studio-picker .pure-checkbox.selected-item {
  background: color-mix(in srgb, var(--sai-accent) 16%, var(--sai-surface));
  color: var(--sai-accent-strong);
  font-weight: 750;
}

.studio-picker .pure-checkbox input {
  display: none;
}

.studio-picker .pure-checkbox label {
  display: block;
  overflow-wrap: anywhere;
}

.studio-picker .list-message {
  margin: 0;
  padding: 14px;
  color: var(--ms-on-surface-muted);
}

.messages {
  position: relative;
  min-height: 0;
  overflow: hidden;
  padding: 22px;
}

.messages.has-messages {
  overflow: auto;
}

.messages.is-empty {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
}

.clear-history {
  position: sticky;
  top: 0;
  z-index: 5;
  display: flex;
  width: fit-content;
  min-width: 0;
  min-height: 32px;
  align-items: center;
  justify-content: center;
  margin: 0 0 12px auto;
  border: 1px solid var(--sai-border);
  border-radius: 999px;
  padding: 0 12px;
  background: color-mix(in srgb, var(--sai-surface) 88%, transparent);
  color: var(--sai-muted);
  box-shadow: 0 8px 22px rgba(23, 32, 42, 0.08);
  font-size: .8rem;
  font-weight: 750;
  backdrop-filter: blur(12px);
}

.clear-history:hover {
  border-color: var(--sai-accent);
  background: var(--sai-surface);
  color: var(--sai-accent-strong);
}

.empty {
  min-height: 0;
  display: grid;
  place-items: center;
  text-align: center;
  color: var(--sai-muted);
}

.message {
  max-width: min(760px, 90%);
  margin: 0 0 14px;
  padding: 14px 16px;
  border-radius: 16px;
  border: 1px solid var(--sai-border);
  background: var(--sai-surface);
  line-height: 1.5;
  overflow-wrap: anywhere;
  white-space: normal;
}

.message.user {
  margin-left: auto;
  border-color: color-mix(in srgb, var(--sai-user) 45%, var(--sai-border));
  background: color-mix(in srgb, var(--sai-user) 12%, var(--sai-surface));
  white-space: pre-wrap;
}

.message.assistant {
  margin-right: auto;
}

.markdown > :first-child {
  margin-top: 0;
}

.markdown > :last-child {
  margin-bottom: 0;
}

.markdown p {
  margin: 0 0 12px;
}

.markdown h3,
.markdown h4,
.markdown h5,
.markdown h6 {
  margin: 16px 0 8px;
  color: var(--sai-text);
  line-height: 1.25;
}

.markdown h3 {
  font-size: 1rem;
}

.markdown h4,
.markdown h5,
.markdown h6 {
  font-size: .94rem;
}

.markdown ul,
.markdown ol {
  margin: 0 0 12px;
  padding-left: 1.3rem;
}

.markdown li {
  margin: 4px 0;
}

.markdown code {
  border-radius: 6px;
  padding: 2px 5px;
  background: var(--sai-surface-soft);
  color: var(--sai-text);
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
  font-size: .92em;
}

.markdown pre {
  max-width: 100%;
  margin: 0 0 12px;
  overflow: auto;
  border: 1px solid var(--sai-border);
  border-radius: 12px;
  padding: 12px;
  background: var(--sai-surface-soft);
}

.markdown pre code {
  display: block;
  padding: 0;
  background: transparent;
  white-space: pre;
}

.markdown blockquote {
  margin: 0 0 12px;
  border-left: 3px solid var(--sai-accent);
  padding: 4px 0 4px 12px;
  color: var(--sai-muted);
}

.markdown table {
  width: 100%;
  margin: 0 0 12px;
  border-collapse: collapse;
  font-size: .94rem;
}

.markdown-table {
  max-width: 100%;
  overflow: auto;
}

.markdown th,
.markdown td {
  border: 1px solid var(--sai-border);
  padding: 8px 10px;
  text-align: left;
  vertical-align: top;
}

.markdown th {
  background: var(--sai-surface-soft);
  font-weight: 750;
}

.markdown a {
  color: var(--sai-accent-strong);
  font-weight: 650;
  text-decoration: underline;
  text-underline-offset: 2px;
}

.rag-evidence {
  margin-top: 12px;
  border-top: 1px solid var(--sai-border);
  padding-top: 10px;
  color: var(--sai-muted);
  font-size: .8rem;
}

.rag-evidence summary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-weight: 750;
}

.rag-badge {
  display: inline-flex;
  min-height: 22px;
  align-items: center;
  border-radius: 999px;
  padding: 2px 8px;
  background: color-mix(in srgb, var(--sai-accent) 12%, var(--sai-surface));
  color: var(--sai-accent-strong);
}

.rag-source-list {
  display: grid;
  gap: 8px;
  margin: 10px 0 0;
  padding: 0;
  list-style: none;
}

.rag-source {
  border: 1px solid var(--sai-border);
  border-radius: 10px;
  padding: 8px 10px;
  background: color-mix(in srgb, var(--sai-surface-soft) 70%, var(--sai-surface));
}

.rag-source strong {
  display: block;
  color: var(--sai-text);
  font-size: .82rem;
}

.rag-source span {
  display: block;
  margin-top: 3px;
  overflow-wrap: anywhere;
}

.rag-source-excerpt {
  margin-top: 6px;
  color: var(--sai-muted);
}

.rag-source-excerpt p {
  margin: 0 0 6px;
}

.composer {
  min-height: 0;
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 12px;
  padding: 16px;
  border-top: 1px solid var(--sai-border);
  background: var(--sai-surface);
}

textarea {
  min-height: 48px;
  max-height: 160px;
  resize: vertical;
  border: 1px solid var(--sai-border);
  border-radius: 14px;
  padding: 13px 14px;
  background: var(--sai-surface-soft);
  color: var(--sai-text);
  font: inherit;
  line-height: 1.35;
}

button {
  min-width: 92px;
  min-height: 48px;
  border: 0;
  border-radius: 14px;
  padding: 0 18px;
  background: var(--sai-accent);
  color: #fff;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}

button:hover {
  background: var(--sai-accent-strong);
}

button:disabled {
  cursor: not-allowed;
  opacity: .58;
}

.error {
  grid-column: 1 / -1;
  color: var(--sai-danger);
  font-size: .875rem;
}

@media (max-width: 680px) {
  :host {
    min-height: 100dvh;
  }

  .studio {
    border-radius: 0;
    border-left: 0;
    border-right: 0;
  }

  .header {
    align-items: stretch;
    flex-direction: column;
  }

  .header-actions {
    width: 100%;
    min-width: 0;
    flex-direction: row;
    align-items: stretch;
  }

  .model-picker {
    width: auto;
    min-width: 0;
    flex: 1 1 auto;
  }

  .language-picker {
    width: 72px;
    flex: 0 0 72px;
  }

  .composer {
    grid-template-columns: 1fr;
  }

  button {
    width: 100%;
  }
}
`;

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => {
    switch (char) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case '"':
        return "&quot;";
      default:
        return "&#039;";
    }
  });
}

function escapeHtmlPreservingEntities(value: string): string {
  return value
    .replace(/&(?!(?:#\d+|#x[\da-fA-F]+|[a-zA-Z][\w-]+);)/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function safeLinkUrl(value: string): string | null {
  const trimmed = value.trim();
  if (/^(https?:|mailto:)/i.test(trimmed) || trimmed.startsWith("/") || trimmed.startsWith("#")) {
    return trimmed;
  }
  return null;
}

const SAFE_HTML_TAGS = new Set([
  "a",
  "b",
  "blockquote",
  "br",
  "code",
  "del",
  "div",
  "em",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "hr",
  "i",
  "li",
  "ol",
  "p",
  "pre",
  "s",
  "span",
  "strong",
  "table",
  "tbody",
  "td",
  "th",
  "thead",
  "tr",
  "u",
  "ul",
]);

const SAFE_HTML_VOID_TAGS = new Set(["br", "hr"]);
const DANGEROUS_HTML_BLOCKS = /<(script|style|iframe|object|embed|svg|math)\b[\s\S]*?(?:<\/\1\s*>|$)/gi;
const DANGEROUS_HTML_TAGS = /<\/?(script|style|iframe|object|embed|svg|math)\b[^>]*>/gi;
const BLOCK_HTML_TAGS = /<\/?(blockquote|div|h[1-6]|li|ol|p|pre|table|tbody|td|th|thead|tr|ul)\b/i;

function attrValue(attributes: string, name: string): string {
  const pattern = new RegExp(String.raw`\b${name}\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+))`, "i");
  const match = attributes.match(pattern);
  return match?.[1] ?? match?.[2] ?? match?.[3] ?? "";
}

function safeHtmlTag(tagName: string, rawAttributes: string, closing: boolean, selfClosing: boolean): string {
  const tag = tagName.toLowerCase();
  if (!SAFE_HTML_TAGS.has(tag)) return "";
  if (closing) return SAFE_HTML_VOID_TAGS.has(tag) ? "" : `</${tag}>`;
  if (tag === "a") {
    const href = safeLinkUrl(attrValue(rawAttributes, "href"));
    const title = attrValue(rawAttributes, "title");
    const titleAttr = title ? ` title="${escapeHtml(title)}"` : "";
    const hrefAttr = href
      ? ` href="${escapeHtml(href)}" target="_blank" rel="noreferrer noopener"`
      : "";
    return `<a${hrefAttr}${titleAttr}>`;
  }
  if (SAFE_HTML_VOID_TAGS.has(tag)) return `<${tag}>`;
  return selfClosing ? `<${tag}></${tag}>` : `<${tag}>`;
}

function sanitizeSafeHtml(value: string): string {
  const withoutDangerousBlocks = value
    .replace(DANGEROUS_HTML_BLOCKS, "")
    .replace(DANGEROUS_HTML_TAGS, "");
  const tagPattern = /<\/?\s*([a-zA-Z][\w:-]*)([^<>]*)>/g;
  let output = "";
  let lastIndex = 0;

  for (const match of withoutDangerousBlocks.matchAll(tagPattern)) {
    const raw = match[0] ?? "";
    const index = match.index ?? 0;
    output += escapeHtmlPreservingEntities(withoutDangerousBlocks.slice(lastIndex, index));
    const closing = /^<\s*\//.test(raw);
    const selfClosing = /\/\s*>$/.test(raw);
    output += safeHtmlTag(match[1] ?? "", match[2] ?? "", closing, selfClosing);
    lastIndex = index + raw.length;
  }

  output += escapeHtmlPreservingEntities(withoutDangerousBlocks.slice(lastIndex));
  return output;
}

function containsBlockHtml(value: string): boolean {
  return BLOCK_HTML_TAGS.test(value);
}

function renderInlinePlainMarkdown(value: string): string {
  return sanitizeSafeHtml(value)
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/__([^_]+)__/g, "<strong>$1</strong>")
    .replace(/~~([^~]+)~~/g, "<s>$1</s>")
    .replace(/(^|[\s(])\*([^*\n]+)\*/g, "$1<em>$2</em>")
    .replace(/(^|[\s(])_([^_\n]+)_/g, "$1<em>$2</em>");
}

function renderInlineMarkdown(value: string): string {
  const codeParts = value.split(/(`[^`]+`)/g);
  return codeParts
    .map((part) => {
      if (part.startsWith("`") && part.endsWith("`")) {
        return `<code>${escapeHtml(part.slice(1, -1))}</code>`;
      }

      let output = "";
      let lastIndex = 0;
      const linkPattern = /\[([^\]]+)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;
      for (const match of part.matchAll(linkPattern)) {
        output += renderInlinePlainMarkdown(part.slice(lastIndex, match.index));
        const label = match[1] ?? "";
        const href = safeLinkUrl(match[2] ?? "");
        output += href
          ? `<a href="${escapeHtml(href)}" target="_blank" rel="noreferrer noopener">${renderInlinePlainMarkdown(
              label,
            )}</a>`
          : renderInlinePlainMarkdown(label);
        lastIndex = (match.index ?? 0) + match[0].length;
      }
      output += renderInlinePlainMarkdown(part.slice(lastIndex));
      return output;
    })
    .join("");
}

function splitTableRow(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

function isTableDivider(line: string | undefined): boolean {
  if (!line) return false;
  const cells = splitTableRow(line);
  return cells.length > 1 && cells.every((cell) => /^:?-{3,}:?$/.test(cell));
}

function renderTable(lines: string[]): string {
  const [headLine, , ...bodyLines] = lines;
  const head = splitTableRow(headLine ?? "");
  const body = bodyLines.map(splitTableRow);

  return `<div class="markdown-table"><table><thead><tr>${head
    .map((cell) => `<th>${renderInlineMarkdown(cell)}</th>`)
    .join("")}</tr></thead><tbody>${body
    .map(
      (row) =>
        `<tr>${head
          .map((_, index) => `<td>${renderInlineMarkdown(row[index] ?? "")}</td>`)
          .join("")}</tr>`,
    )
    .join("")}</tbody></table></div>`;
}

function renderList(lines: string[], ordered: boolean): string {
  const tag = ordered ? "ol" : "ul";
  const pattern = ordered ? /^\s*\d+[.)]\s+(.+)$/ : /^\s*[-*+]\s+(.+)$/;
  return `<${tag}>${lines
    .map((line) => `<li>${renderInlineMarkdown(line.match(pattern)?.[1] ?? line)}</li>`)
    .join("")}</${tag}>`;
}

export function renderStacklineMarkdown(value: string): string {
  const lines = value.replace(/\r\n?/g, "\n").split("\n");
  const blocks: string[] = [];
  let paragraph: string[] = [];

  const flushParagraph = () => {
    const text = paragraph.join(" ").trim();
    if (text) {
      blocks.push(containsBlockHtml(text) ? renderInlineMarkdown(text) : `<p>${renderInlineMarkdown(text)}</p>`);
    }
    paragraph = [];
  };

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index] ?? "";
    const trimmed = line.trim();

    if (!trimmed) {
      flushParagraph();
      continue;
    }

    const fence = trimmed.match(/^```([\w-]+)?\s*$/);
    if (fence) {
      flushParagraph();
      const codeLines: string[] = [];
      index += 1;
      while (index < lines.length && !/^```\s*$/.test((lines[index] ?? "").trim())) {
        codeLines.push(lines[index] ?? "");
        index += 1;
      }
      const language = fence[1] ? ` language-${escapeHtml(fence[1])}` : "";
      blocks.push(`<pre><code class="${language.trim()}">${escapeHtml(codeLines.join("\n"))}</code></pre>`);
      continue;
    }

    if (trimmed.includes("|") && isTableDivider(lines[index + 1])) {
      flushParagraph();
      const tableLines = [line, lines[index + 1] ?? ""];
      index += 2;
      while (index < lines.length && (lines[index] ?? "").includes("|") && (lines[index] ?? "").trim()) {
        tableLines.push(lines[index] ?? "");
        index += 1;
      }
      index -= 1;
      blocks.push(renderTable(tableLines));
      continue;
    }

    const heading = trimmed.match(/^(#{1,4})\s+(.+)$/);
    if (heading) {
      flushParagraph();
      const level = Math.min(6, heading[1]!.length + 2);
      blocks.push(`<h${level}>${renderInlineMarkdown(heading[2] ?? "")}</h${level}>`);
      continue;
    }

    if (/^>\s?/.test(trimmed)) {
      flushParagraph();
      const quoteLines = [trimmed.replace(/^>\s?/, "")];
      while (index + 1 < lines.length && /^>\s?/.test((lines[index + 1] ?? "").trim())) {
        index += 1;
        quoteLines.push((lines[index] ?? "").trim().replace(/^>\s?/, ""));
      }
      blocks.push(`<blockquote>${quoteLines.map(renderInlineMarkdown).join("<br>")}</blockquote>`);
      continue;
    }

    if (/^\s*[-*+]\s+/.test(line)) {
      flushParagraph();
      const listLines = [line];
      while (index + 1 < lines.length && /^\s*[-*+]\s+/.test(lines[index + 1] ?? "")) {
        index += 1;
        listLines.push(lines[index] ?? "");
      }
      blocks.push(renderList(listLines, false));
      continue;
    }

    if (/^\s*\d+[.)]\s+/.test(line)) {
      flushParagraph();
      const listLines = [line];
      while (index + 1 < lines.length && /^\s*\d+[.)]\s+/.test(lines[index + 1] ?? "")) {
        index += 1;
        listLines.push(lines[index] ?? "");
      }
      blocks.push(renderList(listLines, true));
      continue;
    }

    paragraph.push(line);
  }

  flushParagraph();
  return blocks.join("");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object";
}

function isStudioMessage(value: unknown): value is StacklineAIStudioMessage {
  if (!isRecord(value)) return false;
  if (value.role !== "user" && value.role !== "assistant") return false;
  if (typeof value.content !== "string") return false;
  return value.metadata === undefined || isRecord(value.metadata);
}

function sanitizeStudioMetadataForStorage(
  metadata: Record<string, unknown> | undefined,
): Record<string, unknown> | undefined {
  if (!metadata) return undefined;
  const clean = Object.fromEntries(
    Object.entries(metadata).filter(([key]) => !key.startsWith("stacklineRag")),
  );
  return Object.keys(clean).length ? clean : undefined;
}

export function sanitizeStudioMessageForStorage(message: StacklineAIStudioMessage): StacklineAIStudioMessage {
  const metadata = sanitizeStudioMetadataForStorage(message.metadata);
  return metadata ? { ...message, metadata } : { role: message.role, content: message.content };
}

export function normalizeStoredStudioState(
  value: unknown,
  historyLimit = DEFAULT_HISTORY_LIMIT,
  storageMaxBytes = DEFAULT_STORAGE_MAX_BYTES,
): StacklineAIStudioStoredState | null {
  if (!isRecord(value) || value.version !== STORAGE_VERSION) return null;
  if (!Array.isArray(value.messages)) return null;

  const messages = value.messages.filter(isStudioMessage).map(sanitizeStudioMessageForStorage).slice(-historyLimit);
  const selectedModelId = typeof value.selectedModelId === "string" ? value.selectedModelId : undefined;
  const selectedLanguage =
    typeof value.selectedLanguage === "string" ? normalizeLanguage(value.selectedLanguage) : undefined;
  const updatedAt = typeof value.updatedAt === "string" ? value.updatedAt : new Date().toISOString();

  return trimStoredStudioStateToStorageBudget(
    {
      version: STORAGE_VERSION,
      messages,
      selectedModelId,
      selectedLanguage,
      updatedAt,
    },
    storageMaxBytes,
  );
}

export function stacklineAIStorageByteLength(value: unknown): number {
  const text = typeof value === "string" ? value : JSON.stringify(value);
  if (typeof TextEncoder !== "undefined") return new TextEncoder().encode(text).length;
  return text.length * 2;
}

function trimStoredStudioStateToStorageBudget(
  state: StacklineAIStudioStoredState,
  storageMaxBytes: number,
): StacklineAIStudioStoredState {
  if (!Number.isFinite(storageMaxBytes) || storageMaxBytes <= 0) return state;

  let messages = state.messages;
  let next: StacklineAIStudioStoredState = { ...state, messages };

  while (messages.length > 0 && stacklineAIStorageByteLength(next) > storageMaxBytes) {
    messages = messages.slice(1);
    next = { ...next, messages };
  }

  return next;
}

function ragEvidenceFrom(metadata: Record<string, unknown> | undefined): StacklineRagEvidence | null {
  const evidence = metadata?.stacklineRag;
  return isRecord(evidence) ? (evidence as StacklineRagEvidence) : null;
}

function sourceLabel(source: StacklineRagSource, labels: StacklineAIStudioTranslations): string {
  const metadata = source.metadata ?? {};
  const artist = typeof metadata.artistName === "string" ? metadata.artistName : "";
  const song = typeof metadata.songName === "string" ? metadata.songName : "";
  if (artist && song) return `${artist} - ${song}`;
  if (song) return song;
  if (artist) return artist;
  return source.source || labels.ragSourceFallback;
}

function sourceValue(source: StacklineRagSource, key: string): string {
  const value = source.metadata?.[key];
  return typeof value === "string" || typeof value === "number" ? String(value) : "";
}

function ragFallbackMarkdown(
  metadata: Record<string, unknown> | undefined,
  labels: StacklineAIStudioTranslations,
): string {
  const evidence = ragEvidenceFrom(metadata);
  const sources = Array.isArray(evidence?.sources) ? evidence.sources : [];
  if (!evidence?.enabled || !sources.length) return "";

  const songSources = sources.filter((source) => sourceValue(source, "artistName") || sourceValue(source, "songName"));
  if (songSources.length) {
    return [
      `## ${labels.ragResultsTitle}`,
      "",
      pluralLabel(labels, "ragMatchingSourcesFoundOne", "ragMatchingSourcesFoundMany", songSources.length),
      "",
      `| # | ${labels.ragArtistColumn} | ${labels.ragTitleColumn} | ${labels.ragSourceColumn} |`,
      "| --- | --- | --- | --- |",
      ...songSources.map((source, index) =>
        `| ${index + 1} | ${sourceValue(source, "artistName") || "-"} | ${
          sourceValue(source, "songName") || "-"
        } | ${source.source || "-"} |`,
      ),
    ].join("\n");
  }

  return [
    `## ${labels.ragResultsTitle}`,
    "",
    pluralLabel(labels, "ragSourcesFoundOne", "ragSourcesFoundMany", sources.length),
    "",
    ...sources.map((source, index) => {
      const sourceId = source.source ? `\n${labels.ragSourceLabel}: ${source.source}` : "";
      const excerpt = source.excerpt ? `\n\n${source.excerpt}` : "";
      return `### ${interpolateLabel(labels.ragSourceHeading, { index: index + 1 })}${sourceId}${excerpt}`;
    }),
  ].join("\n");
}

export function assistantDisplayMarkdown(
  message: StacklineAIStudioMessage,
  labels: StacklineAIStudioTranslations = DEFAULT_TRANSLATIONS.en,
): string {
  if (message.content.trim()) return message.content;
  return ragFallbackMarkdown(message.metadata, labels) || labels.noAssistantContent;
}

function renderRagEvidence(
  metadata: Record<string, unknown> | undefined,
  labels: StacklineAIStudioTranslations,
): string {
  const evidence = ragEvidenceFrom(metadata);
  if (!evidence?.enabled) return "";

  const contextCount = Number(evidence.contextCount ?? evidence.sources?.length ?? 0);
  const sources = Array.isArray(evidence.sources) ? evidence.sources.slice(0, 5) : [];
  const sourceItems = sources
    .map((source) => {
      const score = typeof source.score === "number" ? ` · ${labels.scoreLabel} ${source.score}` : "";
      const excerpt = source.excerpt
        ? `<div class="rag-source-excerpt markdown">${renderStacklineMarkdown(source.excerpt)}</div>`
        : "";
      const sourceId = source.source ? `<span>${escapeHtml(source.source)}</span>` : "";
      return `<li class="rag-source"><strong>${escapeHtml(sourceLabel(source, labels))}${score}</strong>${sourceId}${excerpt}</li>`;
    })
    .join("");

  return `<details class="rag-evidence" open>
    <summary><span class="rag-badge">RAG</span>${escapeHtml(
      pluralLabel(labels, "ragSourcesUsedOne", "ragSourcesUsedMany", contextCount),
    )}</summary>
    ${sourceItems ? `<ol class="rag-source-list">${sourceItems}</ol>` : ""}
  </details>`;
}

function modelsEndpointFor(endpoint: string, explicit: string | null): string {
  if (explicit) return explicit;
  return endpoint.endsWith("/chat") ? endpoint.slice(0, -5) + "/models" : "/api/ai/models";
}

function modelSortLabel(model: StacklineAIStudioModel): string {
  return model.name || model.id;
}

function compareModels(first: StacklineAIStudioModel, second: StacklineAIStudioModel): number {
  return modelSortLabel(first).localeCompare(modelSortLabel(second), undefined, {
    numeric: true,
    sensitivity: "base",
  });
}

function isStorageQuotaError(cause: unknown): boolean {
  if (!isRecord(cause)) return false;
  const name = typeof cause.name === "string" ? cause.name : "";
  const code = typeof cause.code === "number" ? cause.code : undefined;
  return name === "QuotaExceededError" || name === "NS_ERROR_DOM_QUOTA_REACHED" || code === 22 || code === 1014;
}

export function resolveStacklineAIStudioModelId(
  models: readonly StacklineAIStudioModel[],
  selectedModelId?: string | null,
  modelAttribute?: string | null,
): string {
  const requested = (selectedModelId || modelAttribute || "").trim();
  if (!models.length) return requested;
  if (requested && models.some((model) => model.id === requested)) return requested;
  return models[0]?.id || requested;
}

async function readErrorMessage(response: Response, labels: StacklineAIStudioTranslations): Promise<string> {
  const fallback = interpolateLabel(labels.httpError, { status: response.status });
  const text = await response.text().catch(() => "");
  if (!text.trim()) return fallback;

  try {
    const body = JSON.parse(text) as {
      error?: string | { message?: unknown };
      message?: unknown;
    };
    if (typeof body.error === "string") return body.error;
    if (body.error && typeof body.error === "object" && typeof body.error.message === "string") {
      return body.error.message;
    }
    if (typeof body.message === "string") return body.message;
  } catch {
    return `${fallback} ${text.slice(0, 500)}`;
  }

  return fallback;
}

export function defineStacklineAIStudio(win?: Window & typeof globalThis): void {
  const root = win ?? (typeof window === "undefined" ? undefined : window);
  if (!root?.customElements || root.customElements.get(stacklineAIStudioTagName)) return;

  const windowRoot = root;
  const HTMLElementCtor = root.HTMLElement;

  class StacklineAIStudio extends HTMLElementCtor implements StacklineAIStudioElement {
    private messages: StacklineAIStudioMessage[] = [];
    private models: StacklineAIStudioModel[] = [];
    private modelSelect: StacklineMultiSelect<StacklineAIStudioModelOption> | null = null;
    private languageSelect: StacklineMultiSelect<StacklineAIStudioLanguageOption> | null = null;
    private selectedModelId = "";
    private selectedLanguage: StacklineAIStudioLanguage = DEFAULT_LANGUAGE;
    private customTranslations: Partial<StacklineAIStudioTranslations> = {};
    private busy = false;
    private error = "";
    private restoredStorage = false;

    static get observedAttributes(): string[] {
      return [
        "endpoint",
        "models-endpoint",
        "model",
        "theme",
        "title",
        "subtitle",
        "placeholder",
        "language",
        "lang",
        "labels",
        "translations",
        "show-language-picker",
        "persist",
        "storage-key",
        "history-limit",
        "storage-max-bytes",
      ];
    }

    connectedCallback(): void {
      this.adoptBareHeaderSlot();
      if (!this.shadowRoot) this.attachShadow({ mode: "open" });
      this.selectedLanguage = normalizeLanguage(this.getAttribute("language") || this.getAttribute("lang"));
      this.restoreState();
      this.render();
      this.scrollMessagesToBottom();
      void this.loadModels();
    }

    attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
      if (oldValue === newValue) return;
      if (name === "language" || name === "lang") {
        this.selectedLanguage = normalizeLanguage(newValue);
        this.persistState();
      }
      if (this.shadowRoot) this.render();
    }

    disconnectedCallback(): void {
      this.destroyModelSelect();
      this.destroyLanguageSelect();
    }

    async send(message?: string): Promise<void> {
      const composer = this.shadowRoot?.querySelector<HTMLTextAreaElement>("[part='composer-input']");
      const content = (message ?? composer?.value ?? "").trim();
      if (!content || this.busy) return;

      let receivedAssistantResponse = false;
      this.error = "";
      this.busy = true;
      this.messages = [...this.messages, { role: "user", content }];
      this.persistState();
      if (composer) composer.value = "";
      this.render();
      this.scrollMessagesToBottom();

      try {
        const response = await fetch(this.endpoint, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            model: this.selectedModel || undefined,
            messages: this.messages.map((item) => ({ role: item.role, content: item.content })),
          }),
        });
        if (!response.ok) throw new Error(await readErrorMessage(response, this.labels));
        const body = (await response.json()) as {
          content?: string;
          message?: { content?: string; metadata?: Record<string, unknown> };
        };
        const assistantContent = body.content ?? body.message?.content ?? "";
        const assistantMetadata = body.message?.metadata;
        this.messages = [
          ...this.messages,
          { role: "assistant", content: assistantContent, metadata: assistantMetadata },
        ];
        receivedAssistantResponse = true;
        this.persistState();
        this.dispatchEvent(
          new CustomEvent("stackline-response", {
            detail: { content: assistantContent, metadata: assistantMetadata },
            bubbles: true,
            composed: true,
          }),
        );
      } catch (cause) {
        this.error = cause instanceof Error ? cause.message : this.labels.requestFailed;
        this.dispatchEvent(
          new CustomEvent("stackline-error", {
            detail: { error: this.error },
            bubbles: true,
            composed: true,
          }),
        );
      } finally {
        this.busy = false;
        this.render();
        if (receivedAssistantResponse) {
          this.scrollLatestAssistantToStart();
        } else {
          this.scrollMessagesToBottom();
        }
        this.focusComposer();
      }
    }

    clear(): void {
      this.messages = [];
      this.error = "";
      this.persistState();
      this.render();
      this.scrollMessagesToBottom();
      this.focusComposer();
    }

    setModel(modelId: string): void {
      this.selectedModelId = modelId;
      this.setAttribute("model", modelId);
      this.persistState();
      this.syncModelSelect();
      this.dispatchEvent(
        new CustomEvent("stackline-model-change", {
          detail: { model: modelId },
          bubbles: true,
          composed: true,
        }),
      );
    }

    setLanguage(language: string): void {
      const nextLanguage = normalizeLanguage(language);
      this.selectedLanguage = nextLanguage;
      if (this.getAttribute("language") !== nextLanguage) {
        this.setAttribute("language", nextLanguage);
      } else {
        this.persistState();
        this.render();
      }
      this.syncLanguageSelect();
      this.dispatchEvent(
        new CustomEvent("stackline-language-change", {
          detail: { language: nextLanguage },
          bubbles: true,
          composed: true,
        }),
      );
    }

    setTranslations(translations: Partial<StacklineAIStudioTranslations> | null): void {
      this.customTranslations = translations ? { ...translations } : {};
      this.render();
    }

    get language(): StacklineAIStudioLanguage {
      return this.currentLanguage;
    }

    set language(language: string) {
      this.setLanguage(language);
    }

    get translations(): Partial<StacklineAIStudioTranslations> {
      return { ...this.customTranslations };
    }

    set translations(translations: Partial<StacklineAIStudioTranslations> | null) {
      this.setTranslations(translations);
    }

    focusComposer(): void {
      this.shadowRoot?.querySelector<HTMLTextAreaElement>("[part='composer-input']")?.focus();
    }

    private scrollMessagesToBottom(): void {
      const scroll = () => {
        const messages = this.shadowRoot?.querySelector<HTMLElement>("[part='messages']");
        if (!messages) return;
        messages.scrollTop = messages.scrollHeight;
      };

      scroll();
      windowRoot.requestAnimationFrame?.(() => {
        scroll();
        windowRoot.requestAnimationFrame?.(scroll);
      });
    }

    private scrollLatestAssistantToStart(): void {
      const scroll = () => {
        const messages = this.shadowRoot?.querySelector<HTMLElement>("[part='messages']");
        if (!messages) return;

        const assistantMessages = messages.querySelectorAll<HTMLElement>(".message.assistant");
        const latestAssistant = assistantMessages.item(assistantMessages.length - 1);
        if (!latestAssistant) return;

        const clearButton = messages.querySelector<HTMLElement>("[part='clear-button']");
        const stickyOffset = clearButton ? clearButton.offsetHeight + 14 : 14;
        messages.scrollTop = Math.max(0, latestAssistant.offsetTop - stickyOffset);
      };

      scroll();
      windowRoot.requestAnimationFrame?.(() => {
        scroll();
        windowRoot.requestAnimationFrame?.(scroll);
      });
    }

    private get endpoint(): string {
      return this.getAttribute("endpoint") || "/api/ai/chat";
    }

    private get selectedModel(): string {
      return resolveStacklineAIStudioModelId(this.models, this.selectedModelId, this.getAttribute("model"));
    }

    private get currentLanguage(): StacklineAIStudioLanguage {
      return normalizeLanguage(this.getAttribute("language") || this.getAttribute("lang") || this.selectedLanguage);
    }

    private get labels(): StacklineAIStudioTranslations {
      return resolveStacklineAIStudioTranslations(this.currentLanguage, {
        ...parseTranslationOverrides(this.getAttribute("translations")),
        ...parseTranslationOverrides(this.getAttribute("labels")),
        ...this.customTranslations,
      });
    }

    private get languagePickerEnabled(): boolean {
      return this.getAttribute("show-language-picker") !== "false";
    }

    private get persistEnabled(): boolean {
      return this.getAttribute("persist") !== "false";
    }

    private get historyLimit(): number {
      const parsed = Number(this.getAttribute("history-limit"));
      return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : DEFAULT_HISTORY_LIMIT;
    }

    private get storageMaxBytes(): number {
      const parsed = Number(this.getAttribute("storage-max-bytes"));
      return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : DEFAULT_STORAGE_MAX_BYTES;
    }

    private get storageKey(): string {
      const explicit = this.getAttribute("storage-key");
      if (explicit) return explicit;
      const path = windowRoot.location.pathname || "default";
      return `stackline-ai-studio:${path}:${this.endpoint}`;
    }

    private adoptBareHeaderSlot(): void {
      const header = this.querySelector("header:not([slot])");
      if (header) header.setAttribute("slot", "header");
    }

    private restoreState(): void {
      if (this.restoredStorage || !this.persistEnabled) return;
      this.restoredStorage = true;

      try {
        const raw = windowRoot.localStorage?.getItem(this.storageKey);
        if (!raw) return;
        const state = normalizeStoredStudioState(JSON.parse(raw), this.historyLimit, this.storageMaxBytes);
        if (!state) return;
        this.messages = state.messages;
        this.selectedModelId = state.selectedModelId || this.selectedModelId;
        this.selectedLanguage = state.selectedLanguage || this.selectedLanguage;
        this.writePersistedState(state);
      } catch {
        // Broken or blocked storage should not prevent the component from loading.
      }
    }

    private persistState(): void {
      if (!this.persistEnabled) return;

      try {
        const state = normalizeStoredStudioState(
          {
            version: STORAGE_VERSION,
            messages: this.messages,
            selectedModelId: this.selectedModel || undefined,
            selectedLanguage: this.currentLanguage,
            updatedAt: new Date().toISOString(),
          },
          this.historyLimit,
          this.storageMaxBytes,
        );
        if (!state) return;
        this.writePersistedState(state);
      } catch {
        // Ignore quota/private-mode failures; the in-memory chat still works.
      }
    }

    private writePersistedState(state: StacklineAIStudioStoredState): void {
      let messages = state.messages;
      let next: StacklineAIStudioStoredState = state;

      while (true) {
        try {
          windowRoot.localStorage?.setItem(this.storageKey, JSON.stringify(next));
          return;
        } catch (cause) {
          if (!isStorageQuotaError(cause) || messages.length === 0) return;
          messages = messages.slice(1);
          next = { ...next, messages };
        }
      }
    }

    private async loadModels(): Promise<void> {
      const endpoint = modelsEndpointFor(this.endpoint, this.getAttribute("models-endpoint"));
      try {
        const response = await fetch(endpoint);
        if (!response.ok) return;
        const body = (await response.json()) as { models?: StacklineAIStudioModel[] };
        this.models = Array.isArray(body.models) ? [...body.models].sort(compareModels) : [];
        const nextModelId = resolveStacklineAIStudioModelId(
          this.models,
          this.selectedModelId,
          this.getAttribute("model"),
        );
        if (nextModelId && nextModelId !== this.selectedModelId) {
          this.selectedModelId = nextModelId;
          this.persistState();
        }
        this.render();
      } catch {
        this.models = [];
      }
    }

    private modelOptions(): StacklineAIStudioModelOption[] {
      return [...this.models].sort(compareModels).map((model) => ({
        id: model.id,
        itemName: model.name || model.id,
        provider: model.provider,
      }));
    }

    private selectedModelOption(): StacklineAIStudioModelOption[] {
      const selected = this.modelOptions().find((model) => model.id === this.selectedModel);
      return selected ? [selected] : [];
    }

    private destroyModelSelect(): void {
      this.modelSelect?.destroy();
      this.modelSelect = null;
    }

    private destroyLanguageSelect(): void {
      this.languageSelect?.destroy();
      this.languageSelect = null;
    }

    private syncModelSelect(): void {
      if (!this.modelSelect) return;
      this.modelSelect.setSelected(this.selectedModelOption());
    }

    private syncLanguageSelect(): void {
      if (!this.languageSelect) return;
      this.languageSelect.setSelected(this.selectedLanguageOption());
    }

    private mountModelSelect(): void {
      const target = this.shadowRoot?.querySelector<HTMLElement>("[data-model-picker]");
      if (!target || !this.models.length) return;

      this.modelSelect = new StacklineMultiSelect<StacklineAIStudioModelOption>(target, {
        data: this.modelOptions(),
        selected: this.selectedModelOption(),
        settings: {
          text: this.labels.modelSelectText,
          primaryKey: "id",
          labelKey: "itemName",
          searchBy: ["itemName", "provider"],
          singleSelection: true,
          enableCheckAll: false,
          enableSearchFilter: true,
          searchPlaceholderText: this.labels.modelSearchPlaceholder,
          noDataLabel: this.labels.modelNoDataLabel,
          showCheckbox: false,
          showClearAll: false,
          closeDropDownOnSelection: true,
          badgeShowLimit: 1,
          maxHeight: 320,
          theme: "material",
          skin: "material",
          ariaLabel: this.labels.modelAriaLabel,
          listboxAriaLabel: this.labels.modelListboxAriaLabel,
        },
        onChange: (items) => {
          const selected = items[0];
          if (!selected || selected.id === this.selectedModelId) return;
          this.selectedModelId = selected.id;
          this.setAttribute("model", selected.id);
          this.persistState();
          this.dispatchEvent(
            new CustomEvent("stackline-model-change", {
              detail: { model: selected.id },
              bubbles: true,
              composed: true,
            }),
          );
        },
      });
    }

    private selectedLanguageOption(): StacklineAIStudioLanguageOption[] {
      const selected = LANGUAGE_OPTIONS.find((language) => language.id === this.currentLanguage);
      return selected ? [selected] : [LANGUAGE_OPTIONS[0]!];
    }

    private mountLanguageSelect(): void {
      const target = this.shadowRoot?.querySelector<HTMLElement>("[data-language-picker]");
      if (!target || !this.languagePickerEnabled) return;

      this.languageSelect = new StacklineMultiSelect<StacklineAIStudioLanguageOption>(target, {
        data: LANGUAGE_OPTIONS,
        selected: this.selectedLanguageOption(),
        settings: {
          text: this.labels.languageSelectText,
          primaryKey: "id",
          labelKey: "itemName",
          searchBy: ["itemName", "nativeName"],
          singleSelection: true,
          enableCheckAll: false,
          enableSearchFilter: false,
          noDataLabel: this.labels.languageNoDataLabel,
          showCheckbox: false,
          showClearAll: false,
          closeDropDownOnSelection: true,
          badgeShowLimit: 1,
          maxHeight: 220,
          theme: "material",
          skin: "material",
          ariaLabel: this.labels.languageAriaLabel,
          listboxAriaLabel: this.labels.languageListboxAriaLabel,
        },
        onChange: (items) => {
          const selected = items[0];
          if (!selected || selected.id === this.currentLanguage) return;
          this.setLanguage(selected.id);
        },
      });
    }

    private render(): void {
      this.destroyModelSelect();
      this.destroyLanguageSelect();
      const labels = this.labels;
      const title = this.getAttribute("title") || labels.title;
      const subtitle = this.getAttribute("subtitle") || labels.subtitle;
      const placeholder = this.getAttribute("placeholder") || labels.placeholder;
      const hasHeaderSlot = this.querySelector("[slot='header']");
      const headerActions = [
        this.models.length ? `<div part="model-select" class="studio-picker model-picker" data-model-picker></div>` : "",
        this.languagePickerEnabled
          ? `<div part="language-select" class="studio-picker language-picker" data-language-picker></div>`
          : "",
      ]
        .filter(Boolean)
        .join("");
      const messages = this.messages
        .map(
          (message) => {
            const content =
              message.role === "assistant"
                ? `<div class="markdown">${renderStacklineMarkdown(assistantDisplayMarkdown(message, labels))}</div>${renderRagEvidence(
                    message.metadata,
                    labels,
                  )}`
                : escapeHtml(message.content);
            return `<article part="message ${message.role}" class="message ${message.role}">${content}</article>`;
          },
        )
        .join("");

      this.shadowRoot!.innerHTML = `
        <style>${styles}</style>
        <section part="studio" class="studio">
          <header part="header" class="header">
            ${
              hasHeaderSlot
                ? `<slot name="header"></slot>`
                : `<div><h2 part="title" class="title">${escapeHtml(title)}</h2><p part="subtitle" class="subtitle">${escapeHtml(
                    subtitle,
                  )}</p></div>`
            }
            ${headerActions ? `<div part="header-actions" class="header-actions">${headerActions}</div>` : ""}
          </header>
          <main part="messages" class="messages ${messages ? "has-messages" : "is-empty"}" aria-live="polite">
            <button
              part="clear-button"
              class="clear-history"
              type="button"
              aria-label="${escapeHtml(labels.clearConversationAriaLabel)}"
            >${escapeHtml(labels.clear)}</button>
            <slot name="before-messages"></slot>
            ${
              messages ||
              `<div part="empty" class="empty"><slot name="empty">${escapeHtml(labels.empty)}</slot></div>`
            }
          </main>
          <form part="composer" class="composer">
            <textarea part="composer-input" aria-label="${escapeHtml(labels.messageAriaLabel)}" placeholder="${escapeHtml(
              placeholder,
            )}" ${this.busy ? "disabled" : ""}></textarea>
            <button part="send-button" type="submit" ${this.busy ? "disabled" : ""}>${
              this.busy ? escapeHtml(labels.sending) : escapeHtml(labels.send)
            }</button>
            ${this.error ? `<div part="error" class="error">${escapeHtml(this.error)}</div>` : ""}
            <slot name="footer"></slot>
          </form>
        </section>
      `;

      this.shadowRoot!.querySelector("form")?.addEventListener("submit", (event) => {
        event.preventDefault();
        void this.send();
      });
      this.shadowRoot!.querySelector("textarea")?.addEventListener("keydown", (event) => {
        if (event.key === "Enter" && !event.shiftKey) {
          event.preventDefault();
          void this.send();
        }
      });
      this.shadowRoot!.querySelector("[part='clear-button']")?.addEventListener("click", () => {
        this.clear();
      });
      this.mountModelSelect();
      this.mountLanguageSelect();
    }
  }

  windowRoot.customElements.define(stacklineAIStudioTagName, StacklineAIStudio);
}

defineStacklineAIStudio();
