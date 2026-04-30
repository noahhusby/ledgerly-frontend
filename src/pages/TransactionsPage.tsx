// src/pages/TransactionsPage.tsx
import { useMemo, useState } from 'react';
import {
    Badge,
    Group,
    ScrollArea,
    Stack,
    Table,
    Text,
    Title,
} from '@mantine/core';

const mockTransactions = [
    {
        transactionId: '1',
        accountName: 'Checking',
        category: 'Groceries',
        transactionType: 'expense',
        amount: -64.28,
        transactionDate: '2026-04-28',
        merchantName: 'Jewel-Osco',
    },
    {
        transactionId: '2',
        accountName: 'Savings',
        category: 'Transfer',
        transactionType: 'transfer',
        amount: 300.0,
        transactionDate: '2026-04-27',
        merchantName: 'Internal Transfer',
    },
    {
        transactionId: '3',
        accountName: 'Checking',
        category: 'Income',
        transactionType: 'income',
        amount: 1200.0,
        transactionDate: '2026-04-25',
        merchantName: 'Payroll',
    },
    {
        transactionId: '4',
        accountName: 'Cash',
        category: 'Food',
        transactionType: 'expense',
        amount: -14.5,
        transactionDate: '2026-04-24',
        merchantName: 'Coffee Shop',
    },
];

type SortKey = 'transactionDate' | 'merchantName' | 'category' | 'amount';

export function TransactionsPage() {
    const [selectedAccount, setSelectedAccount] = useState<string>('All');
    const [sortKey, setSortKey] = useState<SortKey>('transactionDate');

    const accounts = ['All', ...new Set(mockTransactions.map((tx) => tx.accountName))];

    const transactions = useMemo(() => {
        return mockTransactions
            .filter((tx) => selectedAccount === 'All' || tx.accountName === selectedAccount)
            .sort((a, b) => {
                if (sortKey === 'amount') {
                    return b.amount - a.amount;
                }

                return String(b[sortKey]).localeCompare(String(a[sortKey]));
            });
    }, [selectedAccount, sortKey]);

    return (
        <Stack gap="lg">
            <div>
                <Title order={1}>Transactions</Title>
                <Text c="dimmed">View and sort your recent transactions.</Text>
            </div>

            <Group gap="xs">
                {accounts.map((account) => (
                    <Badge
                        key={account}
                        size="lg"
                        radius="xl"
                        variant={selectedAccount === account ? 'filled' : 'light'}
                        style={{ cursor: 'pointer' }}
                        onClick={() => setSelectedAccount(account)}
                    >
                        {account}
                    </Badge>
                ))}
            </Group>

            <Group gap="xs">
                <Text size="sm" c="dimmed">
                    Sort by:
                </Text>

                {[
                    ['transactionDate', 'Date'],
                    ['merchantName', 'Merchant'],
                    ['category', 'Category'],
                    ['amount', 'Amount'],
                ].map(([key, label]) => (
                    <Badge
                        key={key}
                        radius="xl"
                        variant={sortKey === key ? 'filled' : 'light'}
                        style={{ cursor: 'pointer' }}
                        onClick={() => setSortKey(key as SortKey)}
                    >
                        {label}
                    </Badge>
                ))}
            </Group>

            <ScrollArea>
                <Table striped highlightOnHover withTableBorder withColumnBorders>
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
                        {transactions.map((tx) => (
                            <Table.Tr key={tx.transactionId}>
                                <Table.Td>{tx.transactionDate}</Table.Td>
                                <Table.Td>{tx.accountName}</Table.Td>
                                <Table.Td>{tx.merchantName}</Table.Td>
                                <Table.Td>{tx.category}</Table.Td>
                                <Table.Td>
                                    <Badge
                                        color={
                                            tx.transactionType === 'income'
                                                ? 'green'
                                                : tx.transactionType === 'expense'
                                                    ? 'red'
                                                    : 'blue'
                                        }
                                        variant="light"
                                    >
                                        {tx.transactionType}
                                    </Badge>
                                </Table.Td>
                                <Table.Td ta="right">
                                    {tx.amount.toLocaleString('en-US', {
                                        style: 'currency',
                                        currency: 'USD',
                                    })}
                                </Table.Td>
                            </Table.Tr>
                        ))}
                    </Table.Tbody>
                </Table>
            </ScrollArea>
        </Stack>
    );
}