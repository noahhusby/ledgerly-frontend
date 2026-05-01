import { Badge, Group, Paper, Progress, Text } from '@mantine/core';
import classes from './BudgetStatusCard.module.css';

type BudgetStatusCardProps = {
    name: string;
    period: string;
    limit: number;
    applied: number;
    remaining: number;
    percentUsed: number;
};

function money(value: number) {
    return value.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
    });
}

export function BudgetStatusCard({
                                     name,
                                     period,
                                     limit,
                                     applied,
                                     remaining,
                                     percentUsed,
                                 }: BudgetStatusCardProps) {
    const used = Math.min(Math.max(percentUsed, 0), 100);
    const overBudget = percentUsed > 100;

    return (
        <Paper radius="md" withBorder className={classes.card}>
            <Text ta="center" fw={700} className={classes.title}>
                {name}
            </Text>

            <Text c="dimmed" ta="center" fz="sm" tt="capitalize">
                {period} budget
            </Text>

            <Group justify="space-between" mt="lg">
                <Text fz="sm" c="dimmed">
                    Progress
                </Text>
                <Text fz="sm" c={overBudget ? 'red' : 'dimmed'}>
                    {percentUsed.toFixed(0)}%
                </Text>
            </Group>

            <Progress
                value={used}
                mt={5}
                color={overBudget ? 'red' : 'blue'}
                aria-label={`${name} budget progress`}
            />

            <Group justify="space-between" mt="md">
                <Text fz="sm">
                    {money(applied)} / {money(limit)}
                </Text>

                <Badge color={overBudget ? 'red' : 'blue'} size="sm">
                    {overBudget ? `${money(Math.abs(remaining))} over` : `${money(remaining)} left`}
                </Badge>
            </Group>
        </Paper>
    );
}