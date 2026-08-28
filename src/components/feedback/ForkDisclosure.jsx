export function ForkDisclosure({ content }) {
  return <details className="fork-disclosure"><summary>{content.label}</summary><p>{content.short}</p><p>{content.detail}</p><p>{content.dataCaveat}</p></details>;
}

