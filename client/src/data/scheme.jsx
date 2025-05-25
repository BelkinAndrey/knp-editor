export const Nodes = [
    {
      id: '1',
      data: { label: 'Input Node' },
      position: { x: 250, y: 25 },
    },
   
    {
      id: '2',
      data: { label: <div>Default Node</div> },
      position: { x: 100, y: 125 },
    },
    {
      id: '3',
      data: { label: 'Output Node' },
      position: { x: 250, y: 250 },
    },
  ];

export const Edges = [
    { id: 'e1-2', source: '1', target: '2' },
    { id: 'e2-3', source: '2', target: '3', animated: true },
  ];
  