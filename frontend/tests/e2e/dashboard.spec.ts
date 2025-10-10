import { test, expect } from '@playwright/test';

test.beforeEach('setup auth storage', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('tab', { name: 'Login' }).click();
    await page.getByPlaceholder('seu@email.com').fill('teste@gmail.com');
    await page.getByPlaceholder('••••••••').fill('123456');
    await page.getByRole('button', { name: 'Entrar' }).click();
    await page.waitForURL(/.*dashboard/);
});

test('titulo de dashboard', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.getByText('Carteira Digital')).toBeVisible();
    await expect(page.getByText('Saldo Disponível')).toBeVisible();
    await expect(page.getByText('Depositar')).toBeVisible();
    await expect(page.getByText('Transferir')).toBeVisible();
});

test('logout redireciona para a página inicial', async ({ page }) => {
    await page.goto('/dashboard');
    await page.getByRole('button', { name: 'Log Out' }).click();
    await expect(page).toHaveURL(/.*$/);
});

test('atualizar dados do usuário', async ({ page }) => {
    await page.goto('/dashboard');
    await page.getByRole('button', { name: 'Atualizar' }).click();
    await expect(page.getByText('Saldo Disponível')).toBeVisible();
});

test('abrir modal de depósito', async ({ page }) => {
    await page.goto('/dashboard');
    await page.getByRole('button', { name: 'Depositar' }).click();
    await expect(page.getByText('Realizar Depósito')).toBeVisible();
});

test('abrir modal de transferência', async ({ page }) => {
    await page.goto('/dashboard');
    await page.getByRole('button', { name: 'Transferir' }).click();
    await expect(page.getByText('Realizar Transferência')).toBeVisible();
});

test('fechar modal de depósito', async ({ page }) => {
    await page.goto('/dashboard');
    await page.getByRole('button', { name: 'Depositar' }).click();
    await page.getByRole('button', { name: 'Close' }).click();
    await expect(page.getByText('Novo Depósito')).not.toBeVisible();
});

test('fechar modal de transferência', async ({ page }) => {
    await page.goto('/dashboard');
    await page.getByRole('button', { name: 'Transferir' }).click();
    await page.getByRole('button', { name: 'Close' }).click();
    await expect(page.getByText('Nova Transferência')).not.toBeVisible();
});
