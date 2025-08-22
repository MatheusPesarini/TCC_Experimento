import { buildApp } from './app';

const PORT = process.env.PORT ? Number(process.env.PORT) : 3002;
const app = buildApp();

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`claude4 API listening on port ${PORT}`);
});
