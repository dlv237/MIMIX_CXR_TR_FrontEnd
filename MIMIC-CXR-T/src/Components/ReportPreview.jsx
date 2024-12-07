const ReportPreview = ({ reportData }) => {
  if (!reportData) {
    return <p>No hay datos disponibles para mostrar.</p>;
  }

  return (
    <div>
      {/* Título del reporte */}
      <p className="text-center text-[1.75rem] font-medium mb-4">{reportData.titulo}</p>

      {/* Resumen */}
      <div>
        <p className="text-[1.25rem] font-medium mb-2">Resumen</p>
        <ul>
          {reportData.resumen.map((linea, index) => (
            <li className="text-[0.9rem]" key={index}>{linea}</li>
          ))}
        </ul>
      </div>

      {/* Secciones */}
      {reportData.secciones.map((seccion, index) => (
        <div key={index} className="mb-4 mt-20">
          <p className="font-medium mb-2 text-[1.25rem]">
            {index + 1}) {seccion.titulo}
          </p>
          <p className="text-[0.9rem] mb-4">{seccion.descripcion}</p>
          {seccion.grafico && seccion.grafico.contenido_base64 && (
            <img
              src={`data:image/png;base64,${seccion.grafico.contenido_base64}`}
              alt={`Gráfico ${index + 1}`}
              style={{ maxWidth: "90%", height: "auto", position: "relative", left: "50%", transform: "translateX(-50%)" }}
              
            />
          )}
          {seccion.texto_grafico && <p className="text-center">{seccion.texto_grafico}</p>}
          {seccion.resultados && (
            <ul>
              {Object.entries(seccion.resultados).map(([key, value], idx) => (
                <li key={idx}>
                  <strong>{key.replace(/_/g, " ")}:</strong> {value}
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
};

export default ReportPreview;
