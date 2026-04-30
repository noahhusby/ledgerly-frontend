// src/components/UserButton/UserButton.tsx
import { IconChevronRight } from '@tabler/icons-react';
import { Avatar, Group, Text, UnstyledButton } from '@mantine/core';
import classes from './UserButton.module.css';

type UserButtonProps = {
    name: string;
    email: string;
    onClick?: () => void;
};

export function UserButton({ name, email, onClick }: UserButtonProps) {
    return (
        <UnstyledButton className={classes.user} onClick={onClick}>
            <Group>
                <Avatar radius="xl" />

                <div style={{ flex: 1 }}>
                    <Text size="sm" fw={500}>
                        {name}
                    </Text>

                    <Text c="dimmed" size="xs">
                        {email}
                    </Text>
                </div>

                <IconChevronRight size={14} stroke={1.5} />
            </Group>
        </UnstyledButton>
    );
}