FROM verdaccio/verdaccio:latest

USER root

# Copiar configuración
COPY config.yaml /verdaccio/conf/config.yaml

# Crear directorios necesarios
RUN mkdir -p /verdaccio/storage /verdaccio/plugins

# Cambiar permisos
RUN chown -R $VERDACCIO_USER_UID:root /verdaccio

USER $VERDACCIO_USER_UID

EXPOSE 4873

VOLUME ["/verdaccio/storage", "/verdaccio/plugins"]

