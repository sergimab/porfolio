import "./PhoneMockup.css";

// Marco de móvil (SVG) con una newsletter cargada en un iframe con scroll.
// El SVG se superpone (borde + barra de estado); detrás, un fondo blanco y el
// iframe navegable.
export default function PhoneMockup({ src, title }: { src: string; title: string }) {
  return (
    <div className="phone">
      <div className="phone-bg" />
      <iframe className="phone-screen" src={src} title={title} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="phone-frame" src="/images/phone-frame.svg" alt="" aria-hidden="true" />
    </div>
  );
}
