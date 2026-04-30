import '@mantine/core/styles.css';

import {NavbarMinimal} from "./components/NavbarMinimal/NavbarMinimal.tsx";

function App() {

  return (
      <div style={{ display: 'flex' }}>
        <NavbarMinimal />

        <div style={{ padding: '20px', flex: 1 }}>

          <h1>Ledgerly</h1>

        </div>

      </div>

  );

}

export default App;