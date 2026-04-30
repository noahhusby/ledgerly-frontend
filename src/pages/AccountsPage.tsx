import {
    ActionIcon,
    Button,
    Card,
    Group, Loader,
    Menu, Modal, NumberInput, Select,
    SimpleGrid,
    Stack,
    Text, TextInput,
    Title,
} from '@mantine/core';
import {
    IconPlus,
    IconDotsVertical,
    IconTrash,
    IconCreditCard,
    IconPigMoney,
    IconBuildingBank,
    IconCash, IconAlertTriangle, IconCheck, IconCoin,
} from '@tabler/icons-react';

import classes from './AccountsPage.module.css';
import {useEffect, useState} from "react";
import {notifications} from "@mantine/notifications";
import {apiFetch} from "../api.ts";
import {useDisclosure} from "@mantine/hooks";
import {useForm} from "@mantine/form";
import {StatsCard} from "../components/StatsCard/StatsCard.tsx";

type Account = {
    accountId: string;
    accountName: string;
    accountType: string;
    openingBalance: number;
    currencyCode: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
};

type BalanceStats = {
    totalBalance: number;
    percentChangeFromLastMonth: number;
};

function getAccountIcon(type: string) {
    switch (type) {
        case 'checking':
            return <IconBuildingBank size={20} />;
        case 'savings':
            return <IconPigMoney size={20} />;
        case 'credit':
            return <IconCreditCard size={20} />;
        case 'cash':
            return <IconCash size={20} />;
        default:
            return <IconBuildingBank size={20} />;
    }
}

export function AccountsPage() {
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [loading, setLoading] = useState(true);
    const [opened, { open, close }] = useDisclosure(false);
    const [balanceStats, setBalanceStats] = useState<BalanceStats | null>(null);

    const form = useForm({
        initialValues: {
            accountName: '',
            accountType: 'checking',
            openingBalance: 0,
        },
    });

    async function deleteAccount(accountId: string) {
        try {
            const response = await apiFetch(`/accounts/${accountId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete account');
            }

            notifications.show({
                title: 'Success',
                message: 'Account deleted',
                color: 'green',
            });

            await Promise.all([
                refreshAccounts(),
                refreshBalanceStats(),
            ])
        } catch {
            notifications.show({
                title: 'Error',
                message: 'Failed to delete account',
                color: 'red',
            });
        }
    }

    async function refreshAccounts() {
        const response = await apiFetch('/accounts');

        if (!response.ok) {
            throw new Error('Failed to load accounts');
        }

        const data = (await response.json()) as Account[];
        setAccounts(data);
    }

    async function refreshBalanceStats() {
        const response = await apiFetch('/transactions/balance-stats');

        if (!response.ok) {
            throw new Error('Failed to load balance stats');
        }

        const data = (await response.json()) as BalanceStats;
        setBalanceStats(data);
    }

    useEffect(() => {
        async function loadAccounts() {
            try {
                await Promise.all([
                    refreshAccounts(),
                    refreshBalanceStats(),
                ])
            } catch {
                notifications.show({
                    title: 'Accounts failed to load',
                    message: 'Could not load your accounts.',
                    color: 'red',
                });
            } finally {
                setLoading(false);
            }
        }
        void loadAccounts();
    }, []);

    const hasNegativeBalance = accounts.some((account) => account.openingBalance < 0);

    return (
        <Stack gap="xl">
            <Modal opened={opened} onClose={close} title="Create account" centered>
                <form
                    onSubmit={form.onSubmit(async (values) => {
                        try {
                            const response = await apiFetch('/accounts', {
                                method: 'POST',
                                body: JSON.stringify(values),
                            });

                            if (!response.ok) {
                                throw new Error('Failed to create account');
                            }

                            notifications.show({
                                title: 'Success',
                                message: 'Account created',
                                color: 'green',
                            });

                            form.reset();
                            close();
                            await Promise.all([
                                refreshAccounts(),
                                refreshBalanceStats(),
                            ])
                        } catch {
                            notifications.show({
                                title: 'Error',
                                message: 'Failed to create account',
                                color: 'red',
                            });
                        }
                    })}
                >
                    <Stack>
                        <TextInput
                            label="Account name"
                            required
                            {...form.getInputProps('accountName')}
                        />

                        <Select
                            label="Account type"
                            required
                            data={[
                                { value: 'checking', label: 'Checking' },
                                { value: 'savings', label: 'Savings' },
                                { value: 'credit', label: 'Credit' },
                                { value: 'cash', label: 'Cash' },
                            ]}
                            {...form.getInputProps('accountType')}
                        />

                        <NumberInput
                            label="Opening balance"
                            required
                            decimalScale={2}
                            fixedDecimalScale
                            {...form.getInputProps('openingBalance')}
                        />

                        <Button type="submit">Create</Button>
                    </Stack>
                </form>
            </Modal>
            <Group justify="space-between">
                <div>
                    <Title order={1}>Accounts</Title>
                    <Text c="dimmed">Manage your financial accounts.</Text>
                </div>
                <Button leftSection={<IconPlus size={16} />} onClick={open}>Add account</Button>
            </Group>
            {loading ? (
                <Loader />
            ) : (
                <>
                    <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }}>
                        <StatsCard
                            title="Total accounts"
                            value={accounts.length.toString()}
                            icon={IconBuildingBank}
                            caption="Number of active accounts"
                        />

                        <StatsCard
                            title="Total balance"
                            value={(balanceStats?.totalBalance ?? 0).toLocaleString('en-US', {
                                style: 'currency',
                                currency: 'USD',
                            })}
                            icon={IconCoin}
                            diff={balanceStats?.percentChangeFromLastMonth ?? 0}
                            caption="Compared to previous month"
                        />

                        <StatsCard
                            title="Balance health"
                            value={hasNegativeBalance ? 'Warning' : 'Good'}
                            icon={hasNegativeBalance ? IconAlertTriangle : IconCheck}
                            caption={
                                hasNegativeBalance
                                    ? 'One or more accounts are below zero'
                                    : 'All account balances are non-negative'
                            }
                            statusColor={hasNegativeBalance ? 'red' : 'teal'}
                        />
                    </SimpleGrid>
                    <Stack gap={4} mt="md">
                        <Text fw={700} size="lg">
                            Accounts
                        </Text>
                        <Text size="sm" c="dimmed">
                            View and manage all your financial accounts
                        </Text>
                    </Stack>
                    {accounts.length === 0 ? (
                        <Card
                            withBorder
                            radius="md"
                            p="xl"
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                textAlign: 'center',
                                gap: 12,
                                minHeight: 180,
                            }}
                        >
                            <Text fw={600} size="lg">
                                No accounts yet
                            </Text>

                            <Text size="sm" c="dimmed">
                                Create your first account to start tracking balances and transactions
                            </Text>

                            <Button
                                mt="sm"
                                leftSection={<IconPlus size={16} />}
                                onClick={open}
                            >
                                Add account
                            </Button>
                        </Card>
                    ) : (
                        <Stack gap="sm">
                            {accounts.map((account) => (
                                <Card
                                    key={account.accountId}
                                    className={classes.card}
                                    withBorder
                                    radius="md"
                                    p="md"
                                >
                                    <Group justify="space-between">
                                        <Group>
                                            {getAccountIcon(account.accountType)}
                                            <div>
                                                <Text fw={600}>{account.accountName}</Text>
                                                <Text size="sm" c="dimmed" tt="capitalize">
                                                    {account.accountType}
                                                </Text>
                                            </div>
                                        </Group>

                                        <Group gap="sm">
                                            <Text fw={700}>
                                                {account.openingBalance.toLocaleString('en-US', {
                                                    style: 'currency',
                                                    currency: account.currencyCode,
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
                                                        onClick={() => void deleteAccount(account.accountId)}
                                                    >
                                                        Delete
                                                    </Menu.Item>
                                                </Menu.Dropdown>
                                            </Menu>
                                        </Group>
                                    </Group>
                                </Card>
                            ))}
                        </Stack>
                    )}

                </>
            )}
        </Stack>
    );
}

