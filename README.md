# express-nunjucks-postgres-starter

This project includes a Node Devcontainer. Be sure to install Node >=18 if you don't plan to utilize the embedded Docker container.

## Development

### Install dependencies

```bash
npm run install
```

### Set DB Connection String
Duplicate `.env.example` as `.env` and add your connection string to the file.
```bash 
cp .env.example .env
```

### Run the app

```bash
npm run dev
```