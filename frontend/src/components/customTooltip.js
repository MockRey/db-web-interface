const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const { uniquePlayers } = payload[0].payload; // достаём из исходного объекта данных
    return (
      <div style={{ backgroundColor: 'white', padding: 10, border: '1px solid #ccc' }}>
        <p><strong>Уровень:</strong> {label}</p>
        <p><strong>Игроков:</strong> {uniquePlayers}</p>
      </div>
    );
  }

  return null;
};

export default CustomTooltip;