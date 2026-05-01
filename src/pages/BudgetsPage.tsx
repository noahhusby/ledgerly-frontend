import { useEffect, useState } from 'react';
import {
    ActionIcon,
    Button,
    Card,
    Group,
    Loader,
    Menu,
    Modal,
    NumberInput,
    Progress,
    ScrollArea,
    Select,
    Stack,
    Table,
    Text,
    TextInput,
    Title,
} from '@mantine/core';
import {
    IconBellDollar,
    IconDotsVertical,
    IconPlus,
    IconTrash,
} from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { apiFetch } from '../api';

type Account = {
    accountId: string;
    accountName: string;
};

type Budget = {
    budgetId: string;
    budgetName: string;
    periodType: 'weekly' | 'monthly' | 'yearly';
    category: string;
    budgetLimit: number;
    appliedAmount: number;
    remainingAmount: number;
    percentUsed: number;
    accountId?: string;
    accountName?: string;
    createdAt: string;
    updatedAt: string;
};

const categoryOptions = [
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
    { value: 'taxes', label: 'Taxes' },
    { value: 'savings', label: 'Savings' },
    { value: 'other', label: 'Other' },
];

function formatCurrency(value: number) {
    return value.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
    });
}

function formatLabel(value: string) {
    return value.replaceAll('_', ' ');
}

function getProgressColor(percentUsed: number) {
    if (percentUsed >= 100) return 'red';
    if (percentUsed >= 80) return 'yellow';
    return 'teal';
}

export function BudgetsPage() {
    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [loading, setLoading] = useState(true);
    const [opened, { open, close }] = useDisclosure(false);

    const form = useForm({
        initialValues: {
            budgetName: '',
            accountId: '',
            periodType: 'monthly',
            category: 'other',
            budgetLimit: 0,
        },
    });

    async function refreshBudgets() {
        const response = await apiFetch('/budgets');

        if (!response.ok) {
            throw new Error('Failed to load budgets');
        }

        const data = (await response.json()) as Budget[];
        setBudgets(data);
    }

    async function refreshAccounts() {
        const response = await apiFetch('/accounts');

        if (!response.ok) {
            throw new Error('Failed to load accounts');
        }

        const data = (await response.json()) as Account[];
        setAccounts(data);
    }

    async function deleteBudget(budgetId: string) {
        try {
            const response = await apiFetch(`/budgets/${budgetId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete budget');
            }

            notifications.show({
                title: 'Success',
                message: 'Budget deleted',
                color: 'green',
            });

            await refreshBudgets();
        } catch {
            notifications.show({
                title: 'Error',
                message: 'Failed to delete budget',
                color: 'red',
            });
        }
    }

    useEffect(() => {
        async function loadPage() {
            setLoading(true);

            try {
                await Promise.all([refreshBudgets(), refreshAccounts()]);
            } catch {
                notifications.show({
                    title: 'Budgets failed to load',
                    message: 'Could not load your budgets.',
                    color: 'red',
                });
            } finally {
                setLoading(false);
            }
        }

        void loadPage();
    }, []);

    const rows = budgets.map((budget) => {
        const used = Math.min(Math.max(budget.percentUsed, 0), 100);
        const remaining = Math.max(100 - used, 0);

        return (
            <Table.Tr key={budget.budgetId}>
                <Table.Td>
                    <Text fw={600}>{budget.budgetName}</Text>
                    <Text size="xs" c="dimmed" tt="capitalize">
                        {formatLabel(budget.category)}
                    </Text>
                </Table.Td>

                <Table.Td tt="capitalize">{budget.periodType}</Table.Td>

                <Table.Td>{budget.accountName ?? 'All accounts'}</Table.Td>

                <Table.Td>{formatCurrency(budget.budgetLimit)}</Table.Td>

                <Table.Td>
                    <Text size="sm">
                        {formatCurrency(budget.appliedAmount)} used
                    </Text>
                    <Text size="xs" c="dimmed">
                        {formatCurrency(budget.remainingAmount)} remaining
                    </Text>
                </Table.Td>

                <Table.Td>
                    <Group justify="space-between">
                        <Text fz="xs" c={getProgressColor(used)} fw={700}>
                            {used.toFixed(0)}%
                        </Text>
                        <Text fz="xs" c="dimmed" fw={700}>
                            {remaining.toFixed(0)}%
                        </Text>
                    </Group>

                    <Progress.Root size="sm">
                        <Progress.Section
                            value={used}
                            color={getProgressColor(used)}
                            aria-label="Budget used"
                        />
                        <Progress.Section
                            value={remaining}
                            color="dark.4"
                            aria-label="Budget remaining"
                        />
                    </Progress.Root>
                </Table.Td>

                <Table.Td ta="right">
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
                                onClick={() => void deleteBudget(budget.budgetId)}
                            >
                                Delete
                            </Menu.Item>
                        </Menu.Dropdown>
                    </Menu>
                </Table.Td>
            </Table.Tr>
        );
    });

    return (
        <Stack gap="xl">
            <Modal opened={opened} onClose={close} title="Create budget" centered>
                <form
                    onSubmit={form.onSubmit(async (values) => {
                        try {
                            const body = {
                                budgetName: values.budgetName,
                                accountId: values.accountId || undefined,
                                periodType: values.periodType,
                                category: values.category,
                                transactionCategory: values.category,
                                budgetLimit: values.budgetLimit,
                            };

                            const response = await apiFetch('/budgets', {
                                method: 'POST',
                                body: JSON.stringify(body),
                            });

                            if (!response.ok) {
                                throw new Error('Failed to create budget');
                            }

                            notifications.show({
                                title: 'Success',
                                message: 'Budget created',
                                color: 'green',
                            });

                            form.reset();
                            close();
                            await refreshBudgets();
                        } catch {
                            notifications.show({
                                title: 'Error',
                                message: 'Failed to create budget',
                                color: 'red',
                            });
                        }
                    })}
                >
                    <Stack>
                        <TextInput
                            label="Budget name"
                            required
                            {...form.getInputProps('budgetName')}
                        />

                        <Select
                            label="Account"
                            placeholder="All accounts"
                            clearable
                            data={accounts.map((account) => ({
                                value: account.accountId,
                                label: account.accountName,
                            }))}
                            {...form.getInputProps('accountId')}
                        />

                        <Select
                            label="Period"
                            required
                            data={[
                                { value: 'weekly', label: 'Weekly' },
                                { value: 'monthly', label: 'Monthly' },
                                { value: 'yearly', label: 'Yearly' },
                            ]}
                            {...form.getInputProps('periodType')}
                        />

                        <Select
                            label="Category"
                            required
                            data={categoryOptions}
                            {...form.getInputProps('category')}
                        />

                        <NumberInput
                            label="Budget limit"
                            required
                            min={0.01}
                            decimalScale={2}
                            fixedDecimalScale
                            {...form.getInputProps('budgetLimit')}
                        />

                        <Button type="submit">Create budget</Button>
                    </Stack>
                </form>
            </Modal>

            <Group justify="space-between">
                <div>
                    <Title order={1}>Budgets</Title>
                    <Text c="dimmed">Track spending limits by category and account.</Text>
                </div>

                <Button leftSection={<IconPlus size={16} />} onClick={open}>
                    Add budget
                </Button>
            </Group>

            <Card withBorder radius="md" p="md">
                {loading ? (
                    <Loader />
                ) : budgets.length === 0 ? (
                    <Stack align="center" py="xl">
                        <IconBellDollar size={36} opacity={0.6} />
                        <Text fw={600} size="lg">
                            No budgets yet
                        </Text>
                        <Text c="dimmed" size="sm">
                            Create a budget to start tracking category spending.
                        </Text>
                        <Button leftSection={<IconPlus size={16} />} onClick={open}>
                            Add budget
                        </Button>
                    </Stack>
                ) : (
                    <ScrollArea>
                        <Table horizontalSpacing="md" verticalSpacing="sm" miw={900}>
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th>Budget</Table.Th>
                                    <Table.Th>Period</Table.Th>
                                    <Table.Th>Account</Table.Th>
                                    <Table.Th>Limit</Table.Th>
                                    <Table.Th>Usage</Table.Th>
                                    <Table.Th>Progress</Table.Th>
                                    <Table.Th />
                                </Table.Tr>
                            </Table.Thead>

                            <Table.Tbody>{rows}</Table.Tbody>
                        </Table>
                    </ScrollArea>
                )}
            </Card>
        </Stack>
    );
}