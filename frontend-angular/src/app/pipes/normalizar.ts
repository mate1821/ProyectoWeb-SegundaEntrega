// "Clínica SHAIO " -> "clinica shaio": sin tildes, en minúscula y sin espacios sobrantes.
// Así "clinica shaio" encuentra "Clínica Shaio".
export function normalizar(texto: string | null | undefined): string {
  return (texto ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');
}
