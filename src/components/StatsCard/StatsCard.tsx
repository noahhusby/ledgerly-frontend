// src/components/StatsCard/StatsCard.tsx
import {
    IconArrowDownRight,
    IconArrowUpRight,
    type Icon,
} from '@tabler/icons-react';
import { Group, Paper, Text } from '@mantine/core';
import classes from './StatsCard.module.css';

type StatsCardProps = {
    title: string;
    value: string;
    icon: Icon;
    diff?: number;
    caption?: string;
    statusColor?: string;
};

export function StatsCard({
                              title,
                              value,
                              icon: IconComponent,
                              diff,
                              caption,
                              statusColor,
                          }: StatsCardProps) {
    const DiffIcon =
        diff !== undefined && diff >= 0 ? IconArrowUpRight : IconArrowDownRight;

    return (
        <Paper withBorder p="md" radius="md">
            <Group justify="space-between">
                <Text size="xs" c="dimmed" className={classes.title}>
                    {title}
                </Text>
                <IconComponent className={classes.icon} size={22} stroke={1.5} />
            </Group>

            <Group align="flex-end" gap="xs" mt={25}>
                <Text className={classes.value}>{value}</Text>

                {diff !== undefined && (
                    <Text
                        c={diff >= 0 ? 'teal' : 'red'}
                        fz="sm"
                        fw={500}
                        className={classes.diff}
                    >
                        <span>{Math.abs(diff).toFixed(1)}%</span>
                        <DiffIcon size={16} stroke={1.5} />
                    </Text>
                )}
            </Group>

            {caption && (
                <Text fz="xs" c={statusColor ?? 'dimmed'} mt={7}>
                    {caption}
                </Text>
            )}
        </Paper>
    );
}