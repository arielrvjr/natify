# Guía de Contribución

¡Gracias por tu interés en contribuir a Natify Framework!

## Cómo Contribuir

### Reportar Bugs

1. Verifica que el bug no haya sido reportado ya en [Issues](https://github.com/arielrvjr/natify/issues)
2. Crea un nuevo issue usando el template de [Bug Report](.github/ISSUE_TEMPLATE/bug_report.md)
3. Proporciona toda la información solicitada

### Sugerir Funcionalidades

1. Verifica que la funcionalidad no haya sido sugerida ya
2. Crea un nuevo issue usando el template de [Feature Request](.github/ISSUE_TEMPLATE/feature_request.md)
3. Explica el caso de uso y el impacto

### Contribuir con Código

1. **Fork** el repositorio
2. **Clone** tu fork:
   ```bash
   git clone https://github.com/arielrvjr/natify.git
   cd natify
   ```
3. **Instala dependencias**:
   ```bash
   pnpm install
   ```
4. **Crea una rama** para tu feature:
   ```bash
   git checkout -b feature/mi-feature
   ```
5. **Desarrolla** tu feature
6. **Ejecuta tests**:
   ```bash
   pnpm test
   ```
7. **Verifica linting**:
   ```bash
   pnpm lint
   ```
8. **Commit** siguiendo [Conventional Commits](https://www.conventionalcommits.org/):
   ```bash
   git commit -m "feat: agregar nueva funcionalidad"
   ```
9. **Push** a tu fork:
   ```bash
   git push origin feature/mi-feature
   ```
10. **Crea un Pull Request** en GitHub

## Estándares de Código

- Sigue las convenciones de código del proyecto (ver `.cursorrules`)
- Escribe tests para nuevas funcionalidades
- Actualiza la documentación si es necesario
- Mantén el código simple y legible

## Proceso de Revisión

- Los PRs serán revisados por los mantenedores
- Puede haber feedback que requiera cambios
- Una vez aprobado, el PR será mergeado

## Preguntas

Si tienes preguntas, puedes:
- Crear un issue con el template de [Question](.github/ISSUE_TEMPLATE/question.md)
- Revisar la documentación en `.docs/`

¡Gracias por contribuir!

