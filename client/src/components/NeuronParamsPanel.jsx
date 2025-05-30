import React from 'react';
import './NeuronParamsPanel.css';

const NeuronParamsPanel = ({ neuronType, params, onChange }) => {
  // Конфигурация параметров для каждого типа нейрона
  const neuronParamsConfig = {
    BLIFATNeuron: [
      {
        name: 'activation_threshold_',
        label: 'Activation threshold',
        type: 'float',
        default: 1.0,
        description: 'The parameter defines a constant part of a threshold for membrane potential.'
      },
      {
        name: 'additional_threshold_',
        label: 'Additional threshold',
        type: 'float',
        default: 0.0,
        description: 'The parameter is used for mechanisms that are implemented in specific neuron types. Current threshold value is composed from three parameters: static value, dynamic with a common algorithm and dynamic that is based on a specific neuron implementation. This is the third one.'
      },
      {
        name: 'dynamic_threshold_',
        label: 'Dynamic threshold',
        type: 'float',
        default: 0.0,
        description: 'The parameter defines a dynamic threshold for membrane potential after reaching which a neuron generates a spike.'
      },
      {
        name: 'threshold_decay_',
        label: 'Threshold decay',
        type: 'float',
        default: 0.0,
        description: 'The parameter defines a time constant during which the dynamic_threshold_ parameter tends to its base value if nothing happens.'
      },
      {
        name: 'threshold_increment_',
        label: 'Threshold increment',
        type: 'float',
        default: 0.0,
        description: 'The parameter defines a value that increases the dynamic_threshold_ value if a neuron generates a spike.'
      },
      {
        name: 'postsynaptic_trace_',
        label: 'Postsynaptic trace',
        type: 'float',
        default: 0.0,
        description: 'The parameter defines a threshold after reaching which a neuron generates spikes.'
      },
      {
        name: 'postsynaptic_trace_decay_',
        label: 'Postsynaptic trace decay',
        type: 'float',
        default: 0.0,
        description: 'The parameter defines a time constant during which the postsynaptic_trace_ parameter tends to zero if nothing happens. If postsynaptic_trace_decay_ equals 0, then postsynaptic_trace_ also equals 0.'
      },
      {
        name: 'postsynaptic_trace_increment_',
        label: 'Postsynaptic trace increment',
        type: 'float',
        default: 0.0,
        description: 'The parameter defines a value that increases the postsynaptic_trace_ value if a neuron generates a spike.'
      },
      {
        name: 'inhibitory_conductance_',
        label: 'Inhibitory conductance',
        type: 'float',
        default: 0.0,
        description: 'The parameter defines speed with which a potential tends to the reversal_inhibitory_potential value.'
      },
      {
        name: 'inhibitory_conductance_decay_',
        label: 'Inhibitory conductance decay',
        type: 'float',
        default: 0.0,
        description: 'The parameter defines a time constant during which the inhibitory_conductance_ value decreases.'
      },
      {
        name: 'potential_',
        label: 'Potential',
        type: 'float',
        default: 0.0,
        description: 'The parameter defines the current membrane potential.'
      },
      {
        name: 'pre_impact_potential_',
        label: 'Pre impact potential',
        type: 'float',
        default: 0.0,
        description: 'This parameter is used if there was a blocking signal. If used, all potential changes due to synapses are ignored.'
      },
      {
        name: 'potential_decay_',
        label: 'Potential decay',
        type: 'float',
        default: 0.0,
        description: 'The parameter defines a time constant during which the potential_ value tends to zero.'
      },
      {
        name: 'bursting_phase_',
        label: 'Bursting phase',
        type: 'int',
        default: 0,
        description: 'The parameter defines a counter for the bursting_period_ value.'
      },
      {
        name: 'bursting_period_',
        label: 'Bursting period',
        type: 'int',
        default: 0,
        description: 'The parameter defines a number of network steps after reaching which a neuron generates a spike. Value of 0 means that no bursting occurs.'
      },
      {
        name: 'reflexive_weight_',
        label: 'Reflexive weight',
        type: 'float',
        default: 0.0,
        description: 'The parameter defines a value that increases the membrane potential after a neuron generates a spike.'
      },
      {
        name: 'reversal_inhibitory_potential_',
        label: 'Reversal inhibitory potential',
        type: 'float',
        default: -0.3,
        description: 'The parameter defines a value to which membrane potential tends (for conductance-based inhibitory synapses).'
      },
      {
        name: 'absolute_refractory_period_',
        label: 'Absolute refractory period',
        type: 'int',
        default: 0,
        description: 'The parameter defines a minimum number of network steps before a neuron can generate the next spike.'
      },
      {
        name: 'potential_reset_value_',
        label: 'Potential reset value',
        type: 'float',
        default: 0.0,
        description: 'The parameter defines a potential value after a neuron generates a spike.'
      },
      {
        name: 'min_potential_',
        label: 'Min potential',
        type: 'float',
        default: -1.0e9,
        description: 'The parameter defines a value to which membrane potential tends (for current-based inhibitory synapses).'
      },
      {
        name: 'dopamine_value_',
        label: 'Dopamine value',
        type: 'float',
        default: 0.0,
        description: 'The parameter defines a dopamine value used to sum up all incoming dopamine synapse impacts.'
      }
    ],
    SynapticResourceSTDPNeuron: [
      {
        name: "synapse_sum_threshold_coefficient_",
        label: "Synapse Sum Threshold Coefficient",
        type: "float",
        default: 0.0,
        description: "Coefficient for a synapse-dependent part of neuron activation threshold. Potential threshold is a sum of base threshold, dynamic threshold and synapse-dependent threshold."
      },
      {
        name: "dopamine_plasticity_time_",
        label: "Dopamine Plasticity Time",
        type: "int",
        default: 1,
        description: "Time parameter for dopamine plasticity."
      },
      {
        name: "free_synaptic_resource_",
        label: "Free Synaptic Resource",
        type: "float",
        default: 1.0,
        description: "Free synaptic resource available for allocation."
      },
      {
        name: "synaptic_resource_threshold_",
        label: "Synaptic Resource Threshold",
        type: "float",
        default: 3.4028235e38,
        description: "Synaptic resource threshold value. Default initialized to maximum float value."
      },
      {
        name: "resource_drain_coefficient_",
        label: "Resource Drain Coefficient",
        type: "int",
        default: 0,
        description: "Defines number of silent synapses. Calculated as synaptic resource divided by (number of synapses + resource drain coefficient)."
      },
      {
        name: "stability_",
        label: "Synapse Stability",
        type: "float",
        default: 0.0,
        description: "Dynamic synapse stability attribute. Higher values reduce plasticity-induced weight changes. Increases with correct responses, decreases with incorrect ones."
      },
      {
        name: "stability_change_parameter_",
        label: "Stability Fluctuation",
        type: "float",
        default: 0.0,
        description: "Controls the magnitude of stability fluctuations."
      },
      {
        name: "stability_change_at_isi_",
        label: "Stability Change at ISI Start",
        type: "float",
        default: 0.0,
        description: "Value added to synapse stability at the beginning of each ISI period."
      },
      {
        name: "isi_max_",
        label: "ISI Period Duration",
        type: "int",
        default: 1,
        description: "Maximum time interval (in steps) between spikes in an ISI period."
      },
      {
        name: "d_h_",
        label: "Hebbian Plasticity Strength",
        type: "float",
        default: 1.0,
        description: "Strength of Hebbian plasticity effects."
      }
    ],
    AltAILIF: [
      {
        name: "is_diff_",
        label: "is diff",
        type: "bool",
        default: false,
        description: "If `is_diff_` flag is set to `true` and neuron potential exceeds one of its threshold value after the neuron receives a spike, the `potential_` parameter takes a value by which the potential threshold is exceeded."
      },
      {
        name: "is_reset_",
        label: "is reset",
        type: "bool",
        default: true,
        description: "If `is_reset_` flag is set to `true` and neuron potential exceeds its threshold value after the neuron receives a spike, the `potential_` parameter takes a value of the `potential_reset_value_` parameter."
      },
      {
        name: "leak_rev_",
        label: "leak rev",
        type: "bool",
        default: true,
        description: "If `leak_rev_` flag is set to `true`, the `potential_leak_` sign automatically changes along with the change of the `potential_` value sign."
      },
      {
        name: "saturate_",
        label: "saturate",
        type: "bool",
        default: true,
        description: "If `saturate_` flag is set to `true` and the neuron potential is less than a negative `negative_activation_threshold_` value after the neuron receives a spike, the `potential_` parameter takes the `negative_activation_threshold_` value."
      },
      {
        name: "do_not_save_",
        label: "do not save",
        type: "bool",
        default: false,
        description: "If `do_not_save_` flag is set to `false`, the `potential_` value is stored with each timestamp. If set to `false`, the potential takes a value of the `potential_reset_value_` parameter at the beginning of each subsequent time step (except the first time step)."
      },
      {
        name: "potential_",
        label: "potential",
        type: "float",
        default: 0,
        description: "Defines the neuron potential value. Additional packet is sent to AltAI-1 for each neuron with non-zero initial `potential_` value."
      },
      {
        name: "activation_threshold_",
        label: "activation threshold",
        type: "int",
        default: 1,
        description: "Threshold value of neuron potential, after exceeding which a positive spike can be emitted. Positive spike is emitted if `potential_` >= `activation_threshold_` and the neuron has a target for positive spike."
      },
      {
        name: "negative_activation_threshold_",
        label: "negative activation threshold",
        type: "int",
        default: 30000,
        description: "Threshold value of neuron potential, below which a negative spike can be emitted. The default value was chosen to protect against `potential_` negative overflow when negative spikes are not used."
      },
      {
        name: "potential_leak_",
        label: "potential leak",
        type: "int",
        default: 0,
        description: "Constant leakage of the neuron potential. If `leak_rev_` is `true`, the leakage sign changes with the `potential_` value sign."
      },
      {
        name: "potential_reset_value_",
        label: "potential reset value",
        type: "int",
        default: 0,
        description: "Reset value of the neuron potential after one of the thresholds has been exceeded. Used conditionally based on `is_reset_` and `saturate_` flags."
      }
    ]
  };

  // Получаем конфигурацию параметров для выбранного типа нейрона
  const currentParamsConfig = neuronParamsConfig[neuronType] || [];

  return (
    <div>
      <h2 className="neuron-params-title">Neuron parameters</h2>
      {currentParamsConfig.map(param => (
        <div key={param.name} className="neuron-param-item">
          <div className="neuron-param-label-container">
            <span className="neuron-param-label">{param.label}</span>
            <span className="param-description" title={param.description}>ⓘ</span>
          </div>
          {param.type === 'bool' ? (
            <input
              type="checkbox"
              checked={params[param.name] ?? param.default}
              onChange={(e) => onChange(param.name, e.target.checked)}
              className="settings-panel-input"
            />
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
  );
};

export default React.memo(NeuronParamsPanel); 