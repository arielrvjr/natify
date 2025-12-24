# Coverage en Monorepo

Este monorepo genera archivos de cobertura separados para cada paquete. Cada paquete tiene su propio `jest.config.js` que genera un archivo `lcov.info` en `coverage/[package-name]/lcov.info`.

## Estructura de Coverage

```
coverage/
├── core/
│   └── lcov.info
├── http-axios/
│   └── lcov.info
├── storage-mmkv/
│   └── lcov.info
└── ...
```

## GitHub Actions

El workflow de CI (`/.github/workflows/ci.yml`) sube todos los archivos de cobertura a Codecov en un solo paso. Codecov automáticamente:

1. **Agrupa los archivos** del mismo commit
2. **Muestra cobertura por paquete** en la interfaz
3. **Calcula la cobertura total** del monorepo

## Agregar un Nuevo Paquete

Cuando agregues un nuevo paquete con tests:

1. Asegúrate de que el `jest.config.js` del paquete tenga:
   ```js
   coverageDirectory: '<rootDir>/../../../coverage/[package-name]',
   coverageReporters: ['text', 'lcov', 'html', 'json-summary'],
   ```

2. Agrega el archivo de cobertura al workflow:
   ```yaml
   files: |
     ...
     ./coverage/[package-name]/lcov.info
   ```

## Ver Cobertura Localmente

Para ver la cobertura de un paquete específico:

```bash
pnpm --filter "@natify/[package-name]" test:coverage
open coverage/[package-name]/index.html
```

Para ver la cobertura de todos los paquetes:

```bash
pnpm test:coverage
# Los reportes HTML están en coverage/[package-name]/index.html
```

## Codecov Token

Si usas Codecov, necesitas configurar el token en GitHub Secrets:

1. Ve a tu repositorio en GitHub
2. Settings → Secrets and variables → Actions
3. Agrega `CODECOV_TOKEN` con tu token de Codecov

Si no tienes token, Codecov funciona sin él pero con funcionalidades limitadas.

