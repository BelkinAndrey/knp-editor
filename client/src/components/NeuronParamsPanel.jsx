import React from 'react';
import './NeuronParamsPanel.css';

const NeuronParamsPanel = ({ neuronType, params, onChange }) => {
  // Конфигурация параметров для каждого типа нейрона
  const neuronParamsConfig = {
    BLIFATNeuron: [
      { 
        name: 'threshold', 
        label: 'Threshold', 
        type: 'number', 
        min: 0, 
        max: 1, 
        step: 0.1,
        description: 'Порог срабатывания нейрона'
      },
      { 
        name: 'tau', 
        label: 'Tau', 
        type: 'number', 
        min: 1, 
        max: 100, 
        step: 1,
        description: 'Временная константа'
      },
      { 
        name: 'restPotential', 
        label: 'Rest Potential', 
        type: 'number', 
        min: -1, 
        max: 0, 
        step: 0.1,
        description: 'Потенциал покоя'
      }
    ],
    SynapticResourceSTDPNeuron: [
      { 
        name: 'threshold', 
        label: 'Threshold', 
        type: 'number', 
        min: 0, 
        max: 1, 
        step: 0.1,
        description: 'Порог срабатывания нейрона'
      },
      { 
        name: 'tau', 
        label: 'Tau', 
        type: 'number', 
        min: 1, 
        max: 100, 
        step: 1,
        description: 'Временная константа'
      },
      { 
        name: 'resourceAmount', 
        label: 'Resource Amount', 
        type: 'number', 
        min: 0, 
        max: 2, 
        step: 0.1,
        description: 'Количество синаптических ресурсов'
      },
      { 
        name: 'recoveryTime', 
        label: 'Recovery Time', 
        type: 'number', 
        min: 1, 
        max: 1000, 
        step: 1,
        description: 'Время восстановления ресурсов'
      }
    ],
    AltAILIF: [
      { 
        name: 'threshold', 
        label: 'Threshold', 
        type: 'number', 
        min: 0, 
        max: 1, 
        step: 0.1,
        description: 'Порог срабатывания нейрона'
      },
      { 
        name: 'tau', 
        label: 'Tau', 
        type: 'number', 
        min: 1, 
        max: 100, 
        step: 1,
        description: 'Временная константа'
      },
      { 
        name: 'refractoryPeriod', 
        label: 'Refractory Period', 
        type: 'number', 
        min: 1, 
        max: 100, 
        step: 1,
        description: 'Рефрактерный период'
      }
    ]
  };

  // Получаем конфигурацию параметров для выбранного типа нейрона
  const currentParamsConfig = neuronParamsConfig[neuronType] || [];

  return (
    <div className="neuron-params-panel">
      {currentParamsConfig.map(param => (
        <div key={param.name} className="neuron-param-item">
          <div className="param-header">
            <span className="param-label">{param.label}</span>
            <span className="param-description" title={param.description}>ⓘ</span>
          </div>
          <input
            type={param.type}
            value={params[param.name] ?? ''}
            onChange={(e) => {
              const value = param.type === 'number' ? parseFloat(e.target.value) : e.target.value;
              if (!isNaN(value)) {
                onChange(param.name, value);
              }
            }}
            min={param.min}
            max={param.max}
            step={param.step}
            className="neuron-param-input"
            placeholder={`${param.min} - ${param.max}`}
          />
        </div>
      ))}
    </div>
  );
};

export default React.memo(NeuronParamsPanel); 