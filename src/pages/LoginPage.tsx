// src/pages/LoginPage.tsx
import {Box, Button, Paper, PasswordInput, Stack, TextInput, Title} from '@mantine/core';
import { useForm } from '@mantine/form';
import { setToken } from '../auth';
import {notifications} from "@mantine/notifications";

type LoginPageProps = {
    onLogin: (token: string) => void;
};

export function LoginPage({ onLogin }: LoginPageProps) {
    const form = useForm({
        initialValues: {
            email: '',
            password: '',
        },
    });

    async function handleSubmit(values: typeof form.values) {
        try {
            const response = await fetch('http://127.0.0.1:3000/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(values),
            });

            if (!response.ok) {
                throw new Error('Login failed');
            }

            const data: { accessToken: string } = await response.json();

            setToken(data.accessToken);
            onLogin(data.accessToken);
            notifications.show({
                title: 'Success',
                message: 'Logged in successfully',
                color: 'green',
            });
        } catch (err) {
            console.log("Time for error!");
            notifications.show({
                title: 'Login failed',
                message: 'Invalid email or password',
                color: 'red',
            });
        }
    }

    return (
        <Box
            style={{
                minHeight: '100vh',
                display: 'grid',
                placeItems: 'center',
            }}
        >
            <Paper w={420} p="xl" radius="md" withBorder>
                <form onSubmit={form.onSubmit(handleSubmit)}>
                    <Stack>
                        <Title order={2}>Ledgerly</Title>

                        <TextInput
                            label="Email"
                            {...form.getInputProps('email')}
                        />

                        <PasswordInput
                            label="Password"
                            {...form.getInputProps('password')}
                        />

                        <Button type="submit">Login</Button>
                    </Stack>
                </form>
            </Paper>
        </Box>
    );
}