// src/pages/TransactionsPage.tsx
import { useEffect, useState } from 'react';
import {
    ActionIcon,
    Badge, Box,
    Button,
    Card,
    Center,
    Group,
    Loader, Menu, Modal, NumberInput,
    ScrollArea, Select,
    SimpleGrid,
    Stack,
    Table,
    Text, Textarea,
    TextInput,
    Title,
    UnstyledButton,
} from '@mantine/core';
import {
    IconCash,
    IconChevronDown,
    IconChevronUp, IconDotsVertical,
    IconPlus,
    IconReceiptDollar,
    IconSearch,
    IconSelector, IconTrash,
    IconTrendingUp,
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { StatsCard } from '../components/StatsCard/StatsCard';
import { apiFetch } from '../api';
import classes from './TransactionsPage.module.css';
import {useDisclosure} from "@mantine/hooks";
import {useForm} from "@mantine/form";
import {DateInput} from "@mantine/dates";
import {PieChart} from "@mantine/charts";

type Account = {
    accountId: string;
    accountName: string;
    accountType: string;
    openingBalance: number;
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
    createdAt: string;
    updatedAt: string;
};

type SortKey =
    | 'transactionDate'
    | 'accountName'
    | 'merchantName'
    | 'category'
    | 'transactionType'
    | 'amount';

interface ThProps {
    children: React.ReactNode;
    reversed: boolean;
    sorted: boolean;
    onSort: () => void;
}

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


function Th({ children, reversed, sorted, onSort }: ThProps) {
    const Icon = sorted ? (reversed ? IconChevronUp : IconChevronDown) : IconSelector;

    return (
        <Table.Th className={classes.th}>
            <UnstyledButton onClick={onSort} className={classes.control}>
                <Group justify="space-between">
                    <Text fw={600} fz="sm">
                        {children}
                    </Text>
                    <Center className={classes.icon}>
                        <Icon size={16} stroke={1.5} />
                    </Center>
                </Group>
            </UnstyledButton>
        </Table.Th>
    );
}

function getMerchantLabel(transaction: Transaction) {
    return transaction.merchantName ?? transaction.description ?? '—';
}

function getAccountLabel(transaction: Transaction) {
    if (transaction.transactionType === 'transfer' && transaction.toAccount) {
        return `${transaction.account.accountName} → ${transaction.toAccount.accountName}`;
    }

    return transaction.account.accountName;
}

function getSortableValue(transaction: Transaction, key: SortKey): string | number {
    switch (key) {
        case 'accountName':
            return getAccountLabel(transaction);
        case 'merchantName':
            return getMerchantLabel(transaction);
        case 'transactionDate':
            return transaction.transactionDate;
        case 'category':
            return transaction.category;
        case 'transactionType':
            return transaction.transactionType;
        case 'amount':
            return transaction.amount;
    }
}

function filterData(data: Transaction[], search: string) {
    const query = search.toLowerCase().trim();

    if (query.length === 0) {
        return data;
    }

    return data.filter((transaction) =>
        [
            transaction.transactionDate,
            getAccountLabel(transaction),
            getMerchantLabel(transaction),
            transaction.category,
            transaction.transactionType,
            transaction.amount.toString(),
        ].some((value) => value.toLowerCase().includes(query)),
    );
}

function sortData(
    data: Transaction[],
    payload: { sortBy: SortKey | null; reversed: boolean; search: string },
) {
    const filtered = filterData(data, payload.search);

    if (!payload.sortBy) {
        return filtered;
    }

    return [...filtered].sort((a, b) => {
        const first = getSortableValue(a, payload.sortBy!);
        const second = getSortableValue(b, payload.sortBy!);

        if (typeof first === 'number' && typeof second === 'number') {
            return payload.reversed ? second - first : first - second;
        }

        return payload.reversed
            ? String(second).localeCompare(String(first))
            : String(first).localeCompare(String(second));
    });
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

function formatDate(date: string) {
    return new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

export function TransactionsPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [sortedData, setSortedData] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState<SortKey | null>('transactionDate');
    const [reverseSortDirection, setReverseSortDirection] = useState(true);
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [opened, { open, close }] = useDisclosure(false);
    const [transactionStats, setTransactionStats] = useState<TransactionStats | null>(null);

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

    async function refreshTransactionStats() {
        const response = await apiFetch('/transactions/stats');
        if (!response.ok) {
            throw new Error('Failed to load transaction stats');
        }

        const data = (await response.json()) as TransactionStats;
        setTransactionStats(data);
    }


    async function refreshTransactions() {
        try {
            const response = await apiFetch('/transactions');

            if (!response.ok) {
                throw new Error('Failed to load transactions');
            }

            const data = (await response.json()) as Transaction[];

            setTransactions(data);
            setSortedData(
                sortData(data, {
                    sortBy,
                    reversed: reverseSortDirection,
                    search,
                }),
            );
        } catch (err) {
            notifications.show({
                title: 'Transactions failed to load',
                message: 'Could not load your transactions.',
                color: 'red',
            });
        } finally {
        }
    }

    async function refreshAccounts() {
        try {
            const response = await apiFetch('/accounts');

            if (!response.ok) {
                throw new Error('Failed to load accounts');
            }

            const data = (await response.json()) as Account[];
            setAccounts(data);
        } catch {
            notifications.show({
                title: 'Accounts failed to load',
                message: 'Could not load accounts.',
                color: 'red',
            });
        }
    }

    async function deleteTransaction(transactionId: string) {
        try {
            const response = await apiFetch(`/transactions/${transactionId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete transaction');
            }

            notifications.show({
                title: 'Success',
                message: 'Transaction deleted',
                color: 'green',
            });

            await Promise.all([
                refreshTransactions(),
                refreshAccounts(),
                refreshTransactionStats()
            ]);
        } catch {
            notifications.show({
                title: 'Error',
                message: 'Failed to delete transaction',
                color: 'red',
            });
        }
    }

    useEffect(() => {
        async function loadPage() {
            setLoading(true);
            try {
                await Promise.all([
                    refreshTransactions(),
                    refreshAccounts(),
                    refreshTransactionStats()
                ]);
            } finally {
                setLoading(false);
            }
        }
        void loadPage();
        }, []);

    const setSorting = (field: SortKey) => {
        const reversed = field === sortBy ? !reverseSortDirection : false;

        setReverseSortDirection(reversed);
        setSortBy(field);
        setSortedData(sortData(transactions, { sortBy: field, reversed, search }));
    };

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.currentTarget.value;

        setSearch(value);
        setSortedData(
            sortData(transactions, {
                sortBy,
                reversed: reverseSortDirection,
                search: value,
            }),
        );
    };

    const rows = sortedData.map((transaction) => (
        <Table.Tr key={transaction.transactionId}>
            <Table.Td>{formatDate(transaction.transactionDate)}</Table.Td>
            <Table.Td>{getAccountLabel(transaction)}</Table.Td>
            <Table.Td>{getMerchantLabel(transaction)}</Table.Td>
            <Table.Td tt="capitalize">{transaction.category.replaceAll('_', ' ')}</Table.Td>
            <Table.Td>
                <Badge color={getTypeColor(transaction.transactionType)} variant="light">
                    {transaction.transactionType}
                </Badge>
            </Table.Td>
            <Table.Td ta="right">
                <Group justify="flex-end" gap="xs">
                    <Text fw={600}>
                        {transaction.amount.toLocaleString('en-US', {
                            style: 'currency',
                            currency: transaction.account.currencyCode,
                        })}
                    </Text>

                    <Menu position="bottom-end" shadow="md">
                        <Menu.Target>
                            <ActionIcon variant="subtle">
                                <IconDotsVertical size={16} />
                            </ActionIcon>
                        </Menu.Target>

                        <Menu.Dropdown>
                            <Menu.Item
                                leftSection={<IconTrash size={14} />}
                                color="red"
                                onClick={() => void deleteTransaction(transaction.transactionId)}
                            >
                                Delete
                            </Menu.Item>
                        </Menu.Dropdown>
                    </Menu>
                </Group>
            </Table.Td>
        </Table.Tr>
    ));

    return (
        <Stack gap="xl">
            <Modal opened={opened} onClose={close} title="Create transaction" centered size="lg">
                <form
                    onSubmit={form.onSubmit(async (values) => {
                        try {
                            const date =
                                values.transactionDate instanceof Date
                                    ? values.transactionDate
                                    : new Date(values.transactionDate);

                            if (isNaN(date.getTime())) {
                                throw new Error('Invalid transaction date');
                            }
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

                            console.log("POST!");

                            const response = await apiFetch('/transactions', {
                                method: 'POST',
                                body: JSON.stringify(body),
                            });



                            if (!response.ok) {
                                console.log(response);
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
                                refreshTransactions(),
                                refreshAccounts(),
                                refreshTransactionStats()
                            ]);
                        } catch(error) {
                            console.error('Create transaction failed:', error);
                            notifications.show({
                                title: 'Error',
                                message: 'Failed to create transaction',
                                color: 'red',
                            });
                        }
                    })}
                >
                    <Stack>
                        <Select
                            label="Account"
                            placeholder="Select account"
                            required
                            data={accounts.map((account) => ({
                                value: account.accountId,
                                label: account.accountName,
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
                                placeholder="Select destination account"
                                required
                                data={accounts
                                    .filter((account) => account.accountId !== form.values.accountId)
                                    .map((account) => ({
                                        value: account.accountId,
                                        label: account.accountName,
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
                                { value: 'mortgage', label: 'Mortgage' },
                                { value: 'insurance', label: 'Insurance' },
                                { value: 'healthcare', label: 'Healthcare' },
                                { value: 'entertainment', label: 'Entertainment' },
                                { value: 'shopping', label: 'Shopping' },
                                { value: 'subscriptions', label: 'Subscriptions' },
                                { value: 'travel', label: 'Travel' },
                                { value: 'education', label: 'Education' },
                                { value: 'income', label: 'Income' },
                                { value: 'transfer', label: 'Transfer' },
                                { value: 'taxes', label: 'Taxes' },
                                { value: 'savings', label: 'Savings' },
                                { value: 'other', label: 'Other' },
                            ]}
                            {...form.getInputProps('category')}
                        />

                        <TextInput
                            label="Merchant"
                            placeholder="Optional"
                            {...form.getInputProps('merchantName')}
                        />

                        <Textarea
                            label="Description"
                            placeholder="Optional"
                            {...form.getInputProps('description')}
                        />

                        <Button type="submit">Create transaction</Button>
                    </Stack>
                </form>
            </Modal>
            <Group justify="space-between">
                <div>
                    <Title order={1}>Transactions</Title>
                    <Text c="dimmed">View and manage account activity.</Text>
                </div>

                <Button leftSection={<IconPlus size={16} />} onClick={open}>Add transaction</Button>
            </Group>

            <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }}>
                <StatsCard
                    title="Transactions"
                    value={(transactionStats?.totalTransactions.value ?? 0).toString()}
                    icon={IconReceiptDollar}
                    diff={transactionStats?.totalTransactions.percentChange ?? 0}
                    caption="Compared to previous 30 days"
                />

                <StatsCard
                    title="Income"
                    value={(transactionStats?.totalIncome.value ?? 0).toLocaleString('en-US', {
                        style: 'currency',
                        currency: 'USD',
                    })}
                    icon={IconCash}
                    diff={transactionStats?.totalIncome.percentChange ?? 0}
                    caption="Compared to previous 30 days"
                />

                <StatsCard
                    title="Expenses"
                    value={(transactionStats?.totalExpense.value ?? 0).toLocaleString('en-US', {
                        style: 'currency',
                        currency: 'USD',
                    })}
                    icon={IconTrendingUp}
                    diff={transactionStats?.totalExpense.percentChange ?? 0}
                    caption="Compared to previous 30 days"
                />

                <Card withBorder p="md" radius="md" style={{ overflow: 'visible' }}>
                    <Text size="xs" c="dimmed" fw={700} tt="uppercase">
                        Category breakdown
                    </Text>

                    {transactionStats?.categoryBreakdown.length ? (
                        <Center mt="md" mb="sm">
                            <PieChart
                                h={150}
                                w={150}
                                size={125}
                                data={transactionStats.categoryBreakdown.map((item, index) => ({
                                    name: item.category,
                                    value: item.total,
                                    color: ['green.6', 'blue.6', 'yellow.6', 'red.6', 'violet.6'][
                                    index % 5
                                        ],
                                }))}
                            />
                        </Center>
                    ) : (
                        <Text mt={25} fw={700} size="xl">
                            No expenses
                        </Text>
                    )}

                    <Text fz="xs" c="dimmed" mt={7}>
                        Last 30 days by category
                    </Text>
                </Card>
            </SimpleGrid>

            <Stack gap={4} mt="md">
                <Text fw={700} size="lg">
                    Transactions
                </Text>
                <Text size="sm" c="dimmed">
                    Search, sort, and review recent financial activity
                </Text>
            </Stack>

            <Card withBorder radius="md" p="md">
                {loading ? (
                    <Loader />
                ) : (
                    <ScrollArea>
                        <TextInput
                            placeholder="Search transactions"
                            mb="md"
                            leftSection={<IconSearch size={16} stroke={1.5} />}
                            value={search}
                            onChange={handleSearchChange}
                        />

                        <Table horizontalSpacing="md" verticalSpacing="sm" miw={900} layout="fixed">
                            <Table.Thead>
                                <Table.Tr>
                                    <Th
                                        sorted={sortBy === 'transactionDate'}
                                        reversed={reverseSortDirection}
                                        onSort={() => setSorting('transactionDate')}
                                    >
                                        Date
                                    </Th>
                                    <Th
                                        sorted={sortBy === 'accountName'}
                                        reversed={reverseSortDirection}
                                        onSort={() => setSorting('accountName')}
                                    >
                                        Account
                                    </Th>
                                    <Th
                                        sorted={sortBy === 'merchantName'}
                                        reversed={reverseSortDirection}
                                        onSort={() => setSorting('merchantName')}
                                    >
                                        Merchant
                                    </Th>
                                    <Th
                                        sorted={sortBy === 'category'}
                                        reversed={reverseSortDirection}
                                        onSort={() => setSorting('category')}
                                    >
                                        Category
                                    </Th>
                                    <Th
                                        sorted={sortBy === 'transactionType'}
                                        reversed={reverseSortDirection}
                                        onSort={() => setSorting('transactionType')}
                                    >
                                        Type
                                    </Th>
                                    <Th
                                        sorted={sortBy === 'amount'}
                                        reversed={reverseSortDirection}
                                        onSort={() => setSorting('amount')}
                                    >
                                        Amount
                                    </Th>
                                </Table.Tr>
                            </Table.Thead>

                            <Table.Tbody>
                                {rows.length > 0 ? (
                                    rows
                                ) : (
                                    <Table.Tr>
                                        <Table.Td colSpan={6}>
                                            <Text fw={500} ta="center">
                                                No transactions found
                                            </Text>
                                        </Table.Td>
                                    </Table.Tr>
                                )}
                            </Table.Tbody>
                        </Table>
                    </ScrollArea>
                )}
            </Card>
        </Stack>
    );
}