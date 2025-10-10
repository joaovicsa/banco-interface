import { test, expect } from '@playwright/test';

test('auth exibe título corretamente', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Carteira Digital')).toBeVisible();
    await expect(page.getByText('Gerencie seu dinheiro com segurança')).toBeVisible();
});

test('login falha com credenciais inválidas', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('tab', { name: 'Login' }).click();
    await page.getByPlaceholder('seu@email.com').fill('wrong@gmail.com');
    await page.getByPlaceholder('••••••••').fill('wrongpassword');
    await page.getByRole('button', { name: 'Entrar' }).click();
    await expect(page.getByText('Credenciais Invalidas')).toBeVisible();
});

test('login bem-sucedido com credenciais válidas', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('tab', { name: 'Login' }).click();
    await page.getByPlaceholder('seu@email.com').fill('teste@gmail.com');
    await page.getByPlaceholder('••••••••').fill('123456');
    await page.getByRole('button', { name: 'Entrar' }).click();
    await expect(page).toHaveURL(/.*dashboard/);
});

test('cadastro de novo usuário', async ({ page }) => {
    const uniqueEmail = `user${Date.now()}@example.com`;
    await page.goto('/');
    await page.getByRole('tab', { name: 'Cadastro' }).click();
    await page.getByPlaceholder('Seu nome completo').fill('Novo Usuário');
    await page.getByPlaceholder('seu@email.com').fill(uniqueEmail);
    await page.getByPlaceholder('••••••••').fill('novasenha123');
    await page.getByRole('button', { name: 'Criar Conta' }).click();
    await expect(page).toHaveURL(/.*dashboard/);
});
