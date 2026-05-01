// src/pages/HomePage.tsx
import { useEffect, useState } from 'react';
import {
    Badge,
    Button,
    Card,
    Group,
    Loader, Modal, NumberInput, Select,
    SimpleGrid,
    Stack,
    Table,
    Text, Textarea, TextInput,
    Title,
} from '@mantine/core';
import {
    IconBellDollar,
    IconBuildingBank,
    IconCash,
    IconPlus,
    IconReceiptDollar,
    IconTrendingUp,
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { StatsCard } from '../components/StatsCard/StatsCard';
import { apiFetch } from '../api';
import type { Page } from '../components/NavbarMinimal/NavbarMinimal';
import classes from './AccountsPage.module.css';
import {useDisclosure} from "@mantine/hooks";
import {useForm} from "@mantine/form";
import {DateInput} from "@mantine/dates";
import {BudgetStatusCard} from "../components/BudgetStatusCard/BudgetStatusCard.tsx";

type Account = {
    accountId: string;
    accountName: string;
    accountType: string;
    openingBalance: number;
    currentBalance: number;
    currencyCode: string;
};

type Transaction = {
    transactionId: string;
    account: Account;
    toAccount: Account | null;
    category: string;
    transactionType: 'income' | 'expense' | 'transfer';
    amount: number;
    transactionDate: string;
    description: string | null;
    merchantName: string | null;
};

type TransactionStats = {
    totalTransactions: {
        value: number;
        percentChange: number;
    };
    totalIncome: {
        value: number;
        percentChange: number;
    };
    totalExpense: {
        value: number;
        percentChange: number;
    };
    categoryBreakdown: {
        category: string;
        total: number;
        percentage: number;
    }[];
};

type BalanceStats = {
    totalBalance: number;
    percentChangeFromLastMonth: number;
};

type HomePageProps = {
    onPageChange: (page: Page) => void;
};

type Budget = {
    budgetId: string;
    budgetName: string;
    periodType: string;
    category: string;
    budgetLimit: number;
    appliedAmount: number;
    remainingAmount: number;
    percentUsed: number;
    accountId?: string;
    accountName?: string;
};

function formatCurrency(value: number, currency = 'USD') {
    return value.toLocaleString('en-US', {
        style: 'currency',
        currency,
    });
}

function formatDate(date: string) {
    return new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

function getTransactionLabel(transaction: Transaction) {
    return transaction.merchantName ?? transaction.description ?? transaction.category;
}

function getAccountLabel(transaction: Transaction) {
    if (transaction.transactionType === 'transfer' && transaction.toAccount) {
        return `${transaction.account.accountName} → ${transaction.toAccount.accountName}`;
    }

    return transaction.account.accountName;
}

function getTypeColor(type: Transaction['transactionType']) {
    switch (type) {
        case 'income':
            return 'teal';
        case 'expense':
            return 'red';
        case 'transfer':
            return 'blue';
    }
}

export function HomePage({ onPageChange }: HomePageProps) {
    const [loading, setLoading] = useState(true);
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [transactionStats, setTransactionStats] = useState<TransactionStats | null>(null);
    const [balanceStats, setBalanceStats] = useState<BalanceStats | null>(null);
    const [opened, { open, close }] = useDisclosure(false);
    const [budgets, setBudgets] = useState<Budget[]>([]);

    const form = useForm({
        initialValues: {
            accountId: '',
            toAccountId: '',
            transactionType: 'expense',
            amount: 0,
            transactionDate: new Date(),
            category: 'other',
            description: '',
            merchantName: '',
        },
    });

    async function createTransaction(values: typeof form.values) {
        try {
            const date =
                values.transactionDate instanceof Date
                    ? values.transactionDate
                    : new Date(values.transactionDate);

            const body = {
                accountId: values.accountId,
                toAccountId:
                    values.transactionType === 'transfer' && values.toAccountId
                        ? values.toAccountId
                        : undefined,
                transactionType: values.transactionType,
                amount: values.amount,
                transactionDate: date.toISOString(),
                category: values.category,
                description: values.description || undefined,
                merchantName: values.merchantName || undefined,
            };

            const response = await apiFetch('/transactions', {
                method: 'POST',
                body: JSON.stringify(body),
            });

            if (!response.ok) {
                throw new Error('Failed to create transaction');
            }

            notifications.show({
                title: 'Success',
                message: 'Transaction created',
                color: 'green',
            });

            form.reset();
            close();

            await Promise.all([
                apiFetch('/transactions').then((r) => r.json()).then(setTransactions),
                apiFetch('/transactions/stats').then((r) => r.json()).then(setTransactionStats),
                apiFetch('/transactions/balance-stats').then((r) => r.json()).then(setBalanceStats),
                apiFetch('/budgets').then((r) => r.json()).then(setBudgets),
            ]);
        } catch {
            notifications.show({
                title: 'Error',
                message: 'Failed to create transaction',
                color: 'red',
            });
        }
    }


    useEffect(() => {
        async function loadHome() {
            try {
                const [
                    accountsResponse,
                    transactionsResponse,
                    transactionStatsResponse,
                    balanceStatsResponse,
                    budgetsResponse,
                ] = await Promise.all([
                    apiFetch('/transactions/accounts-with-balances'),
                    apiFetch('/transactions'),
                    apiFetch('/transactions/stats'),
                    apiFetch('/transactions/balance-stats'),
                    apiFetch('/budgets'),
                ]);

                if (
                    !accountsResponse.ok ||
                    !transactionsResponse.ok ||
                    !transactionStatsResponse.ok ||
                    !balanceStatsResponse.ok ||
                    !budgetsResponse.ok
                ) {
                    throw new Error('Failed to load home data');
                }

                const accountsData = (await accountsResponse.json()) as Account[];
                const transactionsData = (await transactionsResponse.json()) as Transaction[];
                const transactionStatsData =
                    (await transactionStatsResponse.json()) as TransactionStats;
                const balanceStatsData =
                    (await balanceStatsResponse.json()) as BalanceStats;
                const budgetsData = (await budgetsResponse.json()) as Budget[];

                setAccounts(accountsData);
                setTransactions(transactionsData.slice(0, 5));
                setTransactionStats(transactionStatsData);
                setBalanceStats(balanceStatsData);
                setBudgets(budgetsData);
            } catch {
                notifications.show({
                    title: 'Home failed to load',
                    message: 'Could not load dashboard data.',
                    color: 'red',
                });
            } finally {
                setLoading(false);
            }
        }

        void loadHome();
    }, []);

    if (loading) {
        return <Loader />;
    }

    return (
        <Stack gap="xl">
            <Modal opened={opened} onClose={close} title="Create transaction" centered size="lg">
                <form onSubmit={form.onSubmit(createTransaction)}>
                    <Stack>
                        <Select
                            label="Account"
                            required
                            data={accounts.map((a) => ({
                                value: a.accountId,
                                label: a.accountName,
                            }))}
                            {...form.getInputProps('accountId')}
                        />

                        <Select
                            label="Transaction type"
                            required
                            data={[
                                { value: 'income', label: 'Income' },
                                { value: 'expense', label: 'Expense' },
                                { value: 'transfer', label: 'Transfer' },
                            ]}
                            {...form.getInputProps('transactionType')}
                        />

                        {form.values.transactionType === 'transfer' && (
                            <Select
                                label="Destination account"
                                required
                                data={accounts
                                    .filter((a) => a.accountId !== form.values.accountId)
                                    .map((a) => ({
                                        value: a.accountId,
                                        label: a.accountName,
                                    }))}
                                {...form.getInputProps('toAccountId')}
                            />
                        )}

                        <NumberInput
                            label="Amount"
                            required
                            min={0.01}
                            decimalScale={2}
                            fixedDecimalScale
                            {...form.getInputProps('amount')}
                        />

                        <DateInput
                            label="Transaction date"
                            required
                            valueFormat="MMM D, YYYY"
                            {...form.getInputProps('transactionDate')}
                        />

                        <Select
                            label="Category"
                            required
                            data={[
                                { value: 'groceries', label: 'Groceries' },
                                { value: 'dining', label: 'Dining' },
                                { value: 'transport', label: 'Transport' },
                                { value: 'utilities', label: 'Utilities' },
                                { value: 'rent', label: 'Rent' },
                                { value: 'travel', label: 'Travel' },
                                { value: 'income', label: 'Income' },
                                { value: 'transfer', label: 'Transfer' },
                                { value: 'other', label: 'Other' },
                            ]}
                            {...form.getInputProps('category')}
                        />

                        <TextInput
                            label="Merchant"
                            {...form.getInputProps('merchantName')}
                        />

                        <Textarea
                            label="Description"
                            {...form.getInputProps('description')}
                        />

                        <Button type="submit">Create transaction</Button>

                    </Stack>
                </form>
            </Modal>
            <Group justify="space-between">
                <div>
                    <Title order={1}>Home</Title>
                    <Text c="dimmed">Welcome to Ledgerly.</Text>
                </div>

                <Button leftSection={<IconPlus size={16} />} onClick={open}>
                    Add transaction
                </Button>
            </Group>

            <Stack gap="md">
                <div>
                    <Text fw={700} size="lg">
                        Overall stats
                    </Text>
                    <Text size="sm" c="dimmed">
                        A quick overview of your financial activity
                    </Text>
                </div>

                <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }}>
                    <StatsCard
                        title="Total balance"
                        value={formatCurrency(balanceStats?.totalBalance ?? 0)}
                        icon={IconCash}
                        diff={balanceStats?.percentChangeFromLastMonth ?? 0}
                        caption="Compared to previous month"
                    />

                    <StatsCard
                        title="Income"
                        value={formatCurrency(transactionStats?.totalIncome.value ?? 0)}
                        icon={IconTrendingUp}
                        diff={transactionStats?.totalIncome.percentChange ?? 0}
                        caption="Last 30 days"
                    />

                    <StatsCard
                        title="Expenses"
                        value={formatCurrency(transactionStats?.totalExpense.value ?? 0)}
                        icon={IconReceiptDollar}
                        diff={transactionStats?.totalExpense.percentChange ?? 0}
                        caption="Last 30 days"
                    />

                    <StatsCard
                        title="Transactions"
                        value={(transactionStats?.totalTransactions.value ?? 0).toString()}
                        icon={IconReceiptDollar}
                        diff={transactionStats?.totalTransactions.percentChange ?? 0}
                        caption="Last 30 days"
                    />
                </SimpleGrid>
            </Stack>

            <Stack gap="md">
                <Group justify="space-between">
                    <div>
                        <Text fw={700} size="lg">
                            Budgets
                        </Text>
                        <Text size="sm" c="dimmed">
                            Budgets across your accounts
                        </Text>
                    </div>

                    <Button variant="subtle" onClick={() => onPageChange('Budgets')}>
                        View all
                    </Button>
                </Group>

                {budgets.length === 0 ? (
                    <Card withBorder radius="md" p="xl">
                        <Group>
                            <IconBellDollar size={24} />
                            <div>
                                <Text fw={600}>No budget data yet</Text>
                                <Text size="sm" c="dimmed">
                                    Budget tracking has not been configured.
                                </Text>
                            </div>
                        </Group>
                    </Card>
                ) : (
                    <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }}>
                        {budgets.slice(0, 3).map((budget) => (
                            <BudgetStatusCard
                                key={budget.budgetId}
                                name={budget.budgetName}
                                period={budget.periodType}
                                limit={budget.budgetLimit}
                                applied={budget.appliedAmount}
                                remaining={budget.remainingAmount}
                                percentUsed={budget.percentUsed}
                            />
                        ))}
                    </SimpleGrid>
                )}
            </Stack>

            <Stack gap="md">
                <Group justify="space-between">
                    <div>
                        <Text fw={700} size="lg">
                            Accounts
                        </Text>
                        <Text size="sm" c="dimmed">
                            Current balances across your accounts
                        </Text>
                    </div>

                    <Button variant="subtle" onClick={() => onPageChange('Accounts')}>
                        View all
                    </Button>
                </Group>

                {accounts.length === 0 ? (
                    <Card withBorder radius="md" p="xl">
                        <Text fw={600}>No accounts yet</Text>
                        <Text size="sm" c="dimmed">
                            Create an account to start tracking balances.
                        </Text>
                    </Card>
                ) : (
                    <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }}>
                        {accounts.slice(0, 4).map((account) => (
                            <Card
                                key={account.accountId}
                                className={classes.card}
                                withBorder
                                radius="md"
                                p="md"
                                onClick={() => onPageChange('Accounts')}
                                style={{ cursor: 'pointer' }}
                            >
                                <Stack gap="sm">
                                    <Group justify="space-between">
                                        <IconBuildingBank size={22} />
                                        <Text size="xs" c="dimmed" tt="uppercase">
                                            {account.accountType}
                                        </Text>
                                    </Group>

                                    <div>
                                        <Text fw={700}>{account.accountName}</Text>
                                        <Text size="xl" fw={700} mt="xs">
                                            {formatCurrency(account.currentBalance, account.currencyCode)}
                                        </Text>
                                    </div>
                                </Stack>
                            </Card>
                        ))}
                    </SimpleGrid>
                )}
            </Stack>

            <Stack gap="md">
                <Group justify="space-between">
                    <div>
                        <Text fw={700} size="lg">
                            Transactions
                        </Text>
                        <Text size="sm" c="dimmed">
                            Recent account activity
                        </Text>
                    </div>

                    <Button variant="subtle" onClick={() => onPageChange('Transactions')}>
                        View all
                    </Button>
                </Group>

                <Card withBorder radius="md" p="md">
                    <Table horizontalSpacing="md" verticalSpacing="sm">
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th>Date</Table.Th>
                                <Table.Th>Account</Table.Th>
                                <Table.Th>Merchant</Table.Th>
                                <Table.Th>Category</Table.Th>
                                <Table.Th>Type</Table.Th>
                                <Table.Th ta="right">Amount</Table.Th>
                            </Table.Tr>
                        </Table.Thead>

                        <Table.Tbody>
                            {transactions.length === 0 ? (
                                <Table.Tr>
                                    <Table.Td colSpan={6}>
                                        <Text ta="center" c="dimmed">
                                            No transactions yet
                                        </Text>
                                    </Table.Td>
                                </Table.Tr>
                            ) : (
                                transactions.map((transaction) => (
                                    <Table.Tr key={transaction.transactionId}>
                                        <Table.Td>{formatDate(transaction.transactionDate)}</Table.Td>
                                        <Table.Td>{getAccountLabel(transaction)}</Table.Td>
                                        <Table.Td>{getTransactionLabel(transaction)}</Table.Td>
                                        <Table.Td tt="capitalize">
                                            {transaction.category.replaceAll('_', ' ')}
                                        </Table.Td>
                                        <Table.Td>
                                            <Badge color={getTypeColor(transaction.transactionType)} variant="light">
                                                {transaction.transactionType}
                                            </Badge>
                                        </Table.Td>
                                        <Table.Td ta="right" fw={600}>
                                            {formatCurrency(transaction.amount, transaction.account.currencyCode)}
                                        </Table.Td>
                                    </Table.Tr>
                                ))
                            )}
                        </Table.Tbody>
                    </Table>
                </Card>
            </Stack>
        </Stack>
    );
}