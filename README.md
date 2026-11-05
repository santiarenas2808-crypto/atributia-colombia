# AtribuTIA Colombia

App estática en español colombiano y COP.

## Ejecutar
`python -m http.server 8000` y abrir http://localhost:8000.

## Funciones
- `/app/`: importar CSV o datos demo, calcular ingresos, inversión, ROAS, CPA, ordenar campañas y exportar resultados.
- `/login/`: perfil de demostración local; no hay autenticación real.
- `/compare/`: hub SEO y comparativas individuales.
- Cada comparativa incluye title, description, Open Graph, canonical, FAQ y JSON-LD.

CSV: columnas requeridas `campaign,spend,revenue,conversions`; `channel` opcional. Valores numéricos sin separadores de miles.

## Límites
App client-side sin backend, autenticación real, APIs Meta/Google, píxel, integraciones OAuth, persistencia de equipos ni IA generativa. El cálculo usa los totales por campaña que el usuario importa; un modelo multi-touch real requiere eventos individuales, identificadores y marcas de tiempo. El selector no inventa recorridos no incluidos en el CSV. Los datos demo son ilustrativos.

Antes de producción: hosting HTTPS, privacidad y consentimiento conforme a Ley 1581 de 2012, backend seguro, autenticación, integraciones OAuth oficiales y validación editorial de precios.
