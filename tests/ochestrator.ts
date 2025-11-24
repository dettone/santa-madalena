import retry from "async-retry";

async function waitForAllServices() {
  await waitForWebServices();

  async function waitForWebServices() {
    console.log("Waiting for web services...");
    return retry(fetchStatusPage, {
      retries: 100,
      maxTimeout: 10000,
    });
  }
  async function fetchStatusPage() {
    const response = await fetch("http://localhost:3000/api/status");
    if (response.status !== 200) {
      throw new Error(`Unexpected response status: ${response.status}`);
    }
  }
}

const orchestrator = {
  waitForAllServices,
};

export default orchestrator;
