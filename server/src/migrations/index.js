import { createClientSchema } from './clientSchema.js';
import { dyeingFinishingPricesSchema } from './dyeingFinishingPricesSchema.js';
import { additionalProcessPricesSchema } from './additionalProcessPricesSchema.js';

(async () => {
    try {
        await createClientSchema();
        await dyeingFinishingPricesSchema();
        await additionalProcessPricesSchema();
        
        console.log('Migration applied successfully!');
    } catch (error) {
        console.error('Error applying migration:', error);
    }
})();
