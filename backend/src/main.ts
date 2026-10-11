import { createApplication } from "./bootstrap";
import { loadEnvironment } from "./config/environment";

async function main() {
  const environment = loadEnvironment();
  const app = await createApplication(environment);
  await app.listen(environment.port, environment.host);
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
