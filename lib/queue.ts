import { Queue } from 'bullmq'
import { redis } from './redis'

export const scanQueue = new Queue('scan-processing', {
  connection: redis,
  defaultJobOptions: {
    attempts:         3,
    backoff:          { type: 'exponential', delay: 5000 },
    removeOnComplete: 100,
    removeOnFail:     50,
  },
})