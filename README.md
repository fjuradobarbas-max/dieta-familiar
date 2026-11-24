# Dieta Contigo

App familiar de dieta: menú semanal, lista de la compra compartida (Guadalajara / Murillo) y seguimiento de peso.

- **Hoy**: progreso de cada persona, la comida que toca ahora, pendientes de la compra y menú del día.
- **Menú**: semana completa, filtro Ambos / Fernando / Débora.
- **Compra**: por casa y categoría, en tiempo real. Ocultar, desmarcar o quitar comprados.
- **Peso**: estadísticas, gráfica, nuevo pesaje e histórico con diferencias.

Modo oscuro automático. Datos en Firebase Firestore (estructura sin cambios):

```
weights/{persona}               { nombre, pesoInicial, pesoObjetivo }
weights/{persona}/pesajes/{id}  { fecha: "dd/mm/aaaa", peso }
shopping/{casa}/productos/{id}  { nombre, cantidad, categoria, comprado }
```

El menú está en `src/data/menu.json`.

```bash
npm install
npm run dev
```
