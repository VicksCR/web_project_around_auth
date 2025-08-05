export default function InfoToolTip({ isOpen, success, onClose }) {
  return (
    isOpen && (
      <div className="tooltip">
        <div className="tooltip__content">
          <p>
            {success
              ? "¡Correcto! Ya estás registrado."
              : "Uy, algo salió mal. Por favor, inténtalo de nuevo."}
          </p>
        </div>
      </div>
    )
  );
}

//falta hacer el HTML apropiado siguiendo el diseño de Figma e implementando Popup
