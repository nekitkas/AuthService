import Redis from 'ioredis';

const redis = new Redis(6379, 'localhost');

redis.on('connect', () => {
    console.log('Connected to Redis');
});

redis.on('error', (error) => {
    console.log('Error connecting to Redis', error);
});

export default redis;