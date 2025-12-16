# Verdaccio Registry para Nativefy Framework

Este directorio contiene la configuración de Verdaccio, un registry privado de npm para publicar y distribuir los paquetes de Nativefy Framework.

## 🚀 Inicio Rápido

### Con Docker (Recomendado)

```bash
# Iniciar Verdaccio
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener
docker-compose down
```

Verdaccio estará disponible en: `http://localhost:4873`

### Sin Docker

```bash
# Instalar Verdaccio globalmente
npm install -g verdaccio

# Iniciar Verdaccio
verdaccio
```

## 📝 Configuración

La configuración principal está en `config.yaml`. Los puntos clave:

- **Storage**: Los paquetes se guardan en `./storage`
- **Port**: 4873 (por defecto)
- **Scope**: `@nativefy/*` para paquetes privados
- **Proxy**: Los paquetes públicos se obtienen de npmjs.org

## 🔧 Personalización

### Cambiar el puerto

Edita `config.yaml`:
```yaml
listen: 0.0.0.0:5000  # Cambia 4873 por el puerto deseado
```

Y actualiza `docker-compose.yml`:
```yaml
ports:
  - "5000:5000"
```

### Habilitar autenticación

1. Edita `config.yaml`:
```yaml
auth:
  htpasswd:
    file: ./htpasswd
    max_users: -1  # Deshabilitar registro público
```

2. Crea usuarios:
```bash
npm adduser --registry http://localhost:4873
```

## 📦 Publicar Paquetes

Desde la raíz del monorepo:

```bash
# Construir y publicar todos los paquetes
pnpm registry:publish

# Publicar un paquete específico
pnpm --filter @nativefy/core publish --registry http://localhost:4873
```

## 🌐 Desplegar en Producción

1. **Actualiza `config.yaml`** con la URL de tu servidor
2. **Configura HTTPS** con un reverse proxy (nginx)
3. **Habilita autenticación** para seguridad
4. **Configura backups** del directorio `storage/`

Ver `REGISTRY.md` en la raíz del proyecto para más detalles.

