import React, { useState, useEffect } from 'react';
import flujo from './chatbot-flujo.json';

function Simulador() {
  const [currentId, setCurrentId] = useState(flujo[0].id);
  const [conversacion, setConversacion] = useState([]);
  const [input, setInput] = useState('');
  const [variables, setVariables] = useState({});

  const bloqueActual = flujo.find(b => b.id === currentId);

  useEffect(() => {
    if (bloqueActual && bloqueActual.type === 'mensaje') {
      const mensaje = {
        tipo: 'bot',
        texto: reemplazarVariables(bloqueActual.content)
      };
      setConversacion(prev => [...prev, mensaje]);
    }
  }, [currentId]);

  const reemplazarVariables = texto => {
    return texto.replace(/\{(\w+)\}/g, (_, v) => variables[v] || '');
  };

  const avanzar = (opcionElegida = null) => {
    if (!bloqueActual) return;

    if (bloqueActual.type === 'pregunta') {
      const nuevaConversacion = [
        ...conversacion,
        { tipo: 'bot', texto: bloqueActual.content },
        { tipo: 'usuario', texto: input }
      ];
      setConversacion(nuevaConversacion);
      setVariables({ ...variables, [bloqueActual.variableName]: input });
      setInput('');
      setCurrentId(bloqueActual.nextId);

    } else if (bloqueActual.type === 'condicional') {
      if (!opcionElegida) return;
      const nuevaConversacion = [
        ...conversacion,
        { tipo: 'bot', texto: bloqueActual.content },
        { tipo: 'usuario', texto: opcionElegida.label }
      ];
      setConversacion(nuevaConversacion);
      setCurrentId(opcionElegida.nextId);

    } else {
      setCurrentId(bloqueActual.nextId);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>🧪 Simulador de Chatbot</h2>
      <div style={{ background: '#f4f4f4', padding: '10px', borderRadius: '8px', minHeight: '300px' }}>
        {conversacion.map((msg, i) => (
          <div key={i} style={{ textAlign: msg.tipo === 'bot' ? 'left' : 'right' }}>
            <p><strong>{msg.tipo === 'bot' ? '🤖' : '👤'}:</strong> {msg.texto}</p>
          </div>
        ))}
      </div>
      {bloqueActual && bloqueActual.type === 'pregunta' && (
        <>
          <input
            type="text"
            placeholder="Escribe tu respuesta..."
            value={input}
            onChange={e => setInput(e.target.value)}
            style={{ marginTop: '10px', width: '100%', padding: '8px' }}
          />
          <button onClick={() => avanzar()} style={{ marginTop: '10px' }}>Responder</button>
        </>
      )}
      {bloqueActual && bloqueActual.type === 'condicional' && (
        <div style={{ marginTop: '10px' }}>
          {bloqueActual.options.map((op, idx) => (
            <button
              key={idx}
              onClick={() => avanzar(op)}
              style={{ display: 'block', width: '100%', marginTop: '5px', padding: '8px' }}
            >
              {op.label}
            </button>
          ))}
        </div>
      )}
      {bloqueActual && bloqueActual.type !== 'pregunta' && bloqueActual.type !== 'condicional' && (
        <button onClick={() => avanzar()} style={{ marginTop: '10px' }}>Siguiente</button>
      )}
    </div>
  );
}

export default Simulador;
