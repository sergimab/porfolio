"use client";

import { useState } from "react";
import { useLang } from "@/components/shared/useLang";
import LangText from "@/components/shared/LangText";
import Pantallas, { type Pantalla } from "./Pantallas";
// LAS PESTAÑAS SON LAS MISMAS QUE LAS DE LA APP DE ESPACIO VACÍO, y por eso se
// importa su CSS en vez de copiarlo. Son la misma pieza haciendo el mismo
// trabajo en la misma clase de página —el prototipo y el sistema de una app—,
// así que teniéndolo escrito dos veces, el día que se retoque una, la otra se
// queda atrás. Si alguna vez tuvieran que verse distintas, lo que toca es
// sacarlo a un componente compartido, no volver a copiarlo.
import "../app-espacio-vacio/Apartados.css";
import "./ArteMiedo.css";

// La entrada a la app: la marca, la bienvenida, los cinco pasos que explican
// qué se puede hacer dentro y la salida al menú. Es el orden real de la app.
const ENTRADA: Pantalla[] = [
  { id: "login-1", es: "Arranque", en: "Splash" },
  { id: "login-2", es: "Un viaje a través del arte y la mente", en: "A journey through art and the mind" },
  { id: "login-3", es: "Escanea", en: "Scan" },
  { id: "login-4", es: "Descubre", en: "Discover" },
  { id: "login-5", es: "Colecciona", en: "Collect" },
  { id: "login-6", es: "Analiza", en: "Analyse" },
  { id: "login-7", es: "Descarga", en: "Download" },
  { id: "login-8", es: "¿Todo listo?", en: "All set?" },
  { id: "home", es: "Menú principal", en: "Main menu" },
];

// Seis obras de la sala vistas a través de la cámara de la app. NO son seis
// pasos de un recorrido —son la misma pantalla seis veces, con un cuadro
// distinto cada vez—, así que van sin rótulo debajo: lo que cuenta la tira es
// que el efecto funciona sobre cuadros muy distintos, no el orden.
const ESCANEO: Pantalla[] = [
  { id: "escaneo-01" },
  { id: "escaneo-02" },
  { id: "escaneo-03" },
  { id: "escaneo-04" },
  { id: "escaneo-05" },
  { id: "escaneo-06" },
];

// Las dos caras del proyecto en la misma caja: lo que la app HACE y de qué está
// HECHA. Van como dos posiciones de un interruptor y no como dos apartados
// seguidos, igual que en la app de Espacio vacío: es el mismo trabajo mirado de
// dos maneras, y verlos a la vez obligaría a elegir cuál va primero.
//
// Los dos se montan siempre y se esconde el que no toca —`hidden`, no quitarlo
// del marcado— para que al volver a una pestaña se siga donde se estaba: si la
// tira de pantallas se ha arrastrado hasta el escaneo, sigue ahí.
export default function AppApartados() {
  const [cual, setCual] = useState<"prototipo" | "sistema">("prototipo");
  const lang = useLang();
  const t = (es: string, en: string) => (lang === "en" ? en : es);

  return (
    <div className="ev-fichas">
      <div className="ev-fichas-pestanas">
        <button
          type="button"
          className="ev-ficha-pestana"
          data-puesta={cual === "prototipo"}
          onClick={() => setCual("prototipo")}
        >
          {t("Prototipo", "Prototype")}
        </button>
        <button
          type="button"
          className="ev-ficha-pestana"
          data-puesta={cual === "sistema"}
          onClick={() => setCual("sistema")}
        >
          {t("Sistema de diseño", "Design system")}
        </button>
      </div>

      <div className="ev-fichas-caja" data-cual={cual}>
        <div hidden={cual !== "prototipo"}>
          <h3 className="am-subrotulo">
            <LangText es="La entrada" en="Getting in" />
          </h3>
          <div className="am-texto">
            <p>
              <LangText
                es="La app se abre con un recorrido de **cinco pasos** que enseña de una vez lo que se puede hacer dentro —escanear, descubrir, coleccionar, analizar y descargar— y desemboca en el menú. No hay registro: la exposición dura lo que dura la visita, y pedir una cuenta para entrar sobraba."
                en="The app opens with a **five-step** walkthrough that lays out everything you can do inside — scan, discover, collect, analyse and download — and lands on the menu. There is no sign-up: the exhibition lasts as long as the visit, and asking for an account to get in was one step too many."
              />
            </p>
          </div>
          <Pantallas
            pantallas={ENTRADA}
            rotulo="Pantallas de entrada a la app, en orden"
            rotuloEn="The app's entry screens, in order"
          />

          <h3 className="am-subrotulo">
            <LangText es="El escaneo" en="Scanning" />
          </h3>
          <div className="am-texto">
            <p>
              <LangText
                es="Es para lo que existe la app. El visitante apunta la cámara a un cuadro que **no tiene cartela** y, a través de ella, el cuadro se enciende con la **misma textura de escáner** que llevan los carteles. Debajo, seis obras de la sala vistas así: el efecto tiene que leerse igual sobre un óleo oscuro que sobre un grabado en blanco y negro."
                en="This is what the app exists for. You point the camera at a painting with **no wall label** and, through it, the painting lights up with the **same scanner texture** the posters carry. Below, six works from the room seen that way: the effect has to read the same on a dark oil painting as on a black-and-white engraving."
              />
            </p>
          </div>
          <Pantallas
            pantallas={ESCANEO}
            rotulo="Seis obras de la sala vistas a través de la cámara de la app"
            rotuloEn="Six works from the room seen through the app's camera"
          />

          <p className="am-pendiente">
            <LangText
              es="Falta el prototipo navegable —la app funcionando dentro de la página, como la de Espacio vacío—, que va justo aquí debajo."
              en="Missing: the clickable prototype — the app running inside the page, like the Empty space one — which goes right below this."
            />
          </p>
        </div>

        <div hidden={cual !== "sistema"}>
          <p className="am-pendiente">
            <LangText
              es="Falta el sistema de diseño: la retícula, los estilos de texto, los colores tal y como se usan en pantalla, los botones y los iconos. Va aquí, con el mismo trato que el de Espacio vacío."
              en="Missing: the design system — the grid, the text styles, the colours as they are used on screen, the buttons and the icons. It goes here, handled the same way as the Empty space one."
            />
          </p>
        </div>
      </div>
    </div>
  );
}
