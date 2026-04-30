'use strict';

const { Contract } = require('fabric-contract-api');

class SmartFarmContract extends Contract {

    async initLedger(ctx) {
        console.info('============= BEGIN : Initialize Ledger ===========');
        console.info('============= END : Initialize Ledger ===========');
    }

    // SetHash stores the hash of any record (User, Disease, Chat)
    async SetHash(ctx, id, hash, dataType) {
        console.info('============= BEGIN : SetHash ===========');
        console.info(`Setting Hash for ID: ${id}, Type: ${dataType}`);
        
        try {
            if (!id || !hash) {
                throw new Error('ID and hash are required parameters');
            }

            const record = {
                id: id,
                hashValue: hash,
                dataType: dataType || 'GENERAL',
                timestamp: new Date().toISOString()
            };
            
            console.info(`Record to store:`, JSON.stringify(record));
            await ctx.stub.putState(id, Buffer.from(JSON.stringify(record)));
            console.info(`Successfully stored record for ID: ${id}`);
            console.info('============= END : SetHash ===========');
            return JSON.stringify({ success: true, id: id, message: 'Hash stored successfully' });
        } catch (error) {
            console.error('Error in SetHash:', error.message);
            throw new Error(`SetHash failed: ${error.message}`);
        }
    }

    // GetHash retrieves the hash for a specific ID
    async GetHash(ctx, id) {
        console.info('============= BEGIN : GetHash ===========');
        console.info(`Getting Hash for ID: ${id}`);
        
        try {
            const bytes = await ctx.stub.getState(id);
            if (!bytes || bytes.length === 0) {
                throw new Error(`The record ${id} does not exist`);
            }

            const content = bytes.toString();
            try {
                // Try to parse as the new JSON format
                const record = JSON.parse(content);
                console.info(`Retrieved record: ${JSON.stringify(record)}`);
                return record.hashValue;
            } catch (e) {
                // If it's not JSON, it's the old raw string format
                console.info(`Legacy format hash: ${content}`);
                return content;
            }
        } catch (error) {
            console.error('Error in GetHash:', error.message);
            throw error;
        } finally {
            console.info('============= END : GetHash ===========');
        }
    }
}

module.exports = SmartFarmContract;