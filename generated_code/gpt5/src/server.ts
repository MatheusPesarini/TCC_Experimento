import { buildApp } from './app';

const PORT = process.env.PORT ? Number(process.env.PORT) : 3001;
const app = buildApp();

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`gpt5 API listening on port ${PORT}`);
});
