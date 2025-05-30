import React from 'react';
import './NeuronParamsPanel.css';

const EdgeParamsPanel = ({ edgeType, params, onChange, isCollapsed, onCollapseChange, onEdgeTypeChange }) => {
  // Конфигурация параметров для каждого типа синапса
  const edgeParamsConfig = {
    DeltaSynapse: [
      {
        name: 'weight_',
        label: 'Weight',
        type: 'float',
        default: 0.0,
        description: 'Synaptic weight default value.'
      },
      {
        name: 'delay_',
        label: 'Delay',
        type: 'int',
        default: 1,
        min: 1,
        description: 'Synaptic delay default value. Value of `1` is the least delay possible.'
      }
    ],
    AdditiveSTDPDeltaSynapse: [
        {
            name: 'weight_',
            label: 'Weight',
            type: 'float',
            default: 0.0,
            description: 'Synaptic weight default value.'
        },
        {
            name: 'delay_',
            label: 'Delay',
            type: 'int',
            default: 1,
            min: 1,
            description: 'Synaptic delay default value. Value of `1` is the least delay possible.'
        },
        {
            name: 'tau_plus_',
            label: 'tau plus',
            type: 'float',
            default: 10,
            description: 'Time constant in milliseconds intended to increase the weight.'
        },
        {
            name: 'tau_minus_',
            label: 'tau minus',
            type: 'float',
            default: 10,
            description: 'Time constant in milliseconds intended to decrease the weight.'
        },
        {
            name: 'OutputType',
            label: 'Output Type',
            type: 'enum',
            default: ['EXCITATORY', 'INHIBITORY_CURRENT', 'INHIBITORY_CONDUCTANCE', 'DOPAMINE', 'BLOCKING'],
            description: 'Types of synapses.'
        },
        {
            name: 'train',
            label: 'Train',
            type: 'bool',
            default: true,
            description: 'Train.'
        }
    ],
    // Дофаминовый синапс
    SynapticResourceSTDPDeltaSynapse: [
        {
            name: 'weight_',
            label: 'Weight',
            type: 'float',
            default: 0.0,
            description: 'Synaptic weight default value.'
        },
        {
            name: 'delay_',
            label: 'Delay',
            type: 'int',
            default: 1,
            min: 1,
            description: 'Synaptic delay default value. Value of `1` is the least delay possible.'
        },
        {
            name: 'synaptic_resource_',
            label: 'Synaptic resource',
            type: 'float',
            default: 0,
            description: 'Synaptic resource.'
        },
        {
            name: 'w_min_',
            label: 'w min',
            type: 'float',
            default: 0,
            description: 'Minimal weight value.'
        },
        {
            name: 'w_max_',
            label: 'w max',
            type: 'float',
            default: 1,
            description: 'Maximal weight value.'
        },
        {
            name: 'd_u_',
            label: 'd u',
            type: 'float',
            default: 0,
            description: 'Resource decreasing constant. The `d_u_` value must be equal or greater than `0`.'
        },
        {
            name: 'dopamine_plasticity_period_',
            label: 'Dopamine plasticity period',
            type: 'int',
            default: 0,
            description: 'Dopamine plasticity period. If a neuron is rewarded during this period, then the synapse weight changes.'
        },
        {
            name: 'OutputType',
            label: 'Output Type',
            type: 'enum',
            default: ['EXCITATORY', 'INHIBITORY_CURRENT', 'INHIBITORY_CONDUCTANCE', 'DOPAMINE', 'BLOCKING'],
            description: 'Types of synapses.'
        },
        {
            name: 'train',
            label: 'Train',
            type: 'bool',
            default: true,
            description: 'Train.'
        }
    ]
  };

  // Получаем конфигурацию параметров для выбранного типа синапса
  const currentParamsConfig = edgeParamsConfig[edgeType] || [];

  return (
    <div>
      <div className="neuron-params-header" onClick={() => onCollapseChange(!isCollapsed)}>
        <h2 className="neuron-params-title">Projection parameters</h2>
        <span className={`collapse-arrow ${isCollapsed ? 'collapsed' : ''}`}>▼</span>
      </div>
      <div className={`neuron-params-content ${isCollapsed ? 'collapsed' : ''}`}>
        <div className="neuron-param-item">
          <div className="neuron-param-label-container">
            <span className="neuron-param-label">Synapse type</span>
            <span className="param-description" title="Select the type of synapse">ⓘ</span>
          </div>
          <select
            value={edgeType}
            onChange={(e) => onEdgeTypeChange(e.target.value)}
            className="settings-panel-input"
          >
            <option value="DeltaSynapse">DeltaSynapse</option>
            <option value="AdditiveSTDPDeltaSynapse">AdditiveSTDPDeltaSynapse</option>
            <option value="SynapticResourceSTDPDeltaSynapse">SynapticResourceSTDPDeltaSynapse</option>
          </select>
        </div>
        {currentParamsConfig.map(param => (
          <div key={param.name} className="neuron-param-item">
            <div className="neuron-param-label-container">
              <span className="neuron-param-label">{param.label}</span>
              <span className="param-description" title={param.description}>ⓘ</span>
            </div>
            {param.type === 'bool' ? (
              <div className="checkbox-container">
                <input
                  type="checkbox"
                  checked={params[param.name] ?? param.default}
                  onChange={(e) => onChange(param.name, e.target.checked)}
                  className="settings-panel-input"
                />
                <span className="checkbox-label">{params[param.name] ?? param.default ? 'true' : 'false'}</span>
              </div>
            ) : param.type === 'enum' ? (
              <select
                value={params[param.name] ?? param.default[0]}
                onChange={(e) => onChange(param.name, e.target.value)}
                className="settings-panel-input"
              >
                {param.default.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="number"
                value={params[param.name] ?? param.default}
                onChange={(e) => {
                  const value = param.type === 'int' 
                    ? parseInt(e.target.value) 
                    : parseFloat(e.target.value);
                  if (!isNaN(value)) {
                    onChange(param.name, value);
                  }
                }}
                step={param.type === 'int' ? 1 : 'any'}
                className="settings-panel-input"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default React.memo(EdgeParamsPanel); 