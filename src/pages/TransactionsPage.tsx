// src/pages/TransactionsPage.tsx
import { useState } from 'react';
import {
    Badge,
    Button,
    Card,
    Center,
    Group,
    ScrollArea,
    SimpleGrid,
    Stack,
    Table,
    Text,
    TextInput,
    Title,
    UnstyledButton,
} from '@mantine/core';
import {
    IconCash,
    IconChevronDown,
    IconChevronUp,
    IconPlus,
    IconReceiptDollar,
    IconSearch,
    IconSelector,
    IconTrendingUp,
} from '@tabler/icons-react';
import { StatsCard } from '../components/StatsCard/StatsCard';
import classes from './TransactionsPage.module.css';

type Transaction = {
    transactionId: string;
    date: string;
    account: string;
    merchant: string;
    category: string;
    type: 'income' | 'expense' | 'transfer';
    amount: number;
};

type SortKey = keyof Transaction;

const mockTransactions: Transaction[] = [
    {
        transactionId: '1',
        date: '2026-04-30',
        account: 'Checking',
        merchant: 'Jewel-Osco',
        category: 'Groceries',
        type: 'expense',
        amount: -64.28,
    },
    {
        transactionId: '2',
        date: '2026-04-29',
        account: 'Savings',
        merchant: 'Internal Transfer',
        category: 'Transfer',
        type: 'transfer',
        amount: 500,
    },
    {
        transactionId: '3',
        date: '2026-04-28',
        account: 'Checking',
        merchant: 'Payroll',
        category: 'Income',
        type: 'income',
        amount: 1200,
    },
    {
        transactionId: '4',
        date: '2026-04-27',
        account: 'Cash',
        merchant: 'Coffee Shop',
        category: 'Dining',
        type: 'expense',
        amount: -8.75,
    },
];

interface ThProps {
    children: React.ReactNode;
    reversed: boolean;
    sorted: boolean;
    onSort: () => void;
}

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

function filterData(data: Transaction[], search: string) {
    const query = search.toLowerCase().trim();

    return data.filter((item) =>
        [item.date, item.account, item.merchant, item.category, item.type, item.amount.toString()]
            .some((value) => value.toLowerCase().includes(query)),
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
        const first = a[payload.sortBy!];
        const second = b[payload.sortBy!];

        if (typeof first === 'number' && typeof second === 'number') {
            return payload.reversed ? second - first : first - second;
        }

        return payload.reversed
            ? String(second).localeCompare(String(first))
            : String(first).localeCompare(String(second));
    });
}

function getTypeColor(type: Transaction['type']) {
    switch (type) {
        case 'income':
            return 'teal';
        case 'expense':
            return 'red';
        case 'transfer':
            return 'blue';
    }
}

export function TransactionsPage() {
    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState<SortKey | null>('date');
    const [reverseSortDirection, setReverseSortDirection] = useState(true);
    const [sortedData, setSortedData] = useState(
        sortData(mockTransactions, {
            sortBy: 'date',
            reversed: true,
            search: '',
        }),
    );

    const setSorting = (field: SortKey) => {
        const reversed = field === sortBy ? !reverseSortDirection : false;

        setReverseSortDirection(reversed);
        setSortBy(field);
        setSortedData(sortData(mockTransactions, { sortBy: field, reversed, search }));
    };

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.currentTarget.value;

        setSearch(value);
        setSortedData(
            sortData(mockTransactions, {
                sortBy,
                reversed: reverseSortDirection,
                search: value,
            }),
        );
    };

    const rows = sortedData.map((transaction) => (
        <Table.Tr key={transaction.transactionId}>
            <Table.Td>{transaction.date}</Table.Td>
            <Table.Td>{transaction.account}</Table.Td>
            <Table.Td>{transaction.merchant}</Table.Td>
            <Table.Td>{transaction.category}</Table.Td>
            <Table.Td>
                <Badge color={getTypeColor(transaction.type)} variant="light">
                    {transaction.type}
                </Badge>
            </Table.Td>
            <Table.Td ta="right" fw={600}>
                {transaction.amount.toLocaleString('en-US', {
                    style: 'currency',
                    currency: 'USD',
                })}
            </Table.Td>
        </Table.Tr>
    ));

    return (
        <Stack gap="xl">
            <Group justify="space-between">
                <div>
                    <Title order={1}>Transactions</Title>
                    <Text c="dimmed">View and manage account activity.</Text>
                </div>

                <Button leftSection={<IconPlus size={16} />}>Add transaction</Button>
            </Group>

            <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }}>
                <StatsCard
                    title="Monthly spending"
                    value="$1,284.55"
                    icon={IconReceiptDollar}
                    diff={-4.2}
                    caption="Compared to previous month"
                />

                <StatsCard
                    title="Monthly income"
                    value="$3,200.00"
                    icon={IconCash}
                    diff={8.1}
                    caption="Compared to previous month"
                />

                <StatsCard
                    title="Net cash flow"
                    value="$1,915.45"
                    icon={IconTrendingUp}
                    diff={12.6}
                    caption="Compared to previous month"
                />
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
                                    sorted={sortBy === 'date'}
                                    reversed={reverseSortDirection}
                                    onSort={() => setSorting('date')}
                                >
                                    Date
                                </Th>
                                <Th
                                    sorted={sortBy === 'account'}
                                    reversed={reverseSortDirection}
                                    onSort={() => setSorting('account')}
                                >
                                    Account
                                </Th>
                                <Th
                                    sorted={sortBy === 'merchant'}
                                    reversed={reverseSortDirection}
                                    onSort={() => setSorting('merchant')}
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
                                    sorted={sortBy === 'type'}
                                    reversed={reverseSortDirection}
                                    onSort={() => setSorting('type')}
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
            </Card>
        </Stack>
    );
}