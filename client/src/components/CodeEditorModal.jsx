import React, { useState, useEffect } from 'react';
import MonacoEditor from '@monaco-editor/react';
import codeTemplate from '../templates/codeTemplate.txt';
import './CodeEditorModal.css';

const CodeEditorModal = ({ isOpen, onClose, onSave, currentSchema }) => {
  const [code, setCode] = useState('');

  useEffect(() => {
    if (isOpen) {
      // Загружаем содержимое файла при открытии модального окна
      fetch(codeTemplate)
        .then(response => response.text())
        .then(text => {
          // Использование currentSchema для генерации кода, если это необходимо
          // В текущей реализации, если схема есть, она просто игнорируется,
          // а текст загружается из шаблона
          setCode(text);
        })
        .catch(error => {
          // console.error('Ошибка при загрузке шаблона кода:', error);
          setCode('// Ошибка при загрузке шаблона кода\n');
        });
    }
  }, [isOpen]); // Удален currentSchema из зависимостей, так как он не используется для изменения кода здесь

  if (!isOpen) return null;

  const handleEditorChange = (value) => {
    setCode(value);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
      .then(() => {
        // alert('Код скопирован в буфер обмена');
      })
      .catch(err => {
        // console.error('Ошибка при копировании:', err);
        // alert('Не удалось скопировать код');
      });
  };

  const handleDownload = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'code.cpp';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content code-editor-modal">
        <div className="modal-header">
          <h2>Code editor (C++)</h2>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>
        <div className="editor-container">
          <MonacoEditor
            language="cpp"
            theme="vs-dark"
            value={code}
            onChange={handleEditorChange}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              wordWrap: 'on',
              automaticLayout: true,
              tabSize: 4,
              insertSpaces: true,
              formatOnPaste: true,
              formatOnType: true,
              suggestOnTriggerCharacters: true,
              acceptSuggestionOnEnter: 'on',
              quickSuggestions: true,
              parameterHints: { enabled: true },
              semanticHighlighting: { enabled: true },
              bracketPairColorization: { enabled: true },
              folding: true,
              lineNumbers: 'on',
              renderWhitespace: 'selection',
              scrollBeyondLastLine: false,
              smoothScrolling: true,
              cursorBlinking: 'smooth',
              cursorSmoothCaretAnimation: 'on',
              cursorStyle: 'line',
              multiCursorModifier: 'alt',
              contextmenu: true,
              mouseWheelZoom: true,
              scrollbar: {
                vertical: 'visible',
                horizontal: 'visible',
                useShadows: true,
                verticalScrollbarSize: 10,
                horizontalScrollbarSize: 10
              }
            }}
          />
        </div>
        <div className="modal-footer">
          <button className="cancel-button" onClick={onClose}>Отмена</button>
          <button className="copy-button" onClick={handleCopy}>Копировать</button>
          <button className="download-button" onClick={handleDownload}>Скачать</button>
        </div>
      </div>
    </div>
  );
};

export default CodeEditorModal; 