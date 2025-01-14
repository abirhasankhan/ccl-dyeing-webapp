import { clientSchema } from './clientSchema.js';
import { dyeingFinishingPricesSchema } from './dyeingFinishingPricesSchema.js';
import { additionalProcessPricesSchema } from './additionalProcessPricesSchema.js';
import { clientDealsSchema } from './clientDealsSchema.js';
import { dyeingFinishingDealsSchema } from './dyeingFinishingDealsSchema.js'
import { additionalProcessDealsSchema } from './additionalProcessDealsSchema.js'

(async () => {
    try {
        await clientSchema();
        await dyeingFinishingPricesSchema();
        await additionalProcessPricesSchema();
        await clientDealsSchema();
        await dyeingFinishingDealsSchema();
        await additionalProcessDealsSchema();
        
        console.log('Migration applied successfully!');
    } catch (error) {
        console.error('Error applying migration:', error);
    }
})();
