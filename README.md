# i9Hub Admin Panel v1.1.0

Painel administrativo do i9Hub para gestão automatizada de licenças, faturamento integrado via Asaas, telemetria em tempo real da extensão, monitoramento de vendedores e qualidade.

## 🚀 Deploy na VPS

### Pré-requisitos

- Node.js 20+ instalado
- Git instalado
- Acesso SSH à VPS

### 1. Clonar o repositório

```bash
git clone https://github.com/nataoliver/i9hub-admin-panel.git
cd i9hub-admin-panel
```

### 2. Instalar dependências

```bash
npm install
```

### 3. Configurar variáveis de ambiente

```bash
cp .env.example .env
nano .env
```

Preencha as seguintes variáveis obrigatórias:

| Variável | Descrição | Obrigatório |
|----------|-----------|-------------|
| `ASAAS_API_KEY` | Chave de acesso da API Asaas | ✅ Sim |
| `ASAAS_ENV` | `sandbox` ou `production` | ✅ Sim |
| `GEMINI_API_KEY` | Chave da API Google Gemini (IA) | ⚠️ Opcional |
| `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS` | Credenciais de e-mail | ⚠️ Opcional |
| `JWT_SECRET` | Gere com `openssl rand -hex 32` | ✅ Sim |
| `APP_URL` | URL pública do painel (ex: `https://painel.seudominio.com`) | ✅ Sim |

### 4. Build e iniciar em produção

```bash
npm run build
npm start
```

O servidor iniciará na porta **3000** por padrão.

### 5. Configurar como serviço systemd (recomendado)

Crie o arquivo `/etc/systemd/system/i9hub-admin.service`:

```ini
[Unit]
Description=i9Hub Admin Panel
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/i9hub-admin-panel
ExecStart=/usr/bin/node /opt/i9hub-admin-panel/server.ts
Restart=always
RestartSec=10
Environment=NODE_ENV=production
EnvironmentFile=/opt/i9hub-admin-panel/.env

[Install]
WantedBy=multi-user.target
```

Habilite e inicie o serviço:

```bash
sudo systemctl daemon-reload
sudo systemctl enable i9hub-admin
sudo systemctl start i9hub-admin
sudo systemctl status i9hub-admin
```

### 6. Configurar Nginx como reverse proxy

```nginx
server {
    listen 80;
    server_name painel.seudominio.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Para HTTPS, use Certbot:

```bash
sudo certbot --nginx -d painel.seudominio.com
```

## 🔗 Configurar Webhook do Asaas

Após o deploy, configure o webhook no painel do Asaas:

1. Acesse [Asaas > Integrações > Webhooks](https://www.asaas.com/configuracoes/integracoes/webhooks)
2. Adicione uma nova URL de webhook apontando para:
   ```
   https://painel.seudominio.com/api/v1/asaas/webhook
   ```
3. Selecione os eventos: `PAYMENT_RECEIVED`, `PAYMENT_OVERDUE`, `SUBSCRIPTION_CREATED`, `SUBSCRIPTION_UPDATED`
4. Copie o segredo gerado e adicione ao `.env` como `ASAAS_WEBHOOK_SECRET`

## 📁 Estrutura do Projeto

```
├── server.ts              # Backend Express + API REST completa
├── src/                   # Frontend React 19 + Vite + TailwindCSS v4
│   ├── App.tsx            # Componente principal com roteamento por abas
│   ├── components/        # Dashboard, Licenças, Billing, Telemetria, etc.
│   ├── services/          # api.ts, asaas-client.ts
│   └── types/             # Tipagens TypeScript
├── admin_database.json    # Banco de dados local (NÃO commitar)
├── package.json           # Dependências e scripts
├── vite.config.ts         # Configuração Vite
└── .env.example           # Template de variáveis de ambiente
```

## 🛠️ Scripts Disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Inicia em modo desenvolvimento (tsx watch) |
| `npm run build` | Compila o frontend com Vite |
| `npm start` | Inicia o servidor em produção |
| `npm run lint` | Verifica tipos TypeScript |
| `npm run clean` | Remove `dist/` e arquivos compilados |

## ⚠️ Notas Importantes

- **`admin_database.json`** contém dados sensíveis e está no `.gitignore`. Faça backup regularmente.
- Em produção, considere migrar para PostgreSQL/SQLite usando Prisma ou Drizzle ORM.
- O painel usa **Ed25519** para assinatura de tokens. As chaves são geradas automaticamente na primeira execução.
- Para atualizar o painel na VPS após mudanças no repositório:
  ```bash
  cd /opt/i9hub-admin-panel
  git pull origin master
  npm install
  npm run build
  sudo systemctl restart i9hub-admin
  ```

## 📄 Licença

Proprietário — i9Hub © 2026