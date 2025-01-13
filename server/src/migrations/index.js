import { createClientSchema } from './clientSchema.js';
import { dyeingFinishingPricesSchema } from './dyeingFinishingPricesSchema.js';
import { additionalProcessPricesSchema } from './additionalProcessPricesSchema.js';
import { createClientDealsSchema } from './ClientDealsSchema.js';

(async () => {
    try {
        await createClientSchema();
        await dyeingFinishingPricesSchema();
        await additionalProcessPricesSchema();
        await createClientDealsSchema();
        
        console.log('Migration applied successfully!');
    } catch (error) {
        console.error('Error applying migration:', error);
    }
})();
