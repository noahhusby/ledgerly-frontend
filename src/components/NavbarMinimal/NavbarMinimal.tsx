import {
    IconBellDollar,
    IconBuildingBank,
    IconHome2,
    IconReceiptDollar,
} from '@tabler/icons-react';
import { Code, Group, ScrollArea, Text, UnstyledButton } from '@mantine/core';
import { UserButton } from '../UserButton/UserButton';
import classes from './NavbarMinimal.module.css';
import logo from '../../assets/ledgerly.svg';
export type Page = 'Home' | 'Accounts' | 'Transactions' | 'Budgets';

type LinkItem = {
    label: Page;
    icon: typeof IconHome2;
};

const links: LinkItem[] = [
    { label: 'Home', icon: IconHome2 },
    { label: 'Accounts', icon: IconBuildingBank },
    { label: 'Transactions', icon: IconReceiptDollar },
    { label: 'Budgets', icon: IconBellDollar },
];

interface NavbarMinimalProps {
    activePage: Page;
    onPageChange: (page: Page) => void;
    onLogout: () => void;
    user: {
        name: string;
        email: string;
    };
}

function NavbarLink({
                        label,
                        icon: Icon,
                        active,
                        onClick,
                    }: LinkItem & {
    active: boolean;
    onClick: () => void;
}) {
    return (
        <UnstyledButton
            className={classes.link}
            data-active={active || undefined}
            onClick={onClick}
        >
            <Group gap="md">
                <div className={classes.linkIcon}>
                    <Icon size={18} stroke={1.5} />
                </div>

                <Text size="sm">{label}</Text>
            </Group>
        </UnstyledButton>
    );
}

export function NavbarMinimal({
                                  activePage,
                                  onPageChange,
                                  onLogout,
    user,
                              }: NavbarMinimalProps) {
    return (
        <nav className={classes.navbar}>
            <div className={classes.header}>
                <Group justify="space-between" className={classes.headerInner}>
                    <img src={logo} width={150} height={50} alt="Ledgerly logo" />
                    <Code fw={700}>1.0.0</Code>
                </Group>
            </div>

            <ScrollArea className={classes.links}>
                <div className={classes.linksInner}>
                    {links.map((item) => (
                        <NavbarLink
                            key={item.label}
                            {...item}
                            active={item.label === activePage}
                            onClick={() => onPageChange(item.label)}
                        />
                    ))}
                </div>
            </ScrollArea>

            <div className={classes.footer}>
                <UserButton
                    name={user.name}
                    email={user.email}
                    onClick={onLogout}
                />
            </div>
        </nav>
    );
}