// src/pages/DashboardPage.tsx
import { Container, Title, Text, Stack } from '@mantine/core';

export function DashboardPage() {
    return (
        <Container size="lg">
            <Stack>
                <Title order={1}>Dashboard</Title>
                <Text c="dimmed">
                    Welcome to Ledgerly. This is your dashboard.
                </Text>
            </Stack>
        </Container>
    );
}