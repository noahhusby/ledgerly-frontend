// App.tsx
import { useEffect, useState } from 'react';
import { Box } from '@mantine/core';
import { NavbarMinimal, type Page } from './components/NavbarMinimal/NavbarMinimal';
import { LoginPage } from './pages/LoginPage';
import { HomePage } from './pages/HomePage';
import { AccountsPage } from './pages/AccountsPage';
import { TransactionsPage } from './pages/TransactionsPage';
import { BudgetsPage } from './pages/BudgetsPage';
import { clearToken, getToken } from './auth';
import { apiFetch } from './api';

type CurrentUser = {
    userId: string;
    email: string;
    firstName: string;
    lastName: string;
};

function App() {
    const [token, setTokenState] = useState<string | null>(getToken());
    const [activePage, setActivePage] = useState<Page>('Home');
    const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

    useEffect(() => {
        async function loadCurrentUser() {
            if (!token) {
                setCurrentUser(null);
                return;
            }

            try {
                const response = await apiFetch('/users');

                if (!response.ok) {
                    throw new Error('Failed to load user');
                }

                const data = (await response.json()) as CurrentUser;
                setCurrentUser(data);
            } catch {
                clearToken();
                setTokenState(null);
                setCurrentUser(null);
            }
        }

        void loadCurrentUser();
    }, [token]);

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

    if (!token) {
        return <LoginPage onLogin={setTokenState} />;
    }

    return (
        <Box style={{ display: 'flex', height: '100vh', width: '100%' }}>
            <NavbarMinimal
                activePage={activePage}
                onPageChange={setActivePage}
                onLogout={() => {
                    clearToken();
                    setTokenState(null);
                    setCurrentUser(null);
                    setActivePage('Home');
                }}
                user={{
                    name: currentUser
                        ? `${currentUser.firstName} ${currentUser.lastName}`
                        : 'Loading...',
                    email: currentUser?.email ?? '',
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