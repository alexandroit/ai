# @stackline/ai-ui

Framework-neutral Stackline AI Studio web component.

Use it directly in Vanilla, Angular, React, Vue, Svelte, Astro, or any frontend
that can render a custom element. The component gives simple users a complete
chat UI and gives advanced teams styling, slots, endpoints, model selection,
storage control, and backend integration points.

## Highlights

- Drop-in web component: `<stackline-ai-studio></stackline-ai-studio>`.
- Works with any frontend framework.
- Uses Stackline's own `@stackline/multiselect` for the model picker.
- Built-in language picker powered by `@stackline/multiselect`.
- Internationalized layout labels for English, Portuguese, French, and Spanish.
- Safe Markdown rendering for assistant responses.
- Model listing through `GET /api/ai/models`.
- Chat through `POST /api/ai/chat`.
- Local history persistence with quota protection.
- RAG evidence visible in the current response but removed before
  localStorage persistence.
- Clear button in the message body.
- Empty state does not show artificial scrollbars.
- Theme support through CSS variables and host attributes.

## Install

```bash
npm install @stackline/ai-ui
```

## Basic Usage

```ts
import "@stackline/ai-ui";
```

```html
<stackline-ai-studio></stackline-ai-studio>
```

By default the component calls:

- `POST /api/ai/chat`
- `GET /api/ai/models`

## Custom Endpoint

```html
<stackline-ai-studio
  endpoint="/api/ai/chat"
  models-endpoint="/api/ai/models"
  theme="material"
></stackline-ai-studio>
```

## Custom Header

Simple usage:

```html
<stackline-ai-studio></stackline-ai-studio>
```

Advanced header customization:

```html
<stackline-ai-studio>
  <header>
    <strong>Company AI</strong>
    <span>Private support assistant</span>
  </header>
</stackline-ai-studio>
```

## Internationalization

All Studio layout text is resolved through the component translation layer.

The built-in languages are:

- `en`
- `pt`
- `fr`
- `es`

The component starts in English and renders a language combobox in the header by
default.

```html
<stackline-ai-studio language="pt"></stackline-ai-studio>
```

Users can switch languages in the UI. The selected language is persisted with
the Studio state in `localStorage`.

Disable the language picker when the host application owns language switching:

```html
<stackline-ai-studio
  language="fr"
  show-language-picker="false"
></stackline-ai-studio>
```

Override any label without replacing the component:

```html
<stackline-ai-studio
  language="en"
  labels='{
    "title": "Company AI",
    "subtitle": "Private internal assistant",
    "placeholder": "Ask a question...",
    "send": "Ask"
  }'
></stackline-ai-studio>
```

Advanced applications can set translations from JavaScript:

```ts
const studio = document.querySelector("stackline-ai-studio");

studio.setLanguage("es");
studio.setTranslations({
  title: "Asistente interno",
  send: "Preguntar",
});
```

Language changes emit `stackline-language-change`:

```ts
studio.addEventListener("stackline-language-change", (event) => {
  document.documentElement.lang = event.detail.language;
});
```

## Local Persistence

The Studio persists chat history, selected model, and selected language in
`localStorage` by default, so refresh does not clear the conversation or the
user's UI language.

```html
<stackline-ai-studio
  storage-key="company-support-ai"
  history-limit="50"
  storage-max-bytes="524288"
></stackline-ai-studio>
```

Behavior:

- `history-limit` defaults to `50` messages.
- `storage-max-bytes` defaults to `524288` bytes (`512 KB`).
- Old messages are trimmed before writing.
- If the browser raises a quota error, the component retries while keeping the
  newest interactions.
- `persist="false"` disables browser persistence.

```html
<stackline-ai-studio persist="false"></stackline-ai-studio>
```

## RAG Evidence

RAG evidence is display-only in the browser. The current assistant response can
show sources, scores, and excerpts, but `stacklineRag*` metadata is removed
before localStorage writes.

This keeps retrieved source excerpts, private documents, lyrics, and large
evidence blocks out of browser history.

## Assistant Markdown

Assistant responses are rendered as safe Markdown with a small safe HTML
subset. Normal content such as `<p>`, `<br>`, lists, tables, emphasis, and safe
links is interpreted as layout instead of being displayed literally.

- paragraphs
- headings
- ordered and unordered lists
- blockquotes
- fenced code blocks
- inline code
- tables
- links
- bold, emphasis, and strikethrough
- safe HTML tags such as `p`, `br`, `strong`, `em`, `ul`, `ol`, `li`, `table`,
  `blockquote`, `code`, and `pre`

HTML inside Markdown code fences remains escaped so code examples display as
code:

````md
```html
<p>This is shown as code.</p>
```
````

Unsafe tags and attributes are removed. Script/style/iframe/object/embed/svg/math
blocks are not rendered, and unsafe link schemes are not turned into links.

## JavaScript API

```ts
const studio = document.querySelector("stackline-ai-studio");

await studio.send("Summarize this issue.");
studio.setModel("llama3.1:latest");
studio.setLanguage("pt");
studio.setTranslations({ send: "Perguntar" });
studio.clear();
studio.focusComposer();
```

## Events

```ts
studio.addEventListener("stackline-response", (event) => {
  console.log(event.detail.content);
});

studio.addEventListener("stackline-error", (event) => {
  console.error(event.detail.error);
});

studio.addEventListener("stackline-model-change", (event) => {
  console.log(event.detail.model);
});

studio.addEventListener("stackline-language-change", (event) => {
  console.log(event.detail.language);
});
```

## Styling

The component exposes parts and CSS variables so applications can style it
without replacing the whole UI.

```css
stackline-ai-studio {
  --sai-accent: #0f8f7e;
  --sai-accent-strong: #0a6d60;
}

stackline-ai-studio::part(clear-button) {
  font-weight: 800;
}
```

## Backend Pairing

Pair this UI with `@stackline/ai-server` and `@stackline/ai` so provider keys,
RAG SQL, memory stores, and model policy stay on the backend.

## Community

Questions and discussions:

https://www.reddit.com/r/Stackline/
