import React from 'react';

const ResumenSolicitud = ({ datos }) => {
  if (!datos) return null;

  return (
    <div style={{ backgroundColor: '#f9f9f9', padding: 20, marginTop: 20, border: '1px solid #ccc' }}>
      <h3>📄 Resumen de tu solicitud:</h3>
      <p>📍 Dirección: {datos.direccion || 'No ingresada'}</p>
      <p>🏡 Comuna: {datos.comuna || 'No ingresada'}</p>
      <p>📧 Correo: {datos.correo || 'No ingresado'}</p>
      <p>📞 Teléfono: {datos.telefono || 'No ingresado'}</p>
      <p>📍 Zona a intervenir: {datos.zona_tratamiento || 'No especificada'}</p>
      <p>📐 Área aproximada: {datos.area_m2 || 'No especificada'}</p>

      <hr />
      <p>🔍 Un asesor de Smart Plagas te contactará para confirmar detalles y programar la visita.</p>
      <p>📞 Atención urgente: +56 9 5816 6055</p>
    </div>
  );
};

export default ResumenSolicitud;

