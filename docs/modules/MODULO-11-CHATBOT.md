# Módulo 11 — Chatbot Informativo

## Qué se hizo
Se implementó un chatbot informativo que responde sobre la información conocida de High Clean SAS (servicios, empresa, horarios, contacto, precios). Arquitectura extensible: provider interface lista para Gemini/OpenAI en el futuro sin reescribir el sistema.

## Arquitectura

```
Frontend (ChatWidget) → POST /api/v1/chat → ChatController → ChatService → ChatProvider (KnowledgeChatProvider)
```

- **Provider Interface** (`src/providers/chat.provider.ts`): define `ChatProvider.getChatResponse(message, context)` — costura para futuros providers (Gemini, OpenAI) sin reescribir controller/service.
- **KnowledgeChatProvider** (`src/providers/knowledge.chat-provider.ts`): rule-based, sin servicios pagos. Intents en orden: precio → servicios → horarios → contacto → empresa → agradecimiento → despedida → fallback.
- **Normalización**: Unicode NFD + quita diacríticos para matching robusto contra acentos.
- **Fallback honesto**: si no tiene la información, lo indica y recomienda contacto directo (nunca inventa datos).

## Archivos creados / modificados

### Backend
| Archivo | Descripción |
|---------|-------------|
| `src/schemas/chat.schema.ts` | Zod: `{ message: string trim 1–500 }` → 400 `ValidationError` |
| `src/providers/chat.provider.ts` | Interfaz `ChatProvider` + tipos `ChatContext`, `ChatCompanyContext`, `ChatServiceContext` |
| `src/providers/knowledge.chat-provider.ts` | Implementación rule-based con 8 intents + fallback |
| `src/services/chat.service.ts` | `getChatResponse(message)`: junta company + services, delega al provider |
| `src/controllers/chat.controller.ts` | `createChatHandler`: valida input, retorna `res.json({ response })` |
| `src/routes/chat.routes.ts` | `POST /` con `chatLimiter` |
| `src/routes/index.ts` | Registro de `/chat` en apiRouter |
| `src/middleware/rateLimit.ts` | `chatLimiter`: 20 req/min, skip en test |
| `src/chat.test.ts` | 5 tests: servicios, horario, precios, fallback, 400 |

### Frontend
| Archivo | Descripción |
|---------|-------------|
| `src/lib/api.ts` | `sendChatMessage(message): Promise<string>` |
| `src/components/ChatWidget.tsx` | Widget flotante: toggle + panel con historial + input |
| `src/components/ChatWidget.test.tsx` | 4 tests: apertura, envío, error, Escape |
| `src/components/WhatsAppButton.tsx` | Ajuste: `bottom-[calc(1.5rem+env(safe-area-inset-bottom))]` |
| `src/components/Layout.tsx` | Integración global de `<ChatWidget />` |

## API

```
POST /api/v1/chat
Body: { "message": "¿Qué servicios ofrecen?" }
Response 200: { "response": "Estos son los servicios..." }
Response 400: { "error": { "message": "El mensaje es requerido...", "code": "ValidationError" } }
```

## Rate Limiting
- `chatLimiter`: 20 peticiones por minuto por IP.
- En desarrollo/test se desactiva (`skip: NODE_ENV === 'test'`).

## Diseño del widget
- **Posición**: apilado verticalmente sobre el botón de WhatsApp con gap ≥72px.
- **Safe-area**: respeta `env(safe-area-inset-bottom)` para iPhones.
- **Dimensiones**: panel `w-80 max-w-[100vw-3rem] max-h-[100dvh-16rem]`, toggle `h-14 w-14`.
- **Colores**: toggle `brand-turq` (#10B8D0), WhatsApp mantiene `#25D366`, para distinguir visualmente.
- **Accesibilidad**: `aria-expanded`, `aria-controls`, `aria-label`, `role="dialog"`, `role="log"`, `aria-live="polite"`, focus en input al abrir, Escape cierra.

## Testing
- **Backend**: 5 tests aislados (beforeEach crea empresa + servicios; afterEach limpia).
- **Frontend**: 4 tests con mocks de `motion/react`, `lucide-react` y `../lib/api.ts`.

## Cómo modificar
- **Agregar intents**: editar `knowledge.chat-provider.ts`, añadir bloque `if (hasAny(text, [...keywords]))` antes del fallback.
- **Cambiar provider**: implementar interfaz `ChatProvider` en un nuevo archivo, inyectar en `chat.service.ts`.
- **Ajustar rate limit**: modificar constantes en `chatLimiter` en `rateLimit.ts`.
- **Personalizar colores del toggle**: cambiar clases Tailwind en `ChatWidget.tsx` (actualmente `bg-brand-turq`).
