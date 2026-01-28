
'use strict';

const { Contract } = require('fabric-contract-api');

class SmartFarmContract extends Contract {

    async initLedger(ctx) {
        console.info('============= START : Initialize Ledger ===========');
        const sensorData = [
            {
                sensorId: 'SENSOR001',
                temperature: '25',
                humidity: '60',
                timestamp: '1678886400',
            },
        ];

        for (let i = 0; i < sensorData.length; i++) {
            await ctx.stub.putState('SENSOR' + i, Buffer.from(JSON.stringify(sensorData[i])));
            console.info('Added <--> ', sensorData[i]);
        }
        console.info('============= END : Initialize Ledger ===========');
    }

    async createSensorData(ctx, sensorId, temperature, humidity, timestamp) {
        console.info('============= START : Create Sensor Data ===========');

        const sensor = {
            sensorId,
            temperature,
            humidity,
            timestamp,
        };

        await ctx.stub.putState(sensorId, Buffer.from(JSON.stringify(sensor)));
        console.info('============= END : Create Sensor Data ===========');
    }

    async querySensorData(ctx, sensorId) {
        const sensorAsBytes = await ctx.stub.getState(sensorId);
        if (!sensorAsBytes || sensorAsBytes.length === 0) {
            throw new Error(`${sensorId} does not exist`);
        }
        console.log(sensorAsBytes.toString());
        return sensorAsBytes.toString();
    }
}

module.exports = SmartFarmContract;
