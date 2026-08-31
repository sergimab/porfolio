import WebSimulada from "@/components/proyectos/elysium-web/WebSimulada";

export const metadata = {
  title: "Elysium · Genera tu símbolo",
  description:
    "La web de Elysium funcionando: los símbolos de cada era en 3D, el test y tu símbolo generado en vivo.",
};

// Sin Header ni Footer del portfolio: aquí se entra a usar la web, no a leer
// sobre ella. El hilo para volver lo pone la propia página.
export default function Page() {
  return <WebSimulada />;
}
