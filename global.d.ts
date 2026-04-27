// Allows TypeScript to resolve plain CSS side-effect imports (e.g. import './globals.css')
// Next.js webpack handles the actual processing; this declaration satisfies the type checker.
declare module '*.css';
