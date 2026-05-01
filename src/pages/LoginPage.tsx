// src/pages/LoginPage.tsx
import { useState } from 'react';
import {
    Box,
    Button,
    Center,
    Group,
    Paper,
    PasswordInput,
    Progress,
    Stack,
    Text,
    TextInput,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconCheck, IconX } from '@tabler/icons-react';
import { setToken } from '../auth';
import logo from '../assets/ledgerly.svg';

type LoginPageProps = {
    onLogin: (token: string) => void;
};

type AuthMode = 'login' | 'register';

function PasswordRequirement({ meets, label }: { meets: boolean; label: string }) {
    return (
        <Text component="div" c={meets ? 'teal' : 'red'} mt={5} size="sm">
            <Center inline>
                {meets ? (
                    <IconCheck size={14} stroke={1.5} />
                ) : (
                    <IconX size={14} stroke={1.5} />
                )}
                <Box ml={7}>{label}</Box>
            </Center>
        </Text>
    );
}

const requirements = [
    { re: /[0-9]/, label: 'Includes number' },
    { re: /[a-z]/, label: 'Includes lowercase letter' },
    { re: /[A-Z]/, label: 'Includes uppercase letter' },
    { re: /[$&+,:;=?@#|'<>.^*()%!-]/, label: 'Includes special symbol' },
];

function getStrength(password: string) {
    let multiplier = password.length > 5 ? 0 : 1;

    requirements.forEach((requirement) => {
        if (!requirement.re.test(password)) {
            multiplier += 1;
        }
    });

    return Math.max(100 - (100 / (requirements.length + 1)) * multiplier, 0);
}

export function LoginPage({ onLogin }: LoginPageProps) {
    const [mode, setMode] = useState<AuthMode>('login');

    const loginForm = useForm({
        initialValues: {
            email: '',
            password: '',
        },
    });

    const registerForm = useForm({
        initialValues: {
            email: '',
            password: '',
            firstName: '',
            lastName: '',
        },
    });

    const password = registerForm.values.password;
    const strength = getStrength(password);

    const checks = requirements.map((requirement, index) => (
        <PasswordRequirement
            key={index}
            label={requirement.label}
            meets={requirement.re.test(password)}
        />
    ));

    const bars = Array(4)
        .fill(0)
        .map((_, index) => (
            <Progress
                styles={{ section: { transitionDuration: '0ms' } }}
                value={
                    password.length > 0 && index === 0
                        ? 100
                        : strength >= ((index + 1) / 4) * 100
                            ? 100
                            : 0
                }
                color={strength > 80 ? 'teal' : strength > 50 ? 'yellow' : 'red'}
                key={index}
                size={4}
                aria-label={`Password strength segment ${index + 1}`}
            />
        ));

    async function login(values: typeof loginForm.values) {
        const response = await fetch('http://127.0.0.1:3000/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(values),
        });

        if (!response.ok) {
            throw new Error('Login failed');
        }

        const data = (await response.json()) as { accessToken: string };

        setToken(data.accessToken);
        onLogin(data.accessToken);
    }

    async function handleLogin(values: typeof loginForm.values) {
        try {
            await login(values);

            notifications.show({
                title: 'Success',
                message: 'Logged in successfully',
                color: 'green',
            });
        } catch {
            notifications.show({
                title: 'Login failed',
                message: 'Invalid email or password',
                color: 'red',
            });
        }
    }

    async function handleRegister(values: typeof registerForm.values) {
        try {
            const response = await fetch('http://127.0.0.1:3000/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(values),
            });

            if (!response.ok) {
                throw new Error('Registration failed');
            }

            await login({
                email: values.email,
                password: values.password,
            });

            notifications.show({
                title: 'Success',
                message: 'Account created',
                color: 'green',
            });
        } catch(err) {
            console.error(err);
            notifications.show({
                title: 'Registration failed',
                message: 'Could not create account',
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
                <Stack align="center" mb="lg">
                    <img src={logo} width={220} alt="Ledgerly logo" />

                    <Text c="dimmed" size="sm">
                        {mode === 'login'
                            ? 'Sign in to continue'
                            : 'Create your Ledgerly account'}
                    </Text>
                </Stack>

                {mode === 'login' ? (
                    <form onSubmit={loginForm.onSubmit(handleLogin)}>
                        <Stack>
                            <TextInput label="Email" {...loginForm.getInputProps('email')} />

                            <PasswordInput
                                label="Password"
                                {...loginForm.getInputProps('password')}
                            />

                            <Button type="submit">Login</Button>

                            <Group justify="center" gap={4}>
                                <Text size="sm" c="dimmed">
                                    Need an account?
                                </Text>
                                <Button
                                    variant="subtle"
                                    size="compact-sm"
                                    onClick={() => setMode('register')}
                                >
                                    Create one
                                </Button>
                            </Group>
                        </Stack>
                    </form>
                ) : (
                    <form onSubmit={registerForm.onSubmit(handleRegister)}>
                        <Stack>
                            <Group grow>
                                <TextInput
                                    label="First name"
                                    {...registerForm.getInputProps('firstName')}
                                />

                                <TextInput
                                    label="Last name"
                                    {...registerForm.getInputProps('lastName')}
                                />
                            </Group>

                            <TextInput
                                label="Email"
                                {...registerForm.getInputProps('email')}
                            />

                            <div>
                                <PasswordInput
                                    label="Password"
                                    {...registerForm.getInputProps('password')}
                                />

                                <Group gap={5} grow mt="xs" mb="md">
                                    {bars}
                                </Group>

                                <PasswordRequirement
                                    label="Has at least 6 characters"
                                    meets={password.length > 5}
                                />
                                {checks}
                            </div>

                            <Button type="submit">Create account</Button>

                            <Group justify="center" gap={4}>
                                <Text size="sm" c="dimmed">
                                    Already have an account?
                                </Text>
                                <Button
                                    variant="subtle"
                                    size="compact-sm"
                                    onClick={() => setMode('login')}
                                >
                                    Login
                                </Button>
                            </Group>
                        </Stack>
                    </form>
                )}
            </Paper>
        </Box>
    );
}