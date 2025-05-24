import React, { useState } from 'react';

export default function ChatbotBuilder() {
  const [blocks, setBlocks] = useState([]);
  const [conversation, setConversation] = useState([]);

  const addBlock = (type) => {
    const newBlock = {
      id: blocks.length + 1,
      type,
      content: '',
      options: type === 'condicional' ? [{ text: '', nextId: null }] : [],
      nextId: null,
    };
    setBlocks([...blocks, newBlock]);
  };

  const deleteBlock = (id) => {
    const updatedBlocks = blocks
      .filter((b) => b.id !== id)
      .map((b) => ({
        ...b,
        nextId: b.nextId === id ? null : b.nextId,
        options: b.options?.map(opt => ({ ...opt, nextId: opt.nextId === id ? null : opt.nextId })) || []
      }));
    setBlocks(updatedBlocks);
  };

  const updateBlock = (id, content) => {
    if (content.trim() === '') return;
    setBlocks(blocks.map((b) => (b.id === id ? { ...b, content } : b)));
  };

  const updateNext = (id, nextId) => {
    setBlocks(
      blocks.map((b) =>
        b.id === id ? { ...b, nextId: nextId === '' ? null : Number(nextId) } : b
      )
    );
  };

  const updateOption = (blockId, index, key, value) => {
    setBlocks(blocks.map(b => {
      if (b.id === blockId) {
        const options = [...b.options];
        if (key === 'text' && value.trim() === '') return b;
        options[index][key] = key === 'nextId' ? (value === '' ? null : Number(value)) : value;
        return { ...b, options };
      }
      return b;
    }));
  };

  const addOption = (blockId) => {
    setBlocks(blocks.map(b => {
      if (b.id === blockId) {
        return { ...b, options: [...b.options, { text: '', nextId: null }] };
      }
      return b;
    }));
  };

  const simulateConversation = () => {
    const visited = new Set();
    const conv = [];
    let current = blocks[0];
    while (current) {
      if (visited.has(current.id)) break;
      visited.add(current.id);
      conv.push(current);
      if (current.type === 'condicional' && current.options.length > 0) {
        current = blocks.find(b => b.id === current.options[0].nextId);
      } else {
        current = blocks.find(b => b.id === current.nextId);
      }
    }
    setConversation(conv);
  };

  const exportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(blocks, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute('href', dataStr);
    dlAnchor.setAttribute('download', 'chatbot-flujo.json');
    document.body.appendChild(dlAnchor);
    dlAnchor.click();
    dlAnchor.remove();
  };

  const importJSON = (event) => {
    const fileReader = new FileReader();
    fileReader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target.result);
        if (!Array.isArray(imported) || !imported.every(b => b.id && b.type)) {
          throw new Error('Formato inválido');
        }
        setBlocks(imported);
      } catch (error) {
        alert('Error al importar el archivo JSON. Asegúrese de que el formato sea válido.');
      }
    };
    fileReader.readAsText(event.target.files[0]);
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Constructor de Chatbot</h2>
      <div style={{ marginBottom: 10 }}>
        <button onClick={() => addBlock('pregunta')}>Agregar Pregunta</button>
        <button onClick={() => addBlock('respuesta')}>Agregar Respuesta</button>
        <button onClick={() => addBlock('condicional')}>Agregar Condicional</button>
        <button style={{ backgroundColor: 'green', color: 'white', marginLeft: 10 }} onClick={exportJSON}>Exportar JSON</button>
        <label style={{ backgroundColor: 'orange', color: 'white', marginLeft: 10, padding: '5px 10px', cursor: 'pointer' }}>
          Importar JSON
          <input type="file" accept="application/json" style={{ display: 'none' }} onChange={importJSON} />
        </label>
        <button style={{ backgroundColor: 'blue', color: 'white', marginLeft: 10 }} onClick={simulateConversation}>Simular Conversación</button>
      </div>
      <div>
        {blocks.map((block) => (
          <div key={block.id} style={{ marginBottom: 10, padding: 10, border: '1px solid black' }}>
            <strong>{block.type.toUpperCase()}</strong>
            <br />
            <textarea
              rows="2"
              value={block.content}
              onChange={(e) => updateBlock(block.id, e.target.value)}
              style={{ width: '100%' }}
            ></textarea>
            <br />
            {block.type === 'condicional' ? (
              <div>
                {block.options.map((opt, i) => (
                  <div key={i} style={{ marginBottom: 5 }}>
                    Opción {i + 1}:{' '}
                    <input
                      type="text"
                      value={opt.text}
                      onChange={(e) => updateOption(block.id, i, 'text', e.target.value)}
                    />{' '}
                    Ir a:{' '}
                    <select
                      value={opt.nextId ?? ''}
                      onChange={(e) => updateOption(block.id, i, 'nextId', e.target.value)}
                    >
                      <option value=''>ninguno</option>
                      {blocks.filter((b) => b.id !== block.id).map((b) => (
                        <option key={b.id} value={b.id}>{b.type} #{b.id}</option>
                      ))}
                    </select>
                  </div>
                ))}
                <button onClick={() => addOption(block.id)}>Agregar Opción</button>
              </div>
            ) : (
              <>
                Ir al bloque siguiente:{' '}
                <select
                  value={block.nextId ?? ''}
                  onChange={(e) => updateNext(block.id, e.target.value)}
                >
                  <option value=''>ninguno</option>
                  {blocks.filter((b) => b.id !== block.id).map((b) => (
                    <option key={b.id} value={b.id}>{b.type} #{b.id}</option>
                  ))}
                </select>
              </>
            )}
            <br />
            <button style={{ backgroundColor: 'red', color: 'white', marginTop: 5 }} onClick={() => deleteBlock(block.id)}>
              Eliminar Bloque
            </button>
          </div>
        ))}
      </div>
      <div style={{ backgroundColor: '#eee', padding: 10, marginTop: 20 }}>
        <h3>Simulación de Conversación:</h3>
        {conversation.map((block, index) => (
          <div key={index}>
            👉 {block.content}
          </div>
        ))}
      </div>
    </div>
  );
}
