import React, { useState, useEffect } from 'react';

export default function ChatbotBuilder() {
  const [blocks, setBlocks] = useState(() => {
    try {
      const saved = localStorage.getItem('chatbot_blocks');
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  const [currentBlock, setCurrentBlock] = useState(null);
  const [showSimulation, setShowSimulation] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [variables, setVariables] = useState({});

  useEffect(() => {
    localStorage.setItem('chatbot_blocks', JSON.stringify(blocks));
  }, [blocks]);

  const addBlock = (type) => {
    const newBlock = {
      id: Date.now(),
      type: type,
      content: '',
      nextId: null,
      variableName: type === 'pregunta' || type === 'condicional' ? '' : null,
      options: type === 'condicional' ? [] : undefined
    };
    setBlocks([...blocks, newBlock]);
  };

  const handleContentChange = (id, value) => {
    setBlocks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, content: value } : b))
    );
  };

  const handleVariableNameChange = (id, value) => {
    setBlocks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, variableName: value } : b))
    );
  };

  const handleOptionChange = (id, index, key, value) => {
    setBlocks((prev) =>
      prev.map((b) => {
        if (b.id === id) {
          const newOptions = [...b.options];
          newOptions[index] = { ...newOptions[index], [key]: value };
          return { ...b, options: newOptions };
        }
        return b;
      })
    );
  };

  const addOption = (id) => {
    setBlocks((prev) =>
      prev.map((b) =>
        b.id === id ? { ...b, options: [...(b.options || []), { label: '', nextId: null }] } : b
      )
    );
  };

  const exportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(blocks, null, 2));
    const link = document.createElement('a');
    link.setAttribute('href', dataStr);
    link.setAttribute('download', 'chatbot-flujo.json');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const importJSON = (e) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const imported = JSON.parse(ev.target.result);
        if (!Array.isArray(imported)) throw new Error('Formato inválido');
        setBlocks(imported);
      } catch (err) {
        alert('Error al importar JSON: ' + err.message);
      }
    };
    reader.readAsText(e.target.files[0]);
  };

  const startSimulation = () => {
    if (blocks.length > 0) {
      setVariables({});
      setUserInput('');
      setCurrentBlock(blocks[0]);
      setShowSimulation(true);
    }
  };

  const goToNextBlock = () => {
    if (!currentBlock) return;

    let next = null;

    if (currentBlock.type === 'pregunta') {
      if (currentBlock.variableName) {
        setVariables((prev) => ({ ...prev, [currentBlock.variableName]: userInput }));
      }
      next = blocks.find((b) => b.id === currentBlock.nextId);
    }

    if (currentBlock.type === 'condicional') {
      if (currentBlock.variableName) {
        setVariables((prev) => ({ ...prev, [currentBlock.variableName]: userInput }));
      }
      const option = currentBlock.options.find((opt) => opt.label === userInput);
      if (option && option.nextId) {
        next = blocks.find((b) => b.id === option.nextId);
      }
    }

    if (currentBlock.type === 'mensaje' || currentBlock.type === 'respuesta') {
      next = blocks.find((b) => b.id === currentBlock.nextId);
    }

    if (next) {
      setUserInput('');
      setCurrentBlock(next);
    } else {
      alert('No hay siguiente bloque definido.');
    }
  };

  const renderContent = (text) => {
    return text.replace(/\{(\w+)\}/g, (_, key) => variables[key] || '');
  };

  const getShortId = (id) => id.toString().slice(-4);

  const resolveShortId = (shortId) => {
    const match = blocks.find((b) => getShortId(b.id) === shortId);
    return match ? match.id : null;
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>🧠 Constructor de Chatbot</h2>

      <div style={{ marginBottom: '10px' }}>
        <button onClick={() => addBlock('pregunta')}>❓ Agregar Pregunta</button>
        <button onClick={() => addBlock('respuesta')}>💬 Agregar Respuesta</button>
        <button onClick={() => addBlock('condicional')}>🔀 Agregar Condicional</button>
        <button onClick={() => addBlock('mensaje')}>📝 Agregar Mensaje</button>
        <button onClick={exportJSON} style={{ backgroundColor: 'green', color: 'white' }}>📤 Exportar JSON</button>
        <input type="file" accept="application/json" onChange={importJSON} style={{ backgroundColor: 'orange', color: 'black' }} />
        <button onClick={startSimulation} style={{ backgroundColor: 'blue', color: 'white' }}>▶ Simular Conversación</button>
      </div>

      {!showSimulation && blocks.map((block) => (
        <div key={block.id} style={{ marginBottom: '10px', border: '1px solid #ccc', padding: '10px' }}>
          <p><strong>🆔 ID:</strong> {getShortId(block.id)} <span style={{ fontSize: '0.8em', color: '#777' }}>(completo: {block.id})</span></p>
          <strong>Tipo:</strong> {block.type}<br />
          <textarea
            placeholder={`Contenido del ${block.type}`}
            value={block.content}
            onChange={(e) => handleContentChange(block.id, e.target.value)}
            style={{ width: '100%', height: '60px', marginTop: '5px' }}
          />
          {(block.type === 'pregunta' || block.type === 'condicional') && (
            <input
              type="text"
              placeholder="Nombre de variable (ej: nombre, zona...)"
              value={block.variableName || ''}
              onChange={(e) => handleVariableNameChange(block.id, e.target.value)}
              style={{ width: '100%', marginTop: '5px' }}
            />
          )}
          {block.type === 'condicional' && (
            <div>
              <strong>Opciones:</strong>
              {block.options.map((opt, idx) => (
                <div key={idx}>
                  <input
                    type="text"
                    placeholder="Opción"
                    value={opt.label}
                    onChange={(e) => handleOptionChange(block.id, idx, 'label', e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="ID siguiente"
                    value={opt.nextId ? getShortId(opt.nextId) : ''}
                    onChange={(e) => {
                      const fullId = resolveShortId(e.target.value);
                      handleOptionChange(block.id, idx, 'nextId', fullId);
                    }}
                  />
                </div>
              ))}
              <button onClick={() => addOption(block.id)}>➕ Agregar Opción</button>
            </div>
          )}
          <input
            type="number"
            placeholder={`ID del siguiente bloque (ej: ${getShortId(block.id)})`}
            value={block.nextId ? getShortId(block.nextId) : ''}
            onChange={(e) => {
              const shortId = e.target.value;
              const fullId = resolveShortId(shortId);
              setBlocks((prev) =>
                prev.map((b) => (b.id === block.id ? { ...b, nextId: fullId } : b))
              );
            }}
            style={{ marginTop: '5px', width: '100%' }}
          />
          {block.nextId && (
            <p style={{ marginTop: '5px', color: '#555' }}>
              ➡ Conecta con el bloque ID: <strong>{getShortId(block.nextId)}</strong>
            </p>
          )}
          <button
            onClick={() => setBlocks((prev) => prev.filter((b) => b.id !== block.id))}
            style={{ marginTop: '10px', backgroundColor: 'crimson', color: 'white' }}
          >
            🗑 Eliminar Bloque
          </button>
        </div>
      ))}

      {showSimulation && currentBlock && (
        <div style={{ padding: '20px', border: '2px dashed #888', backgroundColor: '#f9f9f9' }}>
          <h3>💬 Simulación de conversación</h3>
          <p><strong>Tipo:</strong> {currentBlock.type}</p>
          <p>{renderContent(currentBlock.content)}</p>
          {currentBlock.type === 'condicional' && currentBlock.options.length > 0 ? (
            <div>
              {currentBlock.options.map((opt, idx) => (
                <div key={idx}>
                  <button
                    onClick={() => {
                      setUserInput(opt.label);
                      goToNextBlock();
                    }}
                    style={{ display: 'block', marginBottom: '5px' }}
                  >
                    {opt.label}
                  </button>
                </div>
              ))}
            </div>
          ) : (currentBlock.type === 'pregunta') ? (
            <div>
              <input
                type="text"
                placeholder="Escribe tu respuesta..."
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                style={{ width: '100%', marginTop: '10px', padding: '5px' }}
              />
              <button onClick={goToNextBlock} style={{ marginTop: '10px' }}>➡ Siguiente</button>
            </div>
          ) : (
            <button onClick={goToNextBlock} style={{ marginTop: '10px' }}>➡ Siguiente</button>
          )}
          <button onClick={() => setShowSimulation(false)} style={{ marginTop: '10px', marginLeft: '10px' }}>🔁 Volver al Constructor</button>
        </div>
      )}
    </div>
  );
}
