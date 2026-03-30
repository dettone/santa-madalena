import { Kafka, Producer, Consumer, logLevel } from "kafkajs";

const brokers = (process.env.KAFKA_BROKERS || "localhost:9092").split(",");

const kafka = new Kafka({
  clientId: "santa-madalena",
  brokers,
  logLevel: logLevel.WARN,
});

let producer: Producer | null = null;

export async function getProducer(): Promise<Producer> {
  if (!producer) {
    producer = kafka.producer();
    await producer.connect();
  }
  return producer;
}

export function createConsumer(groupId: string): Consumer {
  return kafka.consumer({ groupId });
}

export const TOPICS = {
  PAGAMENTOS_CONFIRMADOS: "pagamentos-confirmados",
} as const;

export default kafka;
