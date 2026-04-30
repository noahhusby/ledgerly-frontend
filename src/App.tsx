import '@mantine/core/styles.css';

import {NavbarMinimal} from "./components/NavbarMinimal/NavbarMinimal.tsx";
import {useState} from "react";
import {clearToken, getToken} from "./auth.ts";
import {Box} from "@mantine/core";
import {LoginPage} from "./pages/LoginPage.tsx";
import {DashboardPage} from "./pages/DashboardPage.tsx";

console.log('App loaded');

function App() {
    console.log('App render');

    const [token, setTokenState] = useState<string | null>(getToken());

    if(!token) {
        return <LoginPage onLogin={setTokenState} />;
    }

    return (
        <Box style={{ display: 'flex', minHeight: '100vh', width: '100%' }}>
            <NavbarMinimal
                onLogout={() => {
                    clearToken();
                    setTokenState(null);
                }}
            />

            <Box component="main" style={{ flex: 1, padding: 24 }}>
                <DashboardPage />
            </Box>
        </Box>
    );
}

export default App;