const StartPage = () => {

    const role = localStorage.getItem('role');
    const welcome = () => {
        switch (role) {
            case 'admin':
            return 'администратора';
            case 'analyst':
            return 'аналитика';
            case 'support':
            return 'специалиста поддержки';
            case 'manager':
            return 'менеджера';
            default:
            return '... а кто вы?..';
        }
        }
  
    return (
      <div style={{ alignItems: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100vh'}}>
        <text style={{ fontSize: '50px', fontWeight: 'bold' }}>
          Добро пожаловать в пространство {welcome()}!
        </text>
        <p style={{ fontSize: '30px', marginTop: '30px' }}>
          Выберите нужный раздел в меню слева.
        </p>
      </div>
    );
  };
  
  export default StartPage;