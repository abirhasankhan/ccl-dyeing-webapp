import { createClientSchema } from './clientSchema.js';
import { dyeingFinishingPricesSchema } from './dyeingFinishingPricesSchema.js';

(async () => {
    try {
        await createClientSchema();
        await dyeingFinishingPricesSchema();
        
        console.log('Migration applied successfully!');
    } catch (error) {
        console.error('Error applying migration:', error);
    }
})();
