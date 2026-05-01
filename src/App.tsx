import '@mantine/core/styles.css';

import {NavbarMinimal, type Page} from "./components/NavbarMinimal/NavbarMinimal.tsx";
import {useState} from "react";
import {clearToken, getToken} from "./auth.ts";
import {Box} from "@mantine/core";
import {LoginPage} from "./pages/LoginPage.tsx";
import {HomePage} from "./pages/HomePage.tsx";
import {AccountsPage} from "./pages/AccountsPage.tsx";
import {TransactionsPage} from "./pages/TransactionsPage.tsx";
import {BudgetsPage} from "./pages/BudgetsPage.tsx";

console.log('App loaded');

function App() {
    console.log('App render');

    const [token, setTokenState] = useState<string | null>(getToken());
    const [activePage, setActivePage] = useState<Page>('Home');

    if(!token) {
        return <LoginPage onLogin={setTokenState} />;
    }

    function renderPage() {
        switch (activePage) {
            case 'Home':
                return <HomePage onPageChange={setActivePage} />;
            case 'Accounts':
                return <AccountsPage />;
            case 'Transactions':
                return <TransactionsPage />;
            case 'Budgets':
                return <BudgetsPage />;
        }
    }

    return (
        <Box style={{ display: 'flex', height: '100vh', width: '100%' }}>
            <NavbarMinimal
                activePage={activePage}
                onPageChange={setActivePage}
                onLogout={() => {
                    clearToken();
                    setTokenState(null);
                }}
            />

            <Box
                component="main"
                style={{
                    flex: 1,
                    height: '100vh',
                    overflowY: 'auto',
                    padding: 24,
                }}
            >
                {renderPage()}
            </Box>
        </Box>
    );
}

export default App;