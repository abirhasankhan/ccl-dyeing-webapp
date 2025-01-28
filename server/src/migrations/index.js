import { clientSchema } from './clientSchema.js';
import { dyeingFinishingPricesSchema } from './dyeingFinishingPricesSchema.js';
import { additionalProcessPricesSchema } from './additionalProcessPricesSchema.js';
import { clientDealsSchema } from './clientDealsSchema.js';
import { dyeingFinishingDealsSchema } from './dyeingFinishingDealsSchema.js';
import { additionalProcessDealsSchema } from './additionalProcessDealsSchema.js';
import { dealOrdersSchema } from './dealOrdersSchema.js';
import { shipmentsSchema } from './shipmentsSchema.js';
import { productDetailsSchema } from './productDetailsSchema.js';
import { returnsSchema } from './returnsSchema.js';
import { machinesSchema } from './machinesSchema.js';
import { dyeingProcessSchema } from './dyeingProcessSchema.js';




(async () => {
    try {

        console.log('Starting schema migrations...');

        // Apply all schema migrations sequentially
        await clientSchema();
        await dyeingFinishingPricesSchema();
        await additionalProcessPricesSchema();
        await clientDealsSchema();
        await dyeingFinishingDealsSchema();
        await additionalProcessDealsSchema();
        await dealOrdersSchema();
        await shipmentsSchema();
        await productDetailsSchema();
        await returnsSchema();
        await machinesSchema();
        await dyeingProcessSchema();
        
        console.log('All schemas applied successfully!');

        
        console.log('Migration applied successfully!');
    } catch (error) {
        console.error('Error applying migration:', error);
    }
})();
