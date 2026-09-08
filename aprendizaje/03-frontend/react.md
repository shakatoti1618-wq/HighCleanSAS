# React

React es una biblioteca de JavaScript/TypeScript para construir interfaces de usuario a partir de **componentes**.

- Cada pieza de la interfaz (navbar, tarjeta de servicio, formulario) es un **componente**: una función que devuelve JSX.
- El estado vive en el componente (`useState`) y cuando cambia, React vuelve a renderizar solo la parte afectada.
- Se usa JSX: una sintaxis que mezcla HTML y JavaScript dentro de TypeScript.

Ejemplo en este proyecto:

```tsx
function Navbar() {
  return <header>…</header>
}
```

Archivo relacionado:
`app/frontend/src/components/Navbar.tsx`