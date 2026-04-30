import {
    IconBellDollar,
    IconBuildingBank,
    IconHome2,
    IconLogout, IconReceiptDollar,
} from '@tabler/icons-react';
import { Center, Stack, Tooltip, UnstyledButton } from '@mantine/core';
import { MantineLogo } from '@mantinex/mantine-logo';
import classes from './NavbarMinimal.module.css';

interface NavbarLinkProps {
    icon: typeof IconHome2;
    label: string;
    active?: boolean;
    onClick?: () => void;
}

function NavbarLink({ icon: Icon, label, active, onClick }: NavbarLinkProps) {
    return (
        <Tooltip label={label} position="right" transitionProps={{ duration: 0 }}>
            <UnstyledButton
                onClick={onClick}
                className={classes.link}
                data-active={active || undefined}
                aria-label={label}
            >
                <Icon size={20} stroke={1.5} />
            </UnstyledButton>
        </Tooltip>
    );
}

const mockdata = [
    { icon: IconHome2, label: 'Home' },
    { icon: IconBuildingBank, label: 'Accounts' },
    { icon: IconReceiptDollar, label: 'Transactions' },
    { icon: IconBellDollar, label: 'Budgets' },
];

export type Page = 'Home' | 'Accounts' | 'Transactions' | 'Budgets';
interface NavbarMinimalProps {
    activePage: Page;
    onPageChange: (page: Page) => void;
    onLogout: () => void;
}

export function NavbarMinimal({activePage, onPageChange, onLogout}: NavbarMinimalProps) {
    const links = mockdata.map((link, _) => (
        <NavbarLink
            {...link}
            key={link.label}
            active={link.label === activePage}
            onClick={() => onPageChange(link.label as Page)}
        />
    ));

    return (
        <nav className={classes.navbar}>
            <Center>
                <MantineLogo type="mark" size={30} />
            </Center>

            <div className={classes.navbarMain}>
                <Stack justify="center" gap={0}>
                    {links}
                </Stack>
            </div>

            <Stack justify="center" gap={0}>
                <NavbarLink icon={IconLogout} label="Logout" onClick={onLogout}/>
            </Stack>
        </nav>
    );
}